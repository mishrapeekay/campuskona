import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { COLORS, FONTS, SPACING } from '@/constants';

const AttendanceScreen: React.FC = () => {
  return (
    <ScreenWrapper>
      <Header title="Attendance" subtitle="Manage student attendance" />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.text}>Attendance Screen - To be implemented</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
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

export default AttendanceScreen;
