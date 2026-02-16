/**
 * StaffDirectoryScreen - Searchable staff directory with departments
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

interface Staff {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  designation: string;
  phone: string;
  email: string;
  status: 'active' | 'on_leave' | 'resigned';
  joinDate: string;
}

const StaffDirectoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [activeDept, setActiveDept] = useState('all');

  const departments = [
    { key: 'all', label: 'All' },
    { key: 'teaching', label: 'Teaching' },
    { key: 'admin', label: 'Admin' },
    { key: 'support', label: 'Support' },
    { key: 'transport', label: 'Transport' },
  ];

  const staffList: Staff[] = [
    { id: '1', name: 'Mr. Rajesh Kumar', employeeId: 'EMP-001', department: 'teaching', designation: 'Senior Mathematics Teacher', phone: '+91 98765 43210', email: 'rajesh@school.com', status: 'active', joinDate: '2018-06-15' },
    { id: '2', name: 'Mrs. Anita Desai', employeeId: 'EMP-002', department: 'teaching', designation: 'Head of English Dept.', phone: '+91 87654 32109', email: 'anita@school.com', status: 'active', joinDate: '2015-04-01' },
    { id: '3', name: 'Mr. Sunil Verma', employeeId: 'EMP-003', department: 'admin', designation: 'Office Administrator', phone: '+91 76543 21098', email: 'sunil@school.com', status: 'active', joinDate: '2019-08-20' },
    { id: '4', name: 'Mrs. Priya Sharma', employeeId: 'EMP-004', department: 'teaching', designation: 'Science Teacher', phone: '+91 65432 10987', email: 'priya@school.com', status: 'on_leave', joinDate: '2020-01-10' },
    { id: '5', name: 'Mr. Ramesh Patel', employeeId: 'EMP-005', department: 'support', designation: 'Lab Assistant', phone: '+91 54321 09876', email: 'ramesh@school.com', status: 'active', joinDate: '2017-03-15' },
    { id: '6', name: 'Mr. Mohan Singh', employeeId: 'EMP-006', department: 'transport', designation: 'Transport Supervisor', phone: '+91 43210 98765', email: 'mohan@school.com', status: 'active', joinDate: '2016-07-01' },
    { id: '7', name: 'Ms. Kavita Nair', employeeId: 'EMP-007', department: 'teaching', designation: 'Computer Science Teacher', phone: '+91 32109 87654', email: 'kavita@school.com', status: 'active', joinDate: '2021-06-01' },
  ];

  const statusConfig: Record<string, { color: string; label: string }> = {
    active: { color: COLORS.success, label: 'Active' },
    on_leave: { color: COLORS.warning, label: 'On Leave' },
    resigned: { color: COLORS.error, label: 'Resigned' },
  };

  const filteredStaff = staffList.filter(s => {
    const matchesDept = activeDept === 'all' || s.department === activeDept;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      s.designation.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color={COLORS.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, or designation..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={COLORS.textMuted}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close-circle" size={18} color={COLORS.gray400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Department Tabs */}
      <FlatList
        horizontal
        data={departments}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.deptList}
        style={styles.deptBar}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.deptChip, activeDept === item.key && styles.deptChipActive]}
            onPress={() => setActiveDept(item.key)}
          >
            <Text style={[styles.deptText, activeDept === item.key && styles.deptTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Staff List */}
      <FlatList
        data={filteredStaff}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const config = statusConfig[item.status];
          return (
            <TouchableOpacity
              style={styles.staffCard}
              onPress={() => navigation.navigate('StaffProfile', { staffId: item.id })}
            >
              <View style={styles.staffTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.split(' ').slice(-1)[0].charAt(0)}</Text>
                </View>
                <View style={styles.staffInfo}>
                  <Text style={styles.staffName}>{item.name}</Text>
                  <Text style={styles.staffDesig}>{item.designation}</Text>
                  <Text style={styles.staffId}>{item.employeeId}</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: config.color }]} />
              </View>
              <View style={styles.staffBottom}>
                <TouchableOpacity style={styles.contactBtn}>
                  <Icon name="phone" size={16} color={COLORS.success} />
                  <Text style={styles.contactText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactBtn}>
                  <Icon name="email" size={16} color={COLORS.primary} />
                  <Text style={styles.contactText}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactBtn}>
                  <Icon name="file-document" size={16} color={COLORS.warning} />
                  <Text style={styles.contactText}>Payslip</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="account-search" size={48} color={COLORS.gray300} />
            <Text style={styles.emptyText}>No staff found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchContainer: { paddingHorizontal: SPACING.base, paddingTop: SPACING.md, backgroundColor: COLORS.white },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray50, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, height: 44, marginLeft: SPACING.sm, fontFamily: FONTS.family.regular, fontSize: FONTS.size.base, color: COLORS.text },
  deptBar: { maxHeight: 50, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  deptList: { paddingHorizontal: SPACING.base, alignItems: 'center', gap: SPACING.sm },
  deptChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.gray50 },
  deptChipActive: { backgroundColor: COLORS.primary },
  deptText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.sm, color: COLORS.textSecondary },
  deptTextActive: { color: COLORS.white },
  list: { padding: SPACING.base },
  staffCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOWS.sm },
  staffTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: RADIUS.full, backgroundColor: COLORS.primaryMuted, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  avatarText: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.lg, color: COLORS.primary },
  staffInfo: { flex: 1 },
  staffName: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.text },
  staffDesig: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.sm, color: COLORS.textSecondary, marginTop: 2 },
  staffId: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  staffBottom: { flexDirection: 'row', marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.divider, gap: SPACING.sm },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: COLORS.gray50, gap: SPACING.xs },
  contactText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.xs, color: COLORS.textSecondary },
  empty: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
  emptyText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.base, color: COLORS.textMuted, marginTop: SPACING.md },
});

export default StaffDirectoryScreen;
