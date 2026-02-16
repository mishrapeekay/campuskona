import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

interface FAQ { id: string; question: string; answer: string; }

const faqs: FAQ[] = [
  { id: '1', question: 'How do I check my child\'s attendance?', answer: 'Go to the Academics tab and tap on Attendance. You can view daily attendance records and overall attendance percentage.' },
  { id: '2', question: 'How do I pay fees online?', answer: 'Navigate to the Finance tab, tap on Fee Overview, select the pending fee, and choose your preferred payment method to make the payment.' },
  { id: '3', question: 'How to track the school bus?', answer: 'Go to Services > Transport > Live Tracking to see real-time bus location on the map.' },
  { id: '4', question: 'How to view exam results?', answer: 'Go to Academics > Examinations > Exam Results to see your results with detailed subject-wise marks and grade.' },
  { id: '5', question: 'How to apply for leave?', answer: 'Go to Academics > Leave Requests > Apply Leave. Fill in the details and submit. Your class teacher will review the request.' },
  { id: '6', question: 'How to borrow books from the library?', answer: 'Visit the Library section under Services. Browse the catalog, find a book, and request it. The librarian will process your request.' },
  { id: '7', question: 'How to change my password?', answer: 'Go to Profile > Settings > Change Password. Enter your current password and set a new one.' },
];

const FAQScreen: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={faqs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.faqCard}
            onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.question}>{item.question}</Text>
              <Icon name={expandedId === item.id ? 'chevron-up' : 'chevron-down'} size={24} color={COLORS.gray400} />
            </View>
            {expandedId === item.id && (
              <Text style={styles.answer}>{item.answer}</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.base },
  faqCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOWS.sm },
  faqHeader: { flexDirection: 'row', alignItems: 'center' },
  question: { flex: 1, fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.text },
  answer: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.base, color: COLORS.textSecondary, marginTop: SPACING.md, lineHeight: 22 },
});

export default FAQScreen;
