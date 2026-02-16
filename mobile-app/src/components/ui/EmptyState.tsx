/**
 * EmptyState - Placeholder for empty lists/screens
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING } from '@/constants/theme';
import Button from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'database-off-outline',
  title,
  description,
  actionLabel,
  onAction,
  className
}) => (
  <View style={styles.container} className={className}>
    <View style={styles.iconCircle}>
      <Icon name={icon} size={48} color={COLORS.gray400} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {description && <Text style={styles.description}>{description}</Text>}
    {actionLabel && onAction && (
      <Button
        title={actionLabel}
        onPress={onAction}
        variant="outline"
        size="md"
        style={styles.button}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['5xl'],
    paddingHorizontal: SPACING['2xl']
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
    textAlign: 'center'
  },
  description: {
    fontFamily: FONTS.family.medium,
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 20
  },
  button: { marginTop: SPACING.xl },
});

export default EmptyState;
