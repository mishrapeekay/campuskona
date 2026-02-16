import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

const NoticeDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const notice = {
    title: 'Annual Day Celebration 2024',
    category: 'event',
    date: 'January 27, 2024',
    time: '10:30 AM',
    author: 'Dr. Sharma (Principal)',
    content: `Dear Parents and Students,

We are delighted to announce the Annual Day Celebration for the academic year 2023-2024. This is one of the most anticipated events of our school calendar and we look forward to your enthusiastic participation.

Event Details:
- Date: February 15, 2024 (Thursday)
- Time: 9:00 AM to 2:00 PM
- Venue: School Auditorium

The program includes cultural performances, prize distribution, and special addresses. Parents are cordially invited to attend.

Important Notes:
1. Students participating in cultural events should report by 7:30 AM
2. Regular classes will not be held on this day
3. School buses will operate as per the revised schedule
4. Refreshments will be provided

Please confirm your attendance through the school app or contact the class teacher.

Warm Regards,
Dr. Sharma
Principal`,
    attachments: [
      { name: 'Annual_Day_Schedule.pdf', size: '245 KB', type: 'pdf' },
      { name: 'Performance_List.xlsx', size: '128 KB', type: 'excel' },
    ],
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return { icon: 'file-pdf-box', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' };
      case 'excel': return { icon: 'file-excel-box', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
      case 'word': return { icon: 'file-word-box', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' };
      default: return { icon: 'file-document', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' };
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header
        title="Notice Detail"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="p-6">
          {/* Category Badge */}
          <View className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 self-start mb-6">
            <Text className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
              {notice.category}
            </Text>
          </View>

          {/* Title */}
          <Text className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-6 leading-tight">
            {notice.title}
          </Text>

          {/* Meta Info */}
          <View className="flex-row items-center gap-6 mb-8">
            <View className="flex-row items-center">
              <Icon name="calendar-month" size={16} className="text-slate-400 dark:text-slate-500 mr-2" />
              <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{notice.date}</Text>
            </View>
            <View className="flex-row items-center">
              <Icon name="clock-outline" size={16} className="text-slate-400 dark:text-slate-500 mr-2" />
              <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{notice.time}</Text>
            </View>
          </View>

          {/* Author Card */}
          <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 mb-8 flex-row items-center border border-slate-100 dark:border-slate-800 shadow-sm">
            <View className="w-12 h-12 bg-indigo-600 rounded-[18px] items-center justify-center mr-4">
              <Icon name="account" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-black text-slate-900 dark:text-slate-100">
                {notice.author}
              </Text>
              <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                Notice Author
              </Text>
            </View>
            <TouchableOpacity className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center">
              <Icon name="message-outline" size={20} className="text-indigo-600" />
            </TouchableOpacity>
          </View>

          {/* Content Card */}
          <View className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
            <Text className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-7">
              {notice.content}
            </Text>
          </View>

          {/* Attachments */}
          {notice.attachments.length > 0 && (
            <View className="mb-8">
              <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-6 px-1">
                Attachments ({notice.attachments.length})
              </Text>
              {notice.attachments.map((attachment, index) => {
                const config = getFileIcon(attachment.type);
                return (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center bg-white dark:bg-slate-900 rounded-[28px] p-6 mb-4 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.98]"
                  >
                    <View className={`w-12 h-12 rounded-[18px] items-center justify-center mr-4 ${config.bg}`}>
                      <Icon name={config.icon} size={28} className={config.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-slate-900 dark:text-slate-100 mr-4" numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                        {attachment.size} • {attachment.type.toUpperCase()}
                      </Text>
                    </View>
                    <View className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full items-center justify-center">
                      <Icon name="download" size={20} className="text-indigo-600" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Actions */}
          <View className="flex-row gap-4">
            <TouchableOpacity className="flex-1 bg-indigo-600 py-5 rounded-[24px] items-center shadow-lg shadow-indigo-200 dark:shadow-none flex-row justify-center">
              <Icon name="share-variant" size={18} color="white" />
              <Text className="ml-2 text-white font-black uppercase tracking-widest text-[10px]">Share Notice</Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-16 bg-white dark:bg-slate-900 rounded-[24px] items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm">
              <Icon name="bookmark-outline" size={20} className="text-indigo-600" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default NoticeDetailScreen;
