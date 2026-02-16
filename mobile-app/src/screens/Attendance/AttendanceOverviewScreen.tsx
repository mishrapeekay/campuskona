import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import Animated, { FadeInUp, FadeInRight, Layout, FadeIn } from 'react-native-reanimated';
import { useSelector } from 'react-redux';

import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card, LoadingSpinner } from '@/components/ui';
import { RootState } from '@/store';
import { UserType } from '@/types/models';

interface AttendanceStats {
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  leave_days: number;
  percentage: number;
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave' | 'holiday';
}

const AttendanceOverviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [stats, setStats] = useState<AttendanceStats>({
    total_days: 0,
    present_days: 0,
    absent_days: 0,
    late_days: 0,
    leave_days: 0,
    percentage: 0,
  });
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedMonth]);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      const mockStats: AttendanceStats = {
        total_days: 180,
        present_days: 165,
        absent_days: 8,
        late_days: 5,
        leave_days: 2,
        percentage: 91.67,
      };
      setStats(mockStats);

      const mockRecords: AttendanceRecord[] = generateMockAttendance(selectedMonth);
      const marked = convertToMarkedDates(mockRecords);
      setMarkedDates(marked);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAttendance = (month: string): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${monthNum.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayOfWeek = new Date(date).getDay();
      if (dayOfWeek === 0) records.push({ date, status: 'holiday' });
      else if (day <= new Date().getDate() || month < new Date().toISOString().slice(0, 7)) {
        const random = Math.random();
        if (random < 0.9) records.push({ date, status: 'present' });
        else if (random < 0.95) records.push({ date, status: 'late' });
        else records.push({ date, status: 'absent' });
      }
    }
    return records;
  };

  const convertToMarkedDates = (records: AttendanceRecord[]): any => {
    const marked: any = {};
    records.forEach((record) => {
      const colorMap = {
        present: '#10B981', absent: '#EF4444', late: '#F59E0B', leave: '#3B82F6', holiday: '#94A3B8',
      };
      marked[record.date] = {
        selected: true,
        selectedColor: colorMap[record.status],
        marked: record.status !== 'holiday',
        dotColor: 'white',
      };
    });
    return marked;
  };

  const isTeacher = user?.user_type === UserType.TEACHER;

  if (loading && Object.keys(markedDates).length === 0) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-950">
        <Header title="Attendance" />
        <LoadingSpinner fullScreen text="Loading data..." />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header
        title="Attendance Center"
        subtitle="Tracking your roadmap"
        rightComponent={
          isTeacher ? (
            <TouchableOpacity
              className="bg-indigo-600 px-4 py-2 rounded-2xl"
              onPress={() => navigation.navigate('MarkAttendance' as never)}
            >
              <Text className="text-white font-bold text-[10px] uppercase tracking-wider">Mark Duty</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAttendanceData()} tintColor="#4F46E5" />}
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      >
        {/* Modern Highlights */}
        <Animated.View entering={FadeInUp.duration(600)}>
          <View className="bg-slate-900 dark:bg-slate-900 p-8 rounded-[40px] mb-8 shadow-2xl shadow-slate-300 dark:shadow-none overflow-hidden">
            <View className="flex-row items-center justify-between mb-8">
              <View>
                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-[3px] mb-2">Total Yield</Text>
                <Text className="text-white text-5xl font-black italic">{stats.percentage.toFixed(1)}%</Text>
              </View>
              <View className="w-16 h-16 rounded-3xl bg-white/10 items-center justify-center">
                <Icon name="lightning-bolt" size={32} color="white" />
              </View>
            </View>

            <View className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
              <Animated.View
                className={`h-full rounded-full ${stats.percentage >= 75 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                style={{ width: `${stats.percentage}%` }}
              />
            </View>

            <View className="flex-row items-center">
              <Icon name="clock-outline" size={14} color="#94A3B8" className="mr-2" />
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                {stats.present_days} OF {stats.total_days} DAYS LOGGED
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Dynamic Metric Grid */}
        <View className="flex-row flex-wrap justify-between mb-10">
          <MetricBox icon="account-check-outline" label="Present" count={stats.present_days} color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-950/20" delay={200} />
          <MetricBox icon="account-off-outline" label="Absent" count={stats.absent_days} color="text-rose-500" bg="bg-rose-50 dark:bg-rose-950/20" delay={300} />
          <MetricBox icon="clock-alert-outline" label="Late" count={stats.late_days} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-950/20" delay={400} />
          <MetricBox icon="weather-pouring" label="Leave" count={stats.leave_days} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-950/20" delay={500} />
        </View>

        {/* Global Schedule View */}
        <Animated.View entering={FadeInUp.delay(600).duration(800)}>
          <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 px-1">Presence Roadmap</Text>
          <View className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden p-4">
            <Calendar
              current={selectedMonth + '-01'}
              markedDates={markedDates}
              onMonthChange={(month: any) => setSelectedMonth(month.dateString.slice(0, 7))}
              theme={{
                calendarBackground: 'transparent',
                textSectionTitleColor: '#94A3B8',
                selectedDayBackgroundColor: '#4F46E5',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#4F46E5',
                dayTextColor: '#475569',
                textDisabledColor: '#CBD5E1',
                dotColor: '#4F46E5',
                monthTextColor: '#1E293B',
                textMonthFontWeight: '900',
                textMonthFontSize: 16,
                textDayHeaderFontSize: 11,
                textDayHeaderFontWeight: '800',
                // Dark mode support for component internals
                'stylesheet.calendar.header': {
                  monthText: {
                    color: '#0F172A', // Slate-900 (light) - will be overridden by monthTextColor if set
                    fontWeight: '900',
                    fontSize: 16,
                  }
                }
              }}
            // Add Dark Mode specific props if necessary or use conditional theme
            />
          </View>
        </Animated.View>

        {/* Legend */}
        <Animated.View entering={FadeIn.delay(800).duration(1000)} className="flex-row justify-center space-x-4 mt-8">
          <LegendItem label="Present" color="#10B981" />
          <LegendItem label="Absent" color="#EF4444" />
          <LegendItem label="Late" color="#F59E0B" />
          <LegendItem label="Holiday" color="#94A3B8" />
        </Animated.View>

        <TouchableOpacity
          className="mt-12 mb-10 items-center justify-center py-4 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          onPress={() => navigation.navigate('AttendanceHistory' as never)}
        >
          <Text className="text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-[3px]">View Full History Index</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const MetricBox = ({ icon, label, count, color, bg, delay }: any) => (
  <Animated.View entering={FadeInUp.delay(delay).duration(600)} className="w-[48%] mb-4">
    <Card className={`p-5 rounded-3xl border border-slate-50 dark:border-slate-800 flex-row items-center ${bg}`}>
      <View className="flex-1">
        <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</Text>
        <Text className={`text-xl font-black ${color}`}>{count}</Text>
      </View>
      <Icon name={icon} size={24} className={color} />
    </Card>
  </Animated.View>
);

const LegendItem = ({ label, color }: any) => (
  <View className="flex-row items-center mx-2">
    <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }} />
    <Text className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</Text>
  </View>
);

export default AttendanceOverviewScreen;
