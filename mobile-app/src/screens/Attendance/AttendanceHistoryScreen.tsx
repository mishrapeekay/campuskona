import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInDown, FadeIn, FadeInRight, Layout, SlideInRight } from 'react-native-reanimated';

import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card } from '@/components/ui';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  check_in_time?: string;
  check_out_time?: string;
  marked_by?: string;
  remarks?: string;
}

interface GroupedAttendance {
  month: string;
  records: AttendanceRecord[];
}

const AttendanceHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [history, setHistory] = useState<GroupedAttendance[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'leave'>('all');

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Mock data for now
      const mockRecords = generateMockHistory();
      const filtered = filter === 'all' ? mockRecords : mockRecords.filter(r => r.status === filter);
      const grouped = groupByMonth(filtered);
      setHistory(grouped);
    } catch (error) {
      console.error('Failed to load attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockHistory = (): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      if (date.getDay() === 0) continue;
      const random = Math.random();
      let status: 'present' | 'absent' | 'late' | 'leave';
      if (random < 0.8) status = 'present';
      else if (random < 0.9) status = 'late';
      else if (random < 0.95) status = 'absent';
      else status = 'leave';

      records.push({
        id: `record-${i}`,
        date: date.toISOString().split('T')[0],
        status,
        check_in_time: status === 'present' || status === 'late' ? '08:45 AM' : undefined,
        check_out_time: status === 'present' || status === 'late' ? '03:30 PM' : undefined,
      });
    }
    return records;
  };

  const groupByMonth = (records: AttendanceRecord[]): GroupedAttendance[] => {
    const grouped: Record<string, AttendanceRecord[]> = {};
    records.forEach((record) => {
      const date = new Date(record.date);
      const monthKey = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(record);
    });
    return Object.entries(grouped).map(([month, records]) => ({ month, records }));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'present': return { icon: 'check-circle', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' };
      case 'absent': return { icon: 'close-circle', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/20' };
      case 'late': return { icon: 'clock-alert', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' };
      case 'leave': return { icon: 'account-clock', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' };
      default: return { icon: 'check-circle', color: 'text-slate-600', bg: 'bg-slate-50' };
    }
  };

  const renderItem = ({ item, index }: { item: AttendanceRecord; index: number }) => {
    const style = getStatusStyle(item.status);
    const date = new Date(item.date);
    return (
      <Animated.View entering={FadeInRight.delay(index * 30).duration(400)} layout={Layout.springify()}>
        <TouchableOpacity
          className="bg-white dark:bg-slate-900 mx-5 mb-3 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex-row items-center shadow-sm shadow-slate-200 dark:shadow-none"
          activeOpacity={0.8}
        >
          <View className="w-14 items-center border-r border-slate-100 dark:border-slate-800 mr-4">
            <Text className="text-xl font-black text-slate-800 dark:text-slate-100">{date.getDate()}</Text>
            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{date.toLocaleDateString('en-IN', { month: 'short' })}</Text>
          </View>

          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-sm font-black text-slate-800 dark:text-slate-100 mr-2">{date.toLocaleDateString('en-IN', { weekday: 'short' })}</Text>
              <View className={`px-2 py-0.5 rounded-full ${style.bg}`}>
                <Text className={`text-[8px] font-black uppercase tracking-wider ${style.color}`}>{item.status}</Text>
              </View>
            </View>

            {(item.check_in_time || item.check_out_time) && (
              <View className="flex-row items-center">
                <Icon name="clock-outline" size={10} className="text-slate-400 mr-1" />
                <Text className="text-[10px] text-slate-500 font-medium">
                  {item.check_in_time || '--'} — {item.check_out_time || '--'}
                </Text>
              </View>
            )}
          </View>

          <View className={`w-10 h-10 rounded-2xl items-center justify-center ${style.bg}`}>
            <Icon name={style.icon} size={20} className={style.color} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScreenWrapper>
      <Header title="Attendance" subtitle="Presence logs" showBackButton />

      <View className="bg-white dark:bg-slate-900 pt-2 pb-4 shadow-sm shadow-slate-100 dark:shadow-none">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
          {['all', 'present', 'absent', 'late', 'leave'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f as any)}
              className={`px-5 py-2.5 rounded-2xl ${filter === f ? 'bg-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-800'}`}
            >
              <Text className={`text-xs font-black uppercase tracking-widest ${filter === f ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.month}
        renderItem={({ item }) => (
          <View>
            <Animated.View entering={FadeInDown.duration(600)} className="px-6 pt-6 pb-4">
              <Text className="text-base font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">{item.month}</Text>
            </Animated.View>
            {item.records.map((record, idx) => (
              <View key={record.id}>
                {renderItem({ item: record, index: idx })}
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadHistory()} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? null : (
            <View className="items-center justify-center pt-20 px-10">
              <View className="w-20 h-20 rounded-[28px] bg-slate-100 dark:bg-slate-900 items-center justify-center mb-6">
                <Icon name="calendar-blank-outline" size={40} className="text-slate-300" />
              </View>
              <Text className="text-xl font-black text-slate-900 dark:text-slate-100">No Logs Found</Text>
              <Text className="text-slate-400 text-sm text-center mt-2">Adjust your filters or verify with the administration.</Text>
            </View>
          )
        }
      />
    </ScreenWrapper>
  );
};

export default AttendanceHistoryScreen;
