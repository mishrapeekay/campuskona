import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';
import { transportService } from '@/services/api';

interface RouteStop {
  id: string;
  stop_name: string;
  stop_time: string;
  address: string;
  latitude: number;
  longitude: number;
  sequence: number;
}

interface BusRoute {
  id: string;
  route_number: string;
  route_name: string;
  bus_number: string;
  driver_name: string;
  driver_phone: string;
  conductor_name?: string;
  total_stops: number;
  total_distance: number;
  start_time: string;
  end_time: string;
  stops: RouteStop[];
  total_students: number;
  status: 'active' | 'inactive' | 'on_route';
}

const TransportRoutesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const response = await transportService.getRoutes();
      const apiRoutes = response.results;

      const mappedRoutes: BusRoute[] = apiRoutes.map(r => ({
        id: r.id,
        route_number: r.name,
        route_name: `${r.start_point} - ${r.end_point}`,
        bus_number: r.vehicle || 'Unassigned',
        driver_name: r.driver || 'Unassigned',
        driver_phone: '',
        total_stops: 0,
        total_distance: 0,
        start_time: '07:00 AM',
        end_time: '08:00 AM',
        total_students: 0,
        status: r.is_active ? 'active' : 'inactive',
        stops: []
      }));

      setRoutes(mappedRoutes);
    } catch (error) {
      console.error('Failed to load routes:', error);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRoutes();
    setRefreshing(false);
  };

  const handleRoutePress = (route: BusRoute) => {
    navigation.navigate('RouteDetail', { routeId: route.id });
  };

  const handleTrackBus = (routeId: string) => {
    navigation.navigate('BusTracking', { routeId });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active': return { icon: 'check-circle', color: 'text-emerald-600', label: 'Active', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
      case 'inactive': return { icon: 'close-circle', color: 'text-rose-600', label: 'Inactive', bg: 'bg-rose-50 dark:bg-rose-900/20' };
      case 'on_route': return { icon: 'map-marker-path', color: 'text-blue-600', label: 'On Route', bg: 'bg-blue-50 dark:bg-blue-900/20' };
      default: return { icon: 'help-circle', color: 'text-slate-400', label: 'Unknown', bg: 'bg-slate-100' };
    }
  };

  const renderRouteItem = ({ item }: { item: BusRoute }) => {
    const statusConfig = getStatusConfig(item.status);

    return (
      <TouchableOpacity
        onPress={() => handleRoutePress(item)}
        className="bg-white dark:bg-slate-900 rounded-[32px] p-6 mb-5 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98]"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center mb-6">
          <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${statusConfig.bg}`}>
            <Icon name="bus-school" size={28} className={statusConfig.color} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-lg font-black text-indigo-600 dark:text-indigo-400">{item.route_number}</Text>
              <View className={`flex-row items-center px-2 py-0.5 rounded-lg ${statusConfig.bg} gap-1`}>
                <Icon name={statusConfig.icon} size={10} className={statusConfig.color} />
                <Text className={`text-[8px] font-black uppercase tracking-tighter ${statusConfig.color}`}>{statusConfig.label}</Text>
              </View>
            </View>
            <Text className="text-base font-black text-slate-900 dark:text-slate-100" numberOfLines={1}>{item.route_name}</Text>
            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tighter">Registration: {item.bus_number}</Text>
          </View>
        </View>

        <View className="flex-row justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6">
          {[
            { label: 'Distance', value: `${item.total_distance} km`, icon: 'map-marker-distance' },
            { label: 'Stops', value: item.total_stops, icon: 'map-marker-multiple' },
            { label: 'Students', value: item.total_students, icon: 'account-group' },
          ].map((stat, idx) => (
            <View key={idx} className="items-center">
              <Icon name={stat.icon} size={16} className="text-slate-400 dark:text-slate-500 mb-1" />
              <Text className="text-[10px] font-black text-slate-900 dark:text-slate-100">{stat.value}</Text>
              <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{stat.label}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row items-center justify-between pt-5 border-t border-slate-50 dark:border-slate-800 mb-5">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Icon name="account-hard-hat" size={16} className="text-slate-300 dark:text-slate-600" />
              <Text className="text-xs font-black text-slate-900 dark:text-slate-100">{item.driver_name}</Text>
            </View>
            {item.driver_phone ? (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.driver_phone}`)} className="flex-row items-center gap-2 ml-6">
                <Icon name="phone" size={14} className="text-emerald-600" />
                <Text className="text-xs font-bold text-emerald-600">{item.driver_phone}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <View className="items-end">
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Icon name="clock-start" size={14} className="text-emerald-500" />
              <Text className="text-[10px] font-black text-slate-900 dark:text-slate-100">START {item.start_time}</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Icon name="clock-end" size={14} className="text-rose-500" />
              <Text className="text-[10px] font-black text-slate-900 dark:text-slate-100">END {item.end_time}</Text>
            </View>
          </View>
        </View>

        {item.status === 'on_route' && (
          <TouchableOpacity
            onPress={() => handleTrackBus(item.id)}
            className="flex-row items-center justify-center py-4 bg-rose-600 rounded-2xl gap-2 active:scale-95 transition-all shadow-lg shadow-rose-200 dark:shadow-none"
          >
            <Icon name="map-marker-path" size={20} color="white" />
            <Text className="text-sm font-black text-white uppercase tracking-widest">Track Bus Live</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Routes" showBackButton onBackPress={() => navigation.goBack()} />
      <View className="flex-1">
        {/* Summary Card */}
        <View className="m-6 bg-indigo-600 rounded-[32px] p-6 shadow-lg shadow-indigo-200 dark:shadow-none">
          <View className="flex-row justify-around">
            {[
              { label: 'Total Routes', value: routes.length, color: 'text-white' },
              { label: 'On Route', value: routes.filter(r => r.status === 'on_route').length, color: 'text-indigo-100' },
              { label: 'Active', value: routes.filter(r => r.status === 'active').length, color: 'text-indigo-100' },
            ].map((sum, idx) => (
              <View key={idx} className="items-center">
                <Text className={`text-2xl font-black ${sum.color}`}>{sum.value}</Text>
                <Text className="text-[10px] font-black text-white/60 mt-1 uppercase tracking-widest">{sum.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Routes List */}
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          renderItem={renderRouteItem}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Icon name="bus-off" size={80} className="text-slate-200 dark:text-slate-800" />
              <Text className="text-base font-black text-slate-400 dark:text-slate-600 mt-6 uppercase tracking-widest text-center">No Routes Available</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default TransportRoutesScreen;
