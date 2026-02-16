import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import { COLORS, FONTS, SPACING } from '@/constants';

const RegisterScreen: React.FC = () => {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.text}>Register Screen - To be implemented</Text>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  text: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
});

export default RegisterScreen;
