/**
 * RoomListScreen - List of hostel rooms with status and filters
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

interface Room {
  id: string;
  number: string;
  floor: string;
  capacity: number;
  occupied: number;
  type: 'single' | 'double' | 'triple' | 'dormitory';
  status: 'available' | 'occupied' | 'partially' | 'maintenance';
  students: string[];
}

const RoomListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filters = [
    { key: 'all', label: 'All', count: 120 },
    { key: 'available', label: 'Available', count: 22 },
    { key: 'occupied', label: 'Occupied', count: 75 },
    { key: 'partially', label: 'Partial', count: 18 },
    { key: 'maintenance', label: 'Maintenance', count: 5 },
  ];

  const rooms: Room[] = [
    { id: '1', number: 'A-101', floor: 'Ground Floor', capacity: 3, occupied: 3, type: 'triple', status: 'occupied', students: ['Rahul M.', 'Amit K.', 'Vijay S.'] },
    { id: '2', number: 'A-102', floor: 'Ground Floor', capacity: 3, occupied: 2, type: 'triple', status: 'partially', students: ['Priya R.', 'Neha D.'] },
    { id: '3', number: 'A-103', floor: 'Ground Floor', capacity: 2, occupied: 0, type: 'double', status: 'available', students: [] },
    { id: '4', number: 'A-104', floor: 'Ground Floor', capacity: 1, occupied: 1, type: 'single', status: 'occupied', students: ['Suresh K.'] },
    { id: '5', number: 'A-201', floor: '1st Floor', capacity: 3, occupied: 0, type: 'triple', status: 'maintenance', students: [] },
    { id: '6', number: 'A-202', floor: '1st Floor', capacity: 2, occupied: 2, type: 'double', status: 'occupied', students: ['Meera P.', 'Sara K.'] },
    { id: '7', number: 'A-203', floor: '1st Floor', capacity: 3, occupied: 1, type: 'triple', status: 'partially', students: ['Ravi T.'] },
    { id: '8', number: 'A-204', floor: '1st Floor', capacity: 2, occupied: 0, type: 'double', status: 'available', students: [] },
  ];

  const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
    available: { color: COLORS.success, label: 'Available', icon: 'check-circle' },
    occupied: { color: COLORS.error, label: 'Full', icon: 'close-circle' },
    partially: { color: COLORS.warning, label: 'Partial', icon: 'circle-half-full' },
    maintenance: { color: COLORS.gray500, label: 'Maintenance', icon: 'wrench' },
  };

  const typeConfig: Record<string, { icon: string; label: string }> = {
    single: { icon: 'bed-single', label: 'Single' },
    double: { icon: 'bed-double', label: 'Double' },
    triple: { icon: 'bunk-bed', label: 'Triple' },
    dormitory: { icon: 'bed-king', label: 'Dormitory' },
  };

  const filteredRooms = rooms.filter(room => activeFilter === 'all' || room.status === activeFilter);

  return (
    <SafeAreaView style={styles.container}>
      {/* Filters */}
      <FlatList
        horizontal
        data={filters}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        style={styles.filterBar}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === item.key && styles.filterChipActive]}
            onPress={() => setActiveFilter(item.key)}
          >
            <Text style={[styles.filterText, activeFilter === item.key && styles.filterTextActive]}>
              {item.label} ({item.count})
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Room List */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const config = statusConfig[item.status];
          const typeInfo = typeConfig[item.type];
          return (
            <TouchableOpacity
              style={styles.roomCard}
              onPress={() => navigation.navigate('RoomDetail', { roomId: item.id })}
            >
              <View style={styles.roomHeader}>
                <View style={[styles.roomNumber, { borderColor: config.color }]}>
                  <Text style={[styles.roomNumberText, { color: config.color }]}>{item.number}</Text>
                </View>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomFloor}>{item.floor}</Text>
                  <View style={styles.roomMeta}>
                    <Icon name={typeInfo.icon} size={14} color={COLORS.textMuted} />
                    <Text style={styles.roomType}>{typeInfo.label}</Text>
                    <Text style={styles.roomDivider}>|</Text>
                    <Text style={styles.roomCapacity}>{item.occupied}/{item.capacity} beds</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: config.color + '15' }]}>
                  <Icon name={config.icon} size={12} color={config.color} />
                  <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                </View>
              </View>
              {item.students.length > 0 && (
                <View style={styles.studentsRow}>
                  <Icon name="account-group" size={14} color={COLORS.textMuted} />
                  <Text style={styles.studentsText}>{item.students.join(', ')}</Text>
                </View>
              )}
              {item.status === 'available' && (
                <TouchableOpacity
                  style={styles.allocateBtn}
                  onPress={() => navigation.navigate('AllocateStudent', { roomId: item.id })}
                >
                  <Icon name="account-plus" size={16} color={COLORS.primary} />
                  <Text style={styles.allocateText}>Allocate Student</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="door-open" size={48} color={COLORS.gray300} />
            <Text style={styles.emptyText}>No rooms found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  filterBar: { maxHeight: 50, borderBottomWidth: 1, borderBottomColor: COLORS.divider, backgroundColor: COLORS.white },
  filterList: { paddingHorizontal: SPACING.base, alignItems: 'center', gap: SPACING.sm },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.gray50, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.sm, color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.white },
  list: { padding: SPACING.base },
  roomCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOWS.sm },
  roomHeader: { flexDirection: 'row', alignItems: 'center' },
  roomNumber: { width: 56, height: 56, borderRadius: RADIUS.md, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  roomNumberText: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.sm },
  roomInfo: { flex: 1 },
  roomFloor: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.text },
  roomMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: 2 },
  roomType: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted },
  roomDivider: { color: COLORS.gray300 },
  roomCapacity: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.xs, color: COLORS.textMuted },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm, gap: 4 },
  statusText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.xs },
  studentsRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider, gap: SPACING.sm },
  studentsText: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.sm, color: COLORS.textSecondary, flex: 1 },
  allocateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: SPACING.sm, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: COLORS.primaryMuted, gap: SPACING.xs },
  allocateText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.sm, color: COLORS.primary },
  empty: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
  emptyText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.base, color: COLORS.textMuted, marginTop: SPACING.md },
});

export default RoomListScreen;
