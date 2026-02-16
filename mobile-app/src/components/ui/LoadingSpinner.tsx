import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = COLORS.primary,
  text,
  fullScreen = false,
  className,
}) => {
  return (
    <View
      style={fullScreen ? styles.fullScreenContainer : styles.container}
      className={`bg-white dark:bg-slate-950 ${fullScreen ? 'flex-1' : ''} ${className || ''}`}
    >
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={styles.text} className="text-slate-500 dark:text-slate-400">
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: SPACING.md,
    fontSize: FONTS.size.sm,
    fontFamily: FONTS.family.medium,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
