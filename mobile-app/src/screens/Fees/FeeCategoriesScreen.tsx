/**
 * FeeCategoriesScreen - Fee categories and types management
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

interface FeeCategory {
  id: string;
  name: string;
  description: string;
  amount: string;
  frequency: string;
  students: number;
  status: 'active' | 'inactive';
}

const FeeCategoriesScreen: React.FC = () => {
  const categories: FeeCategory[] = [
    { id: '1', name: 'Tuition Fee', description: 'Monthly academic fee', amount: '₹5,000', frequency: 'Monthly', students: 450, status: 'active' },
    { id: '2', name: 'Transport Fee', description: 'School bus service', amount: '₹2,500', frequency: 'Monthly', students: 280, status: 'active' },
    { id: '3', name: 'Lab Fee', description: 'Science lab charges', amount: '₹1,500', frequency: 'Quarterly', students: 200, status: 'active' },
    { id: '4', name: 'Library Fee', description: 'Library maintenance', amount: '₹500', frequency: 'Annually', students: 500, status: 'active' },
    { id: '5', name: 'Sports Fee', description: 'Sports facilities', amount: '₹2,000', frequency: 'Annually', students: 500, status: 'active' },
    { id: '6', name: 'Exam Fee', description: 'Term examination charges', amount: '₹1,000', frequency: 'Per Exam', students: 500, status: 'active' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.nameRow}>
                <View style={[styles.dot, { backgroundColor: item.status === 'active' ? COLORS.success : COLORS.gray400 }]} />
                <Text style={styles.name}>{item.name}</Text>
              </View>
              <Text style={styles.amount}>{item.amount}</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon name="repeat" size={14} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{item.frequency}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="account-group" size={14} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{item.students} students</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.base },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm, ...SHADOWS.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  name: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.md, color: COLORS.text },
  amount: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.md, color: COLORS.primary },
  description: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
  metaRow: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.divider },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  metaText: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.sm, color: COLORS.textMuted },
});

export default FeeCategoriesScreen;
