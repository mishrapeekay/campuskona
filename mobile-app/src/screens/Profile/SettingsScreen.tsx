import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInDown, FadeIn, Layout } from 'react-native-reanimated';

import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { clearTenant } from '@/store/slices/tenantSlice';
import { COLORS } from '@/constants';
import { UserType } from '@/types/models';
import useAuth from '@hooks/useAuth';

import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card } from '@/components/ui';
import { biometricService } from '@/services/biometric.service';
import { notificationService } from '@/services/notification.service';

interface NotificationPreferences {
  attendance: boolean;
  fees: boolean;
  exams: boolean;
  notices: boolean;
  transport: boolean;
  library: boolean;
  general: boolean;
}

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    attendance: true,
    fees: true,
    exams: true,
    notices: true,
    transport: true,
    library: true,
    general: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const capabilities = await biometricService.checkAvailability();
      setBiometricAvailable(capabilities.available);
      setBiometricType(biometricService.getBiometryTypeName(capabilities.biometryType));
      setBiometricEnabled(biometricService.isBiometricEnabled());
      const prefs = await notificationService.getNotificationPreferences();
      setNotificationPrefs(prefs as NotificationPreferences);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    if (enabled) {
      const success = await biometricService.enableBiometricAuth();
      if (success) setBiometricEnabled(true);
      else Alert.alert('Error', 'Internal security module failed.');
    } else {
      Alert.alert('Disable Security', `Remove ${biometricType} access?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive', onPress: async () => {
            await biometricService.disableBiometricAuth();
            setBiometricEnabled(false);
          }
        },
      ]);
    }
  };

  const handleToggleNotification = async (category: keyof NotificationPreferences, enabled: boolean) => {
    const updatedPrefs = { ...notificationPrefs, [category]: enabled };
    setNotificationPrefs(updatedPrefs);
    try {
      await notificationService.updateNotificationPreferences(updatedPrefs);
    } catch (error) {
      setNotificationPrefs(notificationPrefs);
    }
  };

  return (
    <ScreenWrapper>
      <Header title="Preferences" showBackButton />

      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Appearance</Text>
          <Card className="bg-white dark:bg-slate-900 mb-8 overflow-hidden border border-slate-100 dark:border-slate-800 rounded-3xl">
            <ActionItem
              icon="palette-outline"
              title="Theme"
              subtitle="Light, Dark, or System"
              onPress={() => navigation.navigate('ThemeSettings')}
              color="text-violet-600"
            />
            <ActionItem
              icon="translate"
              title="Language"
              subtitle="English, हिन्दी, தமிழ் & more"
              onPress={() => navigation.navigate('LanguageSettings')}
              color="text-blue-600"
              isLast
            />
          </Card>
        </Animated.View>

        {/* Security Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Security Vault</Text>
          <Card className="bg-white dark:bg-slate-900 mb-8 overflow-hidden border border-slate-100 dark:border-slate-800 rounded-3xl">
            <ToggleItem
              icon="fingerprint"
              title={biometricType || 'Biometric Lock'}
              subtitle={biometricAvailable ? 'Secure device enclave' : 'Hardware not detected'}
              value={biometricEnabled}
              onToggle={handleToggleBiometric}
              disabled={!biometricAvailable}
              color="text-indigo-600"
            />
            <ActionItem
              icon="lock-open-outline"
              title="Change Password"
              subtitle="Rotate credentials"
              onPress={() => navigation.navigate('ChangePassword')}
              color="text-emerald-600"
              isLast
            />
          </Card>
        </Animated.View>

        {/* Notifications Section */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)}>
          <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Pulse Preferences</Text>
          <Card className="bg-white dark:bg-slate-900 mb-8 overflow-hidden border border-slate-100 dark:border-slate-800 rounded-3xl">
            <ToggleItem
              icon="calendar-check-outline"
              title="Attendance"
              subtitle="Daily check-in alerts"
              value={notificationPrefs.attendance}
              onToggle={(v) => handleToggleNotification('attendance', v)}
              color="text-amber-600"
            />
            <ToggleItem
              icon="credit-card-outline"
              title="Fee Transcripts"
              subtitle="Billing & receipts"
              value={notificationPrefs.fees}
              onToggle={(v) => handleToggleNotification('fees', v)}
              color="text-emerald-600"
            />
            <ToggleItem
              icon="school-outline"
              title="Academic Events"
              subtitle="Exams & results"
              value={notificationPrefs.exams}
              onToggle={(v) => handleToggleNotification('exams', v)}
              color="text-blue-600"
            />
            <ToggleItem
              icon="bullhorn-outline"
              title="Global Notices"
              subtitle="School announcements"
              value={notificationPrefs.notices}
              onToggle={(v) => handleToggleNotification('notices', v)}
              color="text-rose-600"
              isLast
            />
          </Card>
        </Animated.View>

        {/* Privacy Section */}
        <Animated.View entering={FadeInUp.delay(400).duration(800)}>
          <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Privacy & Compliance</Text>
          <Card className="bg-white dark:bg-slate-900 mb-8 overflow-hidden border border-slate-100 dark:border-slate-800 rounded-3xl">
            <ActionItem
              icon="shield-sync-outline"
              title="Consent Center"
              subtitle="Manage DPDP permissions"
              onPress={() => navigation.navigate('PrivacySettings')}
              color="text-indigo-500"
            />
            <ActionItem
              icon="database-export-outline"
              title="Portable Data"
              subtitle="Download your node record"
              onPress={() => Alert.alert('Data Request', 'Your data export request has been submitted. You will receive an email shortly.')}
              color="text-slate-500"
              isLast
            />
          </Card>
        </Animated.View>

        {/* Support Section */}
        <Animated.View entering={FadeInUp.delay(600).duration(800)}>
          <TouchableOpacity
            className="bg-slate-900 py-5 rounded-[32px] items-center justify-center flex-row mb-10 shadow-xl shadow-slate-300 dark:shadow-none"
            onPress={() => navigation.navigate('HelpCenter')}
          >
            <Icon name="help-circle-outline" size={20} color="white" className="mr-2" />
            <Text className="text-white font-black text-sm uppercase tracking-widest">Global Support Center</Text>
          </TouchableOpacity>
        </Animated.View>

        <View className="items-center opacity-30 mt-4">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px]">Platform Architecture v1.0</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const ToggleItem = ({ icon, title, subtitle, value, onToggle, disabled, color, isLast }: any) => (
  <View className={`flex-row items-center p-5 ${!isLast ? 'border-b border-slate-50 dark:border-slate-800' : ''} ${disabled ? 'opacity-40' : ''}`}>
    <View className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800/50 items-center justify-center mr-4">
      <Icon name={icon} size={22} className={color} />
    </View>
    <View className="flex-1">
      <Text className="text-sm font-black text-slate-800 dark:text-slate-200">{title}</Text>
      <Text className="text-[10px] text-slate-400 font-medium mt-0.5" numberOfLines={1}>{subtitle}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      disabled={disabled}
      trackColor={{ false: '#E2E8F0', true: '#4F46E5' }}
      thumbColor="white"
    />
  </View>
);

const ActionItem = ({ icon, title, subtitle, onPress, color, isLast }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center p-5 ${!isLast ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}
  >
    <View className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800/50 items-center justify-center mr-4">
      <Icon name={icon} size={22} className={color} />
    </View>
    <View className="flex-1">
      <Text className="text-sm font-black text-slate-800 dark:text-slate-200">{title}</Text>
      <Text className="text-[10px] text-slate-400 font-medium mt-0.5">{subtitle}</Text>
    </View>
    <Icon name="chevron-right" size={20} className="text-slate-300" />
  </TouchableOpacity>
);

export default SettingsScreen;
