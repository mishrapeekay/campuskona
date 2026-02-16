import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '@/components/common/Card';
import { COLORS, SPACING, FONTS } from '@/constants';

interface StatCardProps {
  icon: string;
  title: string;
  value: number | string;
  color: string;
  suffix?: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  color,
  suffix,
  onPress,
}) => {
  return (
    <View style={styles.statCardWrapper}>
      <Card elevation="sm" padding={SPACING.lg} onPress={onPress}>
        <View style={styles.statContent}>
          <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
            <Icon name={icon} size={28} color={color} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>
              {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
              {suffix && <Text style={styles.statSuffix}>{suffix}</Text>}
            </Text>
            <Text style={styles.statTitle}>{title}</Text>
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  statCardWrapper: {
    width: '48%',
    marginBottom: SPACING.xs,
  },
  statContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: FONTS['2xl'],
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  statSuffix: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  statTitle: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray500,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default StatCard;
