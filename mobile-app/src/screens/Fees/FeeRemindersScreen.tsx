import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { feeService } from '@/services/api';

interface FeeReminder {
  id: string;
  fee_name: string;
  due_date: string;
  amount: number;
  balance_amount: number;
  days_remaining: number;
  priority: 'high' | 'medium' | 'low';
  reminder_sent: boolean;
  last_reminder_date?: string;
}

interface ReminderSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  days_before: number;
}

const FeeRemindersScreen: React.FC = () => {
  const navigation = useNavigation();
  const [reminders, setReminders] = useState<FeeReminder[]>([]);
  const [settings, setSettings] = useState<ReminderSettings>({
    email_enabled: true,
    sms_enabled: true,
    push_enabled: true,
    days_before: 3,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
    loadSettings();
  }, []);

  const loadReminders = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await feeService.getFeeReminders();

      // Mock data
      const mockReminders: FeeReminder[] = [
        {
          id: 'rem-1',
          fee_name: 'Tuition Fee - Term 2',
          due_date: '2026-01-20',
          amount: 28000,
          balance_amount: 28000,
          days_remaining: 5,
          priority: 'high',
          reminder_sent: true,
          last_reminder_date: '2026-01-12',
        },
        {
          id: 'rem-2',
          fee_name: 'Transport Fee - Q2',
          due_date: '2026-01-25',
          amount: 6000,
          balance_amount: 6000,
          days_remaining: 10,
          priority: 'medium',
          reminder_sent: false,
        },
        {
          id: 'rem-3',
          fee_name: 'Library Fee',
          due_date: '2026-02-01',
          amount: 2000,
          balance_amount: 2000,
          days_remaining: 17,
          priority: 'low',
          reminder_sent: false,
        },
        {
          id: 'rem-4',
          fee_name: 'Exam Fee - Final Term',
          due_date: '2026-01-18',
          amount: 1500,
          balance_amount: 1500,
          days_remaining: 3,
          priority: 'high',
          reminder_sent: true,
          last_reminder_date: '2026-01-14',
        },
      ];

      setReminders(mockReminders.sort((a, b) => a.days_remaining - b.days_remaining));
    } catch (error) {
      console.error('Failed to load reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await feeService.getReminderSettings();
      // setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReminders();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      high: { color: COLORS.error, label: 'Urgent', icon: 'alert-circle' },
      medium: { color: COLORS.warning, label: 'Important', icon: 'alert' },
      low: { color: COLORS.info, label: 'Normal', icon: 'information' },
    };
    return configs[priority as keyof typeof configs] || configs.low;
  };

  const handlePayFee = (reminder: FeeReminder) => {
    // @ts-ignore
    navigation.navigate('PaymentGateway', {
      feeId: reminder.id,
      amount: reminder.balance_amount,
    });
  };

  const handleSnoozeReminder = async (reminderId: string) => {
    try {
      // TODO: Replace with actual API call
      // await feeService.snoozeReminder(reminderId);
      Alert.alert('Success', 'Reminder snoozed for 2 days');
      await loadReminders();
    } catch (error) {
      Alert.alert('Error', 'Failed to snooze reminder');
    }
  };

  const handleToggleSetting = async (key: keyof ReminderSettings, value: boolean | number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      // TODO: Replace with actual API call
      // await feeService.updateReminderSettings(newSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      // Revert on error
      setSettings(settings);
    }
  };

  const renderReminderItem = ({ item }: { item: FeeReminder }) => {
    const priorityConfig = getPriorityConfig(item.priority);
    const isOverdue = item.days_remaining < 0;
    const daysText = isOverdue
      ? `${Math.abs(item.days_remaining)} days overdue`
      : item.days_remaining === 0
      ? 'Due today'
      : `Due in ${item.days_remaining} days`;

    return (
      <Card elevation="md" padding={SPACING.md} style={styles.reminderCard}>
        {/* Header */}
        <View style={styles.reminderHeader}>
          <View style={styles.reminderLeft}>
            <View style={[styles.priorityIcon, { backgroundColor: priorityConfig.color + '15' }]}>
              <Icon name={priorityConfig.icon} size={24} color={priorityConfig.color} />
            </View>
            <View style={styles.reminderInfo}>
              <Text style={styles.feeName}>{item.fee_name}</Text>
              <View style={styles.dueRow}>
                <Icon name="calendar" size={14} color={COLORS.gray500} />
                <Text style={[styles.dueText, isOverdue && { color: COLORS.error }]}>
                  {daysText}
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.color + '15' }]}>
            <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
              {priorityConfig.label}
            </Text>
          </View>
        </View>

        {/* Amount Section */}
        <View style={styles.amountSection}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Due Amount:</Text>
            <Text style={styles.amountValue}>{formatCurrency(item.balance_amount)}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Due Date:</Text>
            <Text style={styles.amountValue}>{formatDate(item.due_date)}</Text>
          </View>
        </View>

        {/* Reminder Status */}
        {item.reminder_sent && item.last_reminder_date && (
          <View style={styles.reminderStatus}>
            <Icon name="bell-check" size={14} color={COLORS.success} />
            <Text style={styles.reminderStatusText}>
              Last reminder sent on {formatDate(item.last_reminder_date)}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSnoozeReminder(item.id)}
          >
            <Icon name="clock-outline" size={16} color={COLORS.gray600} />
            <Text style={styles.actionText}>Snooze</Text>
          </TouchableOpacity>
          <Button
            title={`Pay ${formatCurrency(item.balance_amount)}`}
            onPress={() => handlePayFee(item)}
            size="small"
            style={styles.payButton}
          />
        </View>
      </Card>
    );
  };

  return (
    <ScreenWrapper>
      <Header title="Fee Reminders" showBackButton onBackPress={() => navigation.goBack()} />
      <View style={styles.container}>
        {/* Settings Section */}
        <Card elevation="md" padding={SPACING.md} style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Reminder Preferences</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="email" size={20} color={COLORS.primary} />
              <Text style={styles.settingLabel}>Email Notifications</Text>
            </View>
            <Switch
              value={settings.email_enabled}
              onValueChange={(value) => handleToggleSetting('email_enabled', value)}
              trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
              thumbColor={settings.email_enabled ? COLORS.primary : COLORS.gray400}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="message-text" size={20} color={COLORS.primary} />
              <Text style={styles.settingLabel}>SMS Notifications</Text>
            </View>
            <Switch
              value={settings.sms_enabled}
              onValueChange={(value) => handleToggleSetting('sms_enabled', value)}
              trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
              thumbColor={settings.sms_enabled ? COLORS.primary : COLORS.gray400}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="bell" size={20} color={COLORS.primary} />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={settings.push_enabled}
              onValueChange={(value) => handleToggleSetting('push_enabled', value)}
              trackColor={{ false: COLORS.gray300, true: COLORS.primary + '50' }}
              thumbColor={settings.push_enabled ? COLORS.primary : COLORS.gray400}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Icon name="calendar-clock" size={20} color={COLORS.primary} />
              <Text style={styles.settingLabel}>Remind me {settings.days_before} days before</Text>
            </View>
          </View>
        </Card>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <Card elevation="sm" padding={SPACING.md} style={styles.statCard}>
            <Text style={[styles.statValue, { color: COLORS.error }]}>{reminders.filter((r) => r.priority === 'high').length}</Text>
            <Text style={styles.statLabel}>Urgent</Text>
          </Card>
          <Card elevation="sm" padding={SPACING.md} style={styles.statCard}>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>{reminders.filter((r) => r.priority === 'medium').length}</Text>
            <Text style={styles.statLabel}>Important</Text>
          </Card>
          <Card elevation="sm" padding={SPACING.md} style={styles.statCard}>
            <Text style={[styles.statValue, { color: COLORS.info }]}>{reminders.filter((r) => r.priority === 'low').length}</Text>
            <Text style={styles.statLabel}>Normal</Text>
          </Card>
        </View>

        {/* Reminders List */}
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          renderItem={renderReminderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="bell-off" size={64} color={COLORS.gray300} />
              <Text style={styles.emptyStateTitle}>No Pending Reminders</Text>
              <Text style={styles.emptyStateText}>
                All your fees are paid or not yet due
              </Text>
            </View>
          }
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  settingsCard: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
  },
  settingsTitle: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  settingLabel: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS['2xl'],
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray500,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  reminderCard: {
    marginBottom: SPACING.md,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  reminderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  priorityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  reminderInfo: {
    flex: 1,
  },
  feeName: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
    marginBottom: 4,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.bold,
  },
  amountSection: {
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  amountLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  amountValue: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  reminderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  reminderStatusText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.success,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  actionText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  payButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
    paddingTop: SPACING['3xl'] * 2,
  },
  emptyStateTitle: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
    textAlign: 'center',
  },
});

export default FeeRemindersScreen;
