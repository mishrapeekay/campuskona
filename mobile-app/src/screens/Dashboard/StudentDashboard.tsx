import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

import { useAppSelector } from '@/store/hooks';
import { COLORS, SPACING } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card, Button, StatCard, Badge } from '@/components/ui';
import {
  authService,
  todayViewService,
  bffService,
} from '@/services/api';
import { TodayViewResponse } from '@/types/todayView';
import { StudentDashboardData } from '@/services/api/bff.service';

const AnimatedView = Animated.createAnimatedComponent(View);
cssInterop(AnimatedView, { className: "style" });

const StudentDashboard: React.FC = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<TodayViewResponse | null>(null);
  const [bffData, setBffData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string>('Student');

  const loadDashboardData = async (force: boolean = false) => {
    try {
      if (!isAuthenticated) return;
      const user = await authService.getStoredUser();
      if (!user) return;

      setUserName(user.first_name);

      // BFF aggregated data (fast path — shows upcoming exams & homework due)
      bffService.getStudentDashboard()
        .then((d) => setBffData(d))
        .catch((e) => console.warn('[StudentDashboard] BFF unavailable:', e));

      // Full today-view (attendance status, richer detail)
      const response = await todayViewService.getStudentToday(undefined, force);
      setData(response);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData(true);
    setRefreshing(false);
  };

  const HighlightCard: React.FC = () => {
    const attendance = data?.attendance;
    const percentage = attendance?.summary.percentage || 0;
    const status = attendance?.status;
    const isPresent = status === 'PRESENT';
    const isMarked = attendance?.marked;

    return (
      <AnimatedView
        entering={FadeInUp.delay(100).duration(600)}
        className="mb-6 px-4"
      >
        <Card
          elevation="lg"
          padding={0}
          className="bg-primary dark:bg-indigo-600 overflow-hidden rounded-[32px]"
        >
          <View className="flex-row items-center p-6">
            <View className="flex-1">
              <Text className="text-white/60 text-[10px] font-black uppercase tracking-[2px]">Term Attendance</Text>
              <View className="flex-row items-center mt-2">
                <Text className="text-white text-4xl font-black mr-3">{percentage}%</Text>
                <Icon name={percentage >= 75 ? "trending-up" : "trending-down"} size={28} color="white" />
              </View>
              <View className="mt-5 flex-row">
                <View
                  className={`px-3 py-1.5 rounded-xl ${isMarked
                    ? (isPresent ? 'bg-white/20' : 'bg-rose-500/20')
                    : 'bg-white/20'
                    }`}
                >
                  <Text className="text-white text-[10px] font-black uppercase tracking-wider">
                    {isMarked ? (isPresent ? 'Present Today' : status) : 'Status Pending'}
                  </Text>
                </View>
              </View>
            </View>
            <View className="opacity-20 absolute -right-6 -bottom-6">
              <Icon name="medal" size={140} color="white" />
            </View>
          </View>
        </Card>
      </AnimatedView>
    );
  };

  const SectionHeader: React.FC<{ title: string; action?: string; onAction?: () => void }> = ({ title, action, onAction }) => (
    <View className="flex-row justify-between items-center mb-4 px-4">
      <Text className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest text-[10px] text-slate-400">{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction} className="bg-primary/10 px-3 py-1 rounded-full">
          <Text className="text-[10px] font-black text-primary uppercase">{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScreenWrapper>
      <Header title="Learning Hub" subtitle={`Hello, ${userName} 👋`} />
      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ paddingVertical: SPACING.lg }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <HighlightCard />

        <View className="px-4 flex-row flex-wrap justify-between gap-y-4">
          <StatCard
            icon="currency-inr"
            label="Pending Fees"
            value={`₹${data?.fees_due.total_due || 0}`}
            color={COLORS.error}
            onPress={() => (navigation as any).navigate('FinanceTab')}
            className="w-[48%]"
          />
          <StatCard
            icon="calendar-clock"
            label="Schedule"
            value={`${data?.timetable.total_periods || 0} Periods`}
            color={COLORS.primary}
            onPress={() => (navigation as any).navigate('ProfileTab', { screen: 'MyTimetable' })}
            className="w-[48%]"
          />
          <StatCard
            icon="file-document-edit"
            label="Upcoming"
            value={`${data?.exams.length || 0} Exams`}
            color={COLORS.warningDark}
            onPress={() => (navigation as any).navigate('AcademicsTab', { screen: 'ExamResults' })}
            className="w-[48%]"
          />
          <StatCard
            icon="notebook-edit"
            label="Homework"
            value={`${data?.homework.length || 0} Active`}
            color={COLORS.success}
            onPress={() => (navigation as any).navigate('AcademicsTab', { screen: 'AssignmentsList' })}
            className="w-[48%]"
          />
        </View>

        {/* Timetable / Next Class Widget */}
        <View className="mt-8">
          <SectionHeader title="Current Schedule" action="View All" onAction={() => (navigation as any).navigate('ProfileTab', { screen: 'MyTimetable' })} />
          <View className="px-4">
            {data?.timetable.is_holiday ? (
              <Card elevation="sm" className="bg-slate-100 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800">
                <View className="items-center justify-center p-8">
                  <Icon name="calendar-star" size={40} color={COLORS.gray400} />
                  <Text className="text-slate-500 font-bold mt-3">{data.timetable.holiday_name || 'It\'s a holiday!'}</Text>
                </View>
              </Card>
            ) : data?.timetable.periods.length ? (
              <AnimatedView entering={FadeInRight.delay(200)}>
                <Card
                  elevation="sm"
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                  onPress={() => (navigation as any).navigate('ProfileTab', { screen: 'MyTimetable' })}
                >
                  <View className="flex-row items-center py-1">
                    <View className="bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-xl mr-4">
                      <Text className="text-emerald-700 dark:text-emerald-400 text-[10px] font-black">NEXT</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-black text-slate-900 dark:text-slate-100">{data.timetable.periods[0].subject?.name || 'Class'}</Text>
                      <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Room {data.timetable.periods[0].room_number} • {data.timetable.periods[0].teacher?.name || 'Staff'}
                      </Text>
                    </View>
                    {data.timetable.periods[0].is_substitution && (
                      <Badge label="Sub" variant="warning" size="sm" className="mr-2" />
                    )}
                    <Icon name="chevron-right" size={24} color={COLORS.gray300} />
                  </View>
                </Card>
              </AnimatedView>
            ) : (
              <Card elevation="none" className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-8 items-center">
                <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest">No classes today</Text>
              </Card>
            )}
          </View>
        </View>

        {/* Homework Due Horizontal Scroll */}
        <View className="mt-8">
          <SectionHeader
            title="Tasks & Homework"
            action="See More"
            onAction={() => (navigation as any).navigate('AcademicsTab', { screen: 'AssignmentsList' })}
          />
          {data?.homework && data.homework.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              className="mt-1"
            >
              {data.homework.map((item, idx) => (
                <AnimatedView key={item.id} entering={FadeInRight.delay(400 + idx * 100)}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => (navigation as any).navigate('AcademicsTab', {
                      screen: 'AssignmentDetail',
                      params: { assignmentId: item.id }
                    })}
                    className="mr-4 w-56"
                  >
                    <Card style={{ minHeight: 160 }} padding={20}>
                      <View
                        className={`self-start px-2 py-1 rounded-lg ${item.is_overdue ? 'bg-rose-100/50' : (item.is_due_today ? 'bg-amber-100/50' : 'bg-indigo-100/50')
                          }`}
                      >
                        <Text
                          className={`text-[9px] font-black uppercase tracking-wider ${item.is_overdue ? 'text-rose-600' : (item.is_due_today ? 'text-amber-600' : 'text-indigo-600')
                            }`}
                        >
                          {item.is_overdue ? 'Overdue' : (item.is_due_today ? 'Due Today' : 'Scheduled')}
                        </Text>
                      </View>
                      <Text className="text-[10px] text-slate-500 font-black mt-4 uppercase tracking-widest" numberOfLines={1}>{item.subject?.name}</Text>
                      <Text className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1" numberOfLines={2}>{item.title}</Text>
                      <View className="mt-auto pt-4 flex-row items-center">
                        <Icon name="clock-outline" size={14} color={COLORS.gray400} />
                        <Text className="text-[10px] text-slate-400 ml-1.5 font-bold uppercase tracking-widest">{item.due_date_display}</Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                </AnimatedView>
              ))}
            </ScrollView>
          ) : (
            <View className="px-4">
              <Card elevation="none" className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-10 items-center">
                <Icon name="check-decagram" size={32} color={COLORS.success} className="opacity-50" />
                <Text className="text-slate-500 font-bold mt-2 text-xs uppercase tracking-widest">All caught up!</Text>
              </Card>
            </View>
          )}
        </View>

        {/* Teacher Remarks Section */}
        {data?.teacher_remarks && data.teacher_remarks.length > 0 && (
          <View className="mt-8 mb-4">
            <SectionHeader title="Messages from Staff" />
            <View className="px-4">
              {data.teacher_remarks.map((remark, idx) => (
                <AnimatedView key={remark.id} entering={FadeInUp.delay(600 + idx * 100)} className="mb-4">
                  <Card className="border-l-4 border-l-primary" padding={20}>
                    <View className="flex-row justify-between items-center mb-3">
                      <View className="flex-row items-center bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl">
                        <Icon name="account-tie" size={16} color={COLORS.primary} className="mr-2" />
                        <Text className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{remark.created_by}</Text>
                      </View>
                      <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{remark.created_at_display}</Text>
                    </View>
                    <Text className="text-base font-black text-slate-800 dark:text-slate-200 mb-2">{remark.title}</Text>
                    <Text className="text-xs text-slate-600 dark:text-slate-400 leading-5 font-medium" numberOfLines={3}>{remark.content}</Text>
                    {remark.is_important && (
                      <View className="flex-row items-center bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-xl self-start mt-4 border border-amber-100 dark:border-amber-900/30">
                        <Icon name="alert-decagram" size={14} color={COLORS.warningDark} />
                        <Text className="text-[9px] font-black text-amber-700 dark:text-amber-400 ml-2 uppercase">Priority</Text>
                      </View>
                    )}
                  </Card>
                </AnimatedView>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </ScreenWrapper>
  );
};

export default StudentDashboard;
