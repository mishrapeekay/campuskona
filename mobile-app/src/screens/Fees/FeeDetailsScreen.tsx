import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

const FeeDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const student = {
    name: 'John Doe',
    class: 'Class X-A',
    rollNo: 'STU-2024-001',
    totalFee: 60000,
    totalPaid: 40000,
    totalPending: 20000,
  };

  const feeItems = [
    { name: 'Tuition Fee (Jan)', amount: 5000, paid: 5000, dueDate: '2024-01-10', status: 'paid' },
    { name: 'Tuition Fee (Feb)', amount: 5000, paid: 5000, dueDate: '2024-02-10', status: 'paid' },
    { name: 'Tuition Fee (Mar)', amount: 5000, paid: 0, dueDate: '2024-03-10', status: 'pending' },
    { name: 'Transport Fee (Q1)', amount: 7500, paid: 7500, dueDate: '2024-01-15', status: 'paid' },
    { name: 'Transport Fee (Q2)', amount: 7500, paid: 0, dueDate: '2024-04-15', status: 'upcoming' },
    { name: 'Lab Fee', amount: 1500, paid: 1500, dueDate: '2024-01-20', status: 'paid' },
    { name: 'Library Fee', amount: 500, paid: 500, dueDate: '2024-01-20', status: 'paid' },
    { name: 'Exam Fee (Mid-Term)', amount: 1000, paid: 0, dueDate: '2024-02-01', status: 'overdue' },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid': return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', label: 'Paid' };
      case 'pending': return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', label: 'Pending' };
      case 'overdue': return { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', label: 'Overdue' };
      case 'upcoming': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', label: 'Upcoming' };
      default: return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', label: status };
    }
  };

  const paidPercentage = Math.round((student.totalPaid / student.totalFee) * 100);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header
        title="Fee Details"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Summary Card */}
        <View className="m-6 p-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <View className="flex-row items-center mb-8">
            <View className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 justify-center items-center mr-5 border border-indigo-100 dark:border-indigo-800/30">
              <Text className="text-xl font-black text-indigo-600 dark:text-indigo-400">{student.name.charAt(0)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-black text-slate-900 dark:text-white">{student.name}</Text>
              <Text className="text-slate-500 dark:text-slate-400 font-medium mt-1">{student.class} | {student.rollNo}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mb-8">
            <View className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <View className="h-full bg-emerald-500 rounded-full" style={{ width: `${paidPercentage}%` }} />
            </View>
            <Text className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-3 text-right uppercase tracking-widest">{paidPercentage}% Paid</Text>
          </View>

          <View className="flex-row justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
            <View className="items-center">
              <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Fee</Text>
              <Text className="text-lg font-black text-slate-900 dark:text-white mt-1">₹{student.totalFee.toLocaleString()}</Text>
            </View>
            <View className="items-center">
              <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Paid</Text>
              <Text className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">₹{student.totalPaid.toLocaleString()}</Text>
            </View>
            <View className="items-center">
              <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pending</Text>
              <Text className="text-lg font-black text-rose-600 dark:text-rose-400 mt-1">₹{student.totalPending.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Fee Items */}
        <View className="px-6">
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-6">Fee Breakdown</Text>
          {feeItems.map((item, index) => {
            const config = getStatusConfig(item.status);
            return (
              <View
                key={index}
                className="bg-white dark:bg-slate-900 rounded-[28px] p-6 mb-4 border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none"
              >
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-base font-black text-slate-900 dark:text-white flex-1">{item.name}</Text>
                  <View className={`px-4 py-1.5 rounded-xl ${config.bg}`}>
                    <Text className={`text-[10px] font-black uppercase tracking-widest ${config.text}`}>{config.label}</Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-end">
                  <Text className="text-xl font-black text-slate-900 dark:text-white">₹{item.amount.toLocaleString()}</Text>
                  <Text className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Due: {item.dueDate}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Pay Now Button */}
        {student.totalPending > 0 && (
          <View className="px-6 mt-6">
            <TouchableOpacity
              className="flex-row items-center justify-center bg-indigo-600 h-16 rounded-[24px] shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-all"
              onPress={() => navigation.navigate('PaymentGateway', { amount: student.totalPending })}
            >
              <Icon name="credit-card-outline" size={24} color="white" />
              <Text className="ml-3 text-white font-black uppercase tracking-widest text-sm">Pay ₹{student.totalPending.toLocaleString()}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default FeeDetailsScreen;
