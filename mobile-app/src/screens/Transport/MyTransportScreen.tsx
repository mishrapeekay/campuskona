import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '@/components/layout/Header';
import { useNavigation } from '@react-navigation/native';

const MyTransportScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const transport = {
    route: 'Route 1 - North Zone',
    vehicle: 'KA-01-AB-1234',
    vehicleType: 'Bus (40 Seater)',
    driver: 'Ramesh Kumar',
    driverPhone: '+91 98765 43210',
    conductor: 'Mohan Lal',
    conductorPhone: '+91 87654 32109',
    pickupStop: 'Green Valley Apartments',
    pickupTime: '7:15 AM',
    dropStop: 'Green Valley Apartments',
    dropTime: '3:45 PM',
    monthlyFee: '₹2,500',
    feeStatus: 'paid',
  };

  const todayStatus = {
    morning: { status: 'completed', time: '7:18 AM', label: 'Picked Up' },
    evening: { status: 'pending', time: '3:45 PM', label: 'Scheduled' },
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="My Transport" showBackButton onBackPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Today's Status */}
        <View className="bg-white dark:bg-slate-900 m-4 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-6">Today's Transport</Text>
          <View className="flex-row gap-4">
            {[
              { ...todayStatus.morning, title: 'Morning Pickup' },
              { ...todayStatus.evening, title: 'Evening Drop' },
            ].map((item, idx) => (
              <View
                key={idx}
                className={`flex-1 items-center p-5 rounded-3xl ${item.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-slate-50 dark:bg-slate-800/50'}`}
              >
                <Icon
                  name={item.status === 'completed' ? 'check-circle' : 'clock-outline'}
                  size={32}
                  className={item.status === 'completed' ? 'text-emerald-600' : 'text-slate-300 dark:text-slate-600'}
                />
                <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center mt-3 uppercase tracking-tighter">{item.title}</Text>
                <Text className={`text-sm font-black mt-1 ${item.status === 'completed' ? 'text-emerald-600' : 'text-slate-400 dark:text-slate-600'}`}>
                  {item.label}
                </Text>
                <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">{item.time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Route Details */}
        <View className="bg-white dark:bg-slate-900 mx-4 mb-4 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 items-center justify-center mr-3">
              <Icon name="map-marker-path" size={22} className="text-indigo-600" />
            </View>
            <Text className="text-base font-black text-slate-900 dark:text-slate-100">Route Details</Text>
          </View>

          <View className="pl-2">
            {/* Start Stop */}
            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-full bg-emerald-600 items-center justify-center z-10">
                <Icon name="map-marker" size={16} color="white" />
              </View>
              <View className="flex-1 ml-4 -mt-1">
                <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Pickup Stop</Text>
                <Text className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">{transport.pickupStop}</Text>
                <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Morning: {transport.pickupTime}</Text>
              </View>
            </View>

            {/* Connecting Line */}
            <View className="w-0.5 h-12 bg-indigo-100 dark:bg-indigo-900/30 ml-[15px] my-1" />

            {/* School Stop */}
            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-full bg-indigo-600 items-center justify-center z-10">
                <Icon name="school" size={16} color="white" />
              </View>
              <View className="flex-1 ml-4 -mt-1">
                <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">School</Text>
                <Text className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">School Campus</Text>
                <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Arrival: 8:15 AM</Text>
              </View>
            </View>
          </View>

          <View className="mt-8 pt-5 border-t border-slate-50 dark:border-slate-800 flex-row justify-between items-center">
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500">Route</Text>
            <Text className="text-sm font-black text-slate-900 dark:text-slate-100">{transport.route}</Text>
          </View>
        </View>

        {/* Vehicle & Driver */}
        <View className="bg-white dark:bg-slate-900 mx-4 mb-4 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/10 items-center justify-center mr-3">
              <Icon name="bus" size={22} className="text-amber-600" />
            </View>
            <Text className="text-base font-black text-slate-900 dark:text-slate-100">Vehicle & Driver</Text>
          </View>

          <View className="flex-row items-center mb-5">
            <View className="w-12 h-12 rounded-full bg-indigo-600 items-center justify-center mr-4">
              <Icon name="account-hard-hat" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-black text-slate-900 dark:text-slate-100">{transport.driver}</Text>
              <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Driver</Text>
            </View>
            <TouchableOpacity className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-900/10 items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
              <Icon name="phone" size={20} className="text-emerald-600" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mb-6">
            <View className="w-12 h-12 rounded-full bg-amber-500 items-center justify-center mr-4">
              <Icon name="account" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-black text-slate-900 dark:text-slate-100">{transport.conductor}</Text>
              <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Conductor</Text>
            </View>
            <TouchableOpacity className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-900/10 items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
              <Icon name="phone" size={20} className="text-emerald-600" />
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-8 pt-5 border-t border-slate-50 dark:border-slate-800">
            <View>
              <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Vehicle No.</Text>
              <Text className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1">{transport.vehicle}</Text>
            </View>
            <View>
              <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Type</Text>
              <Text className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1">{transport.vehicleType}</Text>
            </View>
          </View>
        </View>

        {/* Fee Info */}
        <View className="bg-white dark:bg-slate-900 mx-4 mb-4 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-900/10 items-center justify-center mr-3">
              <Icon name="currency-inr" size={22} className="text-rose-600" />
            </View>
            <Text className="text-base font-black text-slate-900 dark:text-slate-100">Transport Fee</Text>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm font-bold text-slate-500 dark:text-slate-400">Monthly Fee</Text>
            <Text className="text-xl font-black text-slate-900 dark:text-slate-100">{transport.monthlyFee}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-bold text-slate-500 dark:text-slate-400">Payment Status</Text>
            <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <Icon name="check-circle" size={16} className="text-emerald-600" />
              <Text className="text-xs font-black text-emerald-600 ml-2 uppercase tracking-tighter">Paid</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MyTransportScreen;
