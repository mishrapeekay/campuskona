import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const AboutScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, alignItems: 'center' }}>
        {/* App Logo */}
        <View className="items-center my-12">
          <View className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-900/20 justify-center items-center mb-4">
            <Icon name="school" size={48} color="#4F46E5" />
          </View>
          <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">School Management System</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1">Version 1.0.0 (Build 1)</Text>
        </View>

        {/* Links */}
        <View className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <TouchableOpacity
            className="flex-row items-center p-4 gap-4"
            onPress={() => navigation.navigate('Terms')}
          >
            <View className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 items-center justify-center">
              <Icon name="file-document-outline" size={22} color="#4F46E5" />
            </View>
            <Text className="flex-1 text-base font-medium text-slate-900 dark:text-slate-100">Terms of Service</Text>
            <Icon name="chevron-right" size={22} className="text-slate-300 dark:text-slate-700" />
          </TouchableOpacity>

          <View className="h-[1px] bg-slate-100 dark:bg-slate-800 mx-4" />

          <TouchableOpacity
            className="flex-row items-center p-4 gap-4"
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <View className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 items-center justify-center">
              <Icon name="shield-lock-outline" size={22} color="#4F46E5" />
            </View>
            <Text className="flex-1 text-base font-medium text-slate-900 dark:text-slate-100">Privacy Policy</Text>
            <Icon name="chevron-right" size={22} className="text-slate-300 dark:text-slate-700" />
          </TouchableOpacity>

          <View className="h-[1px] bg-slate-100 dark:bg-slate-800 mx-4" />

          <TouchableOpacity
            className="flex-row items-center p-4 gap-4"
            onPress={() => navigation.navigate('Licenses')}
          >
            <View className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 items-center justify-center">
              <Icon name="license" size={22} color="#4F46E5" />
            </View>
            <Text className="flex-1 text-base font-medium text-slate-900 dark:text-slate-100">Open Source Licenses</Text>
            <Icon name="chevron-right" size={22} className="text-slate-300 dark:text-slate-700" />
          </TouchableOpacity>
        </View>

        <Text className="text-sm text-slate-400 dark:text-slate-500 text-center mt-12 leading-5">
          {'\u00A9'} 2024 School Management System{'\n'}All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
};

export default AboutScreen;
