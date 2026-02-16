import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import ExceptionsWidget from '@/components/Dashboard/ExceptionsWidget';
import { studentService, attendanceService, feeService, examService, staffService } from '@/services/api';

const AnimatedView = Animated.createAnimatedComponent(View);
cssInterop(AnimatedView, { className: "style" });
cssInterop(Card, { className: "style" });
cssInterop(Icon, { className: "style" });

interface DashboardStats {
  total_students: number;
  total_teachers: number;
  attendance_today: number;
  pending_fees: number;
  upcoming_exams: number;
}

const AdminDashboard: React.FC = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<DashboardStats>({
    total_students: 0,
    total_teachers: 0,
    attendance_today: 0,
    pending_fees: 0,
    upcoming_exams: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const navigateToTab = (
    tabName: string,
    screenName?: string
  ) => {
    const parent = (navigation as any).getParent?.();
    if (parent?.navigate) {
      parent.navigate(tabName, screenName ? { screen: screenName } : undefined);
      return;
    }
    (navigation as any).navigate(tabName, screenName ? { screen: screenName } : undefined);
  };

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch each resource individually to handle errors gracefully
      let studentsCount = 0;
      let teachersCount = 0;
      let attendanceCount = 0;
      let feesCount = 0;
      let examsCount = 0;

      try {
        const studentsRes = await studentService.getStudents({ page_size: 1 });
        studentsCount = studentsRes.count || 0;
      } catch (e: any) { console.warn('Students fetch error:', e.message); }

      try {
        const teachersRes = await staffService.getStaffMembers({ page_size: 1, designation: 'TEACHER' });
        teachersCount = teachersRes.count || 0;
      } catch (e: any) { console.warn('Teachers fetch error:', e.message); }

      try {
        const attendanceRes = await attendanceService.getStudentAttendance({ date: today, status: 'PRESENT', page_size: 1 });
        attendanceCount = attendanceRes.count || 0;
      } catch (e: any) { console.warn('Attendance fetch error:', e.message); }

      try {
        const feesRes = await feeService.getStudentFees({ status: 'PENDING', page_size: 1 });
        feesCount = feesRes.count || 0;
      } catch (e: any) { console.warn('Fees fetch error:', e.message); }

      try {
        const examsRes = await examService.getExams({ date_from: today, page_size: 1 });
        examsCount = examsRes.count || 0;
      } catch (e: any) { console.warn('Exams fetch error:', e.message); }

      setStats({
        total_students: studentsCount,
        total_teachers: teachersCount,
        attendance_today: attendanceCount,
        pending_fees: feesCount,
        upcoming_exams: examsCount,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  const StatCard: React.FC<{
    icon: string;
    title: string;
    value: number;
    color: string;
    onPress?: () => void;
    delay?: number;
  }> = ({ icon, title, value, color, onPress, delay = 0 }) => (
    <AnimatedView
      entering={FadeInUp.delay(delay).duration(500)}
      className="w-[48%] mb-4"
    >
      <Card
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
        elevation="sm"
        onPress={onPress}
        padding={16}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mb-3"
          style={{ backgroundColor: color + '15' }}
        >
          <Icon name={icon} size={22} color={color} />
        </View>
        <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</Text>
        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{title}</Text>
      </Card>
    </AnimatedView>
  );

  const QuickActionButton: React.FC<{
    icon: string;
    title: string;
    color: string;
    onPress?: () => void;
    delay?: number;
  }> = ({ icon, title, color, onPress, delay = 0 }) => (
    <AnimatedView
      entering={FadeInDown.delay(delay).duration(500)}
      className="w-[48%] mb-4"
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="bg-white dark:bg-slate-900 rounded-2xl p-4 items-center border border-slate-100 dark:border-slate-800 shadow-sm"
      >
        <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: color + '15' }}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300">{title}</Text>
      </TouchableOpacity>
    </AnimatedView>
  );

  return (
    <ScreenWrapper>
      <Header title="Admin Dashboard" subtitle="School Command Center" />
      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <AnimatedView entering={FadeInUp.duration(600)} className="mb-6">
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">Active Overview</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time school metrics</Text>
        </AnimatedView>

        <ExceptionsWidget />

        <View className="flex-row flex-wrap justify-between mt-6">
          <StatCard
            icon="account-group"
            title="Students"
            value={stats.total_students}
            color={COLORS.primary}
            delay={100}
            onPress={() => (navigation as any).navigate('StudentManagement')}
          />
          <StatCard
            icon="account-tie"
            title="Teachers"
            value={stats.total_teachers}
            color={COLORS.secondary}
            delay={200}
            onPress={() => (navigation as any).navigate('StaffManagement')}
          />
          <StatCard
            icon="calendar-check"
            title="Present Today"
            value={stats.attendance_today}
            color={COLORS.success}
            delay={300}
            onPress={() => navigateToTab('AcademicsTab', 'AttendanceOverview')}
          />
          <StatCard
            icon="currency-rupee"
            title="Pending Fees"
            value={stats.pending_fees}
            color={COLORS.warning}
            delay={400}
            onPress={() => navigateToTab('FinanceTab', 'FeeOverview')}
          />
        </View>

        <View className="mt-8">
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 px-1">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            <QuickActionButton
              icon="account-plus"
              title="Add Student"
              color={COLORS.primary}
              delay={500}
              onPress={() => (navigation as any).navigate('StudentManagement')}
            />
            <QuickActionButton
              icon="calendar-check"
              title="Attendance"
              color={COLORS.success}
              delay={600}
              onPress={() => navigateToTab('AcademicsTab', 'AttendanceOverview')}
            />
            <QuickActionButton
              icon="clipboard-plus"
              title="Create Exam"
              color={COLORS.info}
              delay={700}
              onPress={() => navigateToTab('AcademicsTab', 'ExamList')}
            />
            <QuickActionButton
              icon="bell-plus"
              title="Post Notice"
              color={COLORS.warning}
              delay={800}
              onPress={() => navigateToTab('ServicesTab', 'CreateNotice')}
            />
          </View>
        </View>
      </ScrollView >
    </ScreenWrapper >
  );
};

export default AdminDashboard;
