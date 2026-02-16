/**
 * PayslipDetailScreen - Detailed payslip view for a staff member
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const PayslipDetailScreen: React.FC = () => {
  const route = useRoute<any>();

  const payslip = {
    id: route.params?.payslipId || '1',
    month: 'January 2025',
    employeeName: 'Mr. Rajesh Kumar',
    employeeId: 'EMP-001',
    department: 'Mathematics',
    designation: 'Senior Teacher',
    bankName: 'State Bank of India',
    accountNumber: '****6789',
    panNumber: '****1234',
    payDate: '31 Jan 2025',
    workingDays: 26,
    presentDays: 24,
    leaveDays: 2,
    earnings: [
      { label: 'Basic Salary', amount: 45000 },
      { label: 'House Rent Allowance', amount: 4500 },
      { label: 'Dearness Allowance', amount: 2000 },
      { label: 'Transport Allowance', amount: 1600 },
      { label: 'Special Allowance', amount: 400 },
    ],
    deductions: [
      { label: 'Provident Fund', amount: 2700 },
      { label: 'Professional Tax', amount: 200 },
      { label: 'Income Tax (TDS)', amount: 2500 },
      { label: 'ESI', amount: 800 },
    ],
  };

  const totalEarnings = payslip.earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalDeductions = payslip.deductions.reduce((sum, d) => sum + d.amount, 0);
  const netSalary = totalEarnings - totalDeductions;

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{payslip.employeeName.split(' ').slice(-1)[0].charAt(0)}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{payslip.employeeName}</Text>
              <Text style={styles.headerDesig}>{payslip.designation} | {payslip.department}</Text>
              <Text style={styles.headerId}>{payslip.employeeId}</Text>
            </View>
          </View>
          <View style={styles.monthBadge}>
            <Icon name="calendar-month" size={16} color={COLORS.primary} />
            <Text style={styles.monthText}>Payslip for {payslip.month}</Text>
          </View>
        </View>

        {/* Attendance Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Attendance Summary</Text>
          <View style={styles.attendanceRow}>
            <View style={styles.attendanceItem}>
              <Text style={styles.attValue}>{payslip.workingDays}</Text>
              <Text style={styles.attLabel}>Working Days</Text>
            </View>
            <View style={[styles.attendanceItem, { backgroundColor: COLORS.successMuted }]}>
              <Text style={[styles.attValue, { color: COLORS.success }]}>{payslip.presentDays}</Text>
              <Text style={styles.attLabel}>Present</Text>
            </View>
            <View style={[styles.attendanceItem, { backgroundColor: COLORS.warningMuted }]}>
              <Text style={[styles.attValue, { color: COLORS.warning }]}>{payslip.leaveDays}</Text>
              <Text style={styles.attLabel}>Leave</Text>
            </View>
          </View>
        </View>

        {/* Earnings */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Earnings</Text>
            <Text style={[styles.totalAmount, { color: COLORS.success }]}>{formatCurrency(totalEarnings)}</Text>
          </View>
          {payslip.earnings.map((item, index) => (
            <View key={index} style={styles.lineItem}>
              <Text style={styles.lineLabel}>{item.label}</Text>
              <Text style={styles.lineAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Earnings</Text>
            <Text style={[styles.totalValue, { color: COLORS.success }]}>{formatCurrency(totalEarnings)}</Text>
          </View>
        </View>

        {/* Deductions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Deductions</Text>
            <Text style={[styles.totalAmount, { color: COLORS.error }]}>-{formatCurrency(totalDeductions)}</Text>
          </View>
          {payslip.deductions.map((item, index) => (
            <View key={index} style={styles.lineItem}>
              <Text style={styles.lineLabel}>{item.label}</Text>
              <Text style={[styles.lineAmount, { color: COLORS.error }]}>-{formatCurrency(item.amount)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Deductions</Text>
            <Text style={[styles.totalValue, { color: COLORS.error }]}>-{formatCurrency(totalDeductions)}</Text>
          </View>
        </View>

        {/* Net Salary */}
        <View style={[styles.card, styles.netCard]}>
          <View style={styles.netRow}>
            <View>
              <Text style={styles.netLabel}>Net Salary</Text>
              <Text style={styles.netSubtext}>Credited on {payslip.payDate}</Text>
            </View>
            <Text style={styles.netValue}>{formatCurrency(netSalary)}</Text>
          </View>
        </View>

        {/* Bank Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Details</Text>
          <View style={styles.bankRow}>
            <Icon name="bank" size={16} color={COLORS.textMuted} />
            <Text style={styles.bankText}>{payslip.bankName} | A/C: {payslip.accountNumber}</Text>
          </View>
          <View style={styles.bankRow}>
            <Icon name="card-account-details" size={16} color={COLORS.textMuted} />
            <Text style={styles.bankText}>PAN: {payslip.panNumber}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.downloadBtn}>
            <Icon name="download" size={20} color={COLORS.white} />
            <Text style={styles.downloadText}>Download PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Icon name="share-variant" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerCard: { backgroundColor: COLORS.white, margin: SPACING.base, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.sm },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  avatar: { width: 56, height: 56, borderRadius: RADIUS.full, backgroundColor: COLORS.primaryMuted, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  avatarText: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.xl, color: COLORS.primary },
  headerInfo: { flex: 1 },
  headerName: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.lg, color: COLORS.text },
  headerDesig: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.sm, color: COLORS.textSecondary, marginTop: 2 },
  headerId: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 2 },
  monthBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryMuted, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, gap: SPACING.sm, alignSelf: 'flex-start' },
  monthText: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.sm, color: COLORS.primary },
  card: { backgroundColor: COLORS.white, marginHorizontal: SPACING.base, marginBottom: SPACING.sm, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  cardTitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.lg, color: COLORS.text, marginBottom: SPACING.sm },
  totalAmount: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.md },
  attendanceRow: { flexDirection: 'row', gap: SPACING.sm },
  attendanceItem: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, borderRadius: RADIUS.md, backgroundColor: COLORS.gray50 },
  attValue: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.xl, color: COLORS.text },
  attLabel: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 4 },
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  lineLabel: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.sm, color: COLORS.textSecondary },
  lineAmount: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.sm, color: COLORS.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.md, marginTop: SPACING.xs },
  totalLabel: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.text },
  totalValue: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.lg },
  netCard: { backgroundColor: COLORS.primaryMuted, borderWidth: 2, borderColor: COLORS.primary + '30' },
  netRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  netLabel: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.lg, color: COLORS.primary },
  netSubtext: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 4 },
  netValue: { fontFamily: FONTS.family.bold, fontSize: FONTS.size['2xl'], color: COLORS.primary },
  bankRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  bankText: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.sm, color: COLORS.textSecondary },
  actions: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.sm, marginTop: SPACING.md },
  downloadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: RADIUS.md, gap: SPACING.sm },
  downloadText: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.white },
  shareBtn: { width: 48, height: 48, borderRadius: RADIUS.md, backgroundColor: COLORS.primaryMuted, justifyContent: 'center', alignItems: 'center' },
});

export default PayslipDetailScreen;
