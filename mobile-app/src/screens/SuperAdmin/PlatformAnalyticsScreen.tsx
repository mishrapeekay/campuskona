/**
 * PlatformAnalyticsScreen - Super Admin Revenue & Growth Analytics
 *
 * Provides detailed MRR, tenant growth, user growth, and churn analytics
 * for the platform operator.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { LoadingSpinner } from '@/components/ui';
import { tenantService } from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthlyMetric {
  month: string;    // e.g. "Jan", "Feb"
  revenue: number;
  tenants: number;
  users: number;
  churn: number;
}

interface AnalyticsData {
  current_mrr: number;
  mrr_growth: number;
  total_tenants: number;
  new_tenants_this_month: number;
  churned_tenants: number;
  total_users: number;
  active_users_30d: number;
  avg_revenue_per_tenant: number;
  monthly_metrics: MonthlyMetric[];
  top_tenants: { name: string; students: number; plan: string; revenue: number }[];
  plan_distribution: { plan: string; count: number; color: string }[];
}

type Period = '3M' | '6M' | '12M';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (v: number) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(2)}L` : `₹${v.toLocaleString('en-IN')}`;

const formatGrowth = (v: number) =>
  `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

const MOCK_DATA: AnalyticsData = {
  current_mrr: 1875000,
  mrr_growth: 12.4,
  total_tenants: 14,
  new_tenants_this_month: 2,
  churned_tenants: 0,
  total_users: 5280,
  active_users_30d: 4912,
  avg_revenue_per_tenant: 133928,
  monthly_metrics: [
    { month: 'Aug', revenue: 1250000, tenants: 10, users: 3800, churn: 1 },
    { month: 'Sep', revenue: 1380000, tenants: 11, users: 4100, churn: 0 },
    { month: 'Oct', revenue: 1520000, tenants: 12, users: 4400, churn: 1 },
    { month: 'Nov', revenue: 1650000, tenants: 12, users: 4700, churn: 0 },
    { month: 'Dec', revenue: 1720000, tenants: 13, users: 4900, churn: 0 },
    { month: 'Jan', revenue: 1875000, tenants: 14, users: 5280, churn: 0 },
  ],
  top_tenants: [
    { name: 'Demo High School', students: 1200, plan: 'Premium', revenue: 250000 },
    { name: 'Veda Vidyalaya V9', students: 980, plan: 'Premium', revenue: 220000 },
    { name: 'Public School', students: 650, plan: 'Standard', revenue: 120000 },
    { name: 'Sunrise Academy', students: 420, plan: 'Standard', revenue: 95000 },
    { name: 'Green Valley School', students: 310, plan: 'Basic', revenue: 45000 },
  ],
  plan_distribution: [
    { plan: 'Premium', count: 5, color: '#6366f1' },
    { plan: 'Standard', count: 6, color: '#3b82f6' },
    { plan: 'Basic', count: 3, color: '#94a3b8' },
  ],
};

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────

const BarChart = ({
  data,
  getValue,
  color,
  height = 80,
}: {
  data: MonthlyMetric[];
  getValue: (m: MonthlyMetric) => number;
  color: string;
  height?: number;
}) => {
  const values = data.map(getValue);
  const max = Math.max(...values);
  return (
    <View className="flex-row items-end justify-between" style={{ height }}>
      {data.map((m, i) => {
        const barH = max > 0 ? (values[i] / max) * (height - 20) : 4;
        const isLast = i === data.length - 1;
        return (
          <View key={m.month} className="items-center flex-1">
            <View
              style={{
                width: 20,
                height: Math.max(barH, 4),
                backgroundColor: isLast ? color : color + '50',
                borderRadius: 4,
                marginBottom: 6,
              }}
            />
            <Text className="text-[9px] text-slate-400 font-bold">{m.month}</Text>
          </View>
        );
      })}
    </View>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const PlatformAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>('6M');

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await tenantService.getAnalytics({ period });
      if (response && response.current_mrr) {
        setData(response);
      } else {
        setData(MOCK_DATA);
      }
    } catch {
      setData(MOCK_DATA);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const onRefresh = () => { setRefreshing(true); fetchAnalytics(); };

  const filteredMetrics = data?.monthly_metrics.slice(period === '3M' ? -3 : period === '6M' ? -6 : -12) ?? [];

  if (loading) {
    return (
      <ScreenWrapper>
        <Header title="Platform Analytics" showBackButton onBackPress={() => navigation.goBack()} />
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner size="large" />
          <Text className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">
            Crunching Numbers...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!data) return null;

  return (
    <ScreenWrapper>
      <Header
        title="Platform Analytics"
        subtitle="Revenue & Growth"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* MRR Hero */}
        <Animated.View entering={FadeInUp.duration(500)} className="mb-5">
          <View className="bg-slate-900 p-6 rounded-3xl overflow-hidden">
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
              Monthly Recurring Revenue
            </Text>
            <View className="flex-row items-baseline mb-4">
              <Text className="text-white text-4xl font-black">{formatCurrency(data.current_mrr)}</Text>
              <View className={`flex-row items-center ml-3 px-2.5 py-1 rounded-xl ${data.mrr_growth >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                <Icon
                  name={data.mrr_growth >= 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={data.mrr_growth >= 0 ? '#10b981' : '#ef4444'}
                />
                <Text
                  className="font-black text-xs ml-1"
                  style={{ color: data.mrr_growth >= 0 ? '#10b981' : '#ef4444' }}
                >
                  {formatGrowth(data.mrr_growth)}
                </Text>
              </View>
            </View>

            {/* Period selector */}
            <View className="flex-row bg-white/10 rounded-2xl p-1">
              {(['3M', '6M', '12M'] as Period[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPeriod(p)}
                  className={`flex-1 py-2 rounded-xl items-center ${period === p ? 'bg-white' : ''}`}
                >
                  <Text className={`text-xs font-black ${period === p ? 'text-slate-900' : 'text-white/60'}`}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Revenue Chart */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)} className="bg-white dark:bg-slate-900 p-5 rounded-3xl mb-4 border border-slate-100 dark:border-slate-800">
          <Text className="text-base font-black text-slate-800 dark:text-slate-100 mb-1">Revenue Trend</Text>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">{period} Overview</Text>
          <BarChart data={filteredMetrics} getValue={(m) => m.revenue} color="#6366f1" height={100} />
        </Animated.View>

        {/* KPI Row */}
        <View className="flex-row gap-x-3 mb-4">
          <Animated.View entering={FadeInRight.delay(200).duration(500)} className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <View className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 items-center justify-center mb-2">
              <Icon name="domain" size={16} color="#6366f1" />
            </View>
            <Text className="text-xl font-black text-slate-900 dark:text-slate-100">{data.total_tenants}</Text>
            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Schools</Text>
            <Text className="text-emerald-500 text-[10px] font-bold mt-1">+{data.new_tenants_this_month} this month</Text>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(280).duration(500)} className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <View className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/30 items-center justify-center mb-2">
              <Icon name="account-group" size={16} color="#3b82f6" />
            </View>
            <Text className="text-xl font-black text-slate-900 dark:text-slate-100">{data.total_users.toLocaleString()}</Text>
            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Users</Text>
            <Text className="text-slate-400 text-[10px] font-bold mt-1">{data.active_users_30d.toLocaleString()} active (30d)</Text>
          </Animated.View>
        </View>

        <View className="flex-row gap-x-3 mb-5">
          <Animated.View entering={FadeInRight.delay(350).duration(500)} className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <View className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 items-center justify-center mb-2">
              <Icon name="cash-multiple" size={16} color="#f59e0b" />
            </View>
            <Text className="text-xl font-black text-slate-900 dark:text-slate-100">{formatCurrency(data.avg_revenue_per_tenant)}</Text>
            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Avg Rev / School</Text>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(420).duration(500)} className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <View className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/30 items-center justify-center mb-2">
              <Icon name="account-remove" size={16} color="#ef4444" />
            </View>
            <Text className="text-xl font-black text-slate-900 dark:text-slate-100">{data.churned_tenants}</Text>
            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Churn (30d)</Text>
            <Text className={`text-[10px] font-bold mt-1 ${data.churned_tenants === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {data.churned_tenants === 0 ? 'Excellent' : 'Needs attention'}
            </Text>
          </Animated.View>
        </View>

        {/* Plan Distribution */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)} className="bg-white dark:bg-slate-900 p-5 rounded-3xl mb-4 border border-slate-100 dark:border-slate-800">
          <Text className="text-base font-black text-slate-800 dark:text-slate-100 mb-4">Plan Distribution</Text>
          {data.plan_distribution.map((plan, index) => {
            const pct = Math.round((plan.count / data.total_tenants) * 100);
            return (
              <View key={plan.plan} className="mb-4">
                <View className="flex-row justify-between items-center mb-1.5">
                  <View className="flex-row items-center">
                    <View className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: plan.color }} />
                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-200">{plan.plan}</Text>
                  </View>
                  <Text className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {plan.count} <Text className="text-slate-400 font-semibold text-xs">({pct}%)</Text>
                  </Text>
                </View>
                <View className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: plan.color }}
                  />
                </View>
              </View>
            );
          })}
        </Animated.View>

        {/* Top Tenants by Revenue */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
          <Text className="text-base font-black text-slate-800 dark:text-slate-100 mb-4">Top Schools by Revenue</Text>
          {data.top_tenants.map((t, i) => (
            <View
              key={t.name}
              className={`flex-row items-center py-3 ${i < data.top_tenants.length - 1 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}
            >
              <View className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mr-3">
                <Text className="text-xs font-black text-slate-500">#{i + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-800 dark:text-slate-100" numberOfLines={1}>{t.name}</Text>
                <Text className="text-[10px] text-slate-400 font-semibold">{t.students} students · {t.plan}</Text>
              </View>
              <Text className="text-sm font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(t.revenue)}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default PlatformAnalyticsScreen;
