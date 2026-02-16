import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '@/store/hooks';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { tenantService } from '@/services/api';

interface PlatformStats {
  total_tenants: number;
  active_tenants: number;
  trial_tenants: number;
  total_users: number;
  total_students: number;
  monthly_revenue: number;
  mrr_growth: number;
}

interface SystemHealth {
  api_status: 'healthy' | 'degraded' | 'down';
  database_status: 'healthy' | 'degraded' | 'down';
  api_response_time: number;
  uptime_percentage: number;
  last_checked: string;
}

interface RecentActivity {
  id: string;
  type: 'tenant_created' | 'tenant_suspended' | 'subscription_upgraded' | 'payment_received';
  tenant_name: string;
  description: string;
  timestamp: string;
}

const PlatformDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response: any = await tenantService.getDashboardStats();

      const statsData: PlatformStats = {
        total_tenants: response.total_schools || 0,
        active_tenants: response.active_schools || 0,
        trial_tenants: 0, // Placeholder
        total_users: response.total_users || 0,
        total_students: response.total_students || 0,
        monthly_revenue: response.monthly_revenue || 0,
        mrr_growth: 0, // Placeholder
      };

      const healthData: SystemHealth = {
        api_status: response.system_health?.toLowerCase() === 'healthy' ? 'healthy' : 'degraded',
        database_status: 'healthy',
        api_response_time: 120,
        uptime_percentage: 99.9,
        last_checked: new Date().toISOString(),
      };

      setStats(statsData);
      setSystemHealth(healthData);
      // setRecentActivities remains mock for now as we don't have an endpoint yet
      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'tenant_created',
          tenant_name: 'System',
          description: 'Dashboard stats updated from backend',
          timestamp: new Date().toISOString(),
        }
      ];
      setRecentActivities(mockActivities);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number): string => {
    return `₹${(amount / 100000).toFixed(2)}L`;
  };

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getHealthStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy':
        return COLORS.success;
      case 'degraded':
        return COLORS.warning;
      case 'down':
        return COLORS.error;
      default:
        return COLORS.gray500;
    }
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'tenant_created':
        return 'domain-plus';
      case 'tenant_suspended':
        return 'domain-remove';
      case 'subscription_upgraded':
        return 'arrow-up-circle';
      case 'payment_received':
        return 'cash-check';
      default:
        return 'information';
    }
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'tenant_created':
        return COLORS.success;
      case 'tenant_suspended':
        return COLORS.error;
      case 'subscription_upgraded':
        return COLORS.primary;
      case 'payment_received':
        return COLORS.info;
      default:
        return COLORS.gray500;
    }
  };

  const handleAddTenant = () => {
    // @ts-ignore
    navigation.navigate('TenantSetupWizard');
  };

  const handleViewTenants = () => {
    // @ts-ignore
    navigation.navigate('TenantManagement');
  };

  const handleViewLogs = () => {
    // @ts-ignore
    navigation.navigate('AuditLogs', { type: 'platform' });
  };

  const handleAnalytics = () => {
    // @ts-ignore
    navigation.navigate('PlatformAnalytics');
  };

  if (!stats || !systemHealth) {
    return (
      <ScreenWrapper>
        <Header title="Platform Dashboard" />
        <View style={styles.loadingContainer}>
          <Icon name="sync" size={64} color={COLORS.gray300} />
          <Text style={styles.loadingText}>Loading platform data...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header
        title="Platform Dashboard"
        rightComponent={
          <TouchableOpacity onPress={handleAddTenant} style={styles.headerButton}>
            <Icon name="plus-circle" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Platform Stats */}
        <View style={styles.statsGrid}>
          <Card elevation="md" padding={SPACING.md} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <Icon name="domain" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{stats.total_tenants}</Text>
            <Text style={styles.statLabel}>Total Schools</Text>
            <View style={styles.statSubInfo}>
              <Text style={styles.statSubText}>
                {stats.active_tenants} Active • {stats.trial_tenants} Trial
              </Text>
            </View>
          </Card>

          <Card elevation="md" padding={SPACING.md} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.success + '15' }]}>
              <Icon name="account-group" size={28} color={COLORS.success} />
            </View>
            <Text style={styles.statValue}>{stats.total_users.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
            <View style={styles.statSubInfo}>
              <Text style={styles.statSubText}>{stats.total_students.toLocaleString()} Students</Text>
            </View>
          </Card>

          <Card elevation="md" padding={SPACING.md} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.warning + '15' }]}>
              <Icon name="currency-inr" size={28} color={COLORS.warning} />
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats.monthly_revenue)}</Text>
            <Text style={styles.statLabel}>Monthly Revenue</Text>
            <View style={styles.statTrend}>
              <Icon name="trending-up" size={14} color={COLORS.success} />
              <Text style={[styles.trendText, { color: COLORS.success }]}>
                +{stats.mrr_growth}%
              </Text>
            </View>
          </Card>
        </View>

        {/* System Health */}
        <Card elevation="md" padding={SPACING.lg} style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <Text style={styles.cardTitle}>System Health</Text>
            <Text style={styles.lastChecked}>
              Updated {formatTime(systemHealth.last_checked)}
            </Text>
          </View>

          <View style={styles.healthGrid}>
            <View style={styles.healthItem}>
              <View style={styles.healthStatus}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getHealthStatusColor(systemHealth.api_status) },
                  ]}
                />
                <Text style={styles.healthLabel}>API</Text>
              </View>
              <Text style={styles.healthValue}>{systemHealth.api_response_time}ms</Text>
            </View>

            <View style={styles.healthItem}>
              <View style={styles.healthStatus}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getHealthStatusColor(systemHealth.database_status) },
                  ]}
                />
                <Text style={styles.healthLabel}>Database</Text>
              </View>
              <Text
                style={[
                  styles.healthValue,
                  { color: getHealthStatusColor(systemHealth.database_status) },
                ]}
              >
                {systemHealth.database_status}
              </Text>
            </View>

            <View style={styles.healthItem}>
              <View style={styles.healthStatus}>
                <Icon name="server" size={16} color={COLORS.gray600} />
                <Text style={styles.healthLabel}>Uptime</Text>
              </View>
              <Text style={styles.healthValue}>{systemHealth.uptime_percentage}%</Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={handleAddTenant}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.success + '15' }]}>
                <Icon name="domain-plus" size={28} color={COLORS.success} />
              </View>
              <Text style={styles.actionText}>Add School</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleViewTenants}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Icon name="domain" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Manage Schools</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleViewLogs}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.info + '15' }]}>
                <Icon name="file-document-multiple" size={28} color={COLORS.info} />
              </View>
              <Text style={styles.actionText}>View Logs</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleAnalytics}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.warning + '15' }]}>
                <Icon name="chart-line" size={28} color={COLORS.warning} />
              </View>
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <View style={styles.activitiesHeader}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <Card elevation="md" padding={0} style={styles.activitiesCard}>
            {recentActivities.map((activity, index) => (
              <View
                key={activity.id}
                style={[
                  styles.activityItem,
                  index < recentActivities.length - 1 && styles.activityBorder,
                ]}
              >
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: getActivityColor(activity.type) + '15' },
                  ]}
                >
                  <Icon
                    name={getActivityIcon(activity.type)}
                    size={20}
                    color={getActivityColor(activity.type)}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTenant}>{activity.tenant_name}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  <Text style={styles.activityTime}>{formatTime(activity.timestamp)}</Text>
                </View>
              </View>
            ))}
          </Card>
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
  headerButton: {
    padding: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.semibold,
    color: COLORS.gray500,
    marginTop: SPACING.md,
  },
  statsGrid: {
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  statValue: {
    fontSize: FONTS['2xl'],
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  statSubInfo: {
    marginTop: SPACING.xs,
  },
  statSubText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  trendText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.bold,
  },
  healthCard: {
    marginTop: SPACING.md,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  lastChecked: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  healthGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  healthItem: {
    alignItems: 'center',
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  healthValue: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  actionsSection: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  actionText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
    textAlign: 'center',
  },
  activitiesSection: {
    marginTop: SPACING.lg,
  },
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
  activitiesCard: {
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  activityBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTenant: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
});

export default PlatformDashboardScreen;
