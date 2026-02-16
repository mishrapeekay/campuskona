import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    TextInput,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, isAfter, parseISO } from 'date-fns';
import Animated, { FadeInRight, FadeInUp, Layout } from 'react-native-reanimated';

import { useAppSelector } from '@/store/hooks';
import { assignmentService } from '@/services/api';
import { Assignment } from '@/services/api/assignment.service';
import { AcademicsStackParamList } from '@/types/navigation';
import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card, Badge, LoadingSpinner } from '@/components/ui';

type NavigationProp = NativeStackNavigationProp<AcademicsStackParamList, 'AssignmentsList'>;

const AssignmentsScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { user } = useAppSelector((state) => state.auth);

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'OVERDUE'>('ALL');

    const fetchAssignments = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const response = await assignmentService.getAssignments();
            if (response && 'results' in response) {
                setAssignments(response.results || []);
            } else if (Array.isArray(response)) {
                setAssignments(response);
            } else {
                setAssignments([]);
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setAssignments([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAssignments(true);
    };

    const filteredAssignments = (assignments || []).filter((item) => {
        if (!item) return false;
        const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        if (filter === 'ALL') return true;
        const dueDate = parseISO(item.due_date);
        const isOverdue = isAfter(new Date(), dueDate);
        if (filter === 'OVERDUE') return isOverdue;
        if (filter === 'ACTIVE') return !isOverdue;
        return true;
    });

    const renderAssignmentItem = ({ item, index }: { item: Assignment; index: number }) => {
        const dueDate = parseISO(item.due_date);
        const isOverdue = isAfter(new Date(), dueDate);

        return (
            <Animated.View entering={FadeInUp.delay(index * 50).duration(600)} layout={Layout.springify()}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: item.id })}
                    className="bg-white dark:bg-slate-900 mx-5 mb-5 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none"
                >
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1 mr-4">
                            <Text className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[2px] mb-1">{item.subject_details?.name || 'Academic Unit'}</Text>
                            <Text className="text-xl font-black text-slate-900 dark:text-slate-100 leading-7" numberOfLines={2}>{item.title}</Text>
                        </View>
                        <View className={`px-3 py-1 rounded-full ${isOverdue ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30'}`}>
                            <Text className={`text-[8px] font-black uppercase tracking-widest ${isOverdue ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {isOverdue ? 'Expired' : 'Active'}
                            </Text>
                        </View>
                    </View>

                    <Text className="text-slate-500 dark:text-slate-400 text-sm leading-6 mb-6" numberOfLines={2}>
                        {item.description}
                    </Text>

                    <View className="flex-row justify-between items-center pt-5 border-t border-slate-50 dark:border-slate-800">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 items-center justify-center mr-3">
                                <Icon name="calendar-clock" size={16} className="text-slate-400" />
                            </View>
                            <View>
                                <Text className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Deadline</Text>
                                <Text className="text-xs font-black text-slate-700 dark:text-slate-200">{format(dueDate, 'MMM dd, HH:mm')}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/30 items-center justify-center mr-2">
                                <Icon name="account-tie-outline" size={14} className="text-indigo-600" />
                            </View>
                            <Text className="text-[10px] font-black text-slate-500 uppercase">{item.teacher_details?.full_name?.split(' ')[0] || 'Admin'}</Text>
                        </View>
                    </View>

                    {user?.user_type === 'TEACHER' && (
                        <View className="mt-5 flex-row items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                            <View className="flex-row items-center">
                                <Icon name="file-document-multiple-outline" size={14} className="text-slate-400 mr-2" />
                                <Text className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{item.submission_count || 0} Submissions</Text>
                            </View>
                            <Icon name="chevron-right" size={16} className="text-slate-300" />
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <ScreenWrapper>
            <Header
                title="Academic Tasks"
                subtitle="Project Roadmap"
                rightComponent={user?.user_type === 'TEACHER' ? (
                    <TouchableOpacity
                        className="bg-indigo-600 w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none"
                        onPress={() => navigation.navigate('CreateAssignment', {})}
                    >
                        <Icon name="plus" size={24} color="white" />
                    </TouchableOpacity>
                ) : undefined}
            />

            <View className="flex-1 bg-slate-50 dark:bg-slate-950">
                {/* Modern Filter Hub */}
                <View className="bg-white dark:bg-slate-900 pt-2 pb-6 shadow-sm shadow-slate-100 dark:shadow-none">
                    <View className="px-5 mb-4">
                        <View className="bg-slate-50 dark:bg-slate-800 flex-row items-center px-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <Icon name="magnify" size={20} className="text-slate-400" />
                            <TextInput
                                className="flex-1 py-4 ml-2 text-sm text-slate-900 dark:text-slate-100 font-bold"
                                placeholder="Search repository..."
                                placeholderTextColor="#94A3B8"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                        {(['ALL', 'ACTIVE', 'OVERDUE'] as const).map((f) => (
                            <TouchableOpacity
                                key={f}
                                className={`px-6 py-2.5 rounded-2xl ${filter === f ? 'bg-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-800'}`}
                                onPress={() => setFilter(f)}
                            >
                                <Text className={`text-[10px] font-black uppercase tracking-[2px] ${filter === f ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {f}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <FlatList
                    data={filteredAssignments}
                    renderItem={renderAssignmentItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingVertical: 20, paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                    }
                    ListEmptyComponent={
                        loading ? (
                            <View className="flex-1 items-center justify-center pt-20">
                                <Text className="text-slate-400 font-bold uppercase tracking-[4px] text-[10px]">Syncing Tasks...</Text>
                            </View>
                        ) : (
                            <View className="items-center justify-center pt-20 px-10">
                                <View className="w-20 h-20 rounded-[28px] bg-slate-100 dark:bg-slate-900 items-center justify-center mb-6">
                                    <Icon name="clipboard-check-outline" size={40} className="text-slate-300" />
                                </View>
                                <Text className="text-xl font-black text-slate-900 dark:text-slate-100">Clean Slate</Text>
                                <Text className="text-slate-400 text-sm text-center mt-2">No active assignments found matching your current filter.</Text>
                            </View>
                        )
                    }
                />
            </View>
        </ScreenWrapper>
    );
};

export default AssignmentsScreen;
