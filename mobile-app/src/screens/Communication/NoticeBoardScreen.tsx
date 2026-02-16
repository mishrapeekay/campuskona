import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

interface Notice {
  id: string;
  title: string;
  summary: string;
  category: 'general' | 'academic' | 'event' | 'urgent' | 'holiday';
  date: string;
  author: string;
  isRead: boolean;
  hasAttachment: boolean;
  isPinned: boolean;
}

const NoticeBoardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<string>('all');

  const notices: Notice[] = [
    { id: '1', title: 'Annual Day Celebration 2024', summary: 'We are pleased to announce the Annual Day Celebration scheduled for February 15, 2024...', category: 'event', date: '2024-01-27', author: 'Principal', isRead: false, hasAttachment: true, isPinned: true },
    { id: '2', title: 'Mid-Term Examination Schedule', summary: 'The mid-term examinations will commence from February 5, 2024. Please find the detailed timetable...', category: 'academic', date: '2024-01-25', author: 'Vice Principal', isRead: false, hasAttachment: true, isPinned: true },
    { id: '3', title: 'Republic Day - School Closed', summary: 'School will remain closed on January 26, 2024, on account of Republic Day celebrations.', category: 'holiday', date: '2024-01-24', author: 'Admin', isRead: true, hasAttachment: false, isPinned: false },
    { id: '4', title: 'Parent-Teacher Meeting', summary: 'A parent-teacher meeting is scheduled for January 30, 2024, from 10:00 AM to 1:00 PM...', category: 'general', date: '2024-01-23', author: 'Class Teacher', isRead: true, hasAttachment: false, isPinned: false },
    { id: '5', title: 'Water Supply Disruption', summary: 'Due to maintenance work, water supply will be disrupted on January 28, 2024...', category: 'urgent', date: '2024-01-22', author: 'Admin', isRead: true, hasAttachment: false, isPinned: false },
  ];

  const categoryConfig: Record<string, { color: string; bg: string; icon: string; label: string }> = {
    general: { color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: 'information', label: 'General' },
    academic: { color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'school', label: 'Academic' },
    event: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'calendar-star', label: 'Event' },
    urgent: { color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', icon: 'alert-circle', label: 'Urgent' },
    holiday: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'beach', label: 'Holiday' },
  };

  const filters = ['all', 'general', 'academic', 'event', 'urgent', 'holiday'];

  const filteredNotices = filter === 'all' ? notices : notices.filter(n => n.category === filter);

  const renderNotice = ({ item }: { item: Notice }) => {
    const config = categoryConfig[item.category];
    return (
      <TouchableOpacity
        className={`bg-white dark:bg-slate-900 rounded-[32px] p-6 mb-4 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] ${!item.isRead ? 'border-l-4 border-l-indigo-600' : ''
          }`}
        onPress={() => navigation.navigate('NoticeDetail', { noticeId: item.id })}
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className={`w-12 h-12 rounded-[18px] items-center justify-center ${config.bg}`}>
            <Icon name={config.icon} size={24} className={config.color} />
          </View>
          <View className="flex-row items-center gap-2">
            {item.isPinned && (
              <View className="bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full flex-row items-center">
                <Icon name="pin" size={12} className="text-amber-600 mr-1" />
                <Text className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pinned</Text>
              </View>
            )}
            {!item.isRead && (
              <View className="w-2 h-2 rounded-full bg-indigo-600" />
            )}
          </View>
        </View>

        <Text className={`text-lg text-slate-900 dark:text-slate-100 leading-tight mb-2 ${!item.isRead ? 'font-black' : 'font-bold'}`}>
          {item.title}
        </Text>

        <Text className="text-sm text-slate-500 dark:text-slate-400 leading-6 mb-4" numberOfLines={2}>
          {item.summary}
        </Text>

        <View className="flex-row items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
          <View className="flex-row items-center">
            <View className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mr-2">
              <Icon name="account" size={14} className="text-slate-400 dark:text-slate-500" />
            </View>
            <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {item.author}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Icon name="calendar-month" size={14} className="text-slate-400 dark:text-slate-500 mr-1" />
            <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {item.date}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header
        title="Notice Board"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightIcon="plus"
        onRightIconPress={() => navigation.navigate('CreateNotice')}
      />

      <View className="py-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`px-6 py-3 rounded-2xl mr-3 border ${filter === f
                  ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'
                } active:scale-95 transition-all`}
            >
              <Text className={`text-[10px] font-black uppercase tracking-widest ${filter === f ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                }`}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredNotices}
        keyExtractor={(item) => item.id}
        renderItem={renderNotice}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <View className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[32px] items-center justify-center mb-6">
              <Icon name="bulletin-board" size={48} className="text-slate-200 dark:text-slate-800" />
            </View>
            <Text className="text-base font-black text-slate-400 dark:text-slate-700 uppercase tracking-widest">No notices found</Text>
          </View>
        }
      />
    </View>
  );
};

export default NoticeBoardScreen;
