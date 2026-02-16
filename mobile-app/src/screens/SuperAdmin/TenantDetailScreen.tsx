import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  AlertButton,
  RefreshControl,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { ScreenProps } from '@/types/navigation';

import { tenantService, auditService } from '@/services/api';

interface TenantDetail {
  id: string;
  school_name: string;
  school_code: string;
  subdomain: string;
  custom_domain?: string;
  status: 'active' | 'trial' | 'expired' | 'suspended';
  subscription_plan: 'basic' | 'standard' | 'premium' | 'enterprise';
  created_at: string;
  trial_ends_at?: string;
  subscription_ends_at?: string;
  contact: {
    admin_name: string;
    admin_email: string;
    admin_phone: string;
    school_phone: string;
    school_email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  stats: {
    total_students: number;
    total_teachers: number;
    total_staff: number;
    active_users: number;
    total_classes: number;
    total_sections: number;
    storage_used_mb: number;
    storage_limit_mb: number;
  };
  modules: {
    library: boolean;
    transport: boolean;
    online_payments: boolean;
    biometric_attendance: boolean;
  };
  preferences: {
    academic_board: string;
    grading_system: string;
    timezone: string;
    language: string;
  };
  billing: {
    monthly_fee: number;
    last_payment_date?: string;
    next_billing_date: string;
    payment_method: string;
    billing_email: string;
  };
  usage: {
    api_calls_this_month: number;
    storage_uploads_this_month: number;
    active_sessions: number;
    peak_concurrent_users: number;
  };
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const TenantDetailScreen: React.FC<ScreenProps> = ({ route }) => {
  const navigation = useNavigation<any>();
  const { tenantId } = route.params as { tenantId: string };

  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'usage' | 'billing' | 'activity'
  >('overview');

  useEffect(() => {
    loadTenantDetails();
  }, [tenantId]);

  const loadTenantDetails = async () => {
    try {
      setLoading(true);
      const response = await tenantService.getTenantDetails(tenantId);
      const school = response.data || response;

      // Map API fields to UI model
      const mappedTenant: TenantDetail = {
        id: school.id,
        school_name: school.name,
        school_code: school.code,
        subdomain: school.subdomain,
        custom_domain: school.custom_domain,
        status: !school.is_active ? 'suspended' : (school.is_trial ? 'trial' : 'active'),
        subscription_plan: (school.subscription_name?.toLowerCase() || 'basic') as any,
        created_at: school.created_at,
        subscription_ends_at: school.subscription_end_date,
        contact: {
          admin_name: 'Administrator', // Simplified mapping
          admin_email: school.email,
          admin_phone: school.phone,
          school_phone: school.phone,
          school_email: school.email,
          address: school.address || '',
          city: '',
          state: '',
          pincode: '',
        },
        stats: {
          total_students: school.total_students || 0,
          total_teachers: school.total_staff || 0,
          total_staff: school.total_staff || 0,
          active_users: school.active_users || 0,
          total_classes: school.total_classes || 0,
          total_sections: 0,
          storage_used_mb: 0,
          storage_limit_mb: 10240,
        },
        modules: {
          library: true,
          transport: true,
          online_payments: true,
          biometric_attendance: true,
        },
        preferences: {
          academic_board: 'CBSE',
          grading_system: 'percentage',
          timezone: 'Asia/Kolkata',
          language: 'en',
        },
        billing: {
          monthly_fee: 0,
          next_billing_date: school.subscription_end_date || '',
          payment_method: 'Manual',
          billing_email: school.email,
        },
        usage: {
          api_calls_this_month: 0,
          storage_uploads_this_month: 0,
          active_sessions: 0,
          peak_concurrent_users: 0,
        },
      };

      setTenant(mappedTenant);

      // Fetch logs
      try {
        const logsResponse = await auditService.getTenantLogs(tenantId);
        const rawLogs = logsResponse.results || logsResponse.data || logsResponse;
        const mappedLogs: ActivityLog[] = Array.isArray(rawLogs) ? rawLogs.slice(0, 10).map((l: any) => ({
          id: l.id,
          timestamp: l.timestamp,
          action: l.action,
          user: l.user_name || 'System',
          details: l.object_repr || '',
          severity: l.action === 'DELETE' ? 'high' : 'low',
        })) : [];
        setActivityLogs(mappedLogs);
      } catch (logError) {
        console.warn('Failed to fetch activity logs for tenant:', logError);
      }

    } catch (error) {
      console.error('Failed to load tenant details:', error);
      Alert.alert('Error', 'Failed to load tenant details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTenantDetails();
    setRefreshing(false);
  };

  const handleUpgradeSubscription = () => {
    if (!tenant) return;

    const plans = ['basic', 'standard', 'premium'];
    const currentIndex = plans.indexOf(tenant.subscription_plan);
    const availablePlans = plans.slice(currentIndex + 1);

    if (availablePlans.length === 0) {
      Alert.alert('Info', 'Already on the highest plan (Premium)');
      return;
    }

    const buttons: AlertButton[] = availablePlans.map((plan) => ({
      text: plan.charAt(0).toUpperCase() + plan.slice(1),
      onPress: () => {
        (async () => {
          try {
            await tenantService.updateTenant(tenant.id, { subscription_name: plan.toUpperCase() });
            Alert.alert('Success', `Upgraded to ${plan} plan`);
            loadTenantDetails();
          } catch (error) {
            Alert.alert('Error', 'Failed to upgrade subscription');
          }
        })();
      },
    }));

    buttons.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      'Upgrade Subscription',
      `Select new plan for ${tenant.school_name}:`,
      buttons
    );
  };

  const handleDowngradeSubscription = () => {
    if (!tenant) return;

    const plans = ['basic', 'standard', 'premium'];
    const currentIndex = plans.indexOf(tenant.subscription_plan);
    const availablePlans = plans.slice(0, currentIndex);

    if (availablePlans.length === 0) {
      Alert.alert('Info', 'Already on the lowest plan (Basic)');
      return;
    }

    const buttons: AlertButton[] = availablePlans.map((plan) => ({
      text: plan.charAt(0).toUpperCase() + plan.slice(1),
      onPress: () => {
        (async () => {
          try {
            await tenantService.updateTenant(tenant.id, { subscription_name: plan.toUpperCase() });
            Alert.alert('Success', `Downgraded to ${plan} plan`);
            loadTenantDetails();
          } catch (error) {
            Alert.alert('Error', 'Failed to downgrade subscription');
          }
        })();
      },
    }));

    buttons.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      'Downgrade Subscription',
      `⚠️ Downgrading may disable some features. Select new plan:`,
      buttons
    );
  };

  const handleSuspend = () => {
    if (!tenant) return;

    const buttons: AlertButton[] = [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Suspend',
        style: 'destructive',
        onPress: () => {
          (async () => {
            try {
              await tenantService.updateTenant(tenant.id, { is_active: false });
              Alert.alert('Success', 'Tenant suspended successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to suspend tenant');
            }
          })();
        },
      },
    ];

    Alert.alert(
      'Suspend Tenant',
      `Suspend ${tenant.school_name}? All users will lose access immediately.`,
      buttons
    );
  };

  const handleResume = () => {
    if (!tenant) return;

    const buttons: AlertButton[] = [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Resume',
        onPress: () => {
          (async () => {
            try {
              await tenantService.updateTenant(tenant.id, { is_active: true });
              Alert.alert('Success', 'Tenant resumed successfully');
              loadTenantDetails();
            } catch (error) {
              Alert.alert('Error', 'Failed to resume tenant');
            }
          })();
        },
      },
    ];

    Alert.alert('Resume Tenant', `Resume access for ${tenant.school_name}?`, buttons);
  };

  const handleDelete = () => {
    if (!tenant) return;

    const buttons: AlertButton[] = [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.prompt(
            'Confirm Deletion',
            `Type "${tenant.school_code}":`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: (inputText) => {
                  (async () => {
                    if (inputText === tenant.school_code) {
                      try {
                        await tenantService.deleteTenant(tenant.id);
                        Alert.alert('Success', 'Tenant deleted successfully');
                        navigation.goBack();
                      } catch (error) {
                        Alert.alert('Error', 'Failed to delete tenant');
                      }
                    } else {
                      Alert.alert('Error', 'School code mismatch. Deletion cancelled.');
                    }
                  })();
                },
              },
            ],
            'plain-text'
          );
        },
      },
    ];

    Alert.alert(
      'Delete Tenant',
      `⚠️ PERMANENT ACTION\n\nDeleting ${tenant.school_name} will:\n• Erase all student/staff data\n• Delete all academic records\n• Remove all financial data\n\nType "${tenant.school_code}" to confirm:`,
      buttons
    );
  };

  const handleExtendTrial = () => {
    if (!tenant) return;

    Alert.prompt(
      'Extend Trial',
      'Enter number of days to extend:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Extend',
          onPress: (days) => {
            (async () => {
              const numDays = parseInt(days || '0', 10);
              if (numDays > 0 && numDays <= 90) {
                try {
                  const newDate = new Date();
                  newDate.setDate(newDate.getDate() + numDays);
                  await tenantService.updateTenant(tenant.id, {
                    subscription_end_date: newDate.toISOString().split('T')[0],
                  });
                  Alert.alert('Success', `Trial extended by ${numDays} days`);
                  loadTenantDetails();
                } catch (error) {
                  Alert.alert('Error', 'Failed to extend trial');
                }
              } else {
                Alert.alert('Error', 'Please enter a value between 1-90 days');
              }
            })();
          },
        },
      ],
      'plain-text',
      '15'
    );
  };

  const getStatusConfig = (status: TenantDetail['status']) => {
    switch (status) {
      case 'active':
        return { color: COLORS.success, icon: 'check-circle', label: 'Active' };
      case 'trial':
        return { color: COLORS.info, icon: 'clock-outline', label: 'Trial' };
      case 'expired':
        return { color: COLORS.error, icon: 'alert-circle', label: 'Expired' };
      case 'suspended':
        return { color: COLORS.warning, icon: 'pause-circle', label: 'Suspended' };
      default:
        return { color: COLORS.gray600, icon: 'help-circle', label: 'Unknown' };
    }
  };

  const getPlanConfig = (plan: TenantDetail['subscription_plan']) => {
    switch (plan) {
      case 'basic':
        return { color: COLORS.gray600, label: 'Basic', price: 5000 };
      case 'standard':
        return { color: COLORS.info, label: 'Standard', price: 12000 };
      case 'premium':
        return { color: COLORS.purple, label: 'Premium', price: 25000 };
      case 'enterprise':
        return { color: COLORS.primary, label: 'Enterprise', price: 50000 };
      default:
        return { color: COLORS.gray500, label: plan || 'N/A', price: 0 };
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOverviewTab = () => {
    if (!tenant) return null;

    const statusConfig = getStatusConfig(tenant.status);
    const planConfig = getPlanConfig(tenant.subscription_plan);
    const storagePercent = (tenant.stats.storage_used_mb / tenant.stats.storage_limit_mb) * 100;

    return (
      <View style={styles.tabContent}>
        {/* Status and Plan */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Status & Plan</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}15` }]}>
              <Icon name={statusConfig.icon} size={20} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
            <View style={[styles.planBadge, { backgroundColor: `${planConfig.color}15` }]}>
              <Icon name="star" size={20} color={planConfig.color} />
              <Text style={[styles.planText, { color: planConfig.color }]}>
                {planConfig.label}
              </Text>
            </View>
          </View>

          {tenant.subscription_ends_at && (
            <View style={styles.expiryInfo}>
              <Icon name="calendar-clock" size={16} color={COLORS.gray600} />
              <Text style={styles.expiryText}>
                {tenant.status === 'trial' ? 'Trial ends' : 'Subscription renews'} on{' '}
                {formatDate(tenant.subscription_ends_at)}
              </Text>
            </View>
          )}
        </Card>

        {/* School Info */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>School Information</Text>
          <View style={styles.infoRow}>
            <Icon name="domain" size={18} color={COLORS.gray600} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>School Code</Text>
              <Text style={styles.infoValue}>{tenant.school_code}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Icon name="web" size={18} color={COLORS.gray600} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Subdomain</Text>
              <Text style={styles.infoValue}>{tenant.subdomain}.schoolmgmt.com</Text>
            </View>
          </View>
          {tenant.custom_domain && (
            <View style={styles.infoRow}>
              <Icon name="link-variant" size={18} color={COLORS.gray600} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Custom Domain</Text>
                <Text style={styles.infoValue}>{tenant.custom_domain}</Text>
              </View>
            </View>
          )}
          <View style={styles.infoRow}>
            <Icon name="calendar-plus" size={18} color={COLORS.gray600} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Created On</Text>
              <Text style={styles.infoValue}>{formatDate(tenant.created_at)}</Text>
            </View>
          </View>
        </Card>

        {/* Contact Info */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <View style={styles.infoRow}>
            <Icon name="account-tie" size={18} color={COLORS.gray600} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Admin Name</Text>
              <Text style={styles.infoValue}>{tenant.contact.admin_name}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Icon name="email" size={18} color={COLORS.gray600} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Admin Email</Text>
              <Text style={styles.infoValue}>{tenant.contact.admin_email}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Icon name="phone" size={18} color={COLORS.gray600} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Admin Phone</Text>
              <Text style={styles.infoValue}>{tenant.contact.admin_phone}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={18} color={COLORS.gray600} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>
                {tenant.contact.address}, {tenant.contact.city}, {tenant.contact.state} -{' '}
                {tenant.contact.pincode}
              </Text>
            </View>
          </View>
        </Card>

        {/* Statistics */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Icon name="account-group" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>{tenant.stats.total_students}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statBox}>
              <Icon name="account-tie" size={24} color={COLORS.success} />
              <Text style={styles.statValue}>{tenant.stats.total_teachers}</Text>
              <Text style={styles.statLabel}>Teachers</Text>
            </View>
            <View style={styles.statBox}>
              <Icon name="account-multiple" size={24} color={COLORS.info} />
              <Text style={styles.statValue}>{tenant.stats.active_users}</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
            <View style={styles.statBox}>
              <Icon name="google-classroom" size={24} color={COLORS.warning} />
              <Text style={styles.statValue}>{tenant.stats.total_classes}</Text>
              <Text style={styles.statLabel}>Classes</Text>
            </View>
          </View>

          {/* Storage */}
          <View style={styles.storageSection}>
            <View style={styles.storageHeader}>
              <Text style={styles.storageLabel}>Storage Usage</Text>
              <Text style={styles.storageValue}>
                {(tenant.stats.storage_used_mb / 1024).toFixed(2)} GB /{' '}
                {(tenant.stats.storage_limit_mb / 1024).toFixed(0)} GB
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(storagePercent, 100)}%`,
                    backgroundColor:
                      storagePercent > 90
                        ? COLORS.error
                        : storagePercent > 75
                          ? COLORS.warning
                          : COLORS.success,
                  },
                ]}
              />
            </View>
            <Text style={styles.storagePercent}>{storagePercent.toFixed(1)}% used</Text>
          </View>
        </Card>

        {/* Modules */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Enabled Modules</Text>
          <View style={styles.modulesGrid}>
            <View style={styles.moduleItem}>
              <Icon
                name="book-open-variant"
                size={20}
                color={tenant.modules.library ? COLORS.success : COLORS.gray400}
              />
              <Text
                style={[
                  styles.moduleText,
                  { color: tenant.modules.library ? COLORS.gray900 : COLORS.gray400 },
                ]}
              >
                Library
              </Text>
              <Icon
                name={tenant.modules.library ? 'check-circle' : 'close-circle'}
                size={16}
                color={tenant.modules.library ? COLORS.success : COLORS.gray400}
              />
            </View>
            <View style={styles.moduleItem}>
              <Icon
                name="bus-school"
                size={20}
                color={tenant.modules.transport ? COLORS.success : COLORS.gray400}
              />
              <Text
                style={[
                  styles.moduleText,
                  { color: tenant.modules.transport ? COLORS.gray900 : COLORS.gray400 },
                ]}
              >
                Transport
              </Text>
              <Icon
                name={tenant.modules.transport ? 'check-circle' : 'close-circle'}
                size={16}
                color={tenant.modules.transport ? COLORS.success : COLORS.gray400}
              />
            </View>
            <View style={styles.moduleItem}>
              <Icon
                name="credit-card"
                size={20}
                color={tenant.modules.online_payments ? COLORS.success : COLORS.gray400}
              />
              <Text
                style={[
                  styles.moduleText,
                  {
                    color: tenant.modules.online_payments ? COLORS.gray900 : COLORS.gray400,
                  },
                ]}
              >
                Payments
              </Text>
              <Icon
                name={tenant.modules.online_payments ? 'check-circle' : 'close-circle'}
                size={16}
                color={tenant.modules.online_payments ? COLORS.success : COLORS.gray400}
              />
            </View>
            <View style={styles.moduleItem}>
              <Icon
                name="fingerprint"
                size={20}
                color={tenant.modules.biometric_attendance ? COLORS.success : COLORS.gray400}
              />
              <Text
                style={[
                  styles.moduleText,
                  {
                    color: tenant.modules.biometric_attendance
                      ? COLORS.gray900
                      : COLORS.gray400,
                  },
                ]}
              >
                Biometric
              </Text>
              <Icon
                name={tenant.modules.biometric_attendance ? 'check-circle' : 'close-circle'}
                size={16}
                color={tenant.modules.biometric_attendance ? COLORS.success : COLORS.gray400}
              />
            </View>
          </View>
        </Card>

        {/* Preferences */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Preferences</Text>
          <View style={styles.infoRow}>
            <Icon name="school" size={18} color={COLORS.gray600} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Academic Board</Text>
              <Text style={styles.infoValue}>{tenant.preferences.academic_board}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Icon name="certificate" size={18} color={COLORS.gray600} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Grading System</Text>
              <Text style={styles.infoValue}>
                {tenant.preferences.grading_system === 'percentage' ? 'Percentage' : 'Grade'}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Icon name="earth" size={18} color={COLORS.gray600} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Timezone</Text>
              <Text style={styles.infoValue}>{tenant.preferences.timezone}</Text>
            </View>
          </View>
        </Card>
      </View>
    );
  };

  const renderUsageTab = () => {
    if (!tenant) return null;

    return (
      <View style={styles.tabContent}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>This Month's Usage</Text>
          <View style={styles.usageItem}>
            <View style={styles.usageHeader}>
              <Icon name="api" size={20} color={COLORS.primary} />
              <Text style={styles.usageLabel}>API Calls</Text>
            </View>
            <Text style={styles.usageValue}>
              {tenant.usage.api_calls_this_month.toLocaleString()}
            </Text>
          </View>
          <View style={styles.usageItem}>
            <View style={styles.usageHeader}>
              <Icon name="cloud-upload" size={20} color={COLORS.info} />
              <Text style={styles.usageLabel}>Storage Uploads</Text>
            </View>
            <Text style={styles.usageValue}>
              {tenant.usage.storage_uploads_this_month.toLocaleString()} files
            </Text>
          </View>
          <View style={styles.usageItem}>
            <View style={styles.usageHeader}>
              <Icon name="account-multiple-check" size={20} color={COLORS.success} />
              <Text style={styles.usageLabel}>Active Sessions</Text>
            </View>
            <Text style={styles.usageValue}>{tenant.usage.active_sessions}</Text>
          </View>
          <View style={styles.usageItem}>
            <View style={styles.usageHeader}>
              <Icon name="trending-up" size={20} color={COLORS.warning} />
              <Text style={styles.usageLabel}>Peak Concurrent Users</Text>
            </View>
            <Text style={styles.usageValue}>{tenant.usage.peak_concurrent_users}</Text>
          </View>
        </Card>
      </View>
    );
  };

  const renderBillingTab = () => {
    if (!tenant) return null;

    const planConfig = getPlanConfig(tenant.subscription_plan);

    return (
      <View style={styles.tabContent}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Subscription Details</Text>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Current Plan</Text>
            <Text style={[styles.billingValue, { color: planConfig.color }]}>
              {planConfig.label}
            </Text>
          </View>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Monthly Fee</Text>
            <Text style={styles.billingValue}>₹{tenant.billing.monthly_fee.toLocaleString()}</Text>
          </View>
          {tenant.billing.last_payment_date && (
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Last Payment</Text>
              <Text style={styles.billingValue}>
                {formatDate(tenant.billing.last_payment_date)}
              </Text>
            </View>
          )}
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Next Billing Date</Text>
            <Text style={styles.billingValue}>
              {formatDate(tenant.billing.next_billing_date)}
            </Text>
          </View>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Payment Method</Text>
            <Text style={styles.billingValue}>{tenant.billing.payment_method}</Text>
          </View>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Billing Email</Text>
            <Text style={styles.billingValue}>{tenant.billing.billing_email}</Text>
          </View>
        </Card>

        <View style={styles.billingActions}>
          <Button
            title="Upgrade Plan"
            onPress={handleUpgradeSubscription}
            variant="outline"
            icon="arrow-up-circle"
            style={styles.billingButton}
          />
          <Button
            title="Downgrade Plan"
            onPress={handleDowngradeSubscription}
            variant="outline"
            icon="arrow-down-circle"
            style={styles.billingButton}
          />
        </View>
      </View>
    );
  };

  const renderActivityTab = () => {
    const getSeverityConfig = (severity: ActivityLog['severity']) => {
      switch (severity) {
        case 'low':
          return { color: COLORS.info, icon: 'information' };
        case 'medium':
          return { color: COLORS.warning, icon: 'alert' };
        case 'high':
          return { color: COLORS.error, icon: 'alert-circle' };
        case 'critical':
          return { color: COLORS.errorDark, icon: 'alert-decagram' };
        default:
          return { color: COLORS.gray500, icon: 'information' };
      }
    };

    return (
      <View style={styles.tabContent}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          {activityLogs.map((log) => {
            const config = getSeverityConfig(log.severity);
            return (
              <View key={log.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: `${config.color}15` }]}>
                  <Icon name={config.icon} size={16} color={config.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityAction}>{log.action}</Text>
                  <Text style={styles.activityDetails}>{log.details}</Text>
                  <View style={styles.activityFooter}>
                    <Text style={styles.activityUser}>{log.user}</Text>
                    <Text style={styles.activityTime}>{formatDateTime(log.timestamp)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </Card>
      </View>
    );
  };

  if (loading || !tenant) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const statusConfig = getStatusConfig(tenant.status);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={COLORS.gray900} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{tenant.school_name}</Text>
            <Text style={styles.headerSubtitle}>{tenant.subdomain}.schoolmgmt.com</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
            onPress={() => setSelectedTab('overview')}
          >
            <Text
              style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}
            >
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'usage' && styles.tabActive]}
            onPress={() => setSelectedTab('usage')}
          >
            <Text style={[styles.tabText, selectedTab === 'usage' && styles.tabTextActive]}>
              Usage
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'billing' && styles.tabActive]}
            onPress={() => setSelectedTab('billing')}
          >
            <Text style={[styles.tabText, selectedTab === 'billing' && styles.tabTextActive]}>
              Billing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'activity' && styles.tabActive]}
            onPress={() => setSelectedTab('activity')}
          >
            <Text
              style={[styles.tabText, selectedTab === 'activity' && styles.tabTextActive]}
            >
              Activity
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {selectedTab === 'overview' && renderOverviewTab()}
          {selectedTab === 'usage' && renderUsageTab()}
          {selectedTab === 'billing' && renderBillingTab()}
          {selectedTab === 'activity' && renderActivityTab()}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          {tenant.status === 'active' && (
            <Button
              title="Suspend"
              onPress={handleSuspend}
              variant="outline"
              icon="pause"
              style={StyleSheet.flatten([styles.actionBtn, styles.suspendBtn])}
            />
          )}
          {tenant.status === 'suspended' && (
            <Button
              title="Resume"
              onPress={handleResume}
              variant="outline"
              icon="play"
              style={StyleSheet.flatten([styles.actionBtn, styles.resumeBtn])}
            />
          )}
          {tenant.status === 'trial' && (
            <Button
              title="Extend Trial"
              onPress={handleExtendTrial}
              variant="outline"
              icon="clock-plus-outline"
              style={StyleSheet.flatten([styles.actionBtn, styles.extendBtn])}
            />
          )}
          {(tenant.status === 'expired' || tenant.status === 'suspended') && (
            <Button
              title="Delete"
              onPress={handleDelete}
              variant="outline"
              icon="delete"
              style={StyleSheet.flatten([styles.actionBtn, styles.deleteBtn])}
            />
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  headerSubtitle: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  tabContent: {
    padding: SPACING.lg,
  },
  card: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  statusText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    gap: SPACING.xs,
  },
  planText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  expiryText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray700,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.gray900,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: FONTS['2xl'],
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  statLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
  },
  storageSection: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  storageLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
  },
  storageValue: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  storagePercent: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    textAlign: 'right',
  },
  modulesGrid: {
    gap: SPACING.md,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  moduleText: {
    flex: 1,
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
  },
  usageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  usageLabel: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
  },
  usageValue: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  billingLabel: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
  },
  billingValue: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  billingActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  billingButton: {
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  activityDetails: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityUser: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  activityTime: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
  suspendBtn: {
    borderColor: COLORS.warning,
  },
  resumeBtn: {
    borderColor: COLORS.success,
  },
  extendBtn: {
    borderColor: COLORS.info,
  },
  deleteBtn: {
    borderColor: COLORS.error,
  },
});

export default TenantDetailScreen;
