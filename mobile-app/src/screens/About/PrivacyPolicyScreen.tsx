import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

const PrivacyPolicyScreen: React.FC = () => (
  <SafeAreaView style={styles.container}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Text style={styles.lastUpdated}>Last updated: January 2024</Text>
      <Text style={styles.heading}>Information We Collect</Text>
      <Text style={styles.body}>We collect information necessary for the operation of the School Management System, including student records, attendance data, academic performance, fee transactions, and communication logs.</Text>
      <Text style={styles.heading}>How We Use Information</Text>
      <Text style={styles.body}>Information is used solely for educational administration purposes including academic tracking, fee management, transport coordination, and school-parent communication.</Text>
      <Text style={styles.heading}>Data Security</Text>
      <Text style={styles.body}>We implement industry-standard security measures to protect your data including encryption, secure servers, and regular security audits.</Text>
      <Text style={styles.heading}>Data Retention</Text>
      <Text style={styles.body}>Personal data is retained for the duration of the student's enrollment and as required by educational regulations. Data may be anonymized for statistical purposes.</Text>
      <Text style={styles.heading}>Your Rights</Text>
      <Text style={styles.body}>You have the right to access, correct, or request deletion of your personal data. Contact the school administration to exercise these rights.</Text>
      <Text style={styles.heading}>Contact Us</Text>
      <Text style={styles.body}>For privacy-related questions, contact our Data Protection Officer at privacy@school.edu.</Text>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  lastUpdated: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.sm, color: COLORS.textMuted, marginBottom: 20 },
  heading: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.md, color: COLORS.text, marginTop: 20, marginBottom: 8 },
  body: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.base, color: COLORS.textSecondary, lineHeight: 24 },
});

export default PrivacyPolicyScreen;
