import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';
import { transportService } from '@/services/api';

interface AttendanceRecord {
  id: string;
  date: string;
  route_number: string;
  route_name: string;
  bus_number: string;
  boarding_time: string;
  boarding_stop: string;
  alighting_time?: string;
  alighting_stop?: string;
  status: 'boarded' | 'completed' | 'absent' | 'missed';
}

interface TransportAlert {
  id: string;
  type: 'delay' | 'breakdown' | 'route_change' | 'cancellation';
  message: string;
  date: string;
  severity: 'high' | 'medium' | 'low';
  read: boolean;
}

type TabType = 'today' | 'history' | 'alerts';

const TransportAttendanceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [alerts, setAlerts] = useState<TransportAlert[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const mockToday: AttendanceRecord[] = [
        {
          id: 'att-1',
          date: new Date().toISOString().split('T')[0],
          route_number: 'R-101',
          route_name: 'Sector 15 - School',
          bus_number: 'DL 1C 1234',
          boarding_time: '07:05 AM',
          boarding_stop: 'Sector 15 Metro Station',
          alighting_time: '08:12 AM',
          alighting_stop: 'School Main Gate',
          status: 'completed',
        },
      ];

      const mockHistory: AttendanceRecord[] = [
        {
          id: 'hist-1',
          date: '2026-01-15',
          route_number: 'R-101',
          route_name: 'Sector 15 - School',
          bus_number: 'DL 1C 1234',
          boarding_time: '07:08 AM',
          boarding_stop: 'Sector 15 Metro Station',
          alighting_time: '08:15 AM',
          alighting_stop: 'School Main Gate',
          status: 'completed',
        },
        {
          id: 'hist-2',
          date: '2026-01-14',
          route_number: 'R-101',
          route_name: 'Sector 15 - School',
          bus_number: 'DL 1C 1234',
          boarding_time: '07:03 AM',
          boarding_stop: 'Sector 15 Metro Station',
          alighting_time: '08:10 AM',
          alighting_stop: 'School Main Gate',
          status: 'completed',
        },
        {
          id: 'hist-3',
          date: '2026-01-13',
          route_number: 'R-101',
          route_name: 'Sector 15 - School',
          bus_number: 'DL 1C 1234',
          boarding_time: '',
          boarding_stop: '',
          status: 'absent',
        },
      ];

      const mockAlerts: TransportAlert[] = [
        {
          id: 'alert-1',
          type: 'delay',
          message: 'Bus R-101 is delayed by 15 minutes due to traffic. Expected arrival: 7:20 AM',
          date: new Date().toISOString(),
          severity: 'medium',
          read: false,
        },
        {
          id: 'alert-2',
          type: 'route_change',
          message: 'Route R-101 will have a temporary diversion via Sector 18 on Jan 20 due to road maintenance.',
          date: '2026-01-15T09:00:00Z',
          severity: 'high',
          read: false,
        },
      ];

      setTodayAttendance(mockToday);
      setHistory(mockHistory);
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'boarded': return { icon: 'bus-clock', color: 'text-blue-600', label: 'Boarded', bg: 'bg-blue-50 dark:bg-blue-900/20' };
      case 'completed': return { icon: 'check-circle', color: 'text-emerald-600', label: 'Completed', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
      case 'absent': return { icon: 'close-circle', color: 'text-rose-600', label: 'Absent', bg: 'bg-rose-50 dark:bg-rose-900/20' };
      case 'missed': return { icon: 'alert-circle', color: 'text-amber-600', label: 'Missed', bg: 'bg-amber-50 dark:bg-amber-900/20' };
      default: return { icon: 'help-circle', color: 'text-slate-400', label: 'Unknown', bg: 'bg-slate-100 dark:bg-slate-800' };
    }
  };

  const getAlertConfig = (type: string) => {
    switch (type) {
      case 'delay': return { icon: 'clock-alert', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' };
      case 'breakdown': return { icon: 'bus-alert', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' };
      case 'route_change': return { icon: 'map-marker-path', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' };
      case 'cancellation': return { icon: 'cancel', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' };
      default: return { icon: 'bell-outline', color: 'text-slate-400', bg: 'bg-slate-100' };
    }
  };

  const handleMarkAlertAsRead = async (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };

  const renderTodayItem = ({ item }: { item: AttendanceRecord }) => {
    const statusConfig = getStatusConfig(item.status);
    return (
      <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 mb-4 shadow-sm border border-slate-100 dark:border-slate-800">
        <View className="flex-row items-start mb-6">
          <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${statusConfig.bg}`}>
            <Icon name="bus-school" size={24} className={statusConfig.color} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.route_number}</Text>
            <Text className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">{item.route_name}</Text>
            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tighter">Bus: {item.bus_number}</Text>
          </View>
          <View className={`flex-row items-center px-2.5 py-1 rounded-lg ${statusConfig.bg} gap-1.5`}>
            <Icon name={statusConfig.icon} size={12} className={statusConfig.color} />
            <Text className={`text-[10px] font-black uppercase tracking-tighter ${statusConfig.color}`}>{statusConfig.label}</Text>
          </View>
        </View>

        {item.status !== 'absent' && (
          <View className="pl-2 space-y-4">
            <View className="flex-row items-start gap-4">
              <View className="w-1 bg-emerald-500 h-full absolute left-1.5 top-2 bottom-0 rounded-full opacity-20" />
              <View className="z-10 mt-1.5">
                <View className="w-4 h-4 rounded-full border-2 border-emerald-500 bg-white dark:bg-slate-900" />
              </View>
              <View>
                <Text className="text-xl font-black text-slate-900 dark:text-slate-100">{item.boarding_time}</Text>
                <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{item.boarding_stop}</Text>
                <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Boarded</Text>
              </View>
            </View>

            {item.alighting_time && (
              <View className="flex-row items-start gap-4">
                <View className="z-10 mt-1.5">
                  <View className="w-4 h-4 rounded-full border-2 border-rose-500 bg-white dark:bg-slate-900" />
                </View>
                <View>
                  <Text className="text-xl font-black text-slate-900 dark:text-slate-100">{item.alighting_time}</Text>
                  <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{item.alighting_stop}</Text>
                  <Text className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-1">Alighted</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderHistoryItem = ({ item }: { item: AttendanceRecord }) => {
    const statusConfig = getStatusConfig(item.status);
    const date = new Date(item.date);
    return (
      <View className="bg-white dark:bg-slate-900 rounded-3xl p-4 mb-3 border border-slate-100 dark:border-slate-800 shadow-sm flex-row items-center">
        <View className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 items-center justify-center mr-4">
          <Text className="text-lg font-black text-indigo-600">{date.getDate()}</Text>
          <Text className="text-[9px] font-black text-indigo-600 uppercase">{date.toLocaleDateString('en-IN', { month: 'short' })}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-black text-slate-900 dark:text-slate-100" numberOfLines={1}>{item.route_number} - {item.route_name}</Text>
          {item.boarding_time ? (
            <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tighter">
              {item.boarding_time} - {item.alighting_time || 'In Progress'}
            </Text>
          ) : (
            <Text className="text-xs font-bold text-rose-500 mt-1 uppercase tracking-tighter">No Activity Recorded</Text>
          )}
        </View>
        <View className={`w-8 h-8 rounded-xl items-center justify-center ${statusConfig.bg}`}>
          <Icon name={statusConfig.icon} size={16} className={statusConfig.color} />
        </View>
      </View>
    );
  };

  const renderAlertItem = ({ item }: { item: TransportAlert }) => {
    const alertConfig = getAlertConfig(item.type);
    return (
      <TouchableOpacity
        onPress={() => !item.read && handleMarkAlertAsRead(item.id)}
        className={`bg-white dark:bg-slate-900 rounded-[28px] p-5 mb-4 border border-slate-100 dark:border-slate-800 shadow-sm flex-row items-start ${!item.read ? 'border-l-4 border-l-rose-500' : ''}`}
        activeOpacity={0.7}
      >
        <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${alertConfig.bg}`}>
          <Icon name={alertConfig.icon} size={24} className={alertConfig.color} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-black text-slate-900 dark:text-slate-100 leading-5">{item.message}</Text>
          <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-widest">{formatDateTime(item.date)}</Text>
        </View>
        {!item.read && (
          <View className="w-2 h-2 rounded-full bg-rose-500 ml-2 mt-1" />
        )}
      </TouchableOpacity>
    );
  };

  const unreadAlerts = alerts.filter((a) => !a.read).length;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Attendance" showBackButton onBackPress={() => navigation.goBack()} />

      {/* Superior Tabs */}
      <View className="flex-row bg-white dark:bg-slate-900 px-4 pt-2 shadow-sm border-b border-slate-100 dark:border-slate-800">
        {[
          { id: 'today', label: 'Today', icon: 'calendar-today' },
          { id: 'history', label: 'History', icon: 'history' },
          { id: 'alerts', label: 'Alerts', icon: 'bell-outline', badge: unreadAlerts },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 flex-row items-center justify-center py-4 border-b-4 rounded-t-xl gap-2 ${activeTab === tab.id ? 'border-indigo-600' : 'border-transparent'}`}
          >
            <Icon name={tab.icon} size={18} className={activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'} />
            <Text className={`text-xs font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`}>
              {tab.label}
              {tab.badge ? ` (${tab.badge})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={(activeTab === 'today' ? todayAttendance : activeTab === 'history' ? history : alerts) as any[]}
        keyExtractor={(item) => item.id}
        renderItem={(activeTab === 'today' ? renderTodayItem : activeTab === 'history' ? renderHistoryItem : renderAlertItem) as any}
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Icon name={activeTab === 'today' ? 'bus-clock' : activeTab === 'history' ? 'history' : 'bell-off-outline'} size={80} className="text-slate-200 dark:text-slate-800" />
            <Text className="text-base font-black text-slate-400 dark:text-slate-600 mt-6 uppercase tracking-widest">No records found</Text>
          </View>
        }
      />
    </View>
  );
};

export default TransportAttendanceScreen;
