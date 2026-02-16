/**
 * HostelAttendanceScreen - Mark and view hostel attendance
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

interface HostelStudent {
  id: string;
  name: string;
  room: string;
  class: string;
  status: 'present' | 'absent' | 'leave' | 'not_marked';
  photo?: string;
}

const HostelAttendanceScreen: React.FC = () => {
  const [selectedDate] = useState('30 Jan 2025');
  const [students, setStudents] = useState<HostelStudent[]>([
    { id: '1', name: 'Rahul Mehta', room: 'A-101', class: 'X-A', status: 'not_marked' },
    { id: '2', name: 'Amit Kumar', room: 'A-101', class: 'IX-B', status: 'not_marked' },
    { id: '3', name: 'Vijay Singh', room: 'A-101', class: 'X-A', status: 'not_marked' },
    { id: '4', name: 'Priya Reddy', room: 'A-102', class: 'XI-A', status: 'not_marked' },
    { id: '5', name: 'Neha Das', room: 'A-102', class: 'IX-A', status: 'not_marked' },
    { id: '6', name: 'Suresh Kapoor', room: 'A-104', class: 'XII-A', status: 'leave' },
    { id: '7', name: 'Meera Patel', room: 'A-202', class: 'X-B', status: 'not_marked' },
    { id: '8', name: 'Sara Khan', room: 'A-202', class: 'XI-B', status: 'not_marked' },
    { id: '9', name: 'Ravi Tiwari', room: 'A-203', class: 'VIII-A', status: 'not_marked' },
  ]);

  const statusConfig: Record<string, { color: string; icon: string; label: string }> = {
    present: { color: COLORS.success, icon: 'check-circle', label: 'Present' },
    absent: { color: COLORS.error, icon: 'close-circle', label: 'Absent' },
    leave: { color: COLORS.warning, icon: 'clock-outline', label: 'Leave' },
    not_marked: { color: COLORS.gray400, icon: 'minus-circle-outline', label: 'Not Marked' },
  };

  const toggleStatus = (studentId: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== studentId) return s;
        const cycle: HostelStudent['status'][] = ['present', 'absent', 'leave', 'not_marked'];
        const currentIdx = cycle.indexOf(s.status);
        return { ...s, status: cycle[(currentIdx + 1) % cycle.length] };
      })
    );
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(s => s.status === 'leave' ? s : { ...s, status: 'present' }));
  };

  const summary = {
    total: students.length,
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    leave: students.filter(s => s.status === 'leave').length,
    notMarked: students.filter(s => s.status === 'not_marked').length,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Date & Summary Header */}
      <View style={styles.headerCard}>
        <View style={styles.dateRow}>
          <Icon name="calendar" size={18} color={COLORS.primary} />
          <Text style={styles.dateText}>{selectedDate} (Night Roll Call)</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryChip, { backgroundColor: COLORS.successMuted }]}>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>{summary.present}</Text>
            <Text style={styles.summaryLabel}>Present</Text>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: COLORS.errorMuted }]}>
            <Text style={[styles.summaryValue, { color: COLORS.error }]}>{summary.absent}</Text>
            <Text style={styles.summaryLabel}>Absent</Text>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: COLORS.warningMuted }]}>
            <Text style={[styles.summaryValue, { color: COLORS.warning }]}>{summary.leave}</Text>
            <Text style={styles.summaryLabel}>Leave</Text>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: COLORS.gray100 }]}>
            <Text style={[styles.summaryValue, { color: COLORS.gray500 }]}>{summary.notMarked}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.markAllBtn} onPress={markAllPresent}>
          <Icon name="check-all" size={18} color={COLORS.success} />
          <Text style={styles.markAllText}>Mark All Present</Text>
        </TouchableOpacity>
      </View>

      {/* Student List */}
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const config = statusConfig[item.status];
          return (
            <TouchableOpacity style={styles.studentCard} onPress={() => toggleStatus(item.id)}>
              <View style={styles.studentAvatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentMeta}>Room {item.room} | {item.class}</Text>
              </View>
              <View style={[styles.statusBtn, { backgroundColor: config.color + '15', borderColor: config.color + '30' }]}>
                <Icon name={config.icon} size={18} color={config.color} />
                <Text style={[styles.statusBtnText, { color: config.color }]}>{config.label}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn}>
          <Icon name="content-save-check" size={20} color={COLORS.white} />
          <Text style={styles.submitText}>Save Attendance ({summary.present + summary.absent + summary.leave}/{summary.total})</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerCard: { backgroundColor: COLORS.white, padding: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  dateText: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.text },
  summaryRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  summaryChip: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  summaryValue: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.lg },
  summaryLabel: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 2 },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: COLORS.successMuted },
  markAllText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.sm, color: COLORS.success },
  list: { padding: SPACING.base },
  studentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm },
  studentAvatar: { width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: COLORS.primaryMuted, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  avatarText: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.md, color: COLORS.primary },
  studentInfo: { flex: 1 },
  studentName: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.text },
  studentMeta: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 2 },
  statusBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, gap: 4 },
  statusBtnText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.xs },
  footer: { padding: SPACING.base, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.divider },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: RADIUS.md, gap: SPACING.sm },
  submitText: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.white },
});

export default HostelAttendanceScreen;
