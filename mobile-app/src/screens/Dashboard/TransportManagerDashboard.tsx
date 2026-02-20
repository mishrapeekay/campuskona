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

interface TransportStats {
  active_routes: number;
  total_vehicles: number;
  vehicles_on_duty: number;
  students_using_transport: number;
  todays_trips: number;
  maintenance_due: number;
}

const TransportManagerDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<TransportStats>({
    active_routes: 0,
    total_vehicles: 0,
    vehicles_on_duty: 0,
    students_using_transport: 0,
    todays_trips: 0,
    maintenance_due: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string>(user?.first_name || 'Transport Manager');

  const loadDashboardData = async () => {
    try {
      const { transportService } = require('@/services/api');
      const routesRes = await transportService.getRoutes({ page_size: 1 });
      const vehiclesRes = await transportService.getVehicles({ page_size: 1 });

      setStats(prev => ({
        ...prev,
        active_routes: routesRes.count || 0,
        total_vehicles: vehiclesRes.count || 0,
      }));
    } catch (error) {
      console.error('Error loading transport dashboard:', error);
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

  return (
    <ScreenWrapper>
      <Header title="Transport" subtitle="Fleet & Logistics Control" />

      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Manager Header */}
        <Animated.View entering={FadeInUp.duration(600)} className="mb-6">
          <Text className="text-3xl font-black text-slate-900 dark:text-slate-100">Welcome, {userName}</Text>
          <Text className="text-slate-500 font-medium text-sm mt-1">{stats.vehicles_on_duty} of {stats.total_vehicles} vehicles currently trackable</Text>
        </Animated.View>

        {/* Live Operations Banner */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mb-8">
          <Card className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200 dark:shadow-none overflow-hidden">
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-2xl bg-white/10 items-center justify-center mr-4">
                  <Icon name="bus-clock" size={28} color="white" />
                </View>
                <View>
                  <Text className="text-white font-black text-lg">Live Operations</Text>
                  <Text className="text-white/50 text-[10px] font-black uppercase tracking-widest">Morning Shift</Text>
                </View>
              </View>
              <View className="bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                <Text className="text-emerald-500 text-[10px] font-black uppercase">Live</Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-1 items-center bg-white/5 py-4 rounded-2xl mr-2 border border-white/5">
                <Text className="text-white text-2xl font-black">{stats.vehicles_on_duty}</Text>
                <Text className="text-white/40 text-[8px] font-black uppercase mt-1 tracking-tighter">On Duty</Text>
              </View>
              <View className="flex-1 items-center bg-white/5 py-4 rounded-2xl mx-1 border border-white/5">
                <Text className="text-white text-2xl font-black">{stats.todays_trips}</Text>
                <Text className="text-white/40 text-[8px] font-black uppercase mt-1 tracking-tighter">Trips Done</Text>
              </View>
              <View className="flex-1 items-center bg-white/5 py-4 rounded-2xl ml-2 border border-white/5">
                <Text className="text-white text-2xl font-black">{stats.active_routes}</Text>
                <Text className="text-white/40 text-[8px] font-black uppercase mt-1 tracking-tighter">Active Routes</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Fleet Stats Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          <StatBox icon="map-marker-path" label="Routes" value={stats.active_routes} color="bg-indigo-500" delay={300} />
          <StatBox icon="bus-multiple" label="Vehicles" value={stats.total_vehicles} color="bg-blue-500" delay={400} />
          <StatBox icon="account-group" label="Students" value={stats.students_using_transport} color="bg-purple-500" delay={500} />
          <StatBox icon="wrench-clock" label="Maint. Due" value={stats.maintenance_due} color="bg-amber-500" delay={600} />
        </View>

        {/* Maintenance Alert Bar */}
        {stats.maintenance_due > 0 && (
          <Animated.View entering={FadeInDown.delay(700)}>
            <TouchableOpacity className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-3xl border border-amber-200 dark:border-amber-900/30 flex-row items-center mb-8">
              <View className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 items-center justify-center mr-4">
                <Icon name="wrench-outline" size={24} className="text-amber-600 dark:text-amber-400" />
              </View>
              <View className="flex-1">
                <Text className="text-amber-900 dark:text-amber-200 font-bold">{stats.maintenance_due} Vehicles Due Service</Text>
                <Text className="text-amber-700 dark:text-amber-400/70 text-xs">Schedule maintenance for preventive safety</Text>
              </View>
              <View className="bg-amber-600 px-3 py-1.5 rounded-xl">
                <Text className="text-white text-[10px] font-black uppercase">Service</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Fleet Actions */}
        <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Logistics Center</Text>
        <Card className="bg-white dark:bg-slate-900 mb-8 overflow-hidden border border-slate-100 dark:border-slate-800">
          <ActionTile icon="map-marker-radius" title="Real-time Tracking" color="text-emerald-600" />
          <ActionTile icon="routes" title="Optimize Routes" color="text-indigo-600" />
          <ActionTile icon="account-tie" title="Driver Roster" color="text-blue-500" />
          <ActionTile icon="clipboard-list" title="Maintenance Log" color="text-amber-500" isLast />
        </Card>

        {/* Recent Fleet Activity */}
        <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Fleet Activity</Text>
        <Card className="bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800">
          <ActivityRow icon="bus-check" title="Trip Complete" subtitle="Route 7 (Morning) • 32 Students" time="15m ago" color="text-emerald-500" />
          <ActivityRow icon="bus-alert" title="Route Delayed" subtitle="Route 3 (Traffic) • Driver: Rajesh" time="1h ago" color="text-rose-500" />
          <ActivityRow icon="wrench-check" title="Service Complete" subtitle="Vehicle DL-8C-1234 • Oil Change" time="Yesterday" color="text-blue-500" />
          <ActivityRow icon="account-group-outline" title="New Allocations" subtitle="15 Students assigned to Route 5" time="2d ago" color="text-indigo-500" isLast />
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

const ActivityRow = ({ icon, title, subtitle, time, color, isLast }: any) => (
  <View className={`flex-row items-center p-4 ${!isLast ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
    <View className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 items-center justify-center mr-4">
      <Icon name={icon} size={24} className={color} />
    </View>
    <View className="flex-1">
      <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</Text>
      <Text className="text-[10px] text-slate-500">{subtitle}</Text>
    </View>
    <Text className="text-[10px] text-slate-300 font-bold uppercase">{time}</Text>
  </View>
);

export default TransportManagerDashboard;
