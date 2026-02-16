/**
 * SavedReportsScreen - View and manage previously generated/saved reports
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

interface SavedReport {
  id: string;
  name: string;
  type: string;
  generatedOn: string;
  format: 'pdf' | 'excel' | 'csv';
  size: string;
  icon: string;
  color: string;
  recordCount: number;
}

const SavedReportsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const reports: SavedReport[] = [
    { id: '1', name: 'January Attendance Report', type: 'Attendance', generatedOn: '30 Jan 2025', format: 'pdf', size: '2.4 MB', icon: 'clipboard-check', color: '#7C3AED', recordCount: 850 },
    { id: '2', name: 'Fee Collection - Dec 2024', type: 'Finance', generatedOn: '28 Jan 2025', format: 'excel', size: '1.8 MB', icon: 'cash-multiple', color: COLORS.success, recordCount: 620 },
    { id: '3', name: 'Mid-Term Exam Results', type: 'Academic', generatedOn: '25 Jan 2025', format: 'pdf', size: '5.2 MB', icon: 'file-chart', color: COLORS.primary, recordCount: 1200 },
    { id: '4', name: 'Staff Payroll - Jan 2025', type: 'HR & Payroll', generatedOn: '22 Jan 2025', format: 'excel', size: '890 KB', icon: 'account-cash', color: COLORS.warning, recordCount: 86 },
    { id: '5', name: 'Admission Summary 2024-25', type: 'Admissions', generatedOn: '20 Jan 2025', format: 'pdf', size: '3.1 MB', icon: 'school', color: '#F97316', recordCount: 245 },
    { id: '6', name: 'Transport Route Data', type: 'Transport', generatedOn: '15 Jan 2025', format: 'csv', size: '420 KB', icon: 'bus-school', color: COLORS.info, recordCount: 180 },
    { id: '7', name: 'Library Usage Q3', type: 'Library', generatedOn: '10 Jan 2025', format: 'pdf', size: '1.5 MB', icon: 'book-open-variant', color: '#EC4899', recordCount: 350 },
  ];

  const formatIcons: Record<string, { icon: string; color: string }> = {
    pdf: { icon: 'file-pdf-box', color: '#EF4444' },
    excel: { icon: 'file-excel', color: '#10B981' },
    csv: { icon: 'file-delimited', color: '#3B82F6' },
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Report', 'Are you sure you want to delete this saved report?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const formatConfig = formatIcons[item.format];
          return (
            <TouchableOpacity style={styles.reportCard}>
              <View style={[styles.reportIcon, { backgroundColor: item.color + '15' }]}>
                <Icon name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportName}>{item.name}</Text>
                <Text style={styles.reportMeta}>{item.type} | {item.recordCount} records</Text>
                <View style={styles.reportBottom}>
                  <View style={styles.formatBadge}>
                    <Icon name={formatConfig.icon} size={14} color={formatConfig.color} />
                    <Text style={[styles.formatText, { color: formatConfig.color }]}>{item.format.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.reportSize}>{item.size}</Text>
                  <Text style={styles.reportDate}>{item.generatedOn}</Text>
                </View>
              </View>
              <View style={styles.reportActions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Icon name="download" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Icon name="share-variant" size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                  <Icon name="delete-outline" size={18} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="file-document-outline" size={48} color={COLORS.gray300} />
            <Text style={styles.emptyText}>No saved reports</Text>
            <Text style={styles.emptySubtext}>Generate reports to see them here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.base },
  reportCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOWS.sm },
  reportIcon: { width: 48, height: 48, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  reportInfo: { flex: 1 },
  reportName: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.sm, color: COLORS.text },
  reportMeta: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 2 },
  reportBottom: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  formatBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  formatText: { fontFamily: FONTS.family.bold, fontSize: 10 },
  reportSize: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted },
  reportDate: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted },
  reportActions: { justifyContent: 'space-between', paddingVertical: 2 },
  actionBtn: { padding: 4 },
  empty: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
  emptyText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.base, color: COLORS.textMuted, marginTop: SPACING.md },
  emptySubtext: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.sm, color: COLORS.textMuted, marginTop: 4 },
});

export default SavedReportsScreen;
