import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    question: 'How do I reset my password?',
    answer: 'Go to Settings > Security > Change Password. You will need to enter your current password and then set a new one. Make sure your new password is at least 8 characters long and contains uppercase, lowercase, and numbers.',
    category: 'Account',
  },
  {
    id: '2',
    question: 'How do I enable biometric authentication?',
    answer: 'Navigate to Settings > Security > Biometric Authentication and toggle it on. You will be prompted to authenticate with your fingerprint or face to enable this feature.',
    category: 'Account',
  },
  {
    id: '3',
    question: 'How do I check my attendance?',
    answer: 'Tap on the Attendance tab from the bottom navigation. You can view your daily attendance, monthly summary, and attendance percentage. You can also filter by date range.',
    category: 'Attendance',
  },
  {
    id: '4',
    question: 'How do I pay fees online?',
    answer: 'Go to the Fees tab and select the pending fee. Click on "Pay Now" button. You will be redirected to the payment gateway where you can pay using credit/debit card, net banking, or UPI.',
    category: 'Fees',
  },
  {
    id: '5',
    question: 'Where can I see my exam results?',
    answer: 'Navigate to the Exams tab to view all your exam schedules and results. Results will be available once they are published by your school.',
    category: 'Exams',
  },
  {
    id: '6',
    question: 'How do I check issued library books?',
    answer: 'Go to the Library tab to see all your issued books, due dates, and return history. You will also receive notifications when a book is due for return.',
    category: 'Library',
  },
  {
    id: '7',
    question: 'How can I track my school bus?',
    answer: 'Tap on the Transport tab to see real-time location of your assigned bus. You can also view the route and estimated arrival time.',
    category: 'Transport',
  },
  {
    id: '8',
    question: 'How do I update my profile information?',
    answer: 'Go to Profile > Edit Profile. You can update your name, phone number, and profile picture. Email changes may require verification.',
    category: 'Profile',
  },
  {
    id: '9',
    question: 'How do I contact my teacher?',
    answer: 'You can find teacher contact information in the respective subject sections. You can also send messages through the Communication tab (coming soon in Phase 7).',
    category: 'Communication',
  },
  {
    id: '10',
    question: 'What should I do if I face technical issues?',
    answer: 'You can report any technical issues through the Feedback option in the Profile tab. Our support team will get back to you within 24-48 hours.',
    category: 'Support',
  },
];

const HelpCenterScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQs = FAQ_DATA.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@schoolmgmt.com?subject=Help Request');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+911234567890');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/911234567890?text=Hi, I need help with');
  };

  const FAQItemComponent: React.FC<{ item: FAQItem }> = ({ item }) => {
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={styles.faqItem}
        onPress={() => handleToggleFAQ(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <View style={styles.faqLeft}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={styles.faqQuestion}>{item.question}</Text>
          </View>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={COLORS.gray600}
          />
        </View>
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Text style={styles.faqAnswerText}>{item.answer}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper>
      <Header
        title="Help Center"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="magnify"
            rightIcon={searchQuery ? 'close' : undefined}
            onRightIconPress={() => setSearchQuery('')}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleContactSupport}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Icon name="email" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionLabel}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleCallSupport}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.success + '15' }]}>
                <Icon name="phone" size={28} color={COLORS.success} />
              </View>
              <Text style={styles.quickActionLabel}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleWhatsApp}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.info + '15' }]}>
                <Icon name="whatsapp" size={28} color={COLORS.info} />
              </View>
              <Text style={styles.quickActionLabel}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Feedback');
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: COLORS.warning + '15' }]}>
                <Icon name="message-text" size={28} color={COLORS.warning} />
              </View>
              <Text style={styles.quickActionLabel}>Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Frequently Asked Questions ({filteredFAQs.length})
          </Text>
          <Card elevation="sm" padding={0}>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item, index) => (
                <View key={item.id}>
                  <FAQItemComponent item={item} />
                  {index < filteredFAQs.length - 1 && <View style={styles.divider} />}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Icon name="help-circle-outline" size={64} color={COLORS.gray300} />
                <Text style={styles.emptyStateText}>No results found</Text>
              </View>
            )}
          </Card>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>Still need help?</Text>
          <Text style={styles.appInfoText}>
            Contact our support team and we'll get back to you within 24-48 hours.
          </Text>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Icon name="email" size={20} color={COLORS.white} />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  searchContainer: {
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  quickActionLabel: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  faqItem: {
    padding: SPACING.md,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  faqLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  categoryText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  faqQuestion: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
    lineHeight: 22,
  },
  faqAnswer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  faqAnswerText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyStateText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.gray500,
    marginTop: SPACING.md,
  },
  appInfo: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  appInfoTitle: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  appInfoText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    gap: SPACING.sm,
  },
  supportButtonText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.white,
  },
});

export default HelpCenterScreen;
