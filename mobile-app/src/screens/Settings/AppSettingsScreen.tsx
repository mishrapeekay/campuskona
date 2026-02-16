import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import offlineManager from '@/utils/offlineManager';
import i18n, { SUPPORTED_LANGUAGES, LANGUAGE_KEY } from '@/i18n';

interface AppSettings {
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    announcements: boolean;
    messages: boolean;
    attendance: boolean;
    fees: boolean;
    exams: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    language: string;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
    personalization: boolean;
  };
  data: {
    offlineMode: boolean;
    autoSync: boolean;
    wifiOnlySync: boolean;
    cacheSize: 'small' | 'medium' | 'large';
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    announcements: true,
    messages: true,
    attendance: true,
    fees: true,
    exams: true,
  },
  appearance: {
    theme: 'light',
    fontSize: 'medium',
    language: 'en',
  },
  privacy: {
    analytics: true,
    crashReports: true,
    personalization: true,
  },
  data: {
    offlineMode: true,
    autoSync: true,
    wifiOnlySync: false,
    cacheSize: 'medium',
  },
};

const SETTINGS_STORAGE_KEY = '@app_settings';

const AppSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [queueLength, setQueueLength] = useState(0);
  const [cacheSize, setCacheSize] = useState('0 MB');

  const currentLanguage = SUPPORTED_LANGUAGES.find(
    (l) => l.code === (settings.appearance.language || i18n.language)
  ) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    loadSettings();
    updateQueueLength();
    calculateCacheSize();

    // Listen to queue updates
    const handleQueueUpdate = (length: number) => {
      setQueueLength(length);
    };

    offlineManager.on('queueUpdated', handleQueueUpdate);

    return () => {
      offlineManager.off('queueUpdated', handleQueueUpdate);
    };
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      }
      // Sync language preference from i18n storage
      const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (storedLang) {
        setSettings((prev) => ({
          ...prev,
          appearance: { ...prev.appearance, language: storedLang },
        }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleLanguagePress = () => {
    // @ts-ignore
    navigation.navigate('LanguageSettings');
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const updateQueueLength = () => {
    setQueueLength(offlineManager.getQueueLength());
  };

  const calculateCacheSize = async () => {
    // TODO: Implement actual cache size calculation
    setCacheSize('24.5 MB');
  };

  const handleToggle = (section: keyof AppSettings, key: string, value: boolean) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    };
    saveSettings(newSettings);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached data. You may need to re-download content when online. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await offlineManager.clearCache();
            calculateCacheSize();
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleSyncNow = async () => {
    if (!offlineManager.getConnectionStatus()) {
      Alert.alert('Offline', 'You are currently offline. Sync will start automatically when connected.');
      return;
    }

    Alert.alert('Syncing', 'Syncing offline data...');
    await offlineManager.syncOfflineQueue();
    updateQueueLength();
    Alert.alert('Success', 'Sync completed successfully');
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to default values. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            saveSettings(DEFAULT_SETTINGS);
            Alert.alert('Success', 'Settings reset to default');
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    // @ts-ignore
    navigation.navigate('About');
  };

  return (
    <ScreenWrapper>
      <Header title="App Settings" showBackButton onBackPress={() => navigation.goBack()} />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <Card elevation="sm" padding={SPACING.md} style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="bell" size={20} color={COLORS.primary} />
                <Text style={styles.settingLabel}>Enable Notifications</Text>
              </View>
              <Switch
                value={settings.notifications.enabled}
                onValueChange={(value) => handleToggle('notifications', 'enabled', value)}
                trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
                thumbColor={settings.notifications.enabled ? COLORS.primary : COLORS.gray400}
              />
            </View>

            {settings.notifications.enabled && (
              <>
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <Icon name="volume-high" size={20} color={COLORS.gray600} />
                    <Text style={styles.settingLabel}>Sound</Text>
                  </View>
                  <Switch
                    value={settings.notifications.sound}
                    onValueChange={(value) => handleToggle('notifications', 'sound', value)}
                    trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
                    thumbColor={settings.notifications.sound ? COLORS.primary : COLORS.gray400}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <Icon name="vibrate" size={20} color={COLORS.gray600} />
                    <Text style={styles.settingLabel}>Vibration</Text>
                  </View>
                  <Switch
                    value={settings.notifications.vibration}
                    onValueChange={(value) => handleToggle('notifications', 'vibration', value)}
                    trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
                    thumbColor={settings.notifications.vibration ? COLORS.primary : COLORS.gray400}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.settingRow}>
                  <Text style={styles.subSectionTitle}>Notification Types</Text>
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <Icon name="bullhorn" size={20} color={COLORS.gray600} />
                    <Text style={styles.settingLabel}>Announcements</Text>
                  </View>
                  <Switch
                    value={settings.notifications.announcements}
                    onValueChange={(value) => handleToggle('notifications', 'announcements', value)}
                    trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
                    thumbColor={settings.notifications.announcements ? COLORS.primary : COLORS.gray400}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <Icon name="message" size={20} color={COLORS.gray600} />
                    <Text style={styles.settingLabel}>Messages</Text>
                  </View>
                  <Switch
                    value={settings.notifications.messages}
                    onValueChange={(value) => handleToggle('notifications', 'messages', value)}
                    trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
                    thumbColor={settings.notifications.messages ? COLORS.primary : COLORS.gray400}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <Icon name="calendar-check" size={20} color={COLORS.gray600} />
                    <Text style={styles.settingLabel}>Attendance</Text>
                  </View>
                  <Switch
                    value={settings.notifications.attendance}
                    onValueChange={(value) => handleToggle('notifications', 'attendance', value)}
                    trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
                    thumbColor={settings.notifications.attendance ? COLORS.primary : COLORS.gray400}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <Icon name="currency-inr" size={20} color={COLORS.gray600} />
                    <Text style={styles.settingLabel}>Fee Reminders</Text>
                  </View>
                  <Switch
                    value={settings.notifications.fees}
                    onValueChange={(value) => handleToggle('notifications', 'fees', value)}
                    trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
                    thumbColor={settings.notifications.fees ? COLORS.primary : COLORS.gray400}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <Icon name="certificate" size={20} color={COLORS.gray600} />
                    <Text style={styles.settingLabel}>Exam Updates</Text>
                  </View>
                  <Switch
                    value={settings.notifications.exams}
                    onValueChange={(value) => handleToggle('notifications', 'exams', value)}
                    trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
                    thumbColor={settings.notifications.exams ? COLORS.primary : COLORS.gray400}
                  />
                </View>
              </>
            )}
          </Card>
        </View>

        {/* Data & Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>

          <Card elevation="sm" padding={SPACING.md} style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="cloud-off-outline" size={20} color={COLORS.primary} />
                <Text style={styles.settingLabel}>Offline Mode</Text>
              </View>
              <Switch
                value={settings.data.offlineMode}
                onValueChange={(value) => handleToggle('data', 'offlineMode', value)}
                trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
                thumbColor={settings.data.offlineMode ? COLORS.primary : COLORS.gray400}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="sync" size={20} color={COLORS.gray600} />
                <Text style={styles.settingLabel}>Auto Sync</Text>
              </View>
              <Switch
                value={settings.data.autoSync}
                onValueChange={(value) => handleToggle('data', 'autoSync', value)}
                trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
                thumbColor={settings.data.autoSync ? COLORS.primary : COLORS.gray400}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="wifi" size={20} color={COLORS.gray600} />
                <Text style={styles.settingLabel}>WiFi Only Sync</Text>
              </View>
              <Switch
                value={settings.data.wifiOnlySync}
                onValueChange={(value) => handleToggle('data', 'wifiOnlySync', value)}
                trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
                thumbColor={settings.data.wifiOnlySync ? COLORS.primary : COLORS.gray400}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Offline Queue</Text>
              <Text style={styles.infoValue}>{queueLength} items</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cache Size</Text>
              <Text style={styles.infoValue}>{cacheSize}</Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleSyncNow}>
                <Icon name="sync" size={20} color={COLORS.primary} />
                <Text style={styles.actionButtonText}>Sync Now</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
                <Icon name="delete-sweep" size={20} color={COLORS.error} />
                <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Clear Cache</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <Card elevation="sm" padding={SPACING.md} style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="chart-line" size={20} color={COLORS.gray600} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Usage Analytics</Text>
                  <Text style={styles.settingDescription}>Help improve the app</Text>
                </View>
              </View>
              <Switch
                value={settings.privacy.analytics}
                onValueChange={(value) => handleToggle('privacy', 'analytics', value)}
                trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
                thumbColor={settings.privacy.analytics ? COLORS.primary : COLORS.gray400}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="bug" size={20} color={COLORS.gray600} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Crash Reports</Text>
                  <Text style={styles.settingDescription}>Send error reports</Text>
                </View>
              </View>
              <Switch
                value={settings.privacy.crashReports}
                onValueChange={(value) => handleToggle('privacy', 'crashReports', value)}
                trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
                thumbColor={settings.privacy.crashReports ? COLORS.primary : COLORS.gray400}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Icon name="account-cog" size={20} color={COLORS.gray600} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Personalization</Text>
                  <Text style={styles.settingDescription}>Personalized experience</Text>
                </View>
              </View>
              <Switch
                value={settings.privacy.personalization}
                onValueChange={(value) => handleToggle('privacy', 'personalization', value)}
                trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
                thumbColor={settings.privacy.personalization ? COLORS.primary : COLORS.gray400}
              />
            </View>
          </Card>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>

          <Card elevation="sm" padding={0} style={styles.settingCard}>
            <TouchableOpacity style={styles.linkRow} onPress={handleLanguagePress}>
              <View style={styles.settingLeft}>
                <Icon name="translate" size={20} color={COLORS.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>{t('common.language')}</Text>
                  <Text style={styles.settingDescription}>{currentLanguage.native}</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Other Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other</Text>

          <Card elevation="sm" padding={0} style={styles.settingCard}>
            <TouchableOpacity style={styles.linkRow} onPress={handleAbout}>
              <View style={styles.settingLeft}>
                <Icon name="information" size={20} color={COLORS.gray600} />
                <Text style={styles.settingLabel}>About</Text>
              </View>
              <Icon name="chevron-right" size={20} color={COLORS.gray400} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkRow} onPress={() => {}}>
              <View style={styles.settingLeft}>
                <Icon name="shield-check" size={20} color={COLORS.gray600} />
                <Text style={styles.settingLabel}>Privacy Policy</Text>
              </View>
              <Icon name="chevron-right" size={20} color={COLORS.gray400} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkRow} onPress={() => {}}>
              <View style={styles.settingLeft}>
                <Icon name="file-document" size={20} color={COLORS.gray600} />
                <Text style={styles.settingLabel}>Terms of Service</Text>
              </View>
              <Icon name="chevron-right" size={20} color={COLORS.gray400} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkRow} onPress={handleResetSettings}>
              <View style={styles.settingLeft}>
                <Icon name="restore" size={20} color={COLORS.error} />
                <Text style={[styles.settingLabel, { color: COLORS.error }]}>Reset Settings</Text>
              </View>
              <Icon name="chevron-right" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.0 (Build 1)</Text>
          <Text style={styles.versionText}>© 2026 School Management System</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  settingCard: {
    marginBottom: SPACING.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.gray900,
  },
  settingDescription: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
    marginTop: 2,
  },
  subSectionTitle: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.bold,
    color: COLORS.gray700,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  infoValue: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  actionButtonText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  versionText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
    marginBottom: 4,
  },
});

export default AppSettingsScreen;
