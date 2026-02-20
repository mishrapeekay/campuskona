import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp, FadeInRight, FadeInDown, Layout } from 'react-native-reanimated';

import { useAppSelector } from '@/store/hooks';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card, Badge } from '@/components/ui';
import { COLORS } from '@/constants';

interface FinancialStats {
  daily_collection: number;
  pending_payments: number;
  total_outstanding: number;
  payments_today: number;
  monthly_target: number;
  monthly_collected: number;
}

const AccountantDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<FinancialStats>({
    daily_collection: 0,
    pending_payments: 0,
    total_outstanding: 0,
    payments_today: 0,
    monthly_target: 1, // Avoid division by zero
    monthly_collected: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string>(user?.first_name || 'Accountant');

  const loadDashboardData = async () => {
    try {
      // Use fee service to get actual counts
      const { feeService } = require('@/services/api');
      const feesRes = await feeService.getStudentFees({ status: 'PENDING', page_size: 1 });

      setStats(prev => ({
        ...prev,
        pending_payments: feesRes.count || 0,
      }));
    } catch (error) {
      console.error('Error loading accountant dashboard:', error);
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

  const getCollectionPercentage = (): number => {
    return Math.round((stats.monthly_collected / stats.monthly_target) * 100);
  };

  return (
    <ScreenWrapper>
      <Header title="Finance" subtitle="Fee & Payroll Management" />

      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome Section */}
        <Animated.View entering={FadeInUp.duration(600)} className="mb-6">
          <Text className="text-3xl font-black text-slate-900 dark:text-slate-100">Welcome, {userName}</Text>
          <Text className="text-slate-500 font-medium text-sm mt-1">Today's collection: ₹{(stats.daily_collection / 1000).toFixed(1)}k</Text>
        </Animated.View>

        {/* Collection Target Card */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mb-8">
          <Card className="bg-emerald-600 p-6 rounded-3xl shadow-xl shadow-emerald-200 dark:shadow-none overflow-hidden">
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center mr-3">
                  <Icon name="bank-transfer" size={24} color="white" />
                </View>
                <Text className="text-white font-black text-lg">Monthly Revenue</Text>
              </View>
              <Badge label={`${getCollectionPercentage()}%`} variant="success" className="bg-white/20" />
            </View>

            <View className="flex-row justify-between mb-4">
              <View>
                <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest">Collected</Text>
                <Text className="text-white text-2xl font-black">₹{(stats.monthly_collected / 100000).toFixed(2)}L</Text>
              </View>
              <View className="items-end">
                <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest">Target</Text>
                <Text className="text-white text-2xl font-black">₹{(stats.monthly_target / 100000).toFixed(2)}L</Text>
              </View>
            </View>

            <View className="h-3 bg-white/10 rounded-full overflow-hidden mb-2">
              <View className="h-full bg-white rounded-full" style={{ width: `${getCollectionPercentage()}%` }} />
            </View>
            <Text className="text-white/80 text-[10px] font-bold text-center uppercase tracking-widest">
              ₹{((stats.monthly_target - stats.monthly_collected) / 100000).toFixed(2)}L Remaining for target
            </Text>
          </Card>
        </Animated.View>

        {/* Finance Stats Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          <StatBox icon="cash-multiple" label="Today's Cash" value={`₹${(stats.daily_collection / 1000).toFixed(1)}k`} color="bg-emerald-500" delay={300} />
          <StatBox icon="receipt" label="Invoices Today" value={stats.payments_today} color="bg-blue-500" delay={400} />
          <StatBox icon="alert-octagon" label="Outstanding" value={`₹${(stats.total_outstanding / 100000).toFixed(1)}L`} color="bg-rose-500" delay={500} />
          <StatBox icon="clock-fast" label="Pending Sync" value={stats.pending_payments} color="bg-amber-500" delay={600} />
        </View>

        {/* Financial Actions */}
        <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Financial Controls</Text>
        <Card className="bg-white dark:bg-slate-900 mb-8 overflow-hidden border border-slate-100 dark:border-slate-800">
          <ActionTile icon="cash-register" title="New Fee Payment" color="text-emerald-600" />
          <ActionTile icon="account-alert" title="Defaulters List" color="text-rose-500" />
          <ActionTile icon="file-document-outline" title="Payroll Summary" color="text-indigo-600" />
          <ActionTile icon="file-chart" title="Reconciliation" color="text-amber-500" isLast />
        </Card>

        {/* Recent Ledger Entries */}
        <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Recent Ledger</Text>
        <Card className="bg-white dark:bg-slate-900 p-8 border border-slate-100 dark:border-slate-800 items-center justify-center">
          <Icon name="receipt" size={48} color={COLORS.gray200} />
          <Text className="text-slate-400 font-bold mt-4 uppercase tracking-[2px] text-xs">No transactions recorded today</Text>
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
    <Text className="text-2xl font-black text-slate-900 dark:text-slate-100">{value}</Text>
    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</Text>
  </Animated.View>
);

const ActionTile = ({ icon, title, color, isLast }: any) => (
  <TouchableOpacity className={`flex-row items-center p-4 ${!isLast ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
    <View className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800/50 items-center justify-center mr-4">
      <Icon name={icon} size={20} className={color} />
    </View>
    <Text className="flex-1 text-base font-bold text-slate-700 dark:text-slate-200">{title}</Text>
    <Icon name="chevron-right" size={20} className="text-slate-300" />
  </TouchableOpacity>
);

const LedgerRow = ({ name, details, amount, time, color, isLast }: any) => (
  <View className={`flex-row items-center p-4 ${!isLast ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
    <View className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/50 items-center justify-center mr-3">
      <Text className="text-slate-400 font-bold">{name.charAt(0)}</Text>
    </View>
    <View className="flex-1">
      <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">{name}</Text>
      <Text className="text-[10px] text-slate-500">{details}</Text>
    </View>
    <View className="items-end">
      <Text className={`text-sm font-black ${color}`}>{amount}</Text>
      <Text className="text-[10px] text-slate-300 uppercase">{time}</Text>
    </View>
  </View>
);

export default AccountantDashboard;
