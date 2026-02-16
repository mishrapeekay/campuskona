import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInDown, FadeIn, withRepeat, withTiming, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import { Card, Button } from '@/components/ui';
import { biometricService, BiometricCapabilities } from '@/services/biometric.service';

const BiometricSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const [capabilities, setCapabilities] = useState<BiometricCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [enabling, setEnabling] = useState(false);

  const pulse = useSharedValue(1);

  useEffect(() => {
    checkBiometricCapabilities();
    pulse.value = withRepeat(withTiming(1.1, { duration: 1500 }), -1, true);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 1 / pulse.value
  }));

  const checkBiometricCapabilities = async () => {
    setLoading(true);
    const caps = await biometricService.checkAvailability();
    setCapabilities(caps);
    setLoading(false);
  };

  const handleEnableBiometric = async () => {
    setEnabling(true);
    try {
      const success = await biometricService.enableBiometricAuth();
      if (success) {
        // @ts-ignore
        navigation.replace('MainNavigator');
      } else {
        alert('Authentication failed. Please try again.');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to enable biometric authentication');
    } finally {
      setEnabling(false);
    }
  };

  const handleSkip = () => {
    // @ts-ignore
    navigation.replace('MainNavigator');
  };

  const getBiometricIcon = () => {
    if (!capabilities?.biometryType) return 'fingerprint';
    const iconMap: Record<string, string> = {
      FaceID: 'face-recognition',
      TouchID: 'fingerprint',
      Biometrics: 'fingerprint',
    };
    return iconMap[capabilities.biometryType] || 'fingerprint';
  };

  const getBiometricTitle = () => {
    if (!capabilities?.biometryType) return 'Biometric';
    return biometricService.getBiometryTypeName(capabilities.biometryType);
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center p-6">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="text-slate-500 font-bold mt-6 uppercase tracking-widest text-xs">Evaluating Device Security...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!capabilities?.available) {
    return (
      <ScreenWrapper>
        <View className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center p-8">
          <Animated.View entering={FadeInDown.duration(800)} className="items-center">
            <View className="w-24 h-24 rounded-3xl bg-slate-200 dark:bg-slate-800 items-center justify-center mb-8">
              <Icon name="lock-off" size={48} className="text-slate-400" />
            </View>
            <Text className="text-3xl font-black text-slate-900 dark:text-slate-100 text-center">Unavailable</Text>
            <Text className="text-slate-500 font-medium text-center mt-2 mb-10">
              {capabilities?.error || 'Your device does not support biometric security features.'}
            </Text>
            <Button
              title="Proceed to Dashboard"
              onPress={handleSkip}
              className="w-full rounded-2xl"
              size="lg"
            />
          </Animated.View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View className="flex-1 bg-slate-50 dark:bg-slate-950 px-6 py-10 justify-center">
        {/* Security Pulse Icon */}
        <Animated.View entering={FadeInDown.duration(800)} className="items-center mb-10">
          <View className="items-center justify-center">
            <Animated.View style={pulseStyle} className="absolute w-28 h-28 rounded-full bg-indigo-500/20" />
            <View className="w-24 h-24 rounded-[32px] bg-indigo-600 items-center justify-center shadow-2xl shadow-indigo-300 dark:shadow-none">
              <Icon name={getBiometricIcon()} size={48} color="white" />
            </View>
          </View>
          <Text className="text-3xl font-black text-slate-900 dark:text-slate-100 text-center mt-8">
            Enable {getBiometricTitle()}
          </Text>
          <Text className="text-slate-500 font-medium text-center mt-2 px-6">
            Add an extra layer of security and convenience to your portal access.
          </Text>
        </Animated.View>

        {/* Benefits Card */}
        <Animated.View entering={FadeInUp.delay(300).duration(800)}>
          <Card className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-none mb-10">
            <FeatureRow icon="shield-check" title="Privacy First" description="Biometric data is stored locally on your device secure enclave." />
            <FeatureRow icon="lightning-bolt" title="Zero Wait Time" description="Access your dashboard instantly without typing passwords." />
            <FeatureRow icon="cog-refresh" title="Full Control" description="You can manage or disable this anytime in account settings." isLast />
          </Card>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeIn.delay(600).duration(1000)} className="space-y-4">
          <Button
            title={enabling ? 'Authenticating...' : `Setup ${getBiometricTitle()}`}
            onPress={handleEnableBiometric}
            disabled={enabling}
            loading={enabling}
            size="lg"
            className="rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none"
          />
          <TouchableOpacity
            onPress={handleSkip}
            disabled={enabling}
            className="py-4 items-center"
          >
            <Text className="text-slate-400 font-bold text-sm tracking-wider uppercase">Skip for Now</Text>
          </TouchableOpacity>
        </Animated.View>

        <View className="flex-row items-center justify-center mt-10 opacity-50 px-10">
          <Icon name="information-outline" size={14} className="text-slate-500 mr-2" />
          <Text className="text-[10px] text-slate-500 font-medium text-center">
            Standard device security protocols apply for {getBiometricTitle()} usage.
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const FeatureRow = ({ icon, title, description, isLast }: any) => (
  <View className={`flex-row items-start ${!isLast ? 'mb-8' : ''}`}>
    <View className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 items-center justify-center mr-4">
      <Icon name={icon} size={20} className="text-emerald-600 dark:text-emerald-400" />
    </View>
    <View className="flex-1">
      <Text className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</Text>
      <Text className="text-xs text-slate-500 font-medium mt-0.5 leading-4">{description}</Text>
    </View>
  </View>
);

export default BiometricSetupScreen;
