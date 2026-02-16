/**
 * Badge - Status badges and labels
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', size = 'sm', dot = false, className }) => {
  const config = VARIANT_CONFIG[variant];

  return (
    <View
      style={[styles.base, { backgroundColor: config.bg }, size === 'md' && styles.md]}
      className={`border border-transparent dark:border-opacity-30 ${className || ''}`}
    >
      {dot && <View style={[styles.dot, { backgroundColor: config.text }]} />}
      <Text style={[styles.text, { color: config.text }, size === 'md' && styles.mdText]}>{label}</Text>
    </View>
  );
};

const VARIANT_CONFIG: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: COLORS.primaryMuted, text: COLORS.primary },
  success: { bg: COLORS.successMuted, text: COLORS.successDark },
  warning: { bg: COLORS.warningMuted, text: COLORS.warningDark },
  error: { bg: COLORS.errorMuted, text: COLORS.errorDark },
  info: { bg: COLORS.infoMuted, text: COLORS.infoDark },
  neutral: { bg: COLORS.gray100, text: COLORS.gray600 },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.base,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  md: { paddingHorizontal: 16, paddingVertical: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontFamily: FONTS.family.bold, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  mdText: { fontSize: 12 },
});

export default Badge;
