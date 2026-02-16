import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  RefreshControl,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Header from '@/components/layout/Header';
import { transportService } from '@/services/api';

type BusTrackingRouteParams = {
  routeId: string;
};

interface BusLocation {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
}

interface NextStop {
  stop_name: string;
  estimated_arrival: string;
  distance_remaining: number;
}

interface BusStatus {
  route_number: string;
  route_name: string;
  bus_number: string;
  driver_name: string;
  driver_phone: string;
  current_location: BusLocation;
  next_stop: NextStop;
  total_stops: number;
  completed_stops: number;
  students_on_board: number;
  expected_school_arrival: string;
  status: 'on_time' | 'delayed' | 'early';
  delay_minutes?: number;
}

const BusTrackingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: BusTrackingRouteParams }, 'params'>>();
  const { routeId } = route.params;

  const [busStatus, setBusStatus] = useState<BusStatus | null>(null);
  const [isTracking, setIsTracking] = useState(true);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadBusStatus();

    const interval = setInterval(() => {
      if (isTracking) {
        updateBusLocation();
      }
    }, 10000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      clearInterval(interval);
    };
  }, [isTracking]);

  const loadBusStatus = async () => {
    setLoading(true);
    try {
      const { route: routeData, stops, students, vehicle, driver } = await transportService.getRouteDetails(routeId);

      let trackingData;
      try {
        trackingData = await transportService.getBusTracking(routeId);
      } catch (e) {
        trackingData = {
          latitude: 28.7041,
          longitude: 77.1025,
          speed: 0,
          heading: 0,
          timestamp: new Date().toISOString(),
          status: 'on_time',
          delay_minutes: 0
        };
      }

      const status: BusStatus = {
        route_number: routeData.name,
        route_name: `${routeData.start_point} - ${routeData.end_point}`,
        bus_number: vehicle?.registration_number || 'Unassigned',
        driver_name: driver?.staff || 'Unassigned',
        driver_phone: driver?.phone_number || '',
        current_location: {
          latitude: trackingData.latitude,
          longitude: trackingData.longitude,
          speed: trackingData.speed,
          heading: trackingData.heading,
          timestamp: trackingData.timestamp,
        },
        next_stop: trackingData.next_stop ? {
          stop_name: trackingData.next_stop.name,
          estimated_arrival: trackingData.next_stop.eta,
          distance_remaining: trackingData.next_stop.distance
        } : {
          stop_name: stops[0]?.name || 'Unknown',
          estimated_arrival: '--:--',
          distance_remaining: 0
        },
        total_stops: stops.length,
        completed_stops: 0,
        students_on_board: students,
        expected_school_arrival: '08:00 AM',
        status: trackingData.status as any,
        delay_minutes: trackingData.delay_minutes,
      };

      setBusStatus(status);
    } catch (error) {
      console.error('Failed to load bus status:', error);
      Alert.alert('Error', 'Failed to load bus tracking information');
    } finally {
      setLoading(false);
    }
  };

  const updateBusLocation = async () => {
    try {
      const trackingData = await transportService.getBusTracking(routeId);

      setBusStatus((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          current_location: {
            ...prev.current_location,
            latitude: trackingData.latitude,
            longitude: trackingData.longitude,
            speed: trackingData.speed,
            heading: trackingData.heading,
            timestamp: trackingData.timestamp,
          },
          status: trackingData.status as any,
          next_stop: trackingData.next_stop ? {
            stop_name: trackingData.next_stop.name,
            estimated_arrival: trackingData.next_stop.eta,
            distance_remaining: trackingData.next_stop.distance
          } : prev.next_stop
        };
      });
    } catch (error) {
      console.log('Failed to update location:', error);
    }
  };

  const handleCallDriver = () => {
    if (!busStatus?.driver_phone) return;
    Linking.openURL(`tel:${busStatus.driver_phone}`);
  };

  const handleToggleTracking = () => {
    setIsTracking(!isTracking);
  };

  const handleRefresh = () => {
    loadBusStatus();
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'on_time': return { icon: 'check-circle', color: 'text-emerald-600', label: 'On Time', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
      case 'delayed': return { icon: 'alert-circle', color: 'text-rose-600', label: 'Delayed', bg: 'bg-rose-50 dark:bg-rose-900/20' };
      case 'early': return { icon: 'clock-fast', color: 'text-blue-600', label: 'Early', bg: 'bg-blue-50 dark:bg-blue-900/20' };
      default: return { icon: 'help-circle', color: 'text-slate-400', label: 'Unknown', bg: 'bg-slate-100 dark:bg-slate-800' };
    }
  };

  if (loading || !busStatus) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-950">
        <Header title="Live Tracking" showBackButton onBackPress={() => navigation.goBack()} />
        <View className="flex-1 items-center justify-center">
          <Icon name="bus-clock" size={80} className="text-slate-200 dark:text-slate-800" />
          <Text className="text-base font-black text-slate-400 dark:text-slate-600 mt-6 uppercase tracking-[3px]">Loading Location...</Text>
        </View>
      </View>
    );
  }

  const statusConfig = getStatusConfig(busStatus.status);
  const progressPercentage = (busStatus.completed_stops / busStatus.total_stops) * 100;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Live Tracking" showBackButton onBackPress={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
      >
        {/* Live Indicator */}
        <View className="flex-row items-center justify-center py-4 gap-3">
          <Animated.View className="w-2.5 h-2.5 rounded-full bg-rose-600" style={{ transform: [{ scale: pulseAnim }] }} />
          <Text className="text-xs font-black text-rose-600 tracking-[2px] uppercase">LIVE TRACKING ACTIVE</Text>
          <TouchableOpacity onPress={handleToggleTracking} className="w-8 h-8 rounded-full bg-rose-600 items-center justify-center active:scale-90">
            <Icon name={isTracking ? 'pause' : 'play'} size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Map Placeholder */}
        <View className="mx-6 overflow-hidden rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm mb-6 bg-white dark:bg-slate-900">
          <View className="h-72 w-full items-center justify-center bg-slate-100 dark:bg-slate-800/50">
            <View className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 items-center justify-center mb-4">
              <Icon name="map-marker-off" size={40} className="text-slate-400 dark:text-slate-500" />
            </View>
            <Text className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest text-center px-8">Map Module Unavailable</Text>
            <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-600 mt-2 text-center px-10">Simulation active. Native map modules require local build environment.</Text>
          </View>
        </View>

        {/* Info Cards Container */}
        <View className="px-6 space-y-4">
          {/* Main Status Card */}
          <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <View className="flex-row justify-between items-start mb-8">
              <View className="flex-1">
                <Text className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{busStatus.route_number}</Text>
                <Text className="text-base font-black text-slate-900 dark:text-slate-100 mt-1">{busStatus.route_name}</Text>
                <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tighter">Registration: {busStatus.bus_number}</Text>
              </View>
              <View className={`flex-row items-center px-3 py-1.5 rounded-xl ${statusConfig.bg} gap-2`}>
                <Icon name={statusConfig.icon} size={16} className={statusConfig.color} />
                <Text className={`text-[10px] font-black uppercase tracking-widest ${statusConfig.color}`}>{statusConfig.label}</Text>
                {busStatus.delay_minutes ? (
                  <View className="h-3 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5" />
                ) : null}
                {busStatus.delay_minutes ? (
                  <Text className={`text-[10px] font-black ${statusConfig.color}`}>+{busStatus.delay_minutes}m</Text>
                ) : null}
              </View>
            </View>

            {/* Progress Section */}
            <View className="pt-6 border-t border-slate-50 dark:border-slate-800">
              <View className="flex-row justify-between items-end mb-3">
                <View>
                  <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Route Progress</Text>
                  <Text className="text-xs font-black text-slate-900 dark:text-slate-100 mt-1">{busStatus.completed_stops} of {busStatus.total_stops} stops completed</Text>
                </View>
                <Text className="text-xl font-black text-indigo-600">{Math.round(progressPercentage)}%</Text>
              </View>
              <View className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <View className="h-full bg-indigo-600 rounded-full" style={{ width: `${progressPercentage}%` }} />
              </View>
            </View>
          </View>

          {/* Next Stop Card */}
          <View className="bg-indigo-600 rounded-[32px] p-6 shadow-lg shadow-indigo-200 dark:shadow-none">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="w-8 h-8 rounded-xl bg-white/20 items-center justify-center">
                <Icon name="map-marker" size={18} color="white" />
              </View>
              <Text className="text-[10px] font-black text-indigo-100 uppercase tracking-[2px]">Next Stop Arrival</Text>
            </View>
            <Text className="text-2xl font-black text-white mb-6" numberOfLines={1}>{busStatus.next_stop.stop_name}</Text>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center bg-white/10 px-4 py-2.5 rounded-2xl">
                <Icon name="clock-outline" size={18} color="white" className="mr-2" />
                <Text className="text-base font-black text-white">ETA {busStatus.next_stop.estimated_arrival}</Text>
              </View>
              <View className="flex-row items-center">
                <Icon name="map-marker-distance" size={18} color="white" className="opacity-60 mr-2" />
                <Text className="text-sm font-bold text-white opacity-80">{busStatus.next_stop.distance_remaining.toFixed(1)} km away</Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row gap-3">
            {[
              { label: 'Boarded', value: busStatus.students_on_board, icon: 'account-group', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
              { label: 'Speed', value: `${Math.round(busStatus.current_location.speed)} km/h`, icon: 'speedometer', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
              { label: 'School ETA', value: busStatus.expected_school_arrival, icon: 'school', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/10' },
            ].map((stat, idx) => (
              <View key={idx} className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-4 items-center border border-slate-100 dark:border-slate-800 shadow-sm">
                <View className={`w-10 h-10 rounded-xl items-center justify-center mb-3 ${stat.bg}`}>
                  <Icon name={stat.icon} size={20} className={stat.color} />
                </View>
                <Text className="text-sm font-black text-slate-900 dark:text-slate-100">{stat.value}</Text>
                <Text className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter text-center mt-1">{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Driver Card */}
          <View className="bg-white dark:bg-slate-900 rounded-[32px] p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <View className="flex-row items-center">
              <View className="w-16 h-16 rounded-[22px] bg-slate-50 dark:bg-slate-800 items-center justify-center mr-4">
                <Icon name="account-tie-hat" size={32} className="text-slate-400 dark:text-slate-500" />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Operator On Duty</Text>
                <Text className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">{busStatus.driver_name}</Text>
                <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">{busStatus.driver_phone}</Text>
              </View>
              <TouchableOpacity
                onPress={handleCallDriver}
                className="w-14 h-14 rounded-2xl bg-emerald-600 items-center justify-center active:scale-95 transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
              >
                <Icon name="phone" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Last Update & Tips */}
          <View className="py-4 items-center">
            <View className="flex-row items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
              <Icon name="update" size={14} className="text-slate-400 dark:text-slate-500 mr-2" />
              <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Last Sync: {new Date(busStatus.current_location.timestamp).toLocaleTimeString('en-IN')}
              </Text>
            </View>

            <View className="flex-row items-center bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-3xl border border-indigo-100 dark:border-indigo-900/20">
              <Icon name="information-outline" size={18} className="text-indigo-600 mr-3" />
              <Text className="flex-1 text-[10px] font-bold text-indigo-600 leading-4">
                Location data is updated in real-time. Power saving mode may affect tracking accuracy.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default BusTrackingScreen;
