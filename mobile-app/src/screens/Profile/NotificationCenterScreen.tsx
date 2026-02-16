import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  LayoutAnimation,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInDown, FadeIn, Layout, SlideInRight } from 'react-native-reanimated';

import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Badge } from '@/components/ui';
import { communicationService, parentService } from '@/services/api';
import { useAppSelector } from '@/store/hooks';
import { Notification as ApiNotification, UserType } from '@/types/models';

type TabType = 'all' | 'attendance' | 'fees' | 'exams' | 'library' | 'transport' | 'notices';

const TABS: { id: TabType; label: string; icon: string; color: string }[] = [
  { id: 'all', label: 'Priority', icon: 'star-outline', color: 'bg-indigo-600' },
  { id: 'attendance', label: 'Presence', icon: 'calendar-check-outline', color: 'bg-emerald-600' },
  { id: 'fees', label: 'Finance', icon: 'credit-card-outline', color: 'bg-amber-600' },
  { id: 'exams', label: 'Academia', icon: 'school-outline', color: 'bg-blue-600' },
  { id: 'notices', label: 'Broadcast', icon: 'bullhorn-outline', color: 'bg-rose-600' },
];

interface UiNotification {
  id: string;
  title: string;
  body: string;
  category: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

const NotificationCenterScreen: React.FC = ({ route }: any) => {
  const navigation = useNavigation();
  const { user } = useAppSelector((state) => state.auth);
  const studentId = route?.params?.studentId;
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [notifications, setNotifications] = useState<UiNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [activeTab, studentId]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      let data;
      if (studentId && user?.user_type === UserType.PARENT) {
        data = await parentService.getNotifications(studentId);
      } else {
        data = await communicationService.getNotifications();
      }
      const results = Array.isArray(data) ? data : data.results || [];
      const normalized: UiNotification[] = results.map((n: ApiNotification) => ({
        id: n.id,
        title: n.title,
        body: n.message,
        category: (n as any).category || 'general',
        timestamp: n.created_at,
        read: n.is_read,
        link: n.link,
      }));

      if (activeTab === 'all') {
        setNotifications(normalized);
      } else {
        setNotifications(normalized.filter((n) => n.category === activeTab));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async (notification: UiNotification) => {
    if (!notification.read) {
      try {
        await communicationService.markAsRead(notification.id);
        setNotifications(p => p.map(n => n.id === notification.id ? { ...n, read: true } : n));
      } catch (e) { }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await communicationService.deleteNotification(id);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (e) { }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const renderItem = ({ item, index }: { item: UiNotification; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 50).duration(400)}
      layout={Layout.springify()}
    >
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.8}
        className={`bg-white dark:bg-slate-900 mx-5 mb-4 p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200 dark:shadow-none relative ${!item.read ? 'border-l-4 border-l-indigo-600' : ''}`}
      >
        <View className="flex-row items-start">
          <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${item.read ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-indigo-50 dark:bg-indigo-950/30'}`}>
            <Icon
              name={TABS.find(t => t.id === item.category)?.icon || 'bell-outline'}
              size={24}
              className={item.read ? 'text-slate-400' : 'text-indigo-600 dark:text-indigo-400'}
            />
          </View>
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-1">
              <Text className={`text-base flex-1 mr-2 ${item.read ? 'text-slate-500 font-medium' : 'text-slate-900 dark:text-slate-100 font-black'}`} numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{formatTime(item.timestamp)}</Text>
            </View>
            <Text className="text-slate-500 text-xs leading-5" numberOfLines={2}>{item.body}</Text>
          </View>

          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            className="ml-2 p-1"
          >
            <Icon name="close-circle-outline" size={18} className="text-slate-300" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ScreenWrapper>
      <Header title="Pulse Center" showBackButton />

      {/* Dynamic Tabs */}
      <View className="bg-white dark:bg-slate-900 pt-2 pb-4 shadow-sm shadow-slate-100 dark:shadow-none">
        <FlatList
          horizontal
          data={TABS}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveTab(item.id)}
              className={`flex-row items-center px-5 py-2.5 rounded-2xl ${activeTab === item.id ? 'bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-800'}`}
            >
              <Icon name={item.icon} size={16} color={activeTab === item.id ? 'white' : '#64748B'} />
              <Text className={`ml-2 text-xs font-black uppercase tracking-wider ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications()} />}
        ListEmptyComponent={
          loading ? (
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-slate-400 font-bold uppercase tracking-[4px] text-[10px]">Syncing Streams...</Text>
            </View>
          ) : (
            <View className="items-center justify-center pt-20 px-10">
              <View className="w-20 h-20 rounded-[28px] bg-slate-100 dark:bg-slate-900 items-center justify-center mb-6">
                <Icon name="bell-off-outline" size={40} className="text-slate-300" />
              </View>
              <Text className="text-xl font-black text-slate-900 dark:text-slate-100">Quiet Period</Text>
              <Text className="text-slate-400 text-sm text-center mt-2">No active notifications found in your {activeTab !== 'all' ? activeTab : 'inbox'}.</Text>
            </View>
          )
        }
      />
    </ScreenWrapper>
  );
};

export default NotificationCenterScreen;
