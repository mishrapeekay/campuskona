/**
 * AcademicCalendarScreen - Academic year calendar with terms and events
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const AcademicCalendarScreen: React.FC = () => {
  const terms = [
    {
      name: 'Term 1',
      period: 'April 2024 - September 2024',
      events: [
        { date: 'Apr 1', title: 'Term 1 Begins', type: 'academic' },
        { date: 'Apr 14', title: 'Dr. Ambedkar Jayanti', type: 'holiday' },
        { date: 'May 15-25', title: 'Mid-Term Examinations', type: 'exam' },
        { date: 'Jun 1 - Jul 5', title: 'Summer Vacation', type: 'holiday' },
        { date: 'Aug 15', title: 'Independence Day', type: 'holiday' },
        { date: 'Sep 15-25', title: 'Term 1 Examinations', type: 'exam' },
        { date: 'Sep 30', title: 'Term 1 Ends', type: 'academic' },
      ],
    },
    {
      name: 'Term 2',
      period: 'October 2024 - March 2025',
      events: [
        { date: 'Oct 1', title: 'Term 2 Begins', type: 'academic' },
        { date: 'Oct 2', title: 'Gandhi Jayanti', type: 'holiday' },
        { date: 'Nov 14', title: "Children's Day / Annual Day", type: 'event' },
        { date: 'Dec 1-10', title: 'Mid-Term Examinations', type: 'exam' },
        { date: 'Dec 23 - Jan 2', title: 'Winter Break', type: 'holiday' },
        { date: 'Jan 26', title: 'Republic Day', type: 'holiday' },
        { date: 'Feb 15', title: 'Annual Sports Day', type: 'event' },
        { date: 'Mar 10-20', title: 'Final Examinations', type: 'exam' },
        { date: 'Mar 31', title: 'Term 2 Ends', type: 'academic' },
      ],
    },
  ];

  const typeConfig: Record<string, { color: string; icon: string }> = {
    academic: { color: '#4F46E5', icon: 'school' },
    holiday: { color: '#F59E0B', icon: 'beach' },
    exam: { color: '#EF4444', icon: 'clipboard-text' },
    event: { color: '#10B981', icon: 'calendar-star' },
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Legend */}
        <View className="flex-row justify-center gap-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          {Object.entries(typeConfig).map(([key, config]) => (
            <View key={key} className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
              <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{key}</Text>
            </View>
          ))}
        </View>

        {/* Terms */}
        {terms.map((term, termIndex) => (
          <View key={termIndex} className="m-4 mb-2">
            <View className="bg-indigo-600 rounded-2xl p-4 mb-6 shadow-sm shadow-indigo-200 dark:shadow-none">
              <Text className="text-lg font-bold text-white">{term.name}</Text>
              <Text className="text-sm text-indigo-100 mt-1 opacity-80">{term.period}</Text>
            </View>

            <View className="px-1">
              {term.events.map((event, eventIndex) => {
                const config = typeConfig[event.type];
                return (
                  <View key={eventIndex} className="flex-row min-h-[70px]">
                    <View className="w-20 pt-1">
                      <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">{event.date}</Text>
                    </View>

                    <View className="items-center w-5">
                      <View className="w-3 h-3 rounded-full z-10" style={{ backgroundColor: config.color }} />
                      {eventIndex < term.events.length - 1 && (
                        <View
                          className="w-[2px] flex-1 -mt-1"
                          style={{ backgroundColor: config.color + '20' }}
                        />
                      )}
                    </View>

                    <View className="flex-1 pl-4 pb-6">
                      <Text className="text-base font-bold text-slate-900 dark:text-slate-100">{event.title}</Text>
                      <View
                        className="flex-row items-center self-start gap-1.5 px-2 py-0.5 rounded-md mt-2"
                        style={{ backgroundColor: config.color + '10' }}
                      >
                        <Icon name={config.icon} size={12} color={config.color} />
                        <Text
                          className="text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: config.color }}
                        >
                          {event.type}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
};

export default AcademicCalendarScreen;
