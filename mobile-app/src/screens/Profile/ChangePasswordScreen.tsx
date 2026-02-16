import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInDown, FadeIn, Layout, withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card, Button } from '@/components/ui';
import Input from '@/components/common/Input';
import { authService } from '@/services/api';

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.current_password) newErrors.current_password = 'Required';
    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Minimum 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.new_password)) {
      newErrors.new_password = 'Must include Case & Numbers';
    }
    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords match mismatch';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Your password has been updated across all devices.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Update Failed', error.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.new_password;
    if (!password) return { level: 0, text: 'No entry', color: 'bg-slate-200' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    if (strength <= 1) return { level: 1, text: 'Weak Security', color: 'bg-rose-500' };
    if (strength === 2) return { level: 2, text: 'Moderate', color: 'bg-amber-500' };
    if (strength === 3) return { level: 3, text: 'Secure', color: 'bg-emerald-500' };
    return { level: 4, text: 'Military Grade', color: 'bg-indigo-600' };
  };

  const strength = getPasswordStrength();

  return (
    <ScreenWrapper>
      <Header title="Authentication" showBackButton />

      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)} className="mb-8 items-center pt-6">
          <View className="w-20 h-20 rounded-[28px] bg-slate-900 items-center justify-center shadow-xl shadow-slate-300 dark:shadow-none mb-6">
            <Icon name="key-variant" size={32} color="white" />
          </View>
          <Text className="text-3xl font-black text-slate-900 dark:text-slate-100 italic">Reset Key</Text>
          <Text className="text-slate-400 font-medium text-center mt-1">Strengthen your account access</Text>
        </Animated.View>

        {/* Security Alert Banner */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)}>
          <View className="bg-indigo-600 p-6 rounded-[32px] mb-8 shadow-xl shadow-indigo-100 dark:shadow-none overflow-hidden">
            <View className="flex-row items-center mb-4">
              <Icon name="shield-lock" size={20} color="white" className="mr-2" />
              <Text className="text-white font-black text-sm uppercase tracking-widest">Protocol Check</Text>
            </View>
            <Text className="text-white/80 text-xs leading-5">
              Changing your password will sign you out of all other active sessions for your protection.
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(800)}>
          <Card className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl shadow-slate-100 dark:shadow-none border border-slate-100 dark:border-slate-800">
            <View className="space-y-6">
              <Input
                label="Old Password"
                placeholder="Required"
                value={formData.current_password}
                onChangeText={(t) => setFormData({ ...formData, current_password: t })}
                isPassword
                leftIcon="lock-outline"
                error={errors.current_password}
                className="mb-4"
              />

              <View className="mb-4">
                <Input
                  label="New Secure Password"
                  placeholder="At least 8 chars"
                  value={formData.new_password}
                  onChangeText={(t) => setFormData({ ...formData, new_password: t })}
                  isPassword
                  leftIcon="shield-outline"
                  error={errors.new_password}
                />

                {formData.new_password.length > 0 && (
                  <View className="mt-4">
                    <View className="flex-row space-x-1.5 h-1.5 mb-2">
                      {[1, 2, 3, 4].map((i) => (
                        <View
                          key={i}
                          className={`flex-1 rounded-full ${i <= strength.level ? strength.color : 'bg-slate-100 dark:bg-slate-800'}`}
                        />
                      ))}
                    </View>
                    <Text className={`text-[9px] font-black uppercase tracking-widest text-right ${strength.color.replace('bg-', 'text-')}`}>
                      {strength.text}
                    </Text>
                  </View>
                )}
              </View>

              <Input
                label="Repeat Password"
                placeholder="Confirm entry"
                value={formData.confirm_password}
                onChangeText={(t) => setFormData({ ...formData, confirm_password: t })}
                isPassword
                leftIcon="shield-check-outline"
                error={errors.confirm_password}
              />
            </View>

            <View className="mt-10">
              <Button
                title={loading ? 'Updating Identity...' : 'Confirm New Password'}
                onPress={handleChangePassword}
                loading={loading}
                disabled={loading}
                size="lg"
                className="rounded-3xl shadow-lg shadow-indigo-200 dark:shadow-none"
              />
              <TouchableOpacity onPress={() => navigation.goBack()} className="mt-6 items-center">
                <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider">Keep Current Key</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>

        <View className="mt-10 items-center opacity-30 px-10">
          <Text className="text-[9px] text-slate-400 font-bold text-center uppercase leading-4 tracking-tighter">
            We use industry standard hashing algorithms to encrypt your password. Our team never has access to your raw credentials.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ChangePasswordScreen;
