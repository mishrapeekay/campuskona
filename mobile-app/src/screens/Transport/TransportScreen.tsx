import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Header from '@/components/layout/Header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const TransportScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Transport" subtitle="School Management System" />
      <ScrollView className="flex-1">
        <View className="p-6 items-center justify-center pt-20">
          <View className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-900/20 items-center justify-center mb-6">
            <Icon name="bus-school" size={48} className="text-indigo-600" />
          </View>
          <Text className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">Transport Services</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-center font-medium leading-5 mb-10 px-4">
            Manage school bus routes, track vehicles in real-time, and monitor transport attendance.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('TransportHome')}
            className="w-full bg-indigo-600 py-4 rounded-2xl items-center shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Text className="text-white font-black uppercase tracking-widest">Enter Transport Hub</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default TransportScreen;
