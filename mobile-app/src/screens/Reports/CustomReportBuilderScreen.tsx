/**
 * CustomReportBuilderScreen - Build custom reports with drag & drop filters
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const CustomReportBuilderScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [reportType, setReportType] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const reportTypes = [
    { key: 'student', label: 'Student Report', icon: 'school', color: COLORS.primary, description: 'Enrollment, attendance, academic performance' },
    { key: 'staff', label: 'Staff Report', icon: 'account-tie', color: COLORS.success, description: 'Attendance, payroll, leave, department-wise' },
    { key: 'finance', label: 'Financial Report', icon: 'cash-multiple', color: COLORS.warning, description: 'Fee collection, expenses, pending dues' },
    { key: 'academic', label: 'Academic Report', icon: 'book-open-variant', color: COLORS.info, description: 'Exam results, grade distribution, subject-wise' },
    { key: 'attendance', label: 'Attendance Report', icon: 'clipboard-check', color: '#7C3AED', description: 'Daily, weekly, monthly attendance patterns' },
    { key: 'hostel', label: 'Hostel Report', icon: 'home-city', color: '#F97316', description: 'Occupancy, complaints, fees, attendance' },
  ];

  const fieldOptions: Record<string, { label: string; icon: string }[]> = {
    student: [
      { label: 'Student Name', icon: 'account' },
      { label: 'Class & Section', icon: 'school' },
      { label: 'Admission Number', icon: 'numeric' },
      { label: 'Roll Number', icon: 'counter' },
      { label: 'Parent Name', icon: 'account-group' },
      { label: 'Contact Number', icon: 'phone' },
      { label: 'Attendance %', icon: 'chart-arc' },
      { label: 'Exam Marks', icon: 'file-chart' },
      { label: 'Fee Status', icon: 'cash' },
      { label: 'Address', icon: 'map-marker' },
    ],
    staff: [
      { label: 'Staff Name', icon: 'account' },
      { label: 'Employee ID', icon: 'badge-account' },
      { label: 'Department', icon: 'office-building' },
      { label: 'Designation', icon: 'card-account-details' },
      { label: 'Join Date', icon: 'calendar' },
      { label: 'Salary', icon: 'cash' },
      { label: 'Attendance', icon: 'clipboard-check' },
      { label: 'Leave Balance', icon: 'calendar-clock' },
      { label: 'Phone', icon: 'phone' },
      { label: 'Qualification', icon: 'certificate' },
    ],
    finance: [
      { label: 'Fee Category', icon: 'tag' },
      { label: 'Student Name', icon: 'account' },
      { label: 'Class', icon: 'school' },
      { label: 'Total Amount', icon: 'cash' },
      { label: 'Paid Amount', icon: 'cash-check' },
      { label: 'Due Amount', icon: 'cash-remove' },
      { label: 'Payment Date', icon: 'calendar' },
      { label: 'Receipt Number', icon: 'receipt' },
      { label: 'Payment Mode', icon: 'credit-card' },
      { label: 'Fine Amount', icon: 'alert-circle' },
    ],
    academic: [
      { label: 'Student Name', icon: 'account' },
      { label: 'Class & Section', icon: 'school' },
      { label: 'Exam Name', icon: 'file-document' },
      { label: 'Subject', icon: 'book' },
      { label: 'Marks Obtained', icon: 'numeric' },
      { label: 'Total Marks', icon: 'counter' },
      { label: 'Grade', icon: 'alpha-a-circle' },
      { label: 'Percentage', icon: 'chart-arc' },
      { label: 'Rank', icon: 'trophy' },
      { label: 'Remarks', icon: 'text' },
    ],
    attendance: [
      { label: 'Student/Staff Name', icon: 'account' },
      { label: 'Class/Department', icon: 'school' },
      { label: 'Date', icon: 'calendar' },
      { label: 'Status', icon: 'check-circle' },
      { label: 'Total Present', icon: 'account-check' },
      { label: 'Total Absent', icon: 'account-remove' },
      { label: 'Total Late', icon: 'clock-alert' },
      { label: 'Percentage', icon: 'chart-arc' },
      { label: 'Month', icon: 'calendar-month' },
    ],
    hostel: [
      { label: 'Student Name', icon: 'account' },
      { label: 'Room Number', icon: 'door' },
      { label: 'Hostel Block', icon: 'home-city' },
      { label: 'Warden', icon: 'account-tie' },
      { label: 'Occupancy', icon: 'bed' },
      { label: 'Complaints', icon: 'message-alert' },
      { label: 'Fee Status', icon: 'cash' },
      { label: 'Check-in Date', icon: 'calendar-arrow-right' },
    ],
  };

  const filterOptions = ['Date Range', 'Class/Section', 'Department', 'Status', 'Gender', 'Category', 'Fee Status', 'Exam'];

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const handleGenerate = () => {
    if (!reportType) {
      Alert.alert('Select Report Type', 'Please select a report type first.');
      return;
    }
    if (selectedFields.length === 0) {
      Alert.alert('Select Fields', 'Please select at least one field for your report.');
      return;
    }
    Alert.alert('Generate Report', `Generate ${reportTypes.find(r => r.key === reportType)?.label} with ${selectedFields.length} fields?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Generate', style: 'default' },
    ]);
  };

  const currentFields = reportType ? fieldOptions[reportType] || [] : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Step 1: Report Type */}
        <View style={styles.section}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <Text style={styles.stepTitle}>Select Report Type</Text>
          </View>
          <View style={styles.typeGrid}>
            {reportTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[styles.typeCard, reportType === type.key && { borderColor: type.color, borderWidth: 2 }]}
                onPress={() => { setReportType(type.key); setSelectedFields([]); }}
              >
                <View style={[styles.typeIcon, { backgroundColor: type.color + '15' }]}>
                  <Icon name={type.icon} size={24} color={type.color} />
                </View>
                <Text style={styles.typeLabel}>{type.label}</Text>
                <Text style={styles.typeDesc}>{type.description}</Text>
                {reportType === type.key && (
                  <View style={[styles.checkMark, { backgroundColor: type.color }]}>
                    <Icon name="check" size={12} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Step 2: Select Fields */}
        {reportType && (
          <View style={styles.section}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepTitle}>Select Fields ({selectedFields.length} selected)</Text>
            </View>
            <View style={styles.fieldsGrid}>
              {currentFields.map((field, index) => {
                const isSelected = selectedFields.includes(field.label);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.fieldChip, isSelected && styles.fieldChipSelected]}
                    onPress={() => toggleField(field.label)}
                  >
                    <Icon name={field.icon} size={16} color={isSelected ? COLORS.white : COLORS.textSecondary} />
                    <Text style={[styles.fieldText, isSelected && styles.fieldTextSelected]}>{field.label}</Text>
                    {isSelected && <Icon name="check" size={14} color={COLORS.white} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 3: Apply Filters */}
        {reportType && selectedFields.length > 0 && (
          <View style={styles.section}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepTitle}>Apply Filters (optional)</Text>
            </View>
            <View style={styles.fieldsGrid}>
              {filterOptions.map((filter, index) => {
                const isSelected = selectedFilters.includes(filter);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                    onPress={() => toggleFilter(filter)}
                  >
                    <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>{filter}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 4: Export Format */}
        {reportType && selectedFields.length > 0 && (
          <View style={styles.section}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
              <Text style={styles.stepTitle}>Export Format</Text>
            </View>
            <View style={styles.exportRow}>
              {[
                { label: 'PDF', icon: 'file-pdf-box', color: '#EF4444' },
                { label: 'Excel', icon: 'file-excel', color: '#10B981' },
                { label: 'CSV', icon: 'file-delimited', color: '#3B82F6' },
                { label: 'Print', icon: 'printer', color: '#6B7280' },
              ].map((format, index) => (
                <TouchableOpacity key={index} style={styles.exportCard}>
                  <Icon name={format.icon} size={28} color={format.color} />
                  <Text style={styles.exportLabel}>{format.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Generate Button */}
      {reportType && selectedFields.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate}>
            <Icon name="chart-bar" size={20} color={COLORS.white} />
            <Text style={styles.generateText}>Generate Report</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  section: { paddingHorizontal: SPACING.base, marginTop: SPACING.lg },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.sm, color: COLORS.white },
  stepTitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.lg, color: COLORS.text },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  typeCard: { width: '48%', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  typeIcon: { width: 44, height: 44, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  typeLabel: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.sm, color: COLORS.text },
  typeDesc: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 4 },
  checkMark: { position: 'absolute', top: SPACING.sm, right: SPACING.sm, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  fieldsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  fieldChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.xs },
  fieldChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  fieldText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.sm, color: COLORS.textSecondary },
  fieldTextSelected: { color: COLORS.white },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  filterChipSelected: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  filterText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.sm, color: COLORS.textSecondary },
  filterTextSelected: { color: COLORS.white },
  exportRow: { flexDirection: 'row', gap: SPACING.md },
  exportCard: { flex: 1, alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOWS.sm },
  exportLabel: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.xs, color: COLORS.textSecondary, marginTop: SPACING.xs },
  footer: { padding: SPACING.base, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.divider },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: RADIUS.md, gap: SPACING.sm },
  generateText: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.white },
});

export default CustomReportBuilderScreen;
