import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

interface StudentFee {
  id: string;
  name: string;
  class: string;
  totalFee: string;
  paid: string;
  pending: string;
  status: 'paid' | 'partial' | 'overdue';
}

const StudentFeeListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');

  const students: StudentFee[] = [
    { id: '1', name: 'John Doe', class: 'X-A', totalFee: '₹60,000', paid: '₹60,000', pending: '₹0', status: 'paid' },
    { id: '2', name: 'Jane Smith', class: 'IX-B', totalFee: '₹55,000', paid: '₹35,000', pending: '₹20,000', status: 'partial' },
    { id: '3', name: 'Alex Brown', class: 'XI-A', totalFee: '₹65,000', paid: '₹20,000', pending: '₹45,000', status: 'overdue' },
    { id: '4', name: 'Sarah Wilson', class: 'VIII-C', totalFee: '₹50,000', paid: '₹50,000', pending: '₹0', status: 'paid' },
    { id: '5', name: 'Mike Johnson', class: 'X-B', totalFee: '₹60,000', paid: '₹40,000', pending: '₹20,000', status: 'partial' },
  ];

  const getStatusConfig = (status: string) => {
    const configs: any = {
      paid: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Paid', icon: 'check-circle' },
      partial: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Partial', icon: 'circle-half-full' },
      overdue: { color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', label: 'Overdue', icon: 'alert-circle' },
    };
    return configs[status] || configs.partial;
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.class.toLowerCase().includes(search.toLowerCase()));

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Student Fees" />

      <View className="px-6 py-4">
        <View className="flex-row items-center bg-white dark:bg-slate-900 px-4 h-14 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <Icon name="magnify" size={20} className="text-slate-400" />
          <TextInput
            className="flex-1 ml-3 text-slate-900 dark:text-white font-bold"
            placeholder="Search students..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const config = getStatusConfig(item.status);
          return (
            <TouchableOpacity
              className="bg-white dark:bg-slate-900 rounded-[32px] p-6 mb-6 border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none active:scale-[0.98] transition-all"
              onPress={() => navigation.navigate('FeeDetails', { studentId: item.id })}
            >
              <View className="flex-row items-center mb-6">
                <View className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-900/20 items-center justify-center mr-4 border border-indigo-100 dark:border-indigo-800/30">
                  <Text className="text-lg font-black text-indigo-600 dark:text-indigo-400">{item.name.charAt(0)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-black text-slate-900 dark:text-white">{item.name}</Text>
                  <Text className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Class {item.class}</Text>
                </View>
                <View className={`px-3 py-1.5 rounded-xl ${config.bg} flex-row items-center`}>
                  <Icon name={config.icon} size={12} className={config.color} />
                  <Text className={`ml-1.5 text-[8px] font-black uppercase tracking-widest ${config.color}`}>{config.label}</Text>
                </View>
              </View>

              <View className="flex-row bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/30">
                <View className="flex-1 items-center">
                  <Text className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total</Text>
                  <Text className="text-sm font-black text-slate-900 dark:text-white mt-1">{item.totalFee}</Text>
                </View>
                <View className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                <View className="flex-1 items-center">
                  <Text className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Paid</Text>
                  <Text className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">{item.paid}</Text>
                </View>
                <View className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                <View className="flex-1 items-center">
                  <Text className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pending</Text>
                  <Text className={`text-sm font-black mt-1 ${item.status === 'overdue' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>{item.pending}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default StudentFeeListScreen;
