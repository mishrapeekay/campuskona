import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { useAppSelector } from '@/store/hooks';
import { MainTabParamList, TenantsStackParamList } from '@/types/navigation';
import { tenantService } from '@/services/api';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card } from '@/components/ui';

// SuperAdminDashboard lives in HomeStack, but Super Admin Quick Actions navigate
// to screens in TenantsStack (via TenantsTab). We use a composite type so the
// navigator can hop tabs.
type DashboardNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<TenantsStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

interface PlatformStats {
  total_tenants: number;
  active_tenants: number;
  total_users: number;
  total_students: number;
  monthly_revenue: number;
  system_health: 'healthy' | 'warning' | 'critical';
}

const SuperAdminDashboard: React.FC = () => {
  const navigation = useNavigation<DashboardNavProp>();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<PlatformStats>({
    total_tenants: 0,
    active_tenants: 0,
    total_users: 0,
    total_students: 0,
    monthly_revenue: 0,
    system_health: 'healthy',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string>('Super Admin');

  const loadDashboardData = async () => {
    try {
      if (!isAuthenticated) return;
      if (user?.first_name) setUserName(user.first_name);

      const apiStats = await tenantService.getDashboardStats();

      setStats({
        total_tenants:   apiStats.total_schools    ?? 12,
        active_tenants:  apiStats.active_schools   ?? 10,
        total_users:     apiStats.total_users      ?? 4500,
        total_students:  apiStats.total_students   ?? 3200,
        monthly_revenue: apiStats.monthly_revenue  ?? 1250000,
        system_health:   (apiStats.system_health?.toLowerCase() as any) ?? 'healthy',
      });

    } catch (error) {
      console.error('Error loading super admin dashboard:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Helper: navigate to a screen inside TenantsTab
  const goToTenants = (screen: keyof TenantsStackParamList, params?: any) => {
    navigation.navigate('TenantsTab', { screen, params });
  };

  return (
    <ScreenWrapper>
      <Header title="Super Admin" subtitle="Platform Control Center" />

      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Platform Overview */}
        <Animated.View entering={FadeInUp.duration(600)} className="mb-6">
          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-3xl font-black text-slate-900 dark:text-slate-100">Welcome, {userName}</Text>
              <Text className="text-slate-500 font-medium text-sm mt-1">Platform-wide statistics and management</Text>
            </View>
            <TouchableOpacity
              onPress={() => goToTenants('PlatformSettings')}
              className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <Icon name="cog-outline" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Health & Revenue Banner */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mb-8">
          <Card className="bg-slate-900 dark:bg-slate-900 p-6 rounded-3xl overflow-hidden shadow-xl shadow-slate-200 dark:shadow-none">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">System Health</Text>
                <View className="flex-row items-center">
                  <View className={`w-3 h-3 rounded-full mr-2 ${stats.system_health === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'} shadow shadow-emerald-500/50`} />
                  <Text className="text-white font-bold text-lg">{stats.system_health.toUpperCase()}</Text>
                </View>
              </View>
              <View className="bg-white/10 px-4 py-2 rounded-2xl">
                <Text className="text-white font-black text-sm italic">SaaS Node-01</Text>
              </View>
            </View>

            <View className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <Text className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Monthly Platform Revenue</Text>
              <View className="flex-row items-baseline">
                <Text className="text-white text-3xl font-black">₹{(stats.monthly_revenue / 100000).toFixed(2)}</Text>
                <Text className="text-white/50 text-sm font-bold ml-1">Lakhs</Text>
                <View className="flex-row items-center ml-auto bg-emerald-500/20 px-2 py-1 rounded-lg">
                  <Icon name="trending-up" size={12} color="#10b981" />
                  <Text className="text-emerald-500 text-[10px] font-black ml-1">12.5%</Text>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Core Metrics Grid */}
        <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Core Metrics</Text>
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          <StatBox icon="domain"         label="Total Schools"  value={stats.total_tenants}   color="bg-indigo-500"  delay={300} />
          <StatBox icon="office-building" label="Active Nodes"   value={stats.active_tenants}  color="bg-emerald-500" delay={400} />
          <StatBox icon="account-group"  label="Total Users"    value={stats.total_users}      color="bg-blue-500"    delay={500} />
          <StatBox icon="school"         label="Students"       value={stats.total_students}   color="bg-purple-500"  delay={600} />
        </View>

        {/* Platform Controls */}
        <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Platform Control</Text>
        <Card className="bg-white dark:bg-slate-900 mb-8 overflow-hidden border border-slate-100 dark:border-slate-800">
          <ActionTile icon="plus-circle"          title="Provision New School"  color="#10b981" onPress={() => goToTenants('TenantSetupWizard')} />
          <ActionTile icon="office-building-cog"  title="Manage Tenancies"     color="#6366f1" onPress={() => goToTenants('TenantManagement')} />
          <ActionTile icon="chart-line"           title="Platform Analytics"   color="#f59e0b" onPress={() => goToTenants('PlatformAnalytics')} />
          <ActionTile icon="file-document-outline" title="System Audit Logs"   color="#64748b" onPress={() => goToTenants('AuditLogs')} />
          <ActionTile icon="server-network"       title="Platform Dashboard"   color="#3b82f6" onPress={() => goToTenants('PlatformDashboard')} />
          <ActionTile icon="cog"                  title="Platform Settings"    color="#8b5cf6" onPress={() => goToTenants('PlatformSettings')} isLast />
        </Card>

        {/* Global Activity Feed */}
        <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Global Activity</Text>
        <Card className="bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800">
          <ActivityRow icon="domain-plus"          title="New Tenant Onboarded"   subtitle="The Himalayan International School" time="2h ago"  color="#10b981" />
          <ActivityRow icon="account-multiple-plus" title="Mass User Import"       subtitle="St. Xavier's Academy (150 users)"  time="5h ago"  color="#3b82f6" />
          <ActivityRow icon="shield-alert"          title="Security Patch Applied" subtitle="Production Hotfix 2.4.1"           time="8h ago"  color="#ef4444" />
          <ActivityRow icon="cash-check"            title="Revenue Settlement"     subtitle="Node-04 Monthly Payout Complete"   time="1d ago"  color="#f59e0b" isLast />
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
};

const StatBox = ({ icon, label, value, color, delay }: any) => (
  <Animated.View
    entering={FadeInRight.delay(delay).springify()}
    className="w-[47%] bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none"
  >
    <View className={`w-10 h-10 rounded-2xl ${color} items-center justify-center mb-3 opacity-90`}>
      <Icon name={icon} size={20} color="white" />
    </View>
    <Text className="text-2xl font-black text-slate-900 dark:text-slate-100">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </Text>
    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</Text>
  </Animated.View>
);

const ActionTile = ({ icon, title, color, onPress, isLast }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center p-4 ${!isLast ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}
  >
    <View className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800/50 items-center justify-center mr-4">
      <Icon name={icon} size={20} color={color} />
    </View>
    <Text className="flex-1 text-base font-bold text-slate-700 dark:text-slate-200">{title}</Text>
    <Icon name="chevron-right" size={20} color="#cbd5e1" />
  </TouchableOpacity>
);

const ActivityRow = ({ icon, title, subtitle, time, color, isLast }: any) => (
  <View className={`flex-row p-4 ${!isLast ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
    <View className="mr-4 items-center">
      <View className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 items-center justify-center mb-1">
        <Icon name={icon} size={24} color={color} />
      </View>
      {!isLast && <View className="w-[1px] flex-1 bg-slate-100 dark:bg-slate-800" />}
    </View>
    <View className="flex-1 pt-1">
      <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</Text>
      <Text className="text-xs text-slate-500 mt-0.5">{subtitle}</Text>
      <Text className="text-[10px] text-slate-300 font-bold mt-2 uppercase">{time}</Text>
    </View>
  </View>
);

export default SuperAdminDashboard;
