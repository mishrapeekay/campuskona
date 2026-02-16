/**
 * ApplicationListScreen - List of all admission applications with filters
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

interface Application {
  id: string;
  name: string;
  parentName: string;
  classApplied: string;
  applicationDate: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'enrolled';
  phone: string;
  documentsComplete: boolean;
}

const ApplicationListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { key: 'all', label: 'All', count: 245 },
    { key: 'pending', label: 'Pending', count: 38 },
    { key: 'under_review', label: 'Review', count: 15 },
    { key: 'approved', label: 'Approved', count: 186 },
    { key: 'rejected', label: 'Rejected', count: 6 },
  ];

  const applications: Application[] = [
    { id: '1', name: 'Aarav Sharma', parentName: 'Rajesh Sharma', classApplied: 'Class V', applicationDate: '2025-01-28', status: 'pending', phone: '+91 98765 43210', documentsComplete: true },
    { id: '2', name: 'Priya Patel', parentName: 'Suresh Patel', classApplied: 'Class VIII', applicationDate: '2025-01-27', status: 'approved', phone: '+91 87654 32109', documentsComplete: true },
    { id: '3', name: 'Rohan Gupta', parentName: 'Amit Gupta', classApplied: 'Class III', applicationDate: '2025-01-26', status: 'under_review', phone: '+91 76543 21098', documentsComplete: false },
    { id: '4', name: 'Ananya Singh', parentName: 'Vikram Singh', classApplied: 'Class I', applicationDate: '2025-01-25', status: 'pending', phone: '+91 65432 10987', documentsComplete: true },
    { id: '5', name: 'Vikram Joshi', parentName: 'Sunil Joshi', classApplied: 'Class X', applicationDate: '2025-01-24', status: 'rejected', phone: '+91 54321 09876', documentsComplete: true },
    { id: '6', name: 'Meera Reddy', parentName: 'Krishna Reddy', classApplied: 'Class VI', applicationDate: '2025-01-23', status: 'enrolled', phone: '+91 43210 98765', documentsComplete: true },
    { id: '7', name: 'Arjun Nair', parentName: 'Ravi Nair', classApplied: 'Class IV', applicationDate: '2025-01-22', status: 'approved', phone: '+91 32109 87654', documentsComplete: true },
  ];

  const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
    pending: { color: COLORS.warning, label: 'Pending', icon: 'clock-outline' },
    under_review: { color: COLORS.info, label: 'Under Review', icon: 'eye' },
    approved: { color: COLORS.success, label: 'Approved', icon: 'check-circle' },
    rejected: { color: COLORS.error, label: 'Rejected', icon: 'close-circle' },
    enrolled: { color: '#7C3AED', label: 'Enrolled', icon: 'school' },
  };

  const filteredApps = applications.filter(app => {
    const matchesFilter = activeFilter === 'all' || app.status === activeFilter;
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.parentName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={20} color={COLORS.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by student or parent name..."
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

      {/* Filters */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={filters}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === item.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(item.key)}
            >
              <Text style={[styles.filterText, activeFilter === item.key && styles.filterTextActive]}>
                {item.label}
              </Text>
              <View style={[styles.filterBadge, activeFilter === item.key && styles.filterBadgeActive]}>
                <Text style={[styles.filterBadgeText, activeFilter === item.key && styles.filterBadgeTextActive]}>
                  {item.count}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Application List */}
      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const config = statusConfig[item.status];
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ApplicationDetail', { applicationId: item.id })}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardAvatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardSubtext}>Parent: {item.parentName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: config.color + '15' }]}>
                  <Icon name={config.icon} size={12} color={config.color} />
                  <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <View style={styles.cardDetail}>
                  <Icon name="school" size={14} color={COLORS.textMuted} />
                  <Text style={styles.detailText}>{item.classApplied}</Text>
                </View>
                <View style={styles.cardDetail}>
                  <Icon name="calendar" size={14} color={COLORS.textMuted} />
                  <Text style={styles.detailText}>{item.applicationDate}</Text>
                </View>
                <View style={styles.cardDetail}>
                  <Icon name={item.documentsComplete ? 'file-check' : 'file-alert'} size={14} color={item.documentsComplete ? COLORS.success : COLORS.warning} />
                  <Text style={[styles.detailText, { color: item.documentsComplete ? COLORS.success : COLORS.warning }]}>
                    {item.documentsComplete ? 'Docs Complete' : 'Docs Pending'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="file-document-outline" size={48} color={COLORS.gray300} />
            <Text style={styles.emptyText}>No applications found</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewAdmission')}
      >
        <Icon name="plus" size={26} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchContainer: { paddingHorizontal: SPACING.base, paddingTop: SPACING.md },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, height: 44, marginLeft: SPACING.sm, fontFamily: FONTS.family.regular, fontSize: FONTS.size.base, color: COLORS.text },
  filterContainer: { paddingVertical: SPACING.md },
  filterList: { paddingHorizontal: SPACING.base, gap: SPACING.sm },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.xs },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.sm, color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.white },
  filterBadge: { backgroundColor: COLORS.gray100, paddingHorizontal: 6, paddingVertical: 1, borderRadius: RADIUS.full },
  filterBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterBadgeText: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.xs, color: COLORS.textMuted },
  filterBadgeTextActive: { color: COLORS.white },
  list: { padding: SPACING.base },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOWS.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  cardAvatar: { width: 44, height: 44, borderRadius: RADIUS.full, backgroundColor: COLORS.primaryMuted, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  avatarText: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.md, color: COLORS.primary },
  cardInfo: { flex: 1 },
  cardName: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.text },
  cardSubtext: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, gap: 4 },
  statusText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.xs },
  cardBottom: { flexDirection: 'row', marginTop: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider, gap: SPACING.lg },
  cardDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted },
  empty: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
  emptyText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.base, color: COLORS.textMuted, marginTop: SPACING.md },
  fab: { position: 'absolute', right: SPACING.base, bottom: SPACING.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.lg },
});

export default ApplicationListScreen;
