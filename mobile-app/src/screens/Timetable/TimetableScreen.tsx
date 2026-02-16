import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp, FadeInRight, Layout } from 'react-native-reanimated';

import { timetableService, studentService, academicService } from '@/services/api';
import { useAppSelector } from '@/store/hooks';
import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card, Badge } from '@/components/ui';

interface TimetableSlot {
    id: string;
    day: string;
    time: string;
    subject: string;
    class: string;
    room: string;
}

const TimetableScreen: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [refreshing, setRefreshing] = useState(false);
    const [timetable, setTimetable] = useState<TimetableSlot[]>([]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        loadTimetable();
    }, [selectedDay]);

    const loadTimetable = async () => {
        setRefreshing(true);
        try {
            if (!user) return;
            let data: any[] = [];
            const currentDay = selectedDay.toUpperCase();

            if (user.user_type === 'TEACHER' || user.user_type === 'PRINCIPAL') {
                const entries = await timetableService.getTeacherTimetable();
                data = entries.filter((item: any) => item.day_of_week === currentDay);
                if (data.length > 0) {
                    data.sort((a, b) => (a.time_slot?.start_time || '').localeCompare(b.time_slot?.start_time || ''));
                }
            } else if (user.user_type === 'STUDENT' || user.user_type === 'PARENT') {
                let studentId = (user as any).student_id;
                if (user.user_type === 'PARENT') {
                    const wards = await studentService.getWards();
                    if (wards && wards.length > 0) studentId = wards[0].id;
                }

                if (studentId) {
                    const student = await studentService.getStudent(studentId);
                    const classId = typeof student.current_class === 'object' ? (student.current_class as any).id : student.current_class;
                    const sectionId = typeof student.current_section === 'object' ? (student.current_section as any).id : student.current_section;

                    if (classId && sectionId) {
                        try {
                            const academicYear = await academicService.getCurrentAcademicYear();
                            const response = await timetableService.getClassTimetable(academicYear.id, classId, sectionId);
                            data = response.timetable[currentDay] || [];
                        } catch (err) {
                            console.warn('Failed to fetch class timetable details', err);
                        }
                    }
                }
            }

            const formattedSlots: TimetableSlot[] = data.map((item: any, index) => ({
                id: item.id?.toString() || index.toString(),
                day: item.day_of_week || selectedDay,
                time: item.time_slot ? `${item.time_slot.start_time.substring(0, 5)} - ${item.time_slot.end_time.substring(0, 5)}` : '',
                subject: item.subject?.name || 'Free Period',
                class: item.class_name ? `${item.class_name}` : (item.room_number ? `Room ${item.room_number}` : '-'),
                room: item.room_number || '-'
            }));

            setTimetable(formattedSlots);
        } catch (error) {
            console.error('Failed to load timetable:', error);
            setTimetable([]);
        } finally {
            setRefreshing(false);
        }
    };

    const getSubjectInfo = (subject: string) => {
        const subjects: Record<string, { color: string, icon: string }> = {
            'Mathematics': { color: 'text-indigo-600', icon: 'calculator' },
            'Science': { color: 'text-emerald-600', icon: 'flask' },
            'English': { color: 'text-amber-500', icon: 'book-open-variant' },
            'Social Studies': { color: 'text-sky-500', icon: 'earth' },
            'Physics': { color: 'text-purple-600', icon: 'atom' },
            'Chemistry': { color: 'text-teal-600', icon: 'beaker-outline' },
            'Free Period': { color: 'text-slate-400', icon: 'coffee-outline' },
        };
        return subjects[subject] || { color: 'text-slate-600 dark:text-slate-400', icon: 'notebook' };
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-950">
            <Header title="Timetable" />

            <View className="bg-white dark:bg-slate-900 pt-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                >
                    {days.map((day) => (
                        <TouchableOpacity
                            key={day}
                            onPress={() => setSelectedDay(day)}
                            className={`px-5 py-2.5 rounded-2xl ${selectedDay === day ? 'bg-indigo-600 shadow-sm shadow-indigo-300 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-800'}`}
                        >
                            <Text className={`text-xs font-black uppercase tracking-widest ${selectedDay === day ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                {day.substring(0, 3)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadTimetable} tintColor="#4F46E5" />}
            >
                <Animated.View entering={FadeInUp.duration(600)}>
                    <View className="flex-row justify-between items-end mb-6 px-1">
                        <View>
                            <Text className="text-2xl font-black text-slate-900 dark:text-slate-100">{selectedDay}</Text>
                            <Text className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{timetable.length} Scheduled Periods</Text>
                        </View>
                        <TouchableOpacity className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200 dark:shadow-none">
                            <Icon name="calendar-month" size={20} className="text-slate-600 dark:text-slate-300" />
                        </TouchableOpacity>
                    </View>

                    {timetable.length > 0 ? (
                        timetable.map((slot, idx) => {
                            const info = getSubjectInfo(slot.subject);
                            const isFree = slot.subject === 'Free Period';

                            return (
                                <Animated.View
                                    key={slot.id}
                                    entering={FadeInRight.delay(idx * 100).springify()}
                                    layout={Layout.springify()}
                                >
                                    <TouchableOpacity
                                        className={`bg-white dark:bg-slate-900 rounded-3xl p-4 mb-4 flex-row items-center border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none ${isFree ? 'opacity-60' : ''}`}
                                    >
                                        <View className="items-center justify-center mr-4 pr-4 border-r border-slate-50 dark:border-slate-800 min-w-[70px]">
                                            <Text className="text-[10px] font-black text-slate-400 uppercase">{slot.time.split(' - ')[0]}</Text>
                                            <View className="h-4 w-[1px] bg-slate-100 dark:bg-slate-800 my-1" />
                                            <Text className="text-[10px] font-black text-slate-400 uppercase">{slot.time.split(' - ')[1]}</Text>
                                        </View>

                                        <View className="flex-1">
                                            <View className="flex-row items-center mb-1">
                                                <Icon name={info.icon} size={16} className={`${info.color} mr-1.5`} />
                                                <Text className={`text-base font-black ${isFree ? 'text-slate-400' : 'text-slate-800 dark:text-slate-100'}`} numberOfLines={1}>
                                                    {slot.subject}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Badge label={slot.class} variant="info" size="sm" />
                                                {!isFree && (
                                                    <View className="flex-row items-center ml-3">
                                                        <Icon name="door-open" size={12} className="text-slate-400 mr-1" />
                                                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Room {slot.room}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>

                                        {!isFree && <Icon name="chevron-right" size={20} className="text-slate-300 dark:text-slate-700" />}
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })
                    ) : (
                        <View className="py-20 items-center">
                            <View className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900 items-center justify-center mb-4">
                                <Icon name="calendar-blank-outline" size={40} className="text-slate-300 dark:text-slate-700" />
                            </View>
                            <Text className="text-slate-500 dark:text-slate-400 font-bold">No lectures scheduled today</Text>
                            <Text className="text-slate-400 dark:text-slate-500 text-xs mt-1">Enjoy your free time!</Text>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>
        </View>
    );
};

export default TimetableScreen;
