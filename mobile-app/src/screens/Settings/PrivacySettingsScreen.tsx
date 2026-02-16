import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const PrivacySettingsScreen: React.FC = () => {
  const [showProfile, setShowProfile] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  const renderToggle = (label: string, desc: string, value: boolean, onChange: (v: boolean) => void) => (
    <View style={styles.row}>
      <View style={styles.info}><Text style={styles.label}>{label}</Text><Text style={styles.desc}>{desc}</Text></View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: COLORS.primaryMuted, false: COLORS.gray200 }} thumbColor={value ? COLORS.primary : COLORS.gray400} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visibility</Text>
          <View style={styles.card}>
            {renderToggle('Profile Visible', 'Allow others to view your profile', showProfile, setShowProfile)}
            <View style={styles.divider} />
            {renderToggle('Show Phone Number', 'Display phone on your profile', showPhone, setShowPhone)}
            <View style={styles.divider} />
            {renderToggle('Show Email', 'Display email on your profile', showEmail, setShowEmail)}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.card}>
            {renderToggle('Analytics', 'Help improve the app with usage data', analytics, setAnalytics)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  section: { paddingHorizontal: SPACING.base, marginTop: SPACING.lg },
  sectionTitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.sm, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  info: { flex: 1 },
  label: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.base, color: COLORS.text },
  desc: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: SPACING.xs },
});

export default PrivacySettingsScreen;
