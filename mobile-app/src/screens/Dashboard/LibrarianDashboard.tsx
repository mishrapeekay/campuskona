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

interface LibraryStats {
  books_issued_today: number;
  overdue_books: number;
  total_books: number;
  available_books: number;
  books_returned_today: number;
  pending_reservations: number;
}

const LibrarianDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<LibraryStats>({
    books_issued_today: 0,
    overdue_books: 0,
    total_books: 0,
    available_books: 0,
    books_returned_today: 0,
    pending_reservations: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string>(user?.first_name || 'Librarian');

  const loadDashboardData = async () => {
    try {
      const { libraryService } = require('@/services/api');
      const libraryRes = await libraryService.getBooks({ page_size: 1 });
      setStats(prev => ({
        ...prev,
        total_books: libraryRes.count || 0,
      }));
    } catch (error) {
      console.error('Error loading librarian dashboard:', error);
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
      <Header title="Library" subtitle="Digital Inventory Portal" />

      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Librarian Header */}
        <Animated.View entering={FadeInUp.duration(600)} className="mb-6">
          <Text className="text-3xl font-black text-slate-900 dark:text-slate-100">Welcome, {userName}</Text>
          <Text className="text-slate-500 font-medium text-sm mt-1">Maintaining {stats.total_books} books in the catalog</Text>
        </Animated.View>

        {/* Today's Stats Banner */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mb-8">
          <Card className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-200 dark:shadow-none overflow-hidden">
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center mr-4">
                <Icon name="book-open-page-variant" size={28} color="white" />
              </View>
              <View>
                <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest">Circulation Today</Text>
                <Text className="text-white font-black text-xl">Daily Operations</Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-1 items-center bg-white/10 py-4 rounded-2xl mr-2">
                <Text className="text-white text-2xl font-black">{stats.books_issued_today}</Text>
                <Text className="text-white/60 text-[8px] font-black uppercase mt-1">Issued</Text>
              </View>
              <View className="flex-1 items-center bg-white/10 py-4 rounded-2xl mx-1">
                <Text className="text-white text-2xl font-black">{stats.books_returned_today}</Text>
                <Text className="text-white/60 text-[8px] font-black uppercase mt-1">Returned</Text>
              </View>
              <View className="flex-1 items-center bg-white/10 py-4 rounded-2xl ml-2">
                <Text className="text-white text-2xl font-black">{stats.pending_reservations}</Text>
                <Text className="text-white/60 text-[8px] font-black uppercase mt-1">On Hold</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Catalog Stats Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          <StatBox icon="bookshelf" label="Total Books" value={stats.total_books} color="bg-blue-500" delay={300} />
          <StatBox icon="book-check" label="Available" value={stats.available_books} color="bg-emerald-500" delay={400} />
          <StatBox icon="book-alert" label="Overdue" value={stats.overdue_books} color="bg-rose-500" delay={500} />
          <StatBox icon="book-clock" label="Reservations" value={stats.pending_reservations} color="bg-amber-500" delay={600} />
        </View>

        {/* Overdue Alert Bar */}
        {stats.overdue_books > 0 && (
          <Animated.View entering={FadeInDown.delay(700)}>
            <TouchableOpacity className="bg-rose-50 dark:bg-rose-950/20 p-4 rounded-3xl border border-rose-200 dark:border-rose-900/30 flex-row items-center mb-8">
              <View className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 items-center justify-center mr-4">
                <Icon name="alert" size={24} className="text-rose-600 dark:text-rose-400" />
              </View>
              <View className="flex-1">
                <Text className="text-rose-900 dark:text-rose-200 font-bold">{stats.overdue_books} Overdue Reminders</Text>
                <Text className="text-rose-700 dark:text-rose-400/70 text-xs">Send automated alerts to students</Text>
              </View>
              <Icon name="chevron-right" size={20} className="text-rose-400" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Library Services</Text>
        <Card className="bg-white dark:bg-slate-900 mb-8 overflow-hidden border border-slate-100 dark:border-slate-800">
          <ActionTile icon="book-plus" title="Issue New Book" color="text-indigo-600" />
          <ActionTile icon="book-minus" title="Check-in Return" color="text-emerald-600" />
          <ActionTile icon="barcode-scan" title="Scan Barcode" color="text-blue-500" />
          <ActionTile icon="playlist-plus" title="Catalog Entry" color="text-amber-500" isLast />
        </Card>

        {/* Recent Circulation */}
        <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Recent Circulation</Text>
        <Card className="bg-white dark:bg-slate-900 p-8 border border-slate-100 dark:border-slate-800 items-center justify-center">
          <Icon name="book-clock" size={40} color={COLORS.gray200} />
          <Text className="text-slate-400 font-bold mt-4 uppercase tracking-widest text-xs">No activity recorded today</Text>
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

export default LibrarianDashboard;
