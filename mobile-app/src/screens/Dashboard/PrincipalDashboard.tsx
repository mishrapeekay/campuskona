import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp, FadeInRight, FadeInDown } from 'react-native-reanimated';

import { academicService, studentService } from '@/services/api';
import { useAppSelector } from '@/store/hooks';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card, Badge, StatCard } from '@/components/ui';
import { COLORS } from '@/constants/theme';

interface SchoolStats {
  total_students: number;
  total_staff: number;
  total_classes: number;
  pending_approvals: number;
  academic_year: string;
  board: string;
  grading_system: string;
}

const PrincipalDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<SchoolStats>({
    total_students: 0,
    total_staff: 0,
    total_classes: 0,
    pending_approvals: 0,
    academic_year: '...',
    board: '...',
    grading_system: '...',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string>(user?.first_name || 'Principal');

  const loadDashboardData = async () => {
    try {
      const { staffService, admissionsService } = require('@/services/api');

      const [studentsRes, classesRes, staffRes, admissionsRes] = await Promise.all([
        studentService.getStudents({ page_size: 1 }),
        academicService.getClasses({ page_size: 1 }),
        staffService.getStaffMembers({ page_size: 1 }),
        admissionsService.getApplications({ status: 'PENDING', page_size: 1 }),
      ]);

      setStats({
        total_students: studentsRes.count || 0,
        total_staff: staffRes.count || 0,
        total_classes: classesRes.count || 0,
        pending_approvals: admissionsRes.count || 0,
        academic_year: '2024-25', // Should come from a settings API eventually
        board: 'N/A',
        grading_system: 'N/A',
      });

    } catch (error) {
      console.error('Error loading principal dashboard:', error);
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
      <Header title="Principal" subtitle={`School Management Portal`} />

      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <Animated.View entering={FadeInUp.duration(600)} className="mb-6">
          <Text className="text-3xl font-black text-slate-900 dark:text-slate-100">Welcome, {userName}</Text>
          <Text className="text-slate-500 font-medium text-sm mt-1">Managing {stats.total_students} students and {stats.total_staff} faculty members</Text>
        </Animated.View>

        {/* Academic Config Banner */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          <Card
            className="bg-indigo-600 mb-8 rounded-[32px] overflow-hidden"
            elevation="lg"
            padding={20}
          >
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center mr-4">
                  <Icon name="school" size={28} color="white" />
                </View>
                <View>
                  <Text className="text-white font-black text-xl">Academic Hub</Text>
                  <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Configuration Active</Text>
                </View>
              </View>
              <Badge label="Active" variant="success" className="bg-white/20 border-0" />
            </View>

            <View className="flex-row justify-between bg-black/10 p-4 rounded-2xl">
              <ConfigItem icon="calendar" label="Year" value={stats.academic_year} />
              <ConfigItem icon="certificate" label="Board" value={stats.board} />
              <ConfigItem icon="chart-bar" label="System" value={stats.grading_system} />
            </View>

            <TouchableOpacity className="mt-6 flex-row items-center justify-center bg-white/20 py-4 rounded-2xl active:bg-white/30">
              <Text className="text-white font-bold mr-2 text-sm">Open Settings</Text>
              <Icon name="arrow-right" size={16} color="white" />
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          <StatCard icon="account-group" label="Students" value={stats.total_students} color={COLORS.primary} className="w-[48%]" />
          <StatCard icon="account-tie" label="Faculty" value={stats.total_staff} color={COLORS.secondary} className="w-[48%]" />
          <StatCard icon="google-classroom" label="Classes" value={stats.total_classes} color={COLORS.success} className="w-[48%]" />
          <StatCard icon="clipboard-alert" label="Pending" value={stats.pending_approvals} color={COLORS.error} className="w-[48%]" />
        </View>

        {/* Pending Actions Alert */}
        {stats.pending_approvals > 0 && (
          <Animated.View entering={FadeInDown.delay(700)}>
            <TouchableOpacity className="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-[28px] border border-amber-100 dark:border-amber-900/30 flex-row items-center mb-8">
              <View className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 items-center justify-center mr-4">
                <Icon name="bell-ring" size={24} color={COLORS.warningDark} />
              </View>
              <View className="flex-1">
                <Text className="text-amber-900 dark:text-amber-200 font-black">12 Items Pending</Text>
                <Text className="text-amber-700 dark:text-amber-400/70 text-xs font-medium">Admissions and leaves need review</Text>
              </View>
              <View className="bg-amber-600 px-4 py-2 rounded-xl">
                <Text className="text-white text-[10px] font-black uppercase">Review</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Text className="text-lg font-black text-slate-900 dark:text-slate-100 mb-4 px-1 uppercase tracking-widest text-[10px] text-slate-400">Main Modules</Text>
        <Card className="bg-white dark:bg-slate-900 mb-8 p-0 overflow-hidden border border-slate-100 dark:border-slate-800">
          <ActionTile icon="account-check" title="Admissions Hub" color="text-indigo-600" />
          <ActionTile icon="google-classroom" title="Manage Schedule" color="text-emerald-600" />
          <ActionTile icon="file-chart" title="Performance Analytics" color="text-amber-500" />
          <ActionTile icon="account-multiple" title="Staff Directory" color="text-blue-500" isLast />
        </Card>

        {/* Recent Activity */}
        <Text className="text-lg font-black text-slate-900 dark:text-slate-100 mb-4 px-1 uppercase tracking-widest text-[10px] text-slate-400">Recent Activity</Text>
        <Card className="bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800 mb-8">
          <View className="items-center py-6">
            <Icon name="timer-sand" size={32} color={COLORS.gray300} />
            <Text className="text-slate-400 text-xs font-bold mt-2 uppercase">No new activity today</Text>
          </View>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
};

const ConfigItem = ({ icon, label, value }: any) => (
  <View className="items-center px-2">
    <Icon name={icon} size={18} color="rgba(255,255,255,0.6)" className="mb-2" />
    <Text className="text-[8px] font-black text-white/50 uppercase tracking-[2px] mb-1">{label}</Text>
    <Text className="text-white font-black text-xs">{value}</Text>
  </View>
);

const ActionTile = ({ icon, title, color, isLast }: any) => (
  <TouchableOpacity className={`flex-row items-center p-5 ${!isLast ? 'border-b border-slate-50 dark:border-slate-800/50' : ''}`}>
    <View className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 items-center justify-center mr-4">
      <Icon name={icon} size={24} className={color} />
    </View>
    <Text className="flex-1 text-base font-bold text-slate-700 dark:text-slate-200">{title}</Text>
    <Icon name="chevron-right" size={20} className="text-slate-300 dark:text-slate-600" />
  </TouchableOpacity>
);

const UpdateRow = ({ icon, title, subtitle, time, color, isLast }: any) => (
  <View className={`flex-row p-5 ${!isLast ? 'border-b border-slate-50 dark:border-slate-800/50' : ''}`}>
    <View className="mr-4 items-center">
      <View className={`w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/50 items-center justify-center mb-2`}>
        <Icon name={icon} size={20} className={color} />
      </View>
      {!isLast && <View className="w-[1.5px] flex-1 bg-slate-100 dark:bg-slate-800" />}
    </View>
    <View className="flex-1">
      <View className="flex-row justify-between items-start">
        <Text className="text-sm font-black text-slate-900 dark:text-slate-100">{title}</Text>
        <Text className="text-[9px] text-slate-400 font-bold uppercase">{time}</Text>
      </View>
      <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{subtitle}</Text>
    </View>
  </View>
);

export default PrincipalDashboard;
