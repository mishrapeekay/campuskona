import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';

const TermsScreen: React.FC = () => (
  <SafeAreaView style={styles.container}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Text style={styles.lastUpdated}>Last updated: January 2024</Text>
      <Text style={styles.heading}>1. Acceptance of Terms</Text>
      <Text style={styles.body}>By accessing and using the School Management System mobile application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.</Text>
      <Text style={styles.heading}>2. Use of Service</Text>
      <Text style={styles.body}>The application is intended for use by authorized members of the school community including administrators, teachers, students, and parents. You must maintain the confidentiality of your account credentials.</Text>
      <Text style={styles.heading}>3. Data Privacy</Text>
      <Text style={styles.body}>We are committed to protecting your personal information. Student data, academic records, and personal information are handled in accordance with applicable data protection regulations.</Text>
      <Text style={styles.heading}>4. Acceptable Use</Text>
      <Text style={styles.body}>Users agree not to misuse the application, share credentials, or attempt unauthorized access to other accounts or data.</Text>
      <Text style={styles.heading}>5. Modifications</Text>
      <Text style={styles.body}>We reserve the right to modify these terms at any time. Users will be notified of significant changes through the application.</Text>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.base },
  lastUpdated: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.sm, color: COLORS.textMuted, marginBottom: SPACING.lg },
  heading: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.md, color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  body: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.base, color: COLORS.textSecondary, lineHeight: 24 },
});

export default TermsScreen;
