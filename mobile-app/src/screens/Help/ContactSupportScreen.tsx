import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const ContactSupportScreen: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const contactMethods = [
    { label: 'Call Us', value: '+91 1800-123-4567', icon: 'phone', color: COLORS.success },
    { label: 'Email', value: 'support@school.edu', icon: 'email', color: COLORS.primary },
    { label: 'WhatsApp', value: '+91 98765 43210', icon: 'whatsapp', color: '#25D366' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Contact Methods */}
          <Text style={styles.sectionTitle}>Quick Contact</Text>
          <View style={styles.methodsRow}>
            {contactMethods.map((method, index) => (
              <TouchableOpacity key={index} style={styles.methodCard}>
                <View style={[styles.methodIcon, { backgroundColor: method.color + '15' }]}>
                  <Icon name={method.icon} size={24} color={method.color} />
                </View>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <Text style={styles.methodValue}>{method.value}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Form */}
          <Text style={styles.sectionTitle}>Send a Message</Text>
          <View style={styles.formCard}>
            <TextInput style={styles.input} placeholder="Subject" value={subject} onChangeText={setSubject} placeholderTextColor={COLORS.textMuted} />
            <TextInput style={styles.textArea} placeholder="Describe your issue..." value={message} onChangeText={setMessage} placeholderTextColor={COLORS.textMuted} multiline numberOfLines={6} textAlignVertical="top" />
            <TouchableOpacity style={[styles.submitButton, (!subject || !message) && styles.disabled]} disabled={!subject || !message}>
              <Icon name="send" size={20} color={COLORS.white} />
              <Text style={styles.submitText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.base },
  sectionTitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.lg, color: COLORS.text, marginBottom: SPACING.base, marginTop: SPACING.lg },
  methodsRow: { flexDirection: 'row', gap: SPACING.sm },
  methodCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', ...SHADOWS.sm },
  methodIcon: { width: 48, height: 48, borderRadius: RADIUS.full, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  methodLabel: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.sm, color: COLORS.text },
  methodValue: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: SPACING.xs, textAlign: 'center' },
  formCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.sm },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, fontFamily: FONTS.family.regular, fontSize: FONTS.size.base, color: COLORS.text, marginBottom: SPACING.md },
  textArea: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, fontFamily: FONTS.family.regular, fontSize: FONTS.size.base, color: COLORS.text, minHeight: 120, marginBottom: SPACING.md },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: SPACING.base, gap: SPACING.sm },
  disabled: { backgroundColor: COLORS.gray300 },
  submitText: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.md, color: COLORS.white },
});

export default ContactSupportScreen;
