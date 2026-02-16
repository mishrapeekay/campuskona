/**
 * StatCard - Dashboard statistic card component
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: { value: string; positive: boolean };
  onPress?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, trend, onPress, className }) => {
  const Container = (onPress ? TouchableOpacity : View) as any;

  return (
    <Container
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      className={`bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 ${className || ''}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={styles.value} className="text-slate-900 dark:text-slate-100">{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend && (
        <View
          style={[styles.trendBadge, { backgroundColor: trend.positive ? COLORS.successMuted : COLORS.errorMuted }]}
          className="dark:bg-opacity-20"
        >
          <Icon name={trend.positive ? 'trending-up' : 'trending-down'} size={12} color={trend.positive ? COLORS.success : COLORS.error} />
          <Text style={[styles.trendText, { color: trend.positive ? COLORS.success : COLORS.error }]}>{trend.value}</Text>
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.xl, padding: SPACING.base, ...SHADOWS.sm, minWidth: '47%' },
  iconContainer: { width: 44, height: 44, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
  value: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.xl },
  label: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.xs, color: COLORS.textSecondary, marginTop: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full, gap: 4, marginTop: SPACING.sm },
  trendText: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.xs },
});

export default StatCard;
