/**
 * OTP Login Screen — Workstream L
 *
 * Allows parents/students to log in via:
 *   1. Phone OTP (SMS via MSG91)
 *   2. Admission Number + Date of Birth
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { authService } from '@/services/api';
import { AuthStackParamList } from '@/types/navigation';
import { STORAGE_KEYS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'OTPLogin'>;

type LoginTab = 'otp' | 'admission';

const OTP_LENGTH = 6;

const OTPLoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();

  const [activeTab, setActiveTab] = useState<LoginTab>('otp');

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [sessionId, setSessionId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Admission login state
  const [admissionNo, setAdmissionNo] = useState('');
  const [dob, setDob] = useState('');
  const [admissionLoading, setAdmissionLoading] = useState(false);
  const [admissionError, setAdmissionError] = useState('');

  // OTP digit refs for auto-focus
  const otpRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // ── Phone OTP ──────────────────────────────────────────────

  const handleSendOTP = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setOtpError('Enter a valid 10-digit mobile number');
      return;
    }
    setOtpError('');
    setOtpLoading(true);
    try {
      const result = await authService.requestOTP(cleaned);
      setSessionId(result.session_id);
      setOtpSent(true);
      setResendTimer(60);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch (err: any) {
      setOtpError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpDigit = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otp = otpDigits.join('');
    if (otp.length < OTP_LENGTH) {
      setOtpError('Enter all 6 digits');
      return;
    }
    setOtpError('');
    setVerifyLoading(true);
    try {
      const result = await authService.verifyOTP(phone, otp, sessionId);
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.access);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.refresh);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(result.user));
      dispatch({ type: 'auth/login/fulfilled', payload: result });
    } catch (err: any) {
      setOtpError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  // ── Admission Login ────────────────────────────────────────

  const handleAdmissionLogin = async () => {
    if (!admissionNo.trim()) {
      setAdmissionError('Enter admission number');
      return;
    }
    if (!dob.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setAdmissionError('Enter date of birth in YYYY-MM-DD format');
      return;
    }
    setAdmissionError('');
    setAdmissionLoading(true);
    try {
      const result = await authService.admissionLogin(admissionNo.trim(), dob);
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.access);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, result.refresh);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(result.user));
      dispatch({ type: 'auth/login/fulfilled', payload: result });
    } catch (err: any) {
      setAdmissionError(err.message || 'Invalid admission number or date of birth.');
    } finally {
      setAdmissionLoading(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-8">
            <View className="w-16 h-16 rounded-2xl bg-indigo-600 items-center justify-center mb-4">
              <Icon name="shield-key" size={32} color="white" />
            </View>
            <Text className="text-2xl font-black text-slate-900 dark:text-slate-100">Quick Login</Text>
            <Text className="text-slate-500 text-sm mt-1 text-center">
              Login with phone OTP or admission number
            </Text>
          </Animated.View>

          {/* Tab Switch */}
          <Animated.View entering={FadeInUp.delay(100).duration(500)} className="flex-row bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 mb-6">
            <TouchableOpacity
              onPress={() => setActiveTab('otp')}
              className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'otp' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
            >
              <Text className={`font-bold text-sm ${activeTab === 'otp' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                Phone OTP
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('admission')}
              className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'admission' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
            >
              <Text className={`font-bold text-sm ${activeTab === 'admission' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                Admission No.
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Phone OTP Panel */}
          {activeTab === 'otp' && (
            <Animated.View entering={FadeInUp.delay(150).duration(500)} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-slate-800">
              {otpError ? (
                <View className="bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl mb-4 flex-row items-center">
                  <Icon name="alert-circle" size={16} color="#e11d48" />
                  <Text className="ml-2 text-rose-700 dark:text-rose-400 text-xs font-medium flex-1">{otpError}</Text>
                </View>
              ) : null}

              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mobile Number</Text>
              <View className="flex-row items-center border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mb-4 bg-slate-50 dark:bg-slate-800">
                <Text className="text-slate-500 mr-2 font-medium">+91</Text>
                <TextInput
                  className="flex-1 text-slate-900 dark:text-slate-100 text-base"
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={10}
                  editable={!otpSent}
                />
                {otpSent && (
                  <TouchableOpacity onPress={() => { setOtpSent(false); setOtpDigits(Array(OTP_LENGTH).fill('')); }}>
                    <Icon name="pencil" size={16} color="#6366f1" />
                  </TouchableOpacity>
                )}
              </View>

              {!otpSent ? (
                <TouchableOpacity
                  onPress={handleSendOTP}
                  disabled={otpLoading}
                  className="bg-indigo-600 py-4 rounded-2xl items-center"
                >
                  {otpLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-base">Send OTP</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <>
                  <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Enter OTP</Text>
                  <View className="flex-row justify-between mb-4">
                    {otpDigits.map((digit, i) => (
                      <TextInput
                        key={i}
                        ref={(r) => { otpRefs.current[i] = r; }}
                        className="w-12 h-12 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-xl font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800"
                        value={digit}
                        onChangeText={(v) => handleOtpDigit(v, i)}
                        onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={handleVerifyOTP}
                    disabled={verifyLoading}
                    className="bg-indigo-600 py-4 rounded-2xl items-center mb-3"
                  >
                    {verifyLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-bold text-base">Verify & Login</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={resendTimer === 0 ? handleSendOTP : undefined}
                    disabled={resendTimer > 0 || otpLoading}
                    className="items-center py-2"
                  >
                    <Text className={`text-sm font-medium ${resendTimer > 0 ? 'text-slate-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
          )}

          {/* Admission Login Panel */}
          {activeTab === 'admission' && (
            <Animated.View entering={FadeInUp.delay(150).duration(500)} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-slate-800">
              {admissionError ? (
                <View className="bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl mb-4 flex-row items-center">
                  <Icon name="alert-circle" size={16} color="#e11d48" />
                  <Text className="ml-2 text-rose-700 dark:text-rose-400 text-xs font-medium flex-1">{admissionError}</Text>
                </View>
              ) : null}

              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Admission Number</Text>
              <View className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mb-4 bg-slate-50 dark:bg-slate-800">
                <TextInput
                  className="text-slate-900 dark:text-slate-100 text-base"
                  placeholder="e.g. ADM2024001"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="characters"
                  value={admissionNo}
                  onChangeText={setAdmissionNo}
                />
              </View>

              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date of Birth (YYYY-MM-DD)</Text>
              <View className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mb-6 bg-slate-50 dark:bg-slate-800">
                <TextInput
                  className="text-slate-900 dark:text-slate-100 text-base"
                  placeholder="2010-01-15"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numbers-and-punctuation"
                  value={dob}
                  onChangeText={setDob}
                  maxLength={10}
                />
              </View>

              <TouchableOpacity
                onPress={handleAdmissionLogin}
                disabled={admissionLoading}
                className="bg-indigo-600 py-4 rounded-2xl items-center"
              >
                {admissionLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-base">Login</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Back to email login */}
          <Animated.View entering={FadeInUp.delay(300).duration(500)} className="mt-6 items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center py-2">
              <Icon name="arrow-left" size={16} color="#6366f1" />
              <Text className="ml-1 text-indigo-600 dark:text-indigo-400 font-bold text-sm">Back to Email Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default OTPLoginScreen;
