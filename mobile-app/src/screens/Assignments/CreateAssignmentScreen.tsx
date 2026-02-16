import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import Animated, { FadeInUp, FadeInDown, FadeIn, Layout, SlideInRight } from 'react-native-reanimated';

import { assignmentService, academicService } from '@/services/api';
import { AcademicsStackParamList } from '@/types/navigation';
import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card, Button, LoadingSpinner } from '@/components/ui';

type NavigationProp = NativeStackNavigationProp<AcademicsStackParamList, 'CreateAssignment'>;
type ScreenRouteProp = RouteProp<AcademicsStackParamList, 'CreateAssignment' | 'EditAssignment'>;

const CreateAssignmentScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { assignmentId } = (route.params as any) || {};
    const isEditing = !!assignmentId;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000));
    const [maxMarks, setMaxMarks] = useState('100');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [subjects, setSubjects] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [subjRes, sectRes] = await Promise.all([
                    academicService.getSubjects(),
                    academicService.getSections()
                ]);
                setSubjects(subjRes.results || []);
                setSections(sectRes.results || []);

                if (isEditing) {
                    const assignment = await assignmentService.getAssignment(assignmentId);
                    setTitle(assignment.title);
                    setDescription(assignment.description);
                    setSubjectId(assignment.subject);
                    setSectionId(assignment.section);
                    setDueDate(new Date(assignment.due_date));
                    setMaxMarks(assignment.max_marks.toString());
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isEditing, assignmentId]);

    const handleSave = async () => {
        if (!title || !subjectId || !sectionId) {
            Alert.alert('Protocol Error', 'Core data nodes (Title, Subject, Section) must be specified.');
            return;
        }

        setSubmitting(true);
        try {
            const data = {
                title,
                description,
                subject: subjectId,
                section: sectionId,
                due_date: dueDate.toISOString(),
                max_marks: parseFloat(maxMarks),
                status: 'PUBLISHED',
            };

            if (isEditing) {
                await assignmentService.updateAssignment(assignmentId, data);
                Alert.alert('Mission Updated', 'The academic task has been synchronized across the node network.', [{ text: 'Acknowledge', onPress: () => navigation.goBack() }]);
            } else {
                await assignmentService.createAssignment(data);
                Alert.alert('Mission Published', 'The task is now live for all designated students.', [{ text: 'Acknowledge', onPress: () => navigation.goBack() }]);
            }
        } catch (error) {
            Alert.alert('Sync Failed', 'Unable to broadcast task to the server.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <ScreenWrapper>
            <Header title={isEditing ? 'Modify Task' : 'New Project'} subtitle="Broadcast academic requirements" showBackButton />

            <ScrollView
                className="flex-1 bg-slate-50 dark:bg-slate-950"
                contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Identification Section */}
                <Animated.View entering={FadeInUp.duration(600)} className="mb-8">
                    <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 px-1">Identification</Text>
                    <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] p-8">
                        <View className="mb-8">
                            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Manifest Title *</Text>
                            <TextInput
                                className="text-slate-900 dark:text-slate-100 text-lg font-black border-b border-slate-100 dark:border-slate-800 pb-2"
                                placeholder="Enter project designation..."
                                placeholderTextColor="#94A3B8"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        <View>
                            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Operational Spec</Text>
                            <TextInput
                                className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-6"
                                placeholder="Detail the task requirements..."
                                placeholderTextColor="#94A3B8"
                                multiline
                                numberOfLines={4}
                                value={description}
                                onChangeText={setDescription}
                                textAlignVertical="top"
                            />
                        </View>
                    </Card>
                </Animated.View>

                {/* Target Distribution */}
                <Animated.View entering={FadeInUp.delay(200).duration(800)} className="mb-8">
                    <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 px-1">Target Distribution</Text>

                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Subject Node *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-5 px-5">
                        {subjects.map(s => (
                            <TouchableOpacity
                                key={s.id}
                                onPress={() => setSubjectId(s.id)}
                                className={`px-6 py-3 rounded-2xl mr-3 ${subjectId === s.id ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800'}`}
                            >
                                <Text className={`text-[10px] font-black uppercase tracking-widest ${subjectId === s.id ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>{s.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Section Hub *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2 -mx-5 px-5">
                        {sections.map(s => (
                            <TouchableOpacity
                                key={s.id}
                                onPress={() => setSectionId(s.id)}
                                className={`px-6 py-3 rounded-2xl mr-3 ${sectionId === s.id ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800'}`}
                            >
                                <Text className={`text-[10px] font-black uppercase tracking-widest ${sectionId === s.id ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>{s.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* Constraints */}
                <Animated.View entering={FadeInUp.delay(400).duration(800)} className="mb-10">
                    <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 px-1">Constraints</Text>
                    <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] p-8">
                        <View className="flex-row justify-between mb-8">
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-1 mr-4">
                                <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Deadline Date</Text>
                                <View className="flex-row items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <Icon name="calendar-lock" size={18} className="text-indigo-600 mr-2" />
                                    <Text className="text-base font-black text-slate-800 dark:text-slate-100">{format(dueDate, 'MMM dd, yyyy')}</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setShowTimePicker(true)} className="flex-1">
                                <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Cut-off Time</Text>
                                <View className="flex-row items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <Icon name="clock-end" size={18} className="text-indigo-600 mr-2" />
                                    <Text className="text-base font-black text-slate-800 dark:text-slate-100">{format(dueDate, 'HH:mm')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Maximum Marks</Text>
                            <View className="flex-row items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                                <Icon name="shield-star-outline" size={18} className="text-amber-500 mr-2" />
                                <TextInput
                                    className="text-base font-black text-slate-800 dark:text-slate-100"
                                    value={maxMarks}
                                    onChangeText={setMaxMarks}
                                    keyboardType="numeric"
                                    placeholder="100"
                                />
                            </View>
                        </View>
                    </Card>
                </Animated.View>

                {showDatePicker && (
                    <DateTimePicker
                        value={dueDate}
                        mode="date"
                        minimumDate={new Date()}
                        onChange={(e, d) => { setShowDatePicker(false); if (d) setDueDate(new Date(dueDate.setFullYear(d.getFullYear(), d.getMonth(), d.getDate()))); }}
                    />
                )}

                {showTimePicker && (
                    <DateTimePicker
                        value={dueDate}
                        mode="time"
                        onChange={(e, d) => { setShowTimePicker(false); if (d) setDueDate(new Date(dueDate.setHours(d.getHours(), d.getMinutes()))); }}
                    />
                )}

                <Button
                    title={submitting ? 'Broadcasting...' : (isEditing ? 'Update Manifest' : 'Launch Assignment')}
                    onPress={handleSave}
                    loading={submitting}
                    disabled={submitting}
                    size="lg"
                    className="rounded-[32px] shadow-2xl shadow-indigo-200 dark:shadow-none mb-10"
                />
            </ScrollView>
        </ScreenWrapper>
    );
};

export default CreateAssignmentScreen;
