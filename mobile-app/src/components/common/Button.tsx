import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.md,
      opacity: disabled ? 0.5 : 1,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
      medium: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
      large: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: { backgroundColor: COLORS.primary },
      secondary: { backgroundColor: COLORS.secondary },
      danger: { backgroundColor: COLORS.error },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
      },
      text: { backgroundColor: 'transparent' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const fontSize = size === 'small' ? FONTS.sm : size === 'large' ? FONTS.lg : FONTS.base;
    const baseStyle: TextStyle = {
      fontFamily: FONTS.medium,
      fontSize: fontSize,
    };

    const variantTextStyles: Record<string, TextStyle> = {
      primary: { color: COLORS.white },
      secondary: { color: COLORS.white },
      danger: { color: COLORS.white },
      outline: { color: COLORS.primary },
      text: { color: COLORS.primary },
    };

    return {
      ...baseStyle,
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  const getIconColor = () => {
    if (variant === 'primary' || variant === 'secondary' || variant === 'danger') {
      return COLORS.white;
    }
    return COLORS.primary;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getIconColor()} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={20}
              color={getIconColor()}
              style={{ marginRight: SPACING.sm }}
            />
          )}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={20}
              color={getIconColor()}
              style={{ marginLeft: SPACING.sm }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
