import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const HelpCenterScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const sections = [
    { title: 'FAQ', desc: 'Frequently asked questions', icon: 'frequently-asked-questions', color: COLORS.primary, route: 'FAQ' },
    { title: 'Contact Support', desc: 'Get help from our team', icon: 'headset', color: COLORS.success, route: 'ContactSupport' },
    { title: 'Send Feedback', desc: 'Share your suggestions', icon: 'message-draw', color: COLORS.secondary, route: 'Feedback' },
    { title: 'Report a Bug', desc: 'Help us improve the app', icon: 'bug-outline', color: COLORS.error, route: 'ReportBug' },
  ];

  const guides = [
    { title: 'Getting Started', icon: 'rocket-launch', color: COLORS.primary },
    { title: 'Managing Attendance', icon: 'clipboard-check', color: COLORS.success },
    { title: 'Fee Payments', icon: 'credit-card', color: COLORS.warning },
    { title: 'Library Usage', icon: 'book-open-variant', color: COLORS.info },
    { title: 'Transport Tracking', icon: 'bus', color: COLORS.accent },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.actionsGrid}>
            {sections.map((section, index) => (
              <TouchableOpacity key={index} style={styles.actionCard} onPress={() => navigation.navigate(section.route)}>
                <View style={[styles.actionIcon, { backgroundColor: section.color + '15' }]}>
                  <Icon name={section.icon} size={28} color={section.color} />
                </View>
                <Text style={styles.actionTitle}>{section.title}</Text>
                <Text style={styles.actionDesc}>{section.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* User Guides */}
          <Text style={styles.sectionTitle}>User Guides</Text>
          {guides.map((guide, index) => (
            <TouchableOpacity key={index} style={styles.guideCard}>
              <View style={[styles.guideIcon, { backgroundColor: guide.color + '15' }]}>
                <Icon name={guide.icon} size={24} color={guide.color} />
              </View>
              <Text style={styles.guideTitle}>{guide.title}</Text>
              <Icon name="chevron-right" size={22} color={COLORS.gray400} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.base },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  actionCard: { width: '48%', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.sm },
  actionIcon: { width: 48, height: 48, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  actionTitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.text },
  actionDesc: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: SPACING.xs },
  sectionTitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.lg, color: COLORS.text, marginBottom: SPACING.base },
  guideCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOWS.sm },
  guideIcon: { width: 44, height: 44, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  guideTitle: { flex: 1, fontFamily: FONTS.family.medium, fontSize: FONTS.size.base, color: COLORS.text },
});

export default HelpCenterScreen;
