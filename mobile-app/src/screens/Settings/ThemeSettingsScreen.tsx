import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const themes = [
  { key: 'light', label: 'Light', icon: 'white-balance-sunny', desc: 'Classic light appearance' },
  { key: 'dark', label: 'Dark', icon: 'moon-waning-crescent', desc: 'Easy on the eyes in low light' },
  { key: 'system', label: 'System', icon: 'cellphone', desc: 'Follows your device settings' },
];

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setTheme } from '@/store/slices/themeSlice';
import { useColorScheme } from 'nativewind';
import { Appearance } from 'react-native';

const ThemeSettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mode } = useAppSelector((state) => state.theme);
  const { setColorScheme } = useColorScheme();

  const handleSelectTheme = (key: 'light' | 'dark' | 'system') => {
    dispatch(setTheme(key));
    if (key === 'system') {
      setColorScheme(Appearance.getColorScheme() || 'light');
    } else {
      setColorScheme(key);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Choose your preferred theme</Text>
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme.key}
            style={[styles.card, mode === theme.key && styles.selectedCard]}
            onPress={() => handleSelectTheme(theme.key as 'light' | 'dark' | 'system')}
          >
            <View style={[styles.iconBox, mode === theme.key ? { backgroundColor: COLORS.primaryMuted } : { backgroundColor: COLORS.gray100 }]}>
              <Icon name={theme.icon} size={32} color={mode === theme.key ? COLORS.primary : COLORS.gray500} />
            </View>
            <View style={styles.info}>
              <Text style={styles.label}>{theme.label}</Text>
              <Text style={styles.desc}>{theme.desc}</Text>
            </View>
            {mode === theme.key && <Icon name="check-circle" size={24} color={COLORS.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.base },
  heading: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.base, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm,
    borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  selectedCard: { borderColor: COLORS.primary },
  iconBox: { width: 56, height: 56, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  info: { flex: 1 },
  label: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.md, color: COLORS.text },
  desc: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
});

export default ThemeSettingsScreen;
