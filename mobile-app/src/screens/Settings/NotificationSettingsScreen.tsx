/**
 * NotificationSettingsScreen - Push/Email/SMS notification preferences
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const NotificationSettingsScreen: React.FC = () => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [feeReminders, setFeeReminders] = useState(true);
  const [examResults, setExamResults] = useState(true);
  const [notices, setNotices] = useState(true);
  const [transport, setTransport] = useState(true);

  const renderToggle = (label: string, description: string, value: boolean, onChange: (v: boolean) => void, icon: string, color: string) => (
    <View style={styles.toggleRow}>
      <View style={[styles.toggleIcon, { backgroundColor: color + '15' }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: COLORS.primaryMuted, false: COLORS.gray200 }}
        thumbColor={value ? COLORS.primary : COLORS.gray400}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Channels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          <View style={styles.card}>
            {renderToggle('Push Notifications', 'Receive instant alerts on your device', pushEnabled, setPushEnabled, 'bell-ring', COLORS.primary)}
            <View style={styles.divider} />
            {renderToggle('Email Notifications', 'Receive updates via email', emailEnabled, setEmailEnabled, 'email', COLORS.secondary)}
            <View style={styles.divider} />
            {renderToggle('SMS Notifications', 'Receive text messages', smsEnabled, setSmsEnabled, 'message-text', COLORS.success)}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Categories</Text>
          <View style={styles.card}>
            {renderToggle('Attendance', 'Daily attendance updates', attendanceAlerts, setAttendanceAlerts, 'clipboard-check', COLORS.info)}
            <View style={styles.divider} />
            {renderToggle('Fee Reminders', 'Payment due alerts', feeReminders, setFeeReminders, 'currency-inr', COLORS.warning)}
            <View style={styles.divider} />
            {renderToggle('Exam Results', 'Result notifications', examResults, setExamResults, 'school', COLORS.success)}
            <View style={styles.divider} />
            {renderToggle('Notices', 'School announcements', notices, setNotices, 'bulletin-board', COLORS.secondary)}
            <View style={styles.divider} />
            {renderToggle('Transport', 'Bus tracking alerts', transport, setTransport, 'bus', COLORS.accent)}
          </View>
        </View>

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  section: { paddingHorizontal: SPACING.base, marginTop: SPACING.lg },
  sectionTitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.sm, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  toggleIcon: { width: 40, height: 40, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.base, color: COLORS.text },
  toggleDesc: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: SPACING.xs },
});

export default NotificationSettingsScreen;
