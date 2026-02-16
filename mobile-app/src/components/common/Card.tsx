import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, MODERN_SHADOWS } from '@/constants';
interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  elevation?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat';
  backgroundColor?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = SPACING.lg,
  elevation = 'md',
  onPress,
  variant = 'elevated',
  className,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const elevationClasses = {
    none: '',
    xs: 'shadow-sm',
    sm: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const variantClasses = {
    elevated: `bg-white dark:bg-slate-900 ${elevationClasses[elevation]} border border-slate-50 dark:border-slate-800`,
    outlined: 'bg-transparent border border-slate-200 dark:border-slate-800',
    flat: 'bg-slate-50 dark:bg-slate-900',
  };

  const containerClasses = `rounded-2xl ${variantClasses[variant]} ${className || ''}`;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
      opacity.value = withTiming(0.9, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
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

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white,
    // On Android, overflow hidden kills shadow if on the same view. 
    // So we often need a wrapper or careful styling.
  },
  innerContainer: {
    borderRadius: RADIUS.lg,
  },
});

export default Card;
