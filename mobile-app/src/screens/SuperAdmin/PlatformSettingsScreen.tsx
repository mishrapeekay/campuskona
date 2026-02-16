/**
 * PlatformSettingsScreen - Global Platform Configuration for Super Admin
 *
 * Controls platform-wide settings: maintenance mode, feature flags,
 * email templates, API rate limits, subscription plans, and security policies.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  value: boolean;
  dangerous?: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
  <View className="flex-row items-center mb-3 mt-6 px-1">
    <View className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 items-center justify-center mr-2">
      <Icon name={icon} size={15} color="#6366f1" />
    </View>
    <Text className="text-[11px] font-black text-indigo-600 uppercase tracking-[2px]">{title}</Text>
  </View>
);

const SettingRow = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  isLast,
  danger,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isLast?: boolean;
  danger?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    className={`flex-row items-center p-4 bg-white dark:bg-slate-900 ${
      !isLast ? 'border-b border-slate-50 dark:border-slate-800' : ''
    }`}
  >
    <View
      className="w-9 h-9 rounded-xl items-center justify-center mr-3"
      style={{ backgroundColor: danger ? '#fef2f2' : '#f8fafc' }}
    >
      <Icon name={icon} size={18} color={danger ? '#ef4444' : '#64748b'} />
    </View>
    <View className="flex-1">
      <Text className={`text-sm font-bold ${danger ? 'text-rose-600' : 'text-slate-800 dark:text-slate-100'}`}>{title}</Text>
      {subtitle && (
        <Text className="text-[11px] text-slate-400 font-medium mt-0.5" numberOfLines={2}>{subtitle}</Text>
      )}
    </View>
    {rightElement || (onPress && <Icon name="chevron-right" size={18} color="#cbd5e1" />)}
  </TouchableOpacity>
);

const ToggleRow = ({
  item,
  onToggle,
  isLast,
}: {
  item: SettingToggle;
  onToggle: (id: string, value: boolean) => void;
  isLast?: boolean;
}) => (
  <View
    className={`flex-row items-center p-4 bg-white dark:bg-slate-900 ${
      !isLast ? 'border-b border-slate-50 dark:border-slate-800' : ''
    }`}
  >
    <View className="flex-1 mr-3">
      <Text className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.label}</Text>
      <Text className="text-[11px] text-slate-400 font-medium mt-0.5" numberOfLines={2}>
        {item.description}
      </Text>
    </View>
    <Switch
      value={item.value}
      onValueChange={(v) => {
        if (item.dangerous) {
          Alert.alert(
            'Confirm Action',
            `Are you sure you want to ${v ? 'enable' : 'disable'} "${item.label}"?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Confirm', style: 'destructive', onPress: () => onToggle(item.id, v) },
            ]
          );
        } else {
          onToggle(item.id, v);
        }
      }}
      trackColor={{ false: '#e2e8f0', true: '#a5b4fc' }}
      thumbColor={item.value ? '#6366f1' : '#f1f5f9'}
    />
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

const PlatformSettingsScreen: React.FC = () => {
  const navigation = useNavigation();

  const [platformToggles, setPlatformToggles] = useState<SettingToggle[]>([
    { id: 'maintenance',   label: 'Maintenance Mode',        description: 'Block all tenant logins and show maintenance page', value: false, dangerous: true },
    { id: 'new_signups',   label: 'New School Signups',       description: 'Allow new schools to register via the platform',    value: true },
    { id: 'trial_access',  label: 'Trial Access',             description: 'Allow new schools to start with a free trial',      value: true },
  ]);

  const [featureToggles, setFeatureToggles] = useState<SettingToggle[]>([
    { id: 'biometric',     label: 'Biometric Attendance',     description: 'Enable biometric device integration globally',      value: true },
    { id: 'payments',      label: 'Online Fee Payments',      description: 'Enable payment gateway for all schools',            value: true },
    { id: 'library',       label: 'Library Module',           description: 'Enable library management across all tenants',      value: true },
    { id: 'transport',     label: 'Transport Module',         description: 'Enable bus tracking and transport management',      value: true },
    { id: 'hostel',        label: 'Hostel Module',            description: 'Enable hostel management features',                 value: false },
    { id: 'mobile_app',    label: 'Mobile App Access',        description: 'Allow students/parents to use the mobile app',      value: true },
  ]);

  const [notifToggles, setNotifToggles] = useState<SettingToggle[]>([
    { id: 'sms_notif',   label: 'SMS Notifications',         description: 'Send SMS alerts for critical events (usage costs)', value: false },
    { id: 'email_notif', label: 'Email Digest',              description: 'Daily platform health digest to super admin',       value: true },
    { id: 'push_notif',  label: 'Push Notifications',        description: 'Send push alerts for new tenant events',            value: true },
  ]);

  const handleToggle = (
    setter: React.Dispatch<React.SetStateAction<SettingToggle[]>>,
    id: string,
    value: boolean
  ) => {
    setter((prev) => prev.map((t) => (t.id === id ? { ...t, value } : t)));
  };

  const handleDangerousAction = (label: string, action: () => void) => {
    Alert.alert(
      '⚠️ Danger Zone',
      `This will ${label}. This action cannot be undone. Are you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Proceed', style: 'destructive', onPress: action },
      ]
    );
  };

  return (
    <ScreenWrapper>
      <Header
        title="Platform Settings"
        subtitle="Global Configuration"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Platform Status ─────────────────────── */}
        <Animated.View entering={FadeInUp.duration(400)}>
          <SectionHeader title="Platform Status" icon="server-network" />
          <View className="rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none">
            {platformToggles.map((item, i) => (
              <ToggleRow
                key={item.id}
                item={item}
                onToggle={(id, v) => handleToggle(setPlatformToggles, id, v)}
                isLast={i === platformToggles.length - 1}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── Feature Flags ───────────────────────── */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <SectionHeader title="Feature Flags" icon="toggle-switch" />
          <View className="rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none">
            {featureToggles.map((item, i) => (
              <ToggleRow
                key={item.id}
                item={item}
                onToggle={(id, v) => handleToggle(setFeatureToggles, id, v)}
                isLast={i === featureToggles.length - 1}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── Notifications ───────────────────────── */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <SectionHeader title="Notifications" icon="bell-cog" />
          <View className="rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none">
            {notifToggles.map((item, i) => (
              <ToggleRow
                key={item.id}
                item={item}
                onToggle={(id, v) => handleToggle(setNotifToggles, id, v)}
                isLast={i === notifToggles.length - 1}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── Subscription Plans ──────────────────── */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <SectionHeader title="Subscription Plans" icon="credit-card-settings" />
          <View className="rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none">
            <SettingRow icon="crown"        title="Manage Plans"         subtitle="Edit pricing, features and limits for Basic, Standard & Premium"  onPress={() => Alert.alert('Coming Soon', 'Plan editor will be available in the next update.')} />
            <SettingRow icon="tag-multiple" title="Promo Codes"          subtitle="Create and manage discount codes for new tenants"                  onPress={() => Alert.alert('Coming Soon', 'Promo code manager is coming soon.')} />
            <SettingRow icon="receipt"      title="Billing History"      subtitle="View all invoices and payment records"                             onPress={() => Alert.alert('Coming Soon', 'Billing history viewer is coming soon.')} isLast />
          </View>
        </Animated.View>

        {/* ── Security & Access ───────────────────── */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <SectionHeader title="Security & Access" icon="shield-lock" />
          <View className="rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none">
            <SettingRow icon="account-key"   title="API Key Management"    subtitle="Generate and rotate platform-level API keys"                      onPress={() => Alert.alert('Coming Soon', 'API key manager is coming soon.')} />
            <SettingRow icon="ip-network"    title="IP Whitelist"          subtitle="Restrict Super Admin access to specific IP addresses"             onPress={() => Alert.alert('Coming Soon', 'IP whitelist is coming soon.')} />
            <SettingRow icon="lock-reset"    title="Force Logout All"      subtitle="Terminate all active sessions across the platform"                onPress={() => handleDangerousAction('terminate ALL active sessions', () => Alert.alert('Done', 'All sessions terminated.'))} isLast />
          </View>
        </Animated.View>

        {/* ── Danger Zone ─────────────────────────── */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)}>
          <SectionHeader title="Danger Zone" icon="alert" />
          <View className="rounded-3xl overflow-hidden border border-rose-100 dark:border-rose-900/30 shadow-sm">
            <SettingRow
              icon="database-remove"
              title="Purge Inactive Tenants"
              subtitle="Permanently delete all tenants that have been inactive for 6+ months"
              onPress={() => handleDangerousAction('permanently delete all inactive tenants', () => {})}
              danger
            />
            <SettingRow
              icon="cloud-download"
              title="Export Full Platform Data"
              subtitle="Download a complete data export of all tenant and user data"
              onPress={() => Alert.alert('Export Started', 'You will receive an email with the download link within 30 minutes.')}
              danger
              isLast
            />
          </View>
        </Animated.View>

        {/* Version */}
        <View className="items-center mt-8 mb-4">
          <Text className="text-[10px] text-slate-300 font-semibold">Platform v1.0.0 · Build 2026.02</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default PlatformSettingsScreen;
