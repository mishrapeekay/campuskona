import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
    Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, parseISO } from 'date-fns';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';

import { assignmentService } from '@/services/api';
import { Submission } from '@/services/api/assignment.service';
import { AcademicsStackParamList } from '@/types/navigation';
import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card, Button, LoadingSpinner } from '@/components/ui';

type NavigationProp = NativeStackNavigationProp<AcademicsStackParamList, 'GradeSubmission'>;
type ScreenRouteProp = RouteProp<AcademicsStackParamList, 'GradeSubmission'>;

const GradeSubmissionScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { submissionId } = route.params;

    const [submission, setSubmission] = useState<Submission | null>(null);
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchSubmission = async () => {
            setLoading(true);
            try {
                const res = await assignmentService.getSubmission(submissionId);
                setSubmission(res);
                if (res.marks_obtained) setMarks(res.marks_obtained.toString());
                if (res.teacher_feedback) setFeedback(res.teacher_feedback);
            } catch (error) {
                console.error('Error fetching submission:', error);
                Alert.alert('Protocol Error', 'Unable to retrieve submission data from the node.');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [submissionId]);

    const handleDownloadSubmissionFile = () => {
        if (submission?.submission_file) {
            Linking.openURL(submission.submission_file);
        }
    };

    const handleSaveGrade = async () => {
        if (!marks) {
            Alert.alert('Data Required', 'Evaluation score must be specified before sync.');
            return;
        }

        setSubmitting(true);
        try {
            await assignmentService.gradeSubmission(submissionId, {
                marks_obtained: parseFloat(marks),
                teacher_feedback: feedback,
            });
            Alert.alert('Evaluation Synced', 'The submission has been graded and archived.', [
                { text: 'Acknowledge', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Sync Failure', 'Failed to broadcast evaluation to the central server.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;
    if (!submission) return null;

    return (
        <ScreenWrapper>
            <Header title="Submission Audit" subtitle="Evaluating student performance" showBackButton />

            <ScrollView
                className="flex-1 bg-slate-50 dark:bg-slate-950"
                contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Student Identity */}
                <Animated.View entering={FadeInUp.duration(600)} className="mb-8">
                    <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] p-8 shadow-2xl shadow-slate-200 dark:shadow-none">
                        <View className="flex-row items-center mb-6">
                            <View className="w-16 h-16 rounded-[24px] bg-indigo-50 dark:bg-indigo-950/30 items-center justify-center mr-4">
                                <Icon name="account-search-outline" size={32} className="text-indigo-600 dark:text-indigo-400" />
                            </View>
                            <View>
                                <Text className="text-xl font-black text-slate-900 dark:text-slate-100 italic">{submission.student_details?.full_name}</Text>
                                <Text className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">Student Node ID: {submission.student}</Text>
                            </View>
                        </View>

                        <View className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800">
                            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Project Subject</Text>
                            <Text className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4">{submission.assignment_details?.title}</Text>

                            <View className="flex-row justify-between items-center">
                                <View>
                                    <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Received On</Text>
                                    <Text className="text-xs font-bold text-slate-600 dark:text-slate-400">{format(parseISO(submission.submission_date), 'MMM dd, HH:mm')}</Text>
                                </View>
                                <View className={`px-3 py-1 rounded-full ${submission.status === 'LATE' ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30'}`}>
                                    <Text className={`text-[8px] font-black uppercase tracking-widest ${submission.status === 'LATE' ? 'text-rose-600' : 'text-emerald-600'}`}>{submission.status}</Text>
                                </View>
                            </View>
                        </View>
                    </Card>
                </Animated.View>

                {/* Evidence Section */}
                <Animated.View entering={FadeInUp.delay(200).duration(800)} className="mb-8">
                    <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 px-1">Submission Assets</Text>

                    {submission.student_notes && (
                        <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 mb-4">
                            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Student Log</Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-sm leading-6 italic">"{submission.student_notes}"</Text>
                        </Card>
                    )}

                    {submission.submission_file && (
                        <TouchableOpacity
                            className="bg-indigo-600 p-6 rounded-[32px] flex-row items-center border border-indigo-500 shadow-xl shadow-indigo-100 dark:shadow-none"
                            onPress={handleDownloadSubmissionFile}
                        >
                            <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center mr-4">
                                <Icon name="file-pdf-box" size={28} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-black text-white uppercase tracking-widest">Verify Asset</Text>
                                <Text className="text-[9px] font-bold text-indigo-100 mt-0.5">OPEN SUBMITTED DOCUMENTATION</Text>
                            </View>
                            <Icon name="chevron-right" size={24} color="white" />
                        </TouchableOpacity>
                    )}
                </Animated.View>

                {/* Evaluation Logic */}
                <Animated.View entering={FadeInUp.delay(400).duration(800)} className="mb-10">
                    <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 px-1">Evaluation Matrix</Text>
                    <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] p-8">
                        <View className="mb-8">
                            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Marks (Max: {submission.assignment_details?.max_marks})</Text>
                            <View className="flex-row items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                                <Icon name="shield-star-outline" size={20} className="text-amber-500 mr-2" />
                                <TextInput
                                    className="text-xl font-black text-slate-900 dark:text-slate-100 flex-1"
                                    value={marks}
                                    onChangeText={setMarks}
                                    keyboardType="numeric"
                                    placeholder="00.00"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Auditor Feedback</Text>
                            <TextInput
                                className="text-slate-800 dark:text-slate-100 text-sm font-medium leading-6"
                                placeholder="Provide constructive evaluation logs..."
                                placeholderTextColor="#94A3B8"
                                multiline
                                numberOfLines={4}
                                value={feedback}
                                onChangeText={setFeedback}
                                textAlignVertical="top"
                            />
                        </View>
                    </Card>
                </Animated.View>

                <Button
                    title={submitting ? 'Archiving...' : 'Authorize Evaluation'}
                    onPress={handleSaveGrade}
                    loading={submitting}
                    disabled={submitting}
                    size="lg"
                    className="rounded-[32px] shadow-2xl shadow-indigo-200 dark:shadow-none mb-10"
                />
            </ScrollView>
        </ScreenWrapper>
    );
};

export default GradeSubmissionScreen;
