import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

interface Route {
  id: string;
  name: string;
  stops: number;
  students: number;
  vehicle: string;
  driver: string;
  startTime: string;
  endTime: string;
  distance: string;
  status: 'active' | 'inactive';
}

const RouteListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');

  const routes: Route[] = [
    { id: '1', name: 'Route 1 - North Zone', stops: 8, students: 35, vehicle: 'KA-01-AB-1234', driver: 'Ramesh Kumar', startTime: '7:00 AM', endTime: '8:30 AM', distance: '15 km', status: 'active' },
    { id: '2', name: 'Route 2 - South Zone', stops: 10, students: 28, vehicle: 'KA-01-CD-5678', driver: 'Suresh Patel', startTime: '7:15 AM', endTime: '8:45 AM', distance: '18 km', status: 'active' },
    { id: '3', name: 'Route 3 - East Zone', stops: 6, students: 32, vehicle: 'KA-01-EF-9012', driver: 'Vikram Singh', startTime: '7:00 AM', endTime: '8:15 AM', distance: '12 km', status: 'active' },
    { id: '4', name: 'Route 4 - West Zone', stops: 9, students: 25, vehicle: 'KA-01-GH-3456', driver: 'Arun Das', startTime: '7:30 AM', endTime: '9:00 AM', distance: '20 km', status: 'inactive' },
  ];

  const filteredRoutes = routes.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.driver.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRouteItem = ({ item }: { item: Route }) => (
    <TouchableOpacity
      className="bg-white dark:bg-slate-900 rounded-[28px] p-5 mb-4 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98]"
      onPress={() => navigation.navigate('RouteDetail', { routeId: item.id })}
    >
      <View className="flex-row items-center mb-5">
        <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${item.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-slate-50 dark:bg-slate-800'}`}>
          <Icon name="map-marker-path" size={24} className={item.status === 'active' ? 'text-emerald-600' : 'text-slate-400'} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-black text-slate-900 dark:text-slate-100">{item.name}</Text>
          <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">{item.stops} stops • {item.distance}</Text>
        </View>
        <View className={`px-2.5 py-1 rounded-lg ${item.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-slate-50 dark:bg-slate-800'}`}>
          <Text className={`text-[10px] font-black uppercase tracking-tighter ${item.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View className="pt-5 border-t border-slate-50 dark:border-slate-800">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center flex-1">
            <Icon name="bus" size={16} className="text-slate-300 dark:text-slate-600 mr-2" />
            <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.vehicle}</Text>
          </View>
          <View className="flex-row items-center flex-1">
            <Icon name="account-hard-hat" size={16} className="text-slate-300 dark:text-slate-600 mr-2" />
            <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.driver}</Text>
          </View>
        </View>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <Icon name="account-group" size={16} className="text-slate-300 dark:text-slate-600 mr-2" />
            <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.students} students</Text>
          </View>
          <View className="flex-row items-center bg-indigo-50 dark:bg-indigo-900/10 px-3 py-1.5 rounded-xl">
            <Icon name="clock-outline" size={14} className="text-indigo-600 mr-2" />
            <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{item.startTime} - {item.endTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Transport Routes" showBackButton onBackPress={() => navigation.goBack()} />

      <View className="px-6 py-4">
        <View className="flex-row items-center bg-white dark:bg-slate-900 h-14 px-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200 dark:shadow-none">
          <Icon name="magnify" size={22} className="text-slate-400 dark:text-slate-500 mr-3" />
          <TextInput
            className="flex-1 text-slate-900 dark:text-slate-100 font-medium"
            placeholder="Search routes or drivers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <FlatList
        data={filteredRoutes}
        keyExtractor={(item) => item.id}
        renderItem={renderRouteItem}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Icon name="bus-off" size={64} className="text-slate-200 dark:text-slate-800" />
            <Text className="text-base font-black text-slate-900 dark:text-slate-100 mt-6 uppercase tracking-widest">No Routes Found</Text>
            <Text className="text-sm font-medium text-slate-400 dark:text-slate-600 mt-2">Try adjusting your search query</Text>
          </View>
        }
      />
    </View>
  );
};

export default RouteListScreen;
