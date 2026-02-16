/**
 * ReportTemplatesScreen - Pre-built report templates for quick generation
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  fields: string[];
  lastUsed?: string;
  popular?: boolean;
}

const ReportTemplatesScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const templates: ReportTemplate[] = [
    {
      id: '1', name: 'Student Attendance Summary', category: 'Attendance',
      description: 'Monthly attendance summary with present, absent, and late counts per student',
      icon: 'clipboard-check', color: '#7C3AED',
      fields: ['Name', 'Class', 'Present', 'Absent', 'Late', '%'],
      lastUsed: '2 days ago', popular: true,
    },
    {
      id: '2', name: 'Fee Collection Report', category: 'Finance',
      description: 'Fee collection status showing paid, pending, and overdue amounts by class',
      icon: 'cash-multiple', color: COLORS.success,
      fields: ['Class', 'Total Students', 'Collected', 'Pending', 'Overdue'],
      lastUsed: '1 week ago', popular: true,
    },
    {
      id: '3', name: 'Exam Result Analysis', category: 'Academic',
      description: 'Subject-wise and student-wise exam results with grade distribution',
      icon: 'file-chart', color: COLORS.primary,
      fields: ['Student', 'Subject', 'Marks', 'Grade', 'Rank'],
      lastUsed: '3 days ago',
    },
    {
      id: '4', name: 'Staff Payroll Summary', category: 'HR & Payroll',
      description: 'Department-wise salary disbursement with allowances and deductions',
      icon: 'account-cash', color: COLORS.warning,
      fields: ['Employee', 'Department', 'Basic', 'Allowances', 'Deductions', 'Net'],
    },
    {
      id: '5', name: 'Student Enrollment Report', category: 'Admissions',
      description: 'Class-wise enrollment count with gender and category breakdown',
      icon: 'school', color: '#F97316',
      fields: ['Class', 'Section', 'Boys', 'Girls', 'Total', 'Capacity'],
      popular: true,
    },
    {
      id: '6', name: 'Transport Route Report', category: 'Transport',
      description: 'Route-wise student count, vehicles, and driver assignments',
      icon: 'bus-school', color: COLORS.info,
      fields: ['Route', 'Vehicle', 'Driver', 'Students', 'Stops'],
    },
    {
      id: '7', name: 'Library Usage Report', category: 'Library',
      description: 'Book issue/return statistics, overdue books, and popular titles',
      icon: 'book-open-variant', color: '#EC4899',
      fields: ['Book', 'Issued To', 'Issue Date', 'Return Date', 'Status'],
    },
    {
      id: '8', name: 'Hostel Occupancy Report', category: 'Hostel',
      description: 'Block-wise room occupancy with vacancy and maintenance status',
      icon: 'home-city', color: '#6366F1',
      fields: ['Block', 'Floor', 'Total Rooms', 'Occupied', 'Vacant', 'Maintenance'],
    },
    {
      id: '9', name: 'Staff Leave Summary', category: 'HR & Payroll',
      description: 'Staff-wise leave balance, leave taken, and pending requests',
      icon: 'calendar-clock', color: '#14B8A6',
      fields: ['Staff', 'CL', 'ML', 'EL', 'Total Taken', 'Balance'],
    },
    {
      id: '10', name: 'Daily Collection Report', category: 'Finance',
      description: 'Day-wise fee collection summary with payment mode breakdown',
      icon: 'cash-register', color: '#8B5CF6',
      fields: ['Date', 'Cash', 'Cheque', 'Online', 'Total'],
    },
  ];

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {/* Popular Templates */}
            <Text style={styles.sectionTitle}>Popular Templates</Text>
            <View style={styles.popularRow}>
              {templates.filter(t => t.popular).map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.popularCard}
                  onPress={() => navigation.navigate('CustomReport')}
                >
                  <View style={[styles.popularIcon, { backgroundColor: template.color + '15' }]}>
                    <Icon name={template.icon} size={28} color={template.color} />
                  </View>
                  <Text style={styles.popularName}>{template.name}</Text>
                  {template.lastUsed && (
                    <Text style={styles.popularLastUsed}>Used {template.lastUsed}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>All Templates</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.templateCard}
            onPress={() => navigation.navigate('CustomReport')}
          >
            <View style={[styles.templateIcon, { backgroundColor: item.color + '15' }]}>
              <Icon name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.templateInfo}>
              <View style={styles.templateTop}>
                <Text style={styles.templateName}>{item.name}</Text>
                <View style={[styles.categoryBadge, { backgroundColor: item.color + '15' }]}>
                  <Text style={[styles.categoryText, { color: item.color }]}>{item.category}</Text>
                </View>
              </View>
              <Text style={styles.templateDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.fieldsRow}>
                {item.fields.slice(0, 4).map((field, idx) => (
                  <Text key={idx} style={styles.fieldTag}>{field}</Text>
                ))}
                {item.fields.length > 4 && (
                  <Text style={styles.fieldMore}>+{item.fields.length - 4}</Text>
                )}
              </View>
            </View>
            <Icon name="chevron-right" size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.createCustom}
            onPress={() => navigation.navigate('CustomReportBuilder')}
          >
            <Icon name="plus-circle" size={24} color={COLORS.primary} />
            <View style={styles.createInfo}>
              <Text style={styles.createTitle}>Build Custom Report</Text>
              <Text style={styles.createDesc}>Create a report with your own fields and filters</Text>
            </View>
            <Icon name="chevron-right" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.base },
  sectionTitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.lg, color: COLORS.text, marginBottom: SPACING.md },
  popularRow: { flexDirection: 'row', gap: SPACING.sm },
  popularCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, alignItems: 'center', ...SHADOWS.sm },
  popularIcon: { width: 52, height: 52, borderRadius: RADIUS.lg, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  popularName: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.xs, color: COLORS.text, textAlign: 'center' },
  popularLastUsed: { fontFamily: FONTS.family.regular, fontSize: 10, color: COLORS.textMuted, marginTop: 4, textAlign: 'center' },
  templateCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOWS.sm },
  templateIcon: { width: 48, height: 48, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  templateInfo: { flex: 1 },
  templateTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 4 },
  templateName: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.sm, color: COLORS.text, flex: 1 },
  categoryBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.sm },
  categoryText: { fontFamily: FONTS.family.medium, fontSize: 10 },
  templateDesc: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginBottom: SPACING.sm },
  fieldsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  fieldTag: { fontFamily: FONTS.family.regular, fontSize: 10, color: COLORS.textSecondary, backgroundColor: COLORS.gray50, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.sm },
  fieldMore: { fontFamily: FONTS.family.medium, fontSize: 10, color: COLORS.primary },
  createCustom: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryMuted, borderRadius: RADIUS.lg, padding: SPACING.base, marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.primary + '30', borderStyle: 'dashed' },
  createInfo: { flex: 1, marginLeft: SPACING.md },
  createTitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.primary },
  createDesc: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textSecondary, marginTop: 2 },
});

export default ReportTemplatesScreen;
