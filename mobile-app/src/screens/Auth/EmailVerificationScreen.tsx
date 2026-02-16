import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInDown, FadeIn, Layout } from 'react-native-reanimated';

import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import { Card, Button } from '@/components/ui';
import Input from '@/components/common/Input';

interface RouteParams {
  email: string;
  userId: string;
}

const EmailVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // @ts-ignore
      navigation.replace('BiometricSetup');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCanResend(false);
      setCountdown(60);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <ScreenWrapper>
      <View className="flex-1 bg-slate-50 dark:bg-slate-950 px-6 py-10 justify-center">
        {/* Header Section */}
        <Animated.View entering={FadeInDown.duration(800)} className="items-center mb-10">
          <View className="w-24 h-24 rounded-[32px] bg-indigo-600 items-center justify-center shadow-2xl shadow-indigo-300 dark:shadow-none mb-8">
            <Icon name="email-check-outline" size={48} color="white" />
          </View>
          <Text className="text-3xl font-black text-slate-900 dark:text-slate-100 text-center">Verify Identity</Text>
          <Text className="text-slate-500 font-medium text-center mt-2 px-6">
            We've sent a 6-digit verification code to
          </Text>
          <View className="bg-indigo-50 dark:bg-indigo-950/30 px-4 py-1.5 rounded-full mt-3">
            <Text className="text-indigo-600 dark:text-indigo-400 font-bold text-xs">{params?.email || 'your email'}</Text>
          </View>
        </Animated.View>

        {/* Verification Card */}
        <Animated.View entering={FadeInUp.delay(300).duration(800)}>
          <Card className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-none mb-10">
            {error ? (
              <Animated.View entering={FadeIn.duration(400)} className="bg-rose-50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 mb-6 flex-row items-center">
                <Icon name="alert-circle" size={18} className="text-rose-600 dark:text-rose-400 mr-2" />
                <Text className="text-rose-700 dark:text-rose-400 text-[10px] font-bold flex-1">{error}</Text>
              </Animated.View>
            ) : null}

            <Input
              label="Verification Code"
              placeholder="000 000"
              value={code}
              onChangeText={(text) => {
                setCode(text.replace(/[^0-9]/g, '').slice(0, 6));
                setError('');
              }}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              className="text-center tracking-[10px] text-2xl font-black mb-8"
              style={{ textAlign: 'center' }}
            />

            <Button
              title={loading ? 'Verifying Identity...' : 'Confirm Code'}
              onPress={handleVerify}
              disabled={loading || code.length !== 6}
              loading={loading}
              size="lg"
              className="rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none"
            />

            <View className="flex-row items-center justify-center mt-8 space-x-1">
              <Text className="text-slate-400 text-xs font-medium">Didn't get the code?</Text>
              {canResend ? (
                <TouchableOpacity onPress={handleResendCode} disabled={resending}>
                  <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    {resending ? 'Sending...' : 'Resend Now'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full ml-1">
                  <Text className="text-slate-500 font-bold text-[10px]">Retry in {countdown}s</Text>
                </View>
              )}
            </View>
          </Card>
        </Animated.View>

        {/* Footer & Help */}
        <Animated.View entering={FadeIn.delay(600).duration(1000)} className="items-center">
          <View className="flex-row items-center mb-10 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-2xl">
            <Icon name="information-outline" size={16} className="text-slate-400 mr-2" />
            <Text className="text-[10px] text-slate-500 font-medium">Please check your spam folder if the email is missing.</Text>
          </View>

          <TouchableOpacity
            className="flex-row items-center py-2 px-4"
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={16} className="text-slate-400 mr-2" />
            <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider">Cancel & Go Back</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
};

export default EmailVerificationScreen;
