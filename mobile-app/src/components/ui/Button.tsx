/**
 * Button - Reusable button component with variants and sizes
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title, onPress, variant = 'primary', size = 'md', icon, iconPosition = 'left',
  loading = false, disabled = false, fullWidth = false, className, style, textStyle,
}) => {
  const variantStyles = VARIANT_STYLES[variant];
  const sizeStyles = SIZE_STYLES[size];
  const isDisabled = disabled || loading;
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { backgroundColor: variantStyles.bg, borderColor: variantStyles.border, borderWidth: variant === 'outline' ? 1.5 : 0 },
        { paddingVertical: sizeStyles.py, paddingHorizontal: sizeStyles.px },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      className={className}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={iconSize}
              color={variant === 'outline' || variant === 'ghost' ? variantStyles.text : COLORS.white}
              style={styles.iconLeft}
            />
          )}
          <Text style={[
            styles.text,
            { color: variant === 'outline' || variant === 'ghost' ? variantStyles.text : COLORS.white, fontSize: sizeStyles.fontSize },
            textStyle
          ]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={iconSize}
              color={variant === 'outline' || variant === 'ghost' ? variantStyles.text : COLORS.white}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
  primary: { bg: COLORS.primary, text: COLORS.white, border: COLORS.primary },
  secondary: { bg: COLORS.secondary, text: COLORS.white, border: COLORS.secondary },
  outline: { bg: 'transparent', text: COLORS.primary, border: COLORS.primary },
  ghost: { bg: 'transparent', text: COLORS.primary, border: 'transparent' },
  danger: { bg: COLORS.error, text: COLORS.white, border: COLORS.error },
  success: { bg: COLORS.success, text: COLORS.white, border: COLORS.success },
};

const SIZE_STYLES: Record<ButtonSize, { py: number; px: number; fontSize: number }> = {
  sm: { py: SPACING.sm, px: SPACING.md, fontSize: FONTS.size.sm },
  md: { py: SPACING.md, px: SPACING.lg, fontSize: FONTS.size.base },
  lg: { py: SPACING.lg, px: SPACING.xl, fontSize: FONTS.size.md },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  text: { fontFamily: FONTS.family.bold, letterSpacing: 0.5 },
  iconLeft: { marginRight: SPACING.sm },
  iconRight: { marginLeft: SPACING.sm },
});

export default Button;
