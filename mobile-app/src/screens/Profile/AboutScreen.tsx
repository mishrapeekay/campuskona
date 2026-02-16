import React from 'react';
import {
    View,
    Text,
    ScrollView,
    Linking,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp, FadeInDown, FadeIn } from 'react-native-reanimated';

import { ProfileStackParamList } from '@/types/navigation';
import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card } from '@/components/ui';

const AboutScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

    const handleLinkPress = (url: string) => {
        Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
    };

    return (
        <ScreenWrapper>
            <Header title="Legal & Version" showBackButton />

            <ScrollView
                className="flex-1 bg-slate-50 dark:bg-slate-950"
                contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Brand Showcase */}
                <Animated.View entering={FadeInDown.duration(800)} className="items-center py-12">
                    <View className="w-24 h-24 rounded-[32px] bg-indigo-600 items-center justify-center shadow-2xl shadow-indigo-200 dark:shadow-none mb-8">
                        <Icon name="school" size={48} color="white" />
                    </View>
                    <Text className="text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">Academic Node</Text>
                    <View className="bg-slate-200 dark:bg-slate-800 px-4 py-1 rounded-full mt-3">
                        <Text className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Enterprise v1.0.0</Text>
                    </View>
                </Animated.View>

                {/* Mission Card */}
                <Animated.View entering={FadeInUp.delay(200).duration(800)}>
                    <Card className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-none mb-8">
                        <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4">Core Mission</Text>
                        <Text className="text-slate-500 text-sm leading-6 font-medium">
                            To bridge the gap between educational administration and futuristic technology,
                            ensuring that every node in the academic ecosystem—students, parents, and teachers—has
                            seamless, real-time access to the data that matters most.
                        </Text>
                    </Card>
                </Animated.View>

                {/* Legal Links */}
                <Animated.View entering={FadeInUp.delay(400).duration(800)}>
                    <Card className="bg-white dark:bg-slate-900 overflow-hidden border border-slate-100 dark:border-slate-800 rounded-3xl mb-8">
                        <LegalLink
                            icon="file-document-outline"
                            title="Terms of Service"
                            onPress={() => handleLinkPress('https://schoolmgmt.com/terms')}
                        />
                        <LegalLink
                            icon="shield-check-outline"
                            title="Privacy Protocol"
                            onPress={() => handleLinkPress('https://schoolmgmt.com/privacy')}
                        />
                        <LegalLink
                            icon="script-text-outline"
                            title="Software Licenses"
                            onPress={() => navigation.navigate('Licenses' as any)}
                            isLast
                        />
                    </Card>
                </Animated.View>

                {/* Communication Channels */}
                <Animated.View entering={FadeInUp.delay(600).duration(800)}>
                    <Text className="text-xs font-black text-slate-400 uppercase tracking-[3px] mb-4 text-center">Inquiries & Feedback</Text>
                    <Card className="bg-indigo-600 p-8 rounded-[40px] shadow-xl shadow-indigo-100 dark:shadow-none">
                        <TouchableOpacity
                            onPress={() => handleLinkPress('mailto:node@schoolmgmt.com')}
                            className="flex-row items-center mb-6"
                        >
                            <View className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center mr-4">
                                <Icon name="email-outline" size={20} color="white" />
                            </View>
                            <Text className="text-white font-bold text-sm">node@schoolmgmt.com</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleLinkPress('https://www.schoolmgmt.com')}
                            className="flex-row items-center"
                        >
                            <View className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center mr-4">
                                <Icon name="web" size={20} color="white" />
                            </View>
                            <Text className="text-white font-bold text-sm">platform.schoolmgmt.com</Text>
                        </TouchableOpacity>
                    </Card>
                </Animated.View>

                <Animated.View entering={FadeIn.delay(800).duration(1000)} className="py-12">
                    <Text className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-4 px-10">
                        &copy; {new Date().getFullYear()} ACADEMIC NODE INFRASTRUCTURE INC.{"\n"}
                        ALL SYSTEMS OPERATIONAL
                    </Text>
                </Animated.View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const LegalLink = ({ icon, title, onPress, isLast }: any) => (
    <TouchableOpacity
        onPress={onPress}
        className={`flex-row items-center p-5 ${!isLast ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}
    >
        <Icon name={icon} size={22} className="text-indigo-600 dark:text-indigo-400 mr-4" />
        <Text className="flex-1 text-sm font-bold text-slate-700 dark:text-slate-200">{title}</Text>
        <Icon name="chevron-right" size={18} className="text-slate-300" />
    </TouchableOpacity>
);

export default AboutScreen;
