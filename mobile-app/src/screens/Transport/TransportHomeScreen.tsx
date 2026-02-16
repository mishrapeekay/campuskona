import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

const TransportHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const stats = [
    { label: 'Total Routes', value: '12', icon: 'map-marker-path', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Vehicles', value: '18', icon: 'bus', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { label: 'Students', value: '420', icon: 'account-group', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Drivers', value: '18', icon: 'card-account-details', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  const quickActions = [
    { label: 'All Routes', icon: 'map-marker-path', route: 'RouteList', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Vehicles', icon: 'bus-multiple', route: 'VehicleList', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { label: 'Live Tracking', icon: 'map-marker-radius', route: 'BusTracking', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Attendance', icon: 'clipboard-check', route: 'TransportAttendance', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'My Transport', icon: 'bus-school', route: 'MyTransport', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Drivers', icon: 'account-hard-hat', route: 'DriverList', color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  ];

  const activeVehicles = [
    { id: '1', route: 'Route 1 - North', vehicle: 'KA-01-AB-1234', driver: 'Ramesh Kumar', status: 'on_route', students: 35, eta: '8:15 AM' },
    { id: '2', route: 'Route 2 - South', vehicle: 'KA-01-CD-5678', driver: 'Suresh Patel', status: 'on_route', students: 28, eta: '8:20 AM' },
    { id: '3', route: 'Route 3 - East', vehicle: 'KA-01-EF-9012', driver: 'Vikram Singh', status: 'delayed', students: 32, eta: '8:35 AM' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_route': return 'text-emerald-600 dark:text-emerald-400';
      case 'delayed': return 'text-amber-600 dark:text-amber-400';
      case 'stopped': return 'text-rose-600 dark:text-rose-400';
      default: return 'text-slate-400 dark:text-slate-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'on_route': return 'bg-emerald-50 dark:bg-emerald-900/10';
      case 'delayed': return 'bg-amber-50 dark:bg-amber-900/10';
      case 'stopped': return 'bg-rose-50 dark:bg-rose-900/10';
      default: return 'bg-slate-50 dark:bg-slate-900/50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on_route': return 'On Route';
      case 'delayed': return 'Delayed';
      case 'stopped': return 'Stopped';
      default: return 'Unknown';
    }
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Transport" showBackButton onBackPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Stats Grid */}
        <View className="flex-row flex-wrap px-6 pt-6 gap-4">
          {stats.map((stat, index) => (
            <View key={index} className="w-[47%] bg-white dark:bg-slate-900 rounded-[28px] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
              <View className={`w-12 h-12 rounded-2xl justify-center items-center mb-4 ${stat.bg}`}>
                <Icon name={stat.icon} size={24} className={stat.color} />
              </View>
              <Text className="text-2xl font-black text-slate-900 dark:text-slate-100">{stat.value}</Text>
              <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="mt-8 px-6">
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-6">Quick Access</Text>
          <View className="flex-row flex-wrap justify-between bg-white dark:bg-slate-900 p-4 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                className="w-[30%] items-center py-4 active:scale-95 transition-all"
                onPress={() => navigation.navigate(action.route)}
              >
                <View className={`w-14 h-14 rounded-2xl justify-center items-center mb-2 ${action.bg}`}>
                  <Icon name={action.icon} size={28} className={action.color} />
                </View>
                <Text className="text-[10px] text-slate-600 dark:text-slate-300 text-center font-bold px-1" numberOfLines={1}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Active Vehicles */}
        <View className="mt-8 px-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500">Active Vehicles</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BusTracking')} className="active:opacity-60">
              <Text className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">See All</Text>
            </TouchableOpacity>
          </View>

          {activeVehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              className="bg-white dark:bg-slate-900 rounded-[28px] p-5 mb-4 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-all"
              activeOpacity={0.7}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-base font-black text-slate-900 dark:text-slate-100">{vehicle.route}</Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-tighter">Unit: {vehicle.vehicle}</Text>
                </View>
                <View className={`px-2.5 py-1 rounded-lg ${getStatusBg(vehicle.status)}`}>
                  <Text className={`text-[10px] font-black uppercase tracking-tighter ${getStatusColor(vehicle.status)}`}>
                    {getStatusLabel(vehicle.status)}
                  </Text>
                </View>
              </View>

              <View className="flex-row mt-6 pt-5 border-t border-slate-50 dark:border-slate-800 justify-between items-center">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center mr-2">
                    <Icon name="account-hard-hat" size={16} className="text-slate-400 dark:text-slate-500" />
                  </View>
                  <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">{vehicle.driver}</Text>
                </View>

                <View className="flex-row items-center">
                  <Icon name="account-group" size={16} className="text-slate-300 dark:text-slate-600 mr-1" />
                  <Text className="text-xs font-bold text-slate-400 dark:text-slate-500">{vehicle.students}</Text>
                </View>

                <View className="flex-row items-center bg-indigo-50 dark:bg-indigo-900/10 px-3 py-1.5 rounded-xl">
                  <Icon name="clock-outline" size={14} className="text-indigo-600 mr-1.5" />
                  <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">ETA {vehicle.eta}</Text>
                </View>

                <Icon name="chevron-right" size={20} className="text-slate-300 dark:text-slate-600 ml-1" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default TransportHomeScreen;
