import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

const CreateNoticeScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [audience, setAudience] = useState<'all' | 'students' | 'parents' | 'staff'>('all');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Error', 'Please enter a description');
            return;
        }

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            Alert.alert('Success', 'Notice created successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to create notice. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const PriorityButton: React.FC<{
        level: 'low' | 'medium' | 'high';
        label: string;
        color: string;
        bgColor: string;
        borderColor: string;
    }> = ({ level, label, color, bgColor, borderColor }) => {
        const isSelected = priority === level;
        return (
            <TouchableOpacity
                onPress={() => setPriority(level)}
                className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl border ${isSelected ? `${bgColor} ${borderColor}` : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                    } active:scale-95 transition-all shadow-sm`}
            >
                <Icon
                    name={isSelected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                    size={18}
                    className={isSelected ? color : 'text-slate-400 dark:text-slate-500'}
                />
                <Text className={`ml-2 text-[10px] font-black uppercase tracking-widest ${isSelected ? color : 'text-slate-500 dark:text-slate-400'}`}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    const AudienceButton: React.FC<{
        type: 'all' | 'students' | 'parents' | 'staff';
        label: string;
        icon: string;
    }> = ({ type, label, icon }) => {
        const isSelected = audience === type;
        return (
            <TouchableOpacity
                onPress={() => setAudience(type)}
                className={`flex-row items-center px-6 py-3 rounded-xl border ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                    } active:scale-95 transition-all shadow-sm`}
            >
                <Icon
                    name={icon}
                    size={18}
                    color={isSelected ? 'white' : '#94a3b8'}
                />
                <Text className={`ml-2 text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-950">
            <Header
                title="Create Notice"
                showBackButton
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <View className="p-6">
                    <View className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                        {/* Title */}
                        <View className="mb-8">
                            <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-4">Title *</Text>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl text-slate-900 dark:text-slate-100 font-bold text-sm border border-slate-100 dark:border-slate-700"
                                placeholder="Enter notice title"
                                value={title}
                                onChangeText={setTitle}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        {/* Description */}
                        <View className="mb-8">
                            <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-4">Description *</Text>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl text-slate-900 dark:text-slate-100 font-medium text-sm border border-slate-100 dark:border-slate-700"
                                placeholder="Enter notice description"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        {/* Priority */}
                        <View className="mb-8">
                            <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-4">Priority</Text>
                            <View className="flex-row gap-3">
                                <PriorityButton
                                    level="low"
                                    label="Low"
                                    color="text-emerald-600"
                                    bgColor="bg-emerald-50 dark:bg-emerald-900/20"
                                    borderColor="border-emerald-200 dark:border-emerald-800"
                                />
                                <PriorityButton
                                    level="medium"
                                    label="Medium"
                                    color="text-amber-600"
                                    bgColor="bg-amber-50 dark:bg-amber-900/20"
                                    borderColor="border-amber-200 dark:border-amber-800"
                                />
                                <PriorityButton
                                    level="high"
                                    label="High"
                                    color="text-rose-600"
                                    bgColor="bg-rose-50 dark:bg-rose-900/20"
                                    borderColor="border-rose-200 dark:border-rose-800"
                                />
                            </View>
                        </View>

                        {/* Audience */}
                        <View className="mb-10">
                            <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-4">Send To</Text>
                            <View className="flex-row flex-wrap gap-3">
                                <AudienceButton type="all" label="Everyone" icon="account-group" />
                                <AudienceButton type="students" label="Students" icon="school" />
                                <AudienceButton type="parents" label="Parents" icon="account-supervisor" />
                                <AudienceButton type="staff" label="Staff" icon="account-tie" />
                            </View>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            className={`flex-row items-center justify-center py-5 rounded-[24px] ${loading ? 'bg-slate-200 dark:bg-slate-800' : 'bg-indigo-600'
                                } shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-all`}
                        >
                            {loading ? (
                                <Text className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-xs">Publishing...</Text>
                            ) : (
                                <>
                                    <Icon name="send" size={18} color="white" />
                                    <Text className="ml-2 text-white font-black uppercase tracking-widest text-xs">Publish Notice</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default CreateNoticeScreen;
