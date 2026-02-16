/**
 * HRDashboardScreen - Human Resources & Payroll Dashboard
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const HRDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const stats = [
    { label: 'Total Staff', value: '86', icon: 'account-group', color: '#4F46E5' },
    { label: 'Present Today', value: '72', icon: 'account-check', color: '#10B981' },
    { label: 'On Leave', value: '8', icon: 'account-clock', color: '#F59E0B' },
    { label: 'Payroll Due', value: '₹12.5L', icon: 'cash-multiple', color: '#0EA5E9' },
  ];

  const quickActions = [
    { label: 'Staff Directory', icon: 'account-search', route: 'StaffDirectory', color: '#4F46E5' },
    { label: 'Payroll', icon: 'cash', route: 'PayrollDashboard', color: '#10B981' },
    { label: 'Attendance', icon: 'clipboard-check', route: 'StaffAttendance', color: '#7C3AED' },
    { label: 'Leave Mgmt', icon: 'calendar-clock', route: 'StaffLeaveManagement', color: '#F59E0B' },
    { label: 'Departments', icon: 'office-building', route: 'DepartmentList', color: '#F97316' },
    { label: 'Designations', icon: 'card-account-details', route: 'DesignationList', color: '#0EA5E9' },
  ];

  const departmentBreakdown = [
    { name: 'Teaching Staff', count: 45, color: '#4F46E5' },
    { name: 'Administrative', count: 12, color: '#10B981' },
    { name: 'Support Staff', count: 15, color: '#F59E0B' },
    { name: 'Lab Assistants', count: 6, color: '#0EA5E9' },
    { name: 'Transport', count: 8, color: '#7C3AED' },
  ];

  const pendingLeaves = [
    { id: '1', name: 'Mrs. Anita Desai', dept: 'Mathematics', type: 'Casual Leave', days: '2 days', from: '1 Feb', status: 'pending' },
    { id: '2', name: 'Mr. Suresh Rao', dept: 'Physics', type: 'Medical Leave', days: '5 days', from: '3 Feb', status: 'pending' },
    { id: '3', name: 'Ms. Kavita Nair', dept: 'English', type: 'Earned Leave', days: '3 days', from: '5 Feb', status: 'pending' },
  ];

  const payrollSummary = {
    month: 'January 2025',
    totalSalary: '₹12,50,000',
    processed: 72,
    pending: 14,
    deductions: '₹1,85,000',
    netPayable: '₹10,65,000',
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-8 pb-4">
          <Text className="text-3xl font-bold text-slate-900 dark:text-slate-100">HR & Payroll</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1">Staff Management & Compensation</Text>
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

        {/* Payroll Summary */}
        <View className="mt-8 px-4">
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Payroll Summary</Text>
          <View className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center gap-2 mb-6">
              <Icon name="calendar-month" size={20} color="#4F46E5" />
              <Text className="text-base font-bold text-slate-900 dark:text-slate-100">{payrollSummary.month}</Text>
            </View>
            <View className="flex-row flex-wrap gap-3 mb-6">
              <View className="w-[47%] bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <Text className="text-[10px] text-slate-500 font-medium">Gross Salary</Text>
                <Text className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{payrollSummary.totalSalary}</Text>
              </View>
              <View className="w-[47%] bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <Text className="text-[10px] text-slate-500 font-medium">Deductions</Text>
                <Text className="text-sm font-bold text-rose-600 mt-1">{payrollSummary.deductions}</Text>
              </View>
              <View className="w-[47%] bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <Text className="text-[10px] text-slate-500 font-medium">Net Payable</Text>
                <Text className="text-sm font-bold text-emerald-600 mt-1">{payrollSummary.netPayable}</Text>
              </View>
              <View className="w-[47%] bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <Text className="text-[10px] text-slate-500 font-medium">Status</Text>
                <Text className="text-sm font-bold text-blue-600 mt-1">{payrollSummary.processed}/{payrollSummary.processed + payrollSummary.pending} Done</Text>
              </View>
            </View>
            <TouchableOpacity
              className="bg-indigo-600 flex-row items-center justify-center py-3.5 rounded-xl gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
              onPress={() => navigation.navigate('PayrollProcessing')}
            >
              <Icon name="cog-sync" size={20} color="#FFFFFF" />
              <Text className="text-white font-bold">Process Payroll</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Department Breakdown */}
        <View className="mt-8 px-4">
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Staff by Department</Text>
          <View className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            {departmentBreakdown.map((dept, index) => (
              <View key={index} className="flex-row items-center mb-4">
                <View className="w-2.5 h-2.5 rounded-full mr-3" style={{ backgroundColor: dept.color }} />
                <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 w-32">{dept.name}</Text>
                <Text className="text-sm font-bold text-slate-900 dark:text-slate-100 w-10 text-right mr-4">{dept.count}</Text>
                <View className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${(dept.count / 86) * 100}%`, backgroundColor: dept.color }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Pending Leave Requests */}
        <View className="mt-8 px-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">Pending Leave Requests</Text>
            <TouchableOpacity onPress={() => navigation.navigate('StaffLeaveManagement')}>
              <Text className="text-sm font-bold text-indigo-600">View All</Text>
            </TouchableOpacity>
          </View>
          {pendingLeaves.map((leave) => (
            <View key={leave.id} className="flex-row items-center bg-white dark:bg-slate-900 rounded-2xl p-4 mb-3 border border-slate-100 dark:border-slate-800 shadow-sm">
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-900 dark:text-slate-100">{leave.name}</Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">{leave.dept} | {leave.type}</Text>
                <Text className="text-xs font-bold text-indigo-600 mt-1.5">{leave.days} from {leave.from}</Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
                  <Icon name="check" size={20} color="#10B981" />
                </TouchableOpacity>
                <TouchableOpacity className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 items-center justify-center border border-rose-100 dark:border-rose-900/30">
                  <Icon name="close" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HRDashboardScreen;
