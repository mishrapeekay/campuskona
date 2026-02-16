/**
 * StaffLeaveManagementScreen - Staff leave requests and management
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

interface LeaveRequest {
  id: string;
  staffName: string;
  department: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
}

const StaffLeaveManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('pending');

  const leaveBalance = [
    { type: 'Casual Leave', total: 12, used: 5, color: COLORS.primary },
    { type: 'Medical Leave', total: 10, used: 2, color: COLORS.error },
    { type: 'Earned Leave', total: 15, used: 8, color: COLORS.success },
    { type: 'Maternity/Paternity', total: 180, used: 0, color: '#7C3AED' },
  ];

  const leaveRequests: LeaveRequest[] = [
    { id: '1', staffName: 'Mrs. Anita Desai', department: 'Mathematics', leaveType: 'Casual Leave', fromDate: '1 Feb 2025', toDate: '2 Feb 2025', days: 2, reason: 'Family function', status: 'pending', appliedOn: '28 Jan 2025' },
    { id: '2', staffName: 'Mr. Suresh Rao', department: 'Physics', leaveType: 'Medical Leave', fromDate: '3 Feb 2025', toDate: '7 Feb 2025', days: 5, reason: 'Medical procedure', status: 'pending', appliedOn: '27 Jan 2025' },
    { id: '3', staffName: 'Ms. Kavita Nair', department: 'English', leaveType: 'Earned Leave', fromDate: '5 Feb 2025', toDate: '7 Feb 2025', days: 3, reason: 'Personal travel', status: 'pending', appliedOn: '26 Jan 2025' },
    { id: '4', staffName: 'Mr. Ramesh Patel', department: 'Lab', leaveType: 'Casual Leave', fromDate: '20 Jan 2025', toDate: '20 Jan 2025', days: 1, reason: 'Doctor appointment', status: 'approved', appliedOn: '18 Jan 2025' },
    { id: '5', staffName: 'Mr. Mohan Singh', department: 'Transport', leaveType: 'Medical Leave', fromDate: '15 Jan 2025', toDate: '17 Jan 2025', days: 3, reason: 'Fever', status: 'approved', appliedOn: '14 Jan 2025' },
    { id: '6', staffName: 'Ms. Priya Sharma', department: 'Science', leaveType: 'Casual Leave', fromDate: '10 Jan 2025', toDate: '10 Jan 2025', days: 1, reason: 'Personal work', status: 'rejected', appliedOn: '8 Jan 2025' },
  ];

  const tabs = [
    { key: 'pending', label: 'Pending', count: leaveRequests.filter(l => l.status === 'pending').length },
    { key: 'approved', label: 'Approved', count: leaveRequests.filter(l => l.status === 'approved').length },
    { key: 'rejected', label: 'Rejected', count: leaveRequests.filter(l => l.status === 'rejected').length },
  ];

  const statusConfig: Record<string, { color: string; icon: string }> = {
    pending: { color: COLORS.warning, icon: 'clock-outline' },
    approved: { color: COLORS.success, icon: 'check-circle' },
    rejected: { color: COLORS.error, icon: 'close-circle' },
  };

  const leaveTypeColors: Record<string, string> = {
    'Casual Leave': COLORS.primary,
    'Medical Leave': COLORS.error,
    'Earned Leave': COLORS.success,
    'Maternity/Paternity': '#7C3AED',
  };

  const filteredRequests = leaveRequests.filter(l => l.status === activeTab);

  const handleApprove = (id: string) => {
    Alert.alert('Approve Leave', 'Approve this leave request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', style: 'default' },
    ]);
  };

  const handleReject = (id: string) => {
    Alert.alert('Reject Leave', 'Reject this leave request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Leave Balance Summary */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceTitle}>Leave Balance (School Average)</Text>
        <View style={styles.balanceRow}>
          {leaveBalance.map((lb, index) => (
            <View key={index} style={styles.balanceCard}>
              <View style={[styles.balanceDot, { backgroundColor: lb.color }]} />
              <Text style={styles.balanceType}>{lb.type}</Text>
              <Text style={styles.balanceCount}>
                <Text style={{ color: lb.color }}>{lb.used}</Text>/{lb.total}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            <View style={[styles.tabBadge, activeTab === tab.key && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === tab.key && styles.tabBadgeTextActive]}>{tab.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leave Requests */}
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const config = statusConfig[item.status];
          const typeColor = leaveTypeColors[item.leaveType] || COLORS.gray500;
          return (
            <View style={styles.leaveCard}>
              <View style={styles.leaveTop}>
                <View style={styles.leaveAvatar}>
                  <Text style={styles.avatarText}>{item.staffName.split(' ').slice(-1)[0].charAt(0)}</Text>
                </View>
                <View style={styles.leaveInfo}>
                  <Text style={styles.leaveName}>{item.staffName}</Text>
                  <Text style={styles.leaveDept}>{item.department}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: typeColor + '15' }]}>
                  <Text style={[styles.typeText, { color: typeColor }]}>{item.leaveType}</Text>
                </View>
              </View>

              <View style={styles.leaveDetails}>
                <View style={styles.detailRow}>
                  <Icon name="calendar-range" size={14} color={COLORS.textMuted} />
                  <Text style={styles.detailText}>{item.fromDate} - {item.toDate} ({item.days} day{item.days > 1 ? 's' : ''})</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="text" size={14} color={COLORS.textMuted} />
                  <Text style={styles.detailText}>{item.reason}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="clock" size={14} color={COLORS.textMuted} />
                  <Text style={styles.detailText}>Applied: {item.appliedOn}</Text>
                </View>
              </View>

              {item.status === 'pending' && (
                <View style={styles.leaveActions}>
                  <TouchableOpacity style={styles.rejectActionBtn} onPress={() => handleReject(item.id)}>
                    <Icon name="close" size={18} color={COLORS.error} />
                    <Text style={[styles.actionText, { color: COLORS.error }]}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.approveActionBtn} onPress={() => handleApprove(item.id)}>
                    <Icon name="check" size={18} color={COLORS.white} />
                    <Text style={[styles.actionText, { color: COLORS.white }]}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="calendar-check" size={48} color={COLORS.gray300} />
            <Text style={styles.emptyText}>No {activeTab} leave requests</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ApplyStaffLeave')}
      >
        <Icon name="plus" size={26} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  balanceSection: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  balanceTitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  balanceRow: { flexDirection: 'row', gap: SPACING.sm },
  balanceCard: { flex: 1, backgroundColor: COLORS.gray50, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center' },
  balanceDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  balanceType: { fontFamily: FONTS.family.regular, fontSize: 9, color: COLORS.textMuted, textAlign: 'center' },
  balanceCount: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.sm, color: COLORS.text, marginTop: 2 },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md, gap: SPACING.xs, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.sm, color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary, fontFamily: FONTS.family.semiBold },
  tabBadge: { backgroundColor: COLORS.gray100, paddingHorizontal: 6, paddingVertical: 1, borderRadius: RADIUS.full },
  tabBadgeActive: { backgroundColor: COLORS.primaryMuted },
  tabBadgeText: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.xs, color: COLORS.textMuted },
  tabBadgeTextActive: { color: COLORS.primary },
  list: { padding: SPACING.base },
  leaveCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOWS.sm },
  leaveTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  leaveAvatar: { width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: COLORS.primaryMuted, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  avatarText: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.md, color: COLORS.primary },
  leaveInfo: { flex: 1 },
  leaveName: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.text },
  leaveDept: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 2 },
  typeBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm },
  typeText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.xs },
  leaveDetails: { gap: SPACING.sm, marginBottom: SPACING.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  detailText: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.sm, color: COLORS.textSecondary },
  leaveActions: { flexDirection: 'row', gap: SPACING.sm, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.divider },
  rejectActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: COLORS.errorMuted, gap: SPACING.xs },
  approveActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: COLORS.success, gap: SPACING.xs },
  actionText: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.sm },
  empty: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
  emptyText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.base, color: COLORS.textMuted, marginTop: SPACING.md },
  fab: { position: 'absolute', right: SPACING.base, bottom: SPACING.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.lg },
});

export default StaffLeaveManagementScreen;
