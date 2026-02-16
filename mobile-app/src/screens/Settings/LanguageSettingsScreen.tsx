import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import i18n, { SUPPORTED_LANGUAGES, LANGUAGE_KEY } from '@/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageSettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(i18n.language || 'en');
  const [loading, setLoading] = useState(false);

  // Load persisted language on mount
  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
      if (stored) setSelected(stored);
    });
  }, []);

  const handleSelect = async (code: string) => {
    if (code === selected || loading) return;
    setLoading(true);
    try {
      await i18n.changeLanguage(code);
      await AsyncStorage.setItem(LANGUAGE_KEY, code);
      setSelected(code);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.language')}</Text>
        {loading && <ActivityIndicator size="small" color={COLORS.primary} />}
      </View>
      <FlatList
        data={SUPPORTED_LANGUAGES}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, selected === item.code && styles.selectedItem]}
            onPress={() => handleSelect(item.code)}
            activeOpacity={0.7}
          >
            <View style={styles.itemInfo}>
              <Text style={[styles.native, selected === item.code && styles.selectedText]}>
                {item.native}
              </Text>
              <Text style={styles.label}>{item.label}</Text>
            </View>
            {selected === item.code && (
              <Icon name="check-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontFamily: FONTS.family.semiBold,
    fontSize: FONTS.size.lg,
    color: COLORS.text,
  },
  list: { padding: SPACING.base },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  selectedItem: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryMuted },
  itemInfo: { flex: 1 },
  native: {
    fontFamily: FONTS.family.semiBold,
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  selectedText: { color: COLORS.primary },
  label: {
    fontFamily: FONTS.family.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

export default LanguageSettingsScreen;
