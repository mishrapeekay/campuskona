import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp, FadeInDown, FadeIn } from 'react-native-reanimated';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, clearError } from '@/store/slices/authSlice';
import { setSuperAdminMode } from '@/store/slices/tenantSlice';
import { validateEmail, validateRequired } from '@/utils';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Input from '@/components/common/Input';
import { Button, Card } from '@/components/ui';
import { AuthStackParamList } from '@/types/navigation';
import { LoginRequest } from '@/types/api';
import { COLORS } from '@/constants';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SuperAdminLogin'>;

const SuperAdminLoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

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

    // Mark as super admin mode so the API client skips the tenant header
    dispatch(setSuperAdminMode(true));

    const credentials: LoginRequest = {
      email: email.trim().toLowerCase(),
      password,
    };

    try {
      await dispatch(login(credentials)).unwrap();
    } catch (err) {
      // Login failed — clear super admin mode so tenant flow still works
      dispatch(setSuperAdminMode(false));
      console.error('Super admin login error:', err);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-slate-950"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="items-center mb-10">
            <Animated.View entering={FadeInDown.duration(800).springify()}>
              <View className="w-24 h-24 rounded-3xl bg-indigo-600 items-center justify-center mb-6 shadow-2xl shadow-indigo-900">
                <Icon name="shield-crown" size={48} color="white" />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).duration(800)} className="items-center">
              <View className="bg-indigo-950/60 border border-indigo-800/50 px-4 py-1.5 rounded-full mb-3">
                <Text className="text-indigo-400 text-[10px] font-black uppercase tracking-[3px]">
                  Platform Access
                </Text>
              </View>
              <Text className="text-3xl font-black text-white text-center">
                Super Admin
              </Text>
              <Text className="text-slate-400 font-medium text-center mt-1 text-sm">
                Platform-level access. No school required.
              </Text>
            </Animated.View>
          </View>

          {/* Login Form */}
          <Animated.View entering={FadeInUp.delay(400).duration(800)}>
            <Card className="bg-slate-900 p-6 rounded-[40px] shadow-2xl border border-slate-800">
              {error && (
                <Animated.View
                  entering={FadeIn.duration(400)}
                  className="bg-rose-950/40 p-4 rounded-2xl border border-rose-900/40 mb-6 flex-row items-center"
                >
                  <Icon name="alert-circle" size={20} color="#f87171" />
                  <Text className="text-rose-400 text-xs font-bold flex-1 ml-2">{error}</Text>
                </Animated.View>
              )}

              <View className="space-y-4">
                <Input
                  label="Admin Email"
                  placeholder="admin@platform.com"
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
                  className="mb-6"
                />

                <Button
                  title="Access Platform"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  size="lg"
                  className="rounded-2xl"
                  style={{ backgroundColor: COLORS.primary }}
                />
              </View>
            </Card>
          </Animated.View>

          {/* Back to school selection */}
          <Animated.View entering={FadeIn.delay(800).duration(1000)} className="mt-10 items-center">
            <TouchableOpacity
              className="py-2 px-6 rounded-full bg-slate-800 border border-slate-700 flex-row items-center"
              onPress={() => dispatch(setSuperAdminMode(false))}
            >
              <Icon name="arrow-left" size={16} color="#94A3B8" />
              <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider ml-2">
                Back to School Login
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default SuperAdminLoginScreen;
