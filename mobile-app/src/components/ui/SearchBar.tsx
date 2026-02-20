/**
 * SearchBar - Reusable search input component
 */

import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants/theme';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  className?: string;
  placeholderTextColor?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onClear,
  className,
  placeholderTextColor,
}) => {
  return (
    <View
      style={styles.container}
      className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 ${className || ''}`}
    >
      <Icon name="magnify" size={20} color={COLORS.gray400} />
      <TextInput
        style={styles.input}
        className="text-slate-900 dark:text-slate-100"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={placeholderTextColor || COLORS.gray400}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear || (() => onChangeText(''))}>
          <Icon name="close-circle" size={18} color={COLORS.gray400} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    height: 48,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: FONTS.family.medium,
    fontSize: FONTS.size.base,
  },
});

export default SearchBar;
