/**
 * HostelDashboardScreen - Hostel management dashboard
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const HostelDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const stats = [
    { label: 'Total Rooms', value: '120', icon: 'door', color: '#4F46E5' },
    { label: 'Occupied', value: '98', icon: 'bed', color: '#10B981' },
    { label: 'Vacant', value: '22', icon: 'door-open', color: '#0EA5E9' },
    { label: 'Students', value: '285', icon: 'account-group', color: '#7C3AED' },
  ];

  const hostels = [
    { id: '1', name: 'Boys Hostel - Block A', warden: 'Mr. Ramesh Kumar', capacity: 150, occupied: 132, type: 'boys' },
    { id: '2', name: 'Boys Hostel - Block B', warden: 'Mr. Sunil Verma', capacity: 100, occupied: 85, type: 'boys' },
    { id: '3', name: 'Girls Hostel - Block A', warden: 'Mrs. Priya Sharma', capacity: 120, occupied: 68, type: 'girls' },
  ];

  const quickActions = [
    { label: 'Room Allocation', icon: 'bed-outline', route: 'RoomAllocation', color: '#4F46E5' },
    { label: 'Attendance', icon: 'clipboard-check', route: 'HostelAttendance', color: '#10B981' },
    { label: 'Complaints', icon: 'message-alert', route: 'HostelComplaints', color: '#F59E0B' },
    { label: 'Mess Menu', icon: 'food', route: 'MessMenu', color: '#F97316' },
    { label: 'Fees', icon: 'currency-inr', route: 'HostelFees', color: '#0EA5E9' },
    { label: 'Visitors', icon: 'account-arrow-right', route: 'HostelVisitors', color: '#7C3AED' },
  ];

  const recentComplaints = [
    { id: '1', student: 'Rahul M.', room: 'A-205', issue: 'Water leakage in bathroom', status: 'open', time: '2h ago' },
    { id: '2', student: 'Priya S.', room: 'C-108', issue: 'Fan not working', status: 'in_progress', time: '5h ago' },
    { id: '3', student: 'Amit K.', room: 'A-312', issue: 'Window lock broken', status: 'resolved', time: '1d ago' },
  ];

  const complaintStatusConfig: Record<string, { color: string; label: string }> = {
    open: { color: '#EF4444', label: 'Open' },
    in_progress: { color: '#F59E0B', label: 'In Progress' },
    resolved: { color: '#10B981', label: 'Resolved' },
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-8 pb-4">
          <Text className="text-3xl font-bold text-slate-900 dark:text-slate-100">Hostel Management</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1">Overview & Quick Actions</Text>
        </View>

        {/* Stats */}
        <View className="flex-row flex-wrap px-4 gap-3">
          {stats.map((stat, index) => (
            <View key={index} className="w-[47%] bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 items-center">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                style={{ backgroundColor: stat.color + '15' }}
              >
                <Icon name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</Text>
              <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mt-1">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="mt-8 px-4">
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap gap-4">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                className="w-[30%] items-center"
                onPress={() => navigation.navigate(action.route)}
              >
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
                  style={{ backgroundColor: action.color + '15' }}
                >
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center">{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hostels */}
        <View className="mt-8 px-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">Hostels</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HostelList')}>
              <Text className="text-sm font-bold text-indigo-600">View All</Text>
            </TouchableOpacity>
          </View>
          {hostels.map((hostel) => {
            const occupancyPercent = Math.round((hostel.occupied / hostel.capacity) * 100);
            const isHigh = occupancyPercent > 85;
            return (
              <TouchableOpacity
                key={hostel.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 shadow-sm border border-slate-100 dark:border-slate-800"
                onPress={() => navigation.navigate('HostelDetail', { hostelId: hostel.id })}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: hostel.type === 'boys' ? '#4F46E515' : '#EC489915' }}
                  >
                    <Icon name={hostel.type === 'boys' ? 'human-male' : 'human-female'} size={24} color={hostel.type === 'boys' ? '#4F46E5' : '#EC4899'} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-900 dark:text-slate-100">{hostel.name}</Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">Warden: {hostel.warden}</Text>
                  </View>
                  <Icon name="chevron-right" size={22} className="text-slate-300 dark:text-slate-700" />
                </View>
                <View className="flex-row items-center mt-4 gap-4">
                  <View className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${occupancyPercent}%`,
                        backgroundColor: isHigh ? '#F59E0B' : '#10B981'
                      }}
                    />
                  </View>
                  <Text
                    className="text-xs font-bold"
                    style={{ color: isHigh ? '#F59E0B' : '#10B981' }}
                  >
                    {hostel.occupied}/{hostel.capacity} ({occupancyPercent}%)
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recent Complaints */}
        <View className="mt-8 px-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Complaints</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HostelComplaints')}>
              <Text className="text-sm font-bold text-indigo-600">View All</Text>
            </TouchableOpacity>
          </View>
          {recentComplaints.map((complaint) => {
            const config = complaintStatusConfig[complaint.status];
            return (
              <View key={complaint.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-3 border border-slate-100 dark:border-slate-800 shadow-sm">
                <View className="flex-row items-start">
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">{complaint.issue}</Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{complaint.student} | Room {complaint.room} | {complaint.time}</Text>
                  </View>
                  <View
                    className="px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: config.color + '15' }}
                  >
                    <Text
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: config.color }}
                    >
                      {config.label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HostelDashboardScreen;
