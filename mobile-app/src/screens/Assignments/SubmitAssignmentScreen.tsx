import React, { useState } from 'react';
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
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';

import { assignmentService } from '@/services/api';
import { AcademicsStackParamList } from '@/types/navigation';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card, Button, LoadingSpinner } from '@/components/ui';

type NavigationProp = NativeStackNavigationProp<AcademicsStackParamList, 'SubmitAssignment'>;
type ScreenRouteProp = RouteProp<AcademicsStackParamList, 'SubmitAssignment'>;

const SubmitAssignmentScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { assignmentId } = route.params;

    const [notes, setNotes] = useState('');
    const [file, setFile] = useState<DocumentPickerResponse | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handlePickDocument = async () => {
        try {
            const res = await DocumentPicker.pickSingle({
                type: [DocumentPicker.types.allFiles],
            });
            setFile(res);
        } catch (err) {
            if (!DocumentPicker.isCancel(err)) {
                console.error('Picker Error: ', err);
            }
        }
    };

    const handleSubmit = async () => {
        if (!file && !notes) {
            Alert.alert('Protocol Exception', 'Submit either digital assets or explanatory logs.');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('assignment', assignmentId);
            formData.append('student_notes', notes);
            if (file) {
                formData.append('submission_file', {
                    uri: file.uri,
                    type: file.type || 'application/octet-stream',
                    name: file.name || 'submission',
                } as any);
            }
            await assignmentService.submitAssignment(formData);
            Alert.alert('Transmission Successful', 'Your academic data has been securely uploaded to the central repository.', [
                { text: 'Acknowledge', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Sync Failure', 'Unable to transmit data nodes to the server.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitting) return <LoadingSpinner fullScreen text="Encrypting & Transmitting..." />;

    return (
        <ScreenWrapper>
            <Header title="Mission Dispatch" subtitle="Transmit project assets" showBackButton />

            <ScrollView
                className="flex-1 bg-slate-50 dark:bg-slate-950"
                contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInUp.duration(600)} className="mb-8">
                    <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 px-1">Digital Assets</Text>
                    <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] p-8">
                        {file ? (
                            <Animated.View entering={FadeInDown.duration(400)} className="bg-indigo-50 dark:bg-indigo-950/30 p-6 rounded-3xl flex-row items-center border border-indigo-100 dark:border-indigo-900/40">
                                <View className="w-14 h-14 rounded-2xl bg-indigo-600 items-center justify-center mr-4">
                                    <Icon name="file-upload-outline" size={28} color="white" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-widest" numberOfLines={1}>{file.name}</Text>
                                    <Text className="text-[10px] font-bold text-indigo-400 mt-0.5">{(file.size! / 1024).toFixed(0)} KB READY FOR SYNC</Text>
                                </View>
                                <TouchableOpacity
                                    className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/30 items-center justify-center"
                                    onPress={() => setFile(null)}
                                >
                                    <Icon name="close-circle-outline" size={24} className="text-rose-500" />
                                </TouchableOpacity>
                            </Animated.View>
                        ) : (
                            <TouchableOpacity
                                className="w-full py-16 items-center justify-center border-2 border-dashed border-indigo-200 dark:border-slate-800 rounded-[32px] bg-indigo-50/50 dark:bg-slate-900"
                                onPress={handlePickDocument}
                            >
                                <View className="w-20 h-20 rounded-[32px] bg-white dark:bg-slate-800 items-center justify-center mb-6 shadow-xl shadow-indigo-100 dark:shadow-none">
                                    <Icon name="cloud-upload-outline" size={32} className="text-indigo-600" />
                                </View>
                                <Text className="text-base font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-widest">Select Archive</Text>
                                <Text className="text-[10px] font-bold text-indigo-400 mt-2 uppercase">PDF • DOCX • IMAGES (MAX 10MB)</Text>
                            </TouchableOpacity>
                        )}
                    </Card>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(300).duration(800)} className="mb-10">
                    <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 px-1">Transmission Logs</Text>
                    <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] p-8">
                        <TextInput
                            className="text-slate-800 dark:text-slate-100 text-sm font-medium leading-6"
                            placeholder="Type explanatory notes for the evaluator..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={4}
                            value={notes}
                            onChangeText={setNotes}
                            textAlignVertical="top"
                        />
                    </Card>
                </Animated.View>

                <Button
                    title={submitting ? 'Transmitting...' : 'Finalize Dispatch'}
                    onPress={handleSubmit}
                    loading={submitting}
                    disabled={!file && !notes}
                    size="lg"
                    className="rounded-[32px] shadow-2xl shadow-indigo-200 dark:shadow-none mb-10"
                />

                <Text className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[2px] mt-6 mb-10 leading-5">
                    ALL DATA TRANSMISSIONS ARE ENCRYPTED{"\n"}ADHERE TO ACADEMIC INTEGRITY STANDARDS
                </Text>
            </ScrollView>
        </ScreenWrapper>
    );
};

export default SubmitAssignmentScreen;
