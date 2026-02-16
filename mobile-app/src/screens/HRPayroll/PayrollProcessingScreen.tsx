/**
 * PayrollProcessingScreen - Monthly payroll processing and summary
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

interface PayrollEntry {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'processed' | 'pending' | 'on_hold';
}

const PayrollProcessingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedMonth] = useState('January 2025');

  const summary = {
    totalStaff: 86,
    processed: 72,
    pending: 10,
    onHold: 4,
    grossSalary: 1250000,
    totalAllowances: 245000,
    totalDeductions: 185000,
    netPayable: 1310000,
  };

  const entries: PayrollEntry[] = [
    { id: '1', name: 'Mr. Rajesh Kumar', employeeId: 'EMP-001', department: 'Teaching', basicSalary: 45000, allowances: 8500, deductions: 6200, netSalary: 47300, status: 'processed' },
    { id: '2', name: 'Mrs. Anita Desai', employeeId: 'EMP-002', department: 'Teaching', basicSalary: 52000, allowances: 10000, deductions: 7800, netSalary: 54200, status: 'processed' },
    { id: '3', name: 'Mr. Sunil Verma', employeeId: 'EMP-003', department: 'Admin', basicSalary: 35000, allowances: 5000, deductions: 4200, netSalary: 35800, status: 'pending' },
    { id: '4', name: 'Mrs. Priya Sharma', employeeId: 'EMP-004', department: 'Teaching', basicSalary: 38000, allowances: 6500, deductions: 5100, netSalary: 39400, status: 'on_hold' },
    { id: '5', name: 'Mr. Ramesh Patel', employeeId: 'EMP-005', department: 'Support', basicSalary: 18000, allowances: 3000, deductions: 2100, netSalary: 18900, status: 'processed' },
    { id: '6', name: 'Mr. Mohan Singh', employeeId: 'EMP-006', department: 'Transport', basicSalary: 22000, allowances: 4000, deductions: 2800, netSalary: 23200, status: 'pending' },
  ];

  const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
    processed: { color: COLORS.success, label: 'Processed', icon: 'check-circle' },
    pending: { color: COLORS.warning, label: 'Pending', icon: 'clock-outline' },
    on_hold: { color: COLORS.error, label: 'On Hold', icon: 'pause-circle' },
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const handleProcessAll = () => {
    Alert.alert(
      'Process Payroll',
      `Process payroll for ${summary.pending} pending employees for ${selectedMonth}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Process', style: 'default' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Month Header */}
        <View style={styles.monthHeader}>
          <TouchableOpacity>
            <Icon name="chevron-left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.monthInfo}>
            <Icon name="calendar-month" size={20} color={COLORS.primary} />
            <Text style={styles.monthText}>{selectedMonth}</Text>
          </View>
          <TouchableOpacity>
            <Icon name="chevron-right" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { borderLeftColor: COLORS.primary }]}>
            <Text style={styles.summaryLabel}>Gross Salary</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.grossSalary)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: COLORS.success }]}>
            <Text style={styles.summaryLabel}>Allowances</Text>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>+{formatCurrency(summary.totalAllowances)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: COLORS.error }]}>
            <Text style={styles.summaryLabel}>Deductions</Text>
            <Text style={[styles.summaryValue, { color: COLORS.error }]}>-{formatCurrency(summary.totalDeductions)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: COLORS.info }]}>
            <Text style={styles.summaryLabel}>Net Payable</Text>
            <Text style={[styles.summaryValue, { color: COLORS.info }]}>{formatCurrency(summary.netPayable)}</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Processing Status</Text>
            <Text style={styles.progressCount}>{summary.processed}/{summary.totalStaff}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(summary.processed / summary.totalStaff) * 100}%` }]} />
          </View>
          <View style={styles.progressLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.legendText}>Processed: {summary.processed}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.legendText}>Pending: {summary.pending}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
              <Text style={styles.legendText}>On Hold: {summary.onHold}</Text>
            </View>
          </View>
        </View>

        {/* Payroll Entries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Staff Payroll</Text>
            <TouchableOpacity style={styles.processAllBtn} onPress={handleProcessAll}>
              <Icon name="cog-sync" size={16} color={COLORS.white} />
              <Text style={styles.processAllText}>Process All</Text>
            </TouchableOpacity>
          </View>
          {entries.map((entry) => {
            const config = statusConfig[entry.status];
            return (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onPress={() => navigation.navigate('PayslipDetail', { payslipId: entry.id })}
              >
                <View style={styles.entryTop}>
                  <View style={styles.entryAvatar}>
                    <Text style={styles.entryAvatarText}>{entry.name.split(' ').slice(-1)[0].charAt(0)}</Text>
                  </View>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryName}>{entry.name}</Text>
                    <Text style={styles.entryDept}>{entry.employeeId} | {entry.department}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: config.color + '15' }]}>
                    <Icon name={config.icon} size={12} color={config.color} />
                    <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                  </View>
                </View>
                <View style={styles.entryBottom}>
                  <View style={styles.entryCol}>
                    <Text style={styles.entryLabel}>Basic</Text>
                    <Text style={styles.entryAmount}>{formatCurrency(entry.basicSalary)}</Text>
                  </View>
                  <View style={styles.entryCol}>
                    <Text style={styles.entryLabel}>Allowances</Text>
                    <Text style={[styles.entryAmount, { color: COLORS.success }]}>+{formatCurrency(entry.allowances)}</Text>
                  </View>
                  <View style={styles.entryCol}>
                    <Text style={styles.entryLabel}>Deductions</Text>
                    <Text style={[styles.entryAmount, { color: COLORS.error }]}>-{formatCurrency(entry.deductions)}</Text>
                  </View>
                  <View style={styles.entryCol}>
                    <Text style={styles.entryLabel}>Net</Text>
                    <Text style={[styles.entryAmount, { fontFamily: FONTS.family.bold }]}>{formatCurrency(entry.netSalary)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  monthInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  monthText: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.lg, color: COLORS.text },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: SPACING.base, gap: SPACING.sm },
  summaryCard: { width: '48%', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, borderLeftWidth: 4, ...SHADOWS.sm },
  summaryLabel: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted },
  summaryValue: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.lg, color: COLORS.text, marginTop: 4 },
  progressCard: { backgroundColor: COLORS.white, marginHorizontal: SPACING.base, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.sm },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  progressTitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.text },
  progressCount: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.base, color: COLORS.primary },
  progressBar: { height: 10, backgroundColor: COLORS.gray100, borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: SPACING.md },
  progressFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: RADIUS.full },
  progressLegend: { flexDirection: 'row', justifyContent: 'space-around' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted },
  section: { marginTop: SPACING.lg, paddingHorizontal: SPACING.base },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.lg, color: COLORS.text },
  processAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, gap: SPACING.xs },
  processAllText: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.xs, color: COLORS.white },
  entryCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOWS.sm },
  entryTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  entryAvatar: { width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: COLORS.primaryMuted, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  entryAvatarText: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.md, color: COLORS.primary },
  entryInfo: { flex: 1 },
  entryName: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.text },
  entryDept: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, gap: 4 },
  statusText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.xs },
  entryBottom: { flexDirection: 'row', paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider },
  entryCol: { flex: 1 },
  entryLabel: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted },
  entryAmount: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.sm, color: COLORS.text, marginTop: 2 },
});

export default PayrollProcessingScreen;
