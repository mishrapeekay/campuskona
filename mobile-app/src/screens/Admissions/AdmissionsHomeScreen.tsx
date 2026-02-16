/**
 * AdmissionsHomeScreen - Dashboard for managing online admissions
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const AdmissionsHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const stats = [
    { label: 'Total Applications', value: '245', icon: 'file-document-multiple', color: '#4F46E5', trend: '+12 this week' },
    { label: 'Pending Review', value: '38', icon: 'clock-outline', color: '#F59E0B', trend: '5 urgent' },
    { label: 'Approved', value: '186', icon: 'check-circle', color: '#10B981', trend: '92% rate' },
    { label: 'Rejected', value: '21', icon: 'close-circle', color: '#EF4444', trend: '8.5%' },
  ];

  const quickActions = [
    { label: 'New Admission', icon: 'plus-circle', route: 'NewAdmission', color: '#4F46E5' },
    { label: 'Applications', icon: 'file-document', route: 'ApplicationList', color: '#7C3AED' },
    { label: 'Enquiries', icon: 'help-circle', route: 'EnquiryList', color: '#3B82F6' },
    { label: 'Settings', icon: 'cog', route: 'AdmissionSettings', color: '#64748B' },
  ];

  const recentApplications = [
    { id: '1', name: 'Aarav Sharma', class: 'Class V', date: '28 Jan 2025', status: 'pending', avatar: 'A' },
    { id: '2', name: 'Priya Patel', class: 'Class VIII', date: '27 Jan 2025', status: 'approved', avatar: 'P' },
    { id: '3', name: 'Rohan Gupta', class: 'Class III', date: '26 Jan 2025', status: 'under_review', avatar: 'R' },
    { id: '4', name: 'Ananya Singh', class: 'Class I', date: '25 Jan 2025', status: 'pending', avatar: 'A' },
    { id: '5', name: 'Vikram Joshi', class: 'Class X', date: '24 Jan 2025', status: 'rejected', avatar: 'V' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', label: 'Pending' };
      case 'approved': return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', label: 'Approved' };
      case 'rejected': return { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', label: 'Rejected' };
      case 'under_review': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', label: 'Under Review' };
      default: return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', label: status };
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-8">
          <View>
            <Text className="text-3xl font-bold text-slate-900 dark:text-slate-100">Admissions</Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1">Academic Year 2024-25</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center bg-indigo-600 px-4 py-2.5 rounded-xl gap-2 shadow-sm shadow-indigo-200"
            onPress={() => navigation.navigate('NewAdmission')}
          >
            <Icon name="plus" size={20} color="#FFFFFF" />
            <Text className="text-sm font-bold text-white">New</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap px-4 gap-4">
          {stats.map((stat, index) => (
            <TouchableOpacity key={index} className="w-[47%] bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
              <View
                className="w-10 h-10 rounded-xl justify-center items-center mb-3"
                style={{ backgroundColor: stat.color + '15' }}
              >
                <Icon name={stat.icon} size={22} color={stat.color} />
              </View>
              <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</Text>
              <Text className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase font-semibold">{stat.label}</Text>
              <Text className="text-[10px] font-bold mt-2" style={{ color: stat.color }}>{stat.trend}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="mt-8 px-4">
          <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</Text>
          <View className="flex-row justify-between">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                className="items-center w-[23%]"
                onPress={() => navigation.navigate(action.route)}
              >
                <View
                  className="w-14 h-14 rounded-2xl justify-center items-center mb-2"
                  style={{ backgroundColor: action.color + '15' }}
                >
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-medium text-center">{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Admission Funnel */}
        <View className="mt-8 px-4">
          <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Admission Funnel</Text>
          <View className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            {[
              { stage: 'Enquiries', count: 320, width: '100%', color: '#93C5FD' },
              { stage: 'Applications', count: 245, width: '76%', color: '#60A5FA' },
              { stage: 'Document Verified', count: 210, width: '65%', color: '#3B82F6' },
              { stage: 'Approved', count: 186, width: '58%', color: '#2563EB' },
              { stage: 'Enrolled', count: 172, width: '53%', color: '#1D4ED8' },
            ].map((stage, index) => (
              <View key={index} className="mb-4">
                <View className="flex-row justify-between items-center mb-1.5">
                  <Text className="text-sm font-medium text-slate-900 dark:text-slate-100">{stage.stage}</Text>
                  <Text className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stage.count}</Text>
                </View>
                <View className="h-2 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                  <View className="h-full rounded-full" style={{ width: `${stage.width}` as any, backgroundColor: stage.color }} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Applications */}
        <View className="mt-8 px-4 mb-10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Applications</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ApplicationList')}>
              <Text className="text-sm font-medium text-indigo-600 dark:text-indigo-400">View All</Text>
            </TouchableOpacity>
          </View>
          {recentApplications.map((app) => {
            const statusStyle = getStatusStyle(app.status);
            return (
              <TouchableOpacity
                key={app.id}
                className="flex-row items-center bg-white dark:bg-slate-900 rounded-2xl p-4 mb-3 shadow-sm border border-slate-100 dark:border-slate-800"
                onPress={() => navigation.navigate('ApplicationDetail', { applicationId: app.id })}
              >
                <View className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 justify-center items-center mr-4">
                  <Text className="text-base font-bold text-indigo-600 dark:text-indigo-400">{app.avatar}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-slate-900 dark:text-slate-100">{app.name}</Text>
                  <Text className="text-xs text-slate-400 dark:text-slate-500 mt-1">{app.class} | Applied: {app.date}</Text>
                </View>
                <View className={`px-2.5 py-1 rounded-md ${statusStyle.bg}`}>
                  <Text className={`text-[10px] font-bold ${statusStyle.text}`}>{statusStyle.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default AdmissionsHomeScreen;
