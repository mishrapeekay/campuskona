import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp, FadeInDown, FadeIn, Layout } from 'react-native-reanimated';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, clearError } from '@/store/slices/authSlice';
import { clearTenant } from '@/store/slices/tenantSlice';
import { selectThemeColors, selectBranding } from '@/store/slices/brandingSlice';
import { validateEmail, validateRequired } from '@/utils';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Input from '@/components/common/Input';
import { Button, Card } from '@/components/ui';
import { LoginRequest } from '@/types/api';
import biometricService from '@/services/biometric.service';
import { BiometryTypes } from 'react-native-biometrics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types/navigation';

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<LoginNavProp>();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const themeColors = useAppSelector(selectThemeColors);
  const { config: brandingConfig } = useAppSelector(selectBranding);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Biometric state
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryTypes | null>(null);
  const [biometricLoading, setBiometricLoading] = useState(false);

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = useCallback(async () => {
    const caps = await biometricService.checkAvailability();
    setBiometricAvailable(caps.available);
    setBiometryType(caps.biometryType);
    setBiometricEnabled(biometricService.isBiometricEnabled());
  }, []);

  const getBiometricIcon = (): string => {
    if (biometryType === BiometryTypes.FaceID) return 'face-recognition';
    if (biometryType === BiometryTypes.TouchID) return 'fingerprint';
    return 'fingerprint';
  };

  const getBiometricLabel = (): string => {
    if (biometryType === BiometryTypes.FaceID) return 'Face ID';
    if (biometryType === BiometryTypes.TouchID) return 'Touch ID';
    return 'Biometrics';
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      const result = await biometricService.authenticate('Sign in to School Management');
      if (result.success) {
        // Biometric verified — attempt login with stored credentials
        // The biometric service validates identity; the app dispatches login using
        // previously authenticated session tokens (handled by API interceptor refresh flow)
        await dispatch(login({ biometric: true } as any)).unwrap();
      }
    } catch (err) {
      // Biometric failed — user can fall back to password
    } finally {
      setBiometricLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!validateRequired(email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!validateRequired(password)) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    const credentials: LoginRequest = {
      email: email.trim().toLowerCase(),
      password: password,
    };

    try {
      await dispatch(login(credentials)).unwrap();
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-slate-50 dark:bg-slate-950"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Header */}
          <View className="items-center mb-10">
            <Animated.View entering={FadeInDown.duration(800).springify()}>
              {brandingConfig?.logo_light ? (
                <View className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200 dark:shadow-none items-center justify-center p-4 mb-6">
                  <Image
                    source={{ uri: brandingConfig.logo_light }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View className="w-20 h-20 rounded-3xl bg-indigo-600 items-center justify-center mb-6 shadow-xl shadow-indigo-200 dark:shadow-none">
                  <Icon name="school" size={40} color="white" />
                </View>
              )}
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).duration(800)} className="items-center">
              <Text className="text-3xl font-black text-slate-900 dark:text-slate-100 text-center">
                {brandingConfig?.school_name || 'Portal Login'}
              </Text>
              <Text className="text-slate-500 font-medium text-center mt-1">
                Welcome back! Sign in to continue.
              </Text>
            </Animated.View>
          </View>

          {/* Biometric Quick-Login */}
          {biometricAvailable && biometricEnabled && (
            <Animated.View entering={FadeInUp.delay(300).duration(600)} className="mb-6">
              <TouchableOpacity
                onPress={handleBiometricLogin}
                disabled={biometricLoading || isLoading}
                activeOpacity={0.8}
                className="flex-row items-center justify-center bg-white dark:bg-slate-900 rounded-2xl py-4 px-6 shadow-md shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800"
              >
                {biometricLoading ? (
                  <Icon name="loading" size={24} color={themeColors.primary || '#4F46E5'} />
                ) : (
                  <Icon name={getBiometricIcon()} size={24} color={themeColors.primary || '#4F46E5'} />
                )}
                <Text className="ml-3 text-slate-900 dark:text-slate-100 font-bold text-base">
                  {biometricLoading ? 'Authenticating…' : `Sign in with ${getBiometricLabel()}`}
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center mt-5 mb-2">
                <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <Text className="mx-3 text-slate-400 text-xs font-medium">or use password</Text>
                <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </View>
            </Animated.View>
          )}

          {/* Login Form */}
          <Animated.View entering={FadeInUp.delay(400).duration(800)}>
            <Card className="bg-white dark:bg-slate-900 p-6 rounded-[40px] shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800">
              {error && (
                <Animated.View entering={FadeIn.duration(400)} className="bg-rose-50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 mb-6 flex-row items-center">
                  <Icon name="alert-circle" size={20} className="text-rose-600 dark:text-rose-400 mr-2" />
                  <Text className="text-rose-700 dark:text-rose-400 text-xs font-bold flex-1">{error}</Text>
                </Animated.View>
              )}

              <View className="space-y-4">
                <Input
                  label="Email Address"
                  placeholder="name@school.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="email-outline"
                  className="mb-4"
                />

                <Input
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  error={errors.password}
                  isPassword
                  leftIcon="lock-outline"
                  className="mb-2"
                />

                <TouchableOpacity className="align-end mb-6" activeOpacity={0.6}>
                  <Text className="text-indigo-600 dark:text-indigo-400 text-right font-bold text-xs">Forgot Password?</Text>
                </TouchableOpacity>

                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading || biometricLoading}
                  size="lg"
                  className="rounded-2xl shadow-lg shadow-indigo-300 dark:shadow-none"
                  style={{ backgroundColor: themeColors.primary || '#4F46E5' }}
                />
              </View>
            </Card>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeIn.delay(800).duration(1000)} className="mt-10 items-center">
            <Text className="text-slate-500 text-xs font-medium text-center">
              Don't have an account?{' '}
              <Text className="text-slate-900 dark:text-slate-200 font-bold">Contact Admin</Text>
            </Text>

            <TouchableOpacity
              className="mt-4 py-2 px-6 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex-row items-center"
              onPress={() => navigation.navigate('OTPLogin')}
            >
              <Icon name="shield-key-outline" size={16} color="#6366f1" style={{ marginRight: 6 }} />
              <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-xs">Login with OTP / Admission No.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-3 py-2 px-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-row items-center"
              onPress={() => dispatch(clearTenant())}
            >
              <Icon name="swap-horizontal" size={16} className="text-slate-600 dark:text-slate-400 mr-2" />
              <Text className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Change School</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default LoginScreen;
