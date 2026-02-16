import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'base' | 'elevated' | 'outlined';
  style?: StyleProp<ViewStyle>;
  padding?: number;
  onPress?: () => void;
  className?: string;
  elevation?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'base',
  style,
  onPress,
  padding = 16,
  className,
  elevation = 'sm',
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const elevationClasses: Record<string, string> = {
    none: '',
    xs: 'shadow-sm',
    sm: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const variantClasses = {
    base: `bg-white dark:bg-slate-900 ${elevationClasses[elevation]} border border-slate-50 dark:border-slate-800/50`,
    elevated: `bg-white dark:bg-slate-900 ${elevationClasses.md} border border-slate-50 dark:border-slate-800/50`,
    outlined: 'bg-transparent border border-slate-200 dark:border-slate-800',
  };

  const containerClasses = `rounded-2xl ${variantClasses[variant]} ${className || ''}`;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.9, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 100 });
    }
  };

  if (onPress) {
    return (
      <Animated.View className={containerClasses} style={[style, animatedStyle]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="rounded-2xl overflow-hidden"
        >
          <View style={{ padding }}>
            {children}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View className={containerClasses} style={[{ padding }, style]}>
      {children}
    </View>
  );
};

export default Card;
