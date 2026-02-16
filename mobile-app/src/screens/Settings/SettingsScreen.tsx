/**
 * SettingsScreen - App settings and preferences
 */

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { label: 'Edit Profile', icon: 'account-edit', route: 'EditProfile', color: COLORS.primary },
        { label: 'Change Password', icon: 'lock-reset', route: 'ChangePassword', color: COLORS.secondary },
        { label: 'Linked Accounts', icon: 'link-variant', route: 'LinkedAccounts', color: COLORS.info },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Notifications', icon: 'bell-outline', route: 'NotificationSettings', color: COLORS.warning },
        { label: 'Language', icon: 'translate', route: 'LanguageSettings', color: COLORS.success },
        { label: 'Appearance', icon: 'palette-outline', route: 'ThemeSettings', color: COLORS.secondary },
        { label: 'Privacy', icon: 'shield-lock-outline', route: 'PrivacySettings', color: COLORS.error },
      ],
    },
    {
      title: 'Data',
      items: [
        { label: 'Security', icon: 'security', route: 'SecuritySettings', color: COLORS.error },
        { label: 'Data & Storage', icon: 'database', route: 'DataSettings', color: COLORS.accent },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', icon: 'help-circle-outline', route: 'HelpCenter', color: COLORS.info },
        { label: 'Send Feedback', icon: 'message-draw', route: 'Feedback', color: COLORS.success },
        { label: 'Report a Bug', icon: 'bug-outline', route: 'ReportBug', color: COLORS.error },
        { label: 'About', icon: 'information-outline', route: 'About', color: COLORS.primary },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[styles.settingItem, itemIndex < group.items.length - 1 && styles.settingItemBorder]}
                  onPress={() => navigation.navigate(item.route)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                    <Icon name={item.icon} size={22} color={item.color} />
                  </View>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Icon name="chevron-right" size={22} color={COLORS.gray400} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton}>
          <Icon name="logout" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0 (Build 1)</Text>

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  group: { paddingHorizontal: SPACING.base, marginTop: SPACING.lg },
  groupTitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.sm, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm, marginLeft: SPACING.xs },
  groupCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, ...SHADOWS.sm },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base },
  settingItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  iconContainer: { width: 40, height: 40, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  settingLabel: { flex: 1, fontFamily: FONTS.family.medium, fontSize: FONTS.size.base, color: COLORS.text },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    marginHorizontal: SPACING.base, marginTop: SPACING.xl, paddingVertical: SPACING.base,
    borderRadius: RADIUS.lg, backgroundColor: COLORS.errorMuted,
  },
  logoutText: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.md, color: COLORS.error },
  version: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.sm, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.lg },
});

export default SettingsScreen;
