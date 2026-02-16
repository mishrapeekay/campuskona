import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

interface Vehicle {
  id: string;
  number: string;
  type: string;
  capacity: number;
  route: string;
  driver: string;
  status: 'active' | 'maintenance' | 'inactive';
  insuranceExpiry: string;
  fitnessExpiry: string;
}

const VehicleListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');

  const vehicles: Vehicle[] = [
    { id: '1', number: 'KA-01-AB-1234', type: 'Bus (40 Seater)', capacity: 40, route: 'Route 1 - North', driver: 'Ramesh Kumar', status: 'active', insuranceExpiry: '2024-12-31', fitnessExpiry: '2024-06-30' },
    { id: '2', number: 'KA-01-CD-5678', type: 'Bus (35 Seater)', capacity: 35, route: 'Route 2 - South', driver: 'Suresh Patel', status: 'active', insuranceExpiry: '2024-11-15', fitnessExpiry: '2024-08-20' },
    { id: '3', number: 'KA-01-EF-9012', type: 'Mini Bus (20 Seater)', capacity: 20, route: 'Route 3 - East', driver: 'Vikram Singh', status: 'maintenance', insuranceExpiry: '2025-01-10', fitnessExpiry: '2024-05-15' },
    { id: '4', number: 'KA-01-GH-3456', type: 'Van (12 Seater)', capacity: 12, route: 'Route 4 - West', driver: 'Arun Das', status: 'inactive', insuranceExpiry: '2024-03-31', fitnessExpiry: '2024-02-28' },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10', label: 'Active', icon: 'check-circle' };
      case 'maintenance': return { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10', label: 'Maintenance', icon: 'wrench' };
      case 'inactive': return { color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/10', label: 'Inactive', icon: 'close-circle' };
      default: return { color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800', label: 'Unknown', icon: 'help-circle' };
    }
  };

  const renderVehicle = ({ item }: { item: Vehicle }) => {
    const statusConfig = getStatusConfig(item.status);
    return (
      <TouchableOpacity
        className="bg-white dark:bg-slate-900 rounded-[28px] p-5 mb-4 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98]"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center mb-5">
          <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${statusConfig.bg}`}>
            <Icon name="bus" size={28} className={statusConfig.color} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-black text-slate-900 dark:text-slate-100">{item.number}</Text>
            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">{item.type}</Text>
          </View>
          <View className={`flex-row items-center px-2.5 py-1 rounded-lg ${statusConfig.bg} gap-1.5`}>
            <Icon name={statusConfig.icon} size={12} className={statusConfig.color} />
            <Text className={`text-[10px] font-black uppercase tracking-tighter ${statusConfig.color}`}>{statusConfig.label}</Text>
          </View>
        </View>

        <View className="pt-5 border-t border-slate-50 dark:border-slate-800">
          <View className="flex-row items-center mb-3">
            <Icon name="map-marker-path" size={16} className="text-slate-300 dark:text-slate-600 mr-2" />
            <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.route}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center flex-1">
              <Icon name="account-hard-hat" size={16} className="text-slate-300 dark:text-slate-600 mr-2" />
              <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.driver}</Text>
            </View>
            <View className="flex-row items-center flex-1">
              <Icon name="seat" size={16} className="text-slate-300 dark:text-slate-600 mr-2" />
              <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.capacity} seats</Text>
            </View>
          </View>
        </View>

        <View className="flex-row mt-5 pt-5 border-t border-slate-50 dark:border-slate-800 gap-6">
          <View>
            <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Insurance Exp.</Text>
            <Text className="text-xs font-black text-slate-900 dark:text-slate-100 mt-1">{item.insuranceExpiry}</Text>
          </View>
          <View>
            <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Fitness Exp.</Text>
            <Text className="text-xs font-black text-slate-900 dark:text-slate-100 mt-1">{item.fitnessExpiry}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Vehicles" showBackButton onBackPress={() => navigation.goBack()} />

      <View className="px-6 py-4">
        <View className="flex-row items-center bg-white dark:bg-slate-900 h-14 px-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200 dark:shadow-none">
          <Icon name="magnify" size={22} className="text-slate-400 dark:text-slate-500 mr-3" />
          <TextInput
            className="flex-1 text-slate-900 dark:text-slate-100 font-medium"
            placeholder="Search vehicles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <FlatList
        data={vehicles.filter(v => v.number.toLowerCase().includes(searchQuery.toLowerCase()) || v.driver.toLowerCase().includes(searchQuery.toLowerCase()))}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicle}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default VehicleListScreen;
