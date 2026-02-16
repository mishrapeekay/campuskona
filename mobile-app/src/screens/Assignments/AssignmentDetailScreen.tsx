import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, parseISO } from 'date-fns';
import Animated, { FadeInUp, FadeInDown, FadeIn, Layout } from 'react-native-reanimated';

import { useAppSelector } from '@/store/hooks';
import { assignmentService } from '@/services/api';
import { Assignment, Submission } from '@/services/api/assignment.service';
import { AcademicsStackParamList } from '@/types/navigation';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card, Button, LoadingSpinner } from '@/components/ui';

type NavigationProp = NativeStackNavigationProp<AcademicsStackParamList, 'AssignmentDetail'>;
type ScreenRouteProp = RouteProp<AcademicsStackParamList, 'AssignmentDetail'>;

const AssignmentDetailScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { assignmentId } = route.params;
    const { user } = useAppSelector((state) => state.auth);

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [mySubmission, setMySubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const assignmentRes = await assignmentService.getAssignment(assignmentId);
                setAssignment(assignmentRes);

                if (user?.user_type === 'TEACHER') {
                    const response = await assignmentService.getSubmissions({ assignment: assignmentId });
                    const results = (response && 'results' in response) ? response.results : (Array.isArray(response) ? response : []);
                    setSubmissions(results);
                } else if (user?.user_type === 'STUDENT') {
                    const response = await assignmentService.getSubmissions({
                        assignment: assignmentId,
                        student: user.id
                    });
                    const results = (response && 'results' in response) ? response.results : (Array.isArray(response) ? response : []);
                    if (results && results.length > 0) {
                        setMySubmission(results[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching assignment details:', error);
                Alert.alert('Error', 'Could not load assignment details.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [assignmentId, user]);

    const handleDownloadAttachment = () => {
        if (assignment?.attachment) {
            Linking.openURL(assignment.attachment);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;
    if (!assignment) return null;

    const dueDate = parseISO(assignment.due_date);

    return (
        <ScreenWrapper>
            <Header title="Project Manifest" subtitle="Detailed mission spec" showBackButton />

            <ScrollView
                className="flex-1 bg-slate-50 dark:bg-slate-950"
                contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Card */}
                <Animated.View entering={FadeInUp.duration(600)} className="mb-8">
                    <Card className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200 dark:shadow-none overflow-hidden">
                        <View className="bg-indigo-600 p-8">
                            <View className="flex-row justify-between items-center mb-6">
                                <View className="bg-white/20 px-3 py-1 rounded-full">
                                    <Text className="text-white text-[8px] font-black uppercase tracking-widest">{assignment.subject_details?.name || 'Academic Unit'}</Text>
                                </View>
                                <View className={`px-3 py-1 rounded-full ${assignment.status === 'PUBLISHED' ? 'bg-emerald-400' : 'bg-amber-400'}`}>
                                    <Text className="text-white text-[8px] font-black uppercase tracking-widest">{assignment.status}</Text>
                                </View>
                            </View>
                            <Text className="text-white text-3xl font-black italic mb-4 leading-9">{assignment.title}</Text>
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
                                    <Icon name="account-tie" size={16} color="white" />
                                </View>
                                <Text className="text-indigo-100 text-xs font-bold">Administered by {assignment.teacher_details?.full_name}</Text>
                            </View>
                        </View>

                        <View className="p-8">
                            <View className="flex-row gap-4 mb-8">
                                <View className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <Icon name="calendar-clock-outline" size={18} className="text-indigo-600 mb-2" />
                                    <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Engage Before</Text>
                                    <Text className="text-sm font-black text-slate-900 dark:text-slate-100">{format(dueDate, 'MMM dd, HH:mm')}</Text>
                                </View>
                                <View className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <Icon name="shield-check-outline" size={18} className="text-amber-500 mb-2" />
                                    <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Yield</Text>
                                    <Text className="text-sm font-black text-slate-900 dark:text-slate-100">{assignment.max_marks} Points</Text>
                                </View>
                            </View>

                            <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Scope</Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-sm leading-7 mb-8 px-1">
                                {assignment.description}
                            </Text>

                            {assignment.attachment && (
                                <TouchableOpacity
                                    className="bg-indigo-50 dark:bg-indigo-950/20 p-5 rounded-3xl flex-row items-center border border-indigo-100 dark:border-indigo-900/40"
                                    onPress={handleDownloadAttachment}
                                >
                                    <View className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 items-center justify-center mr-4">
                                        <Icon name="file-pdf-box" size={28} className="text-indigo-600 dark:text-indigo-400" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-widest">Download Assets</Text>
                                        <Text className="text-[9px] font-bold text-indigo-400 mt-0.5">SUPPORTING DOCUMENTATION</Text>
                                    </View>
                                    <Icon name="download-circle-outline" size={24} className="text-indigo-600" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </Card>
                </Animated.View>

                {user?.user_type === 'STUDENT' && (
                    <Animated.View entering={FadeInDown.delay(300).duration(800)}>
                        {mySubmission ? (
                            <Card className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-none">
                                <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 px-1">Your Submission Logs</Text>
                                <View className="flex-row justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl mb-6">
                                    <View>
                                        <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Verification Status</Text>
                                        <Text className={`text-sm font-black ${mySubmission.status === 'GRADED' ? 'text-emerald-600' : 'text-amber-600'}`}>{mySubmission.status}</Text>
                                    </View>
                                    <Icon name={mySubmission.status === 'GRADED' ? "check-decagram" : "progress-clock"} size={24} className={mySubmission.status === 'GRADED' ? 'text-emerald-600' : 'text-amber-600'} />
                                </View>

                                {mySubmission.status === 'GRADED' && (
                                    <View className="bg-emerald-600 p-8 rounded-[32px] items-center mb-4">
                                        <Text className="text-emerald-200/60 text-[10px] font-black uppercase tracking-[3px] mb-4">Performance Index</Text>
                                        <Text className="text-white text-5xl font-black italic">
                                            {mySubmission.marks_obtained}
                                            <Text className="text-xl text-white/30 italic"> / {assignment.max_marks}</Text>
                                        </Text>

                                        {mySubmission.teacher_feedback && (
                                            <View className="mt-8 pt-6 border-t border-white/10 w-full">
                                                <Text className="text-emerald-100 font-bold text-xs uppercase tracking-widest mb-3">Auditor Remarks:</Text>
                                                <Text className="text-white text-sm italic font-medium leading-6">"{mySubmission.teacher_feedback}"</Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </Card>
                        ) : (
                            <TouchableOpacity
                                className="bg-indigo-600 p-6 rounded-[32px] items-center justify-center flex-row shadow-2xl shadow-indigo-200 dark:shadow-none"
                                onPress={() => navigation.navigate('SubmitAssignment', { assignmentId: assignment.id })}
                            >
                                <Icon name="cloud-upload-outline" size={24} color="white" className="mr-3" />
                                <Text className="text-white font-black text-lg uppercase tracking-widest">Finalize Submission</Text>
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                )}

                {user?.user_type === 'TEACHER' && (
                    <Animated.View entering={FadeInDown.delay(300).duration(800)}>
                        <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 px-1">Submissions List</Text>
                        {submissions.length > 0 ? (
                            <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] overflow-hidden">
                                {submissions.map((sub, idx) => (
                                    <TouchableOpacity
                                        key={sub.id}
                                        className={`p-6 flex-row items-center border-b border-slate-50 dark:border-slate-800 ${idx === submissions.length - 1 ? 'border-b-0' : ''}`}
                                        onPress={() => navigation.navigate('GradeSubmission', { submissionId: sub.id })}
                                    >
                                        <View className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center mr-4">
                                            <Icon name="account-details-outline" size={24} className="text-slate-400" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-sm font-black text-slate-800 dark:text-slate-100">{sub.student_details?.full_name}</Text>
                                            <Text className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{sub.status}</Text>
                                        </View>
                                        <Icon name="chevron-right" size={20} className="text-slate-300" />
                                    </TouchableOpacity>
                                ))}
                            </Card>
                        ) : (
                            <View className="bg-slate-100 dark:bg-slate-900/50 p-12 rounded-[40px] items-center">
                                <Icon name="folder-open-outline" size={40} className="text-slate-300 mb-4" />
                                <Text className="text-slate-400 font-bold uppercase tracking-widest text-xs">No entries detected</Text>
                            </View>
                        )}
                    </Animated.View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

export default AssignmentDetailScreen;
