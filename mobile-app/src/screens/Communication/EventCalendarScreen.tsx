import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  category: 'academic' | 'cultural' | 'sports' | 'holiday' | 'meeting';
  location: string;
}

const EventCalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedDate, setSelectedDate] = useState<string>('2024-01-27');

  const events: CalendarEvent[] = [
    { id: '1', title: 'Republic Day Celebration', date: '2024-01-26', time: '8:00 AM - 11:00 AM', category: 'cultural', location: 'School Ground' },
    { id: '2', title: 'Parent-Teacher Meeting', date: '2024-01-30', time: '10:00 AM - 1:00 PM', category: 'meeting', location: 'Respective Classrooms' },
    { id: '3', title: 'Mid-Term Exams Begin', date: '2024-02-05', time: '9:00 AM', category: 'academic', location: 'Examination Hall' },
    { id: '4', title: 'Annual Day Celebration', date: '2024-02-15', time: '9:00 AM - 2:00 PM', category: 'cultural', location: 'School Auditorium' },
    { id: '5', title: 'Inter-School Cricket Match', date: '2024-02-20', time: '9:00 AM - 4:00 PM', category: 'sports', location: 'School Ground' },
    { id: '6', title: 'Maha Shivaratri - Holiday', date: '2024-03-08', time: 'Full Day', category: 'holiday', location: '-' },
  ];

  const categoryConfig: Record<string, { color: string; bg: string; icon: string }> = {
    academic: { color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: 'school' },
    cultural: { color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'palette' },
    sports: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'basketball' },
    holiday: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'beach' },
    meeting: { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'account-group' },
  };

  const daysInMonth = 31;
  const firstDayOffset = 1;
  const today = 27;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const eventDates = events.map(e => parseInt(e.date.split('-')[2]));

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header
        title="Calendar"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Calendar Card */}
        <View className="bg-white dark:bg-slate-900 m-6 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <View className="flex-row justify-between items-center mb-8">
            <TouchableOpacity className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center">
              <Icon name="chevron-left" size={24} className="text-slate-900 dark:text-slate-100" />
            </TouchableOpacity>
            <Text className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">January 2024</Text>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center">
              <Icon name="chevron-right" size={24} className="text-slate-900 dark:text-slate-100" />
            </TouchableOpacity>
          </View>

          <View className="flex-row mb-4">
            {weekDays.map((day, index) => (
              <Text key={index} className={`flex-1 text-center text-[10px] font-black uppercase tracking-widest ${(index === 0 || index === 6) ? 'text-rose-500' : 'text-slate-400'}`}>
                {day}
              </Text>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {Array.from({ length: firstDayOffset }, (_, i) => (
              <View key={`empty-${i}`} className="w-[14.28%] h-12" />
            ))}
            {days.map((day) => {
              const hasEvent = eventDates.includes(day);
              const isToday = day === today;
              const isSelected = day === parseInt(selectedDate.split('-')[2]);
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDate(`2024-01-${day.toString().padStart(2, '0')}`)}
                  className={`w-[14.28%] h-12 justify-center items-center rounded-2xl ${isSelected ? 'bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none' : isToday ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    }`}
                >
                  <Text className={`text-sm font-bold ${isSelected ? 'text-white' : isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'
                    }`}>
                    {day}
                  </Text>
                  {hasEvent && (
                    <View className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-indigo-600'}`} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Upcoming Events */}
        <View className="px-6">
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-6">Upcoming Events</Text>
          {events.map((event) => {
            const config = categoryConfig[event.category];
            return (
              <TouchableOpacity
                key={event.id}
                className="flex-row bg-white dark:bg-slate-900 rounded-[28px] mb-4 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden active:scale-[0.98]"
              >
                <View className={`w-1.5 ${config.bg.replace('/20', '')}`} />
                <View className="flex-1 p-6">
                  <View className="flex-row items-center">
                    <View className={`w-12 h-12 rounded-[18px] justify-center items-center mr-4 ${config.bg}`}>
                      <Icon name={config.icon} size={24} className={config.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-black text-slate-900 dark:text-slate-100 leading-tight">{event.title}</Text>
                      <View className="flex-row items-center mt-1">
                        <Icon name="calendar-month" size={14} className="text-slate-400 dark:text-slate-500 mr-1.5" />
                        <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{event.date}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="flex-row gap-6 mt-5 pt-5 border-t border-slate-50 dark:border-slate-800/50">
                    <View className="flex-row items-center">
                      <Icon name="clock-outline" size={14} className="text-slate-400 dark:text-slate-500 mr-1.5" />
                      <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{event.time}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Icon name="map-marker-outline" size={14} className="text-slate-400 dark:text-slate-500 mr-1.5" />
                      <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400" numberOfLines={1}>{event.location}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default EventCalendarScreen;
