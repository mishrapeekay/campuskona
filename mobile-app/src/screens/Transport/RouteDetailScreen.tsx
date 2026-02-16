import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

const RouteDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const route = {
    name: 'Route 1 - North Zone',
    vehicle: 'KA-01-AB-1234',
    driver: 'Ramesh Kumar',
    driverPhone: '+91 98765 43210',
    startTime: '7:00 AM',
    endTime: '8:30 AM',
    distance: '15 km',
    students: 35,
    status: 'active',
  };

  const stops = [
    { id: '1', name: 'Green Valley Apartments', time: '7:00 AM', students: 5, isFirst: true },
    { id: '2', name: 'MG Road Junction', time: '7:10 AM', students: 4, isFirst: false },
    { id: '3', name: 'Lakeview Colony', time: '7:20 AM', students: 6, isFirst: false },
    { id: '4', name: 'Sunrise Towers', time: '7:30 AM', students: 3, isFirst: false },
    { id: '5', name: 'Central Park', time: '7:40 AM', students: 7, isFirst: false },
    { id: '6', name: 'Hillside Residency', time: '7:50 AM', students: 4, isFirst: false },
    { id: '7', name: 'Railway Station Road', time: '8:00 AM', students: 3, isFirst: false },
    { id: '8', name: 'School Campus', time: '8:15 AM', students: 0, isLast: true },
  ];

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Route Details" showBackButton onBackPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Route Info Card */}
        <View className="bg-white dark:bg-slate-900 m-4 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <View className="flex-row items-center mb-8">
            <View className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 items-center justify-center mr-4">
              <Icon name="map-marker-path" size={28} className="text-emerald-600" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-black text-slate-900 dark:text-slate-100">{route.name}</Text>
              <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">{route.distance} • {route.students} students</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-3">
            {[
              { label: 'Vehicle', value: route.vehicle, icon: 'bus', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/10' },
              { label: 'Driver', value: route.driver, icon: 'account-hard-hat', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/10' },
              { label: 'Pickup', value: route.startTime, icon: 'clock-start', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
              { label: 'Arrival', value: route.endTime, icon: 'clock-end', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/10' },
            ].map((box, idx) => (
              <View key={idx} className={`w-[48%] ${box.bg} rounded-3xl p-4 items-center`}>
                <Icon name={box.icon} size={20} className={box.color} />
                <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-tighter">{box.label}</Text>
                <Text className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1">{box.value}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity className="flex-row items-center justify-center bg-emerald-600 rounded-2xl py-4 mt-6 space-x-2 active:scale-95 transition-all">
            <Icon name="phone" size={20} color="white" className="mr-2" />
            <Text className="text-base font-black text-white uppercase tracking-widest">Call Driver</Text>
          </TouchableOpacity>
        </View>

        {/* Route Stops Timeline */}
        <View className="px-6 mt-6">
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-8">Route Stops ({stops.length})</Text>
          <View>
            {stops.map((stop, index) => (
              <View key={stop.id} className="flex-row min-h-[80px]">
                <View className="w-20 items-end pr-4 pt-1">
                  <Text className="text-sm font-black text-slate-900 dark:text-slate-100">{stop.time}</Text>
                </View>
                <View className="items-center w-8">
                  <View className={`w-8 h-8 rounded-full items-center justify-center z-10 ${stop.isFirst ? 'bg-emerald-600 shadow-lg shadow-emerald-200' : stop.isLast ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700'}`}>
                    <Icon
                      name={stop.isFirst ? 'play-circle' : stop.isLast ? 'flag-checkered' : 'map-marker'}
                      size={16}
                      color={stop.isFirst || stop.isLast ? 'white' : '#6366F1'}
                    />
                  </View>
                  {index < stops.length - 1 && <View className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800 my-1" />}
                </View>
                <View className="flex-1 pl-4 pt-1">
                  <Text className="text-base font-black text-slate-900 dark:text-slate-100">{stop.name}</Text>
                  {stop.students > 0 && (
                    <View className="flex-row items-center mt-1">
                      <Icon name="account-group" size={14} className="text-slate-300 dark:text-slate-600 mr-1.5" />
                      <Text className="text-xs font-bold text-slate-400 dark:text-slate-500">{stop.students} students</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RouteDetailScreen;
