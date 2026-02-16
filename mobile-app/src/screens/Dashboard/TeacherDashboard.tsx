import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  FadeInUp,
  FadeInRight,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card, Button, StatCard } from '@/components/ui';
import { bffService } from '@/services/api';
import { TeacherHomeData } from '@/services/api/bff.service';

const AnimatedView = Animated.createAnimatedComponent(View);
cssInterop(AnimatedView, { className: "style" });

const TeacherDashboard: React.FC = () => {
  const navigation = useNavigation();
  const [data, setData] = useState<TeacherHomeData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigateToTab = (
    tabName: string,
    screenName?: string,
    params?: object
  ) => {
    const payload = screenName ? { screen: screenName, params } : undefined;
    const parent = (navigation as any).getParent?.();
    if (parent?.navigate) {
      parent.navigate(tabName, payload);
      return;
    }
    (navigation as any).navigate(tabName, payload);
  };

  const loadDashboardData = async () => {
    try {
      const homeData = await bffService.getTeacherHome();
      setData(homeData);
    } catch (error) {
      console.error('Error loading teacher home data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const UrgentAlert: React.FC<{ item: TeacherHomeData['urgent_alerts'][0]; delay?: number }> = ({ item, delay = 0 }) => (
    <AnimatedView entering={FadeInUp.delay(delay).duration(500)}>
      <Card
        className={`mb-4 border-l-4 ${item.severity === 'HIGH' ? 'border-l-rose-500 bg-rose-50 dark:bg-rose-950/20' : 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/20'}`}
        padding={16}
        elevation="none"
      >
        <View className="flex-row items-center">
          <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${item.severity === 'HIGH' ? 'bg-rose-100 dark:bg-rose-900/50' : 'bg-amber-100 dark:bg-amber-900/50'}`}>
            <Icon
              name="alert-circle"
              size={24}
              color={item.severity === 'HIGH' ? COLORS.error : COLORS.warningDark}
            />
          </View>
          <View className="flex-1">
            <Text className={`text-sm font-black ${item.severity === 'HIGH' ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {item.type === 'SUBSTITUTION' ? 'Substitution Alert' : 'Priority Action'}
            </Text>
            <Text className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">{item.message}</Text>
          </View>
          {item.action_url && (
            <Button
              title="VIEW"
              size="sm"
              variant={item.severity === 'HIGH' ? 'danger' : 'outline'}
              onPress={() => item.type === 'SUBSTITUTION' && navigateToTab('AcademicsTab', 'TeacherTimetable')}
              style={{ borderRadius: 12, paddingVertical: 6, paddingHorizontal: 12 }}
              textStyle={{ fontSize: 10 }}
            />
          )}
        </View>
      </Card>
    </AnimatedView>
  );

  const ActionCard: React.FC<{ item: TeacherHomeData['pending_actions'][0]; delay?: number }> = ({ item, delay = 0 }) => {
    const getTheme = () => {
      switch (item.type) {
        case 'ATTENDANCE': return { icon: 'calendar-check', color: COLORS.error };
        case 'ASSIGNMENT': return { icon: 'file-document-edit', color: COLORS.primary };
        case 'NOTIFICATION': return { icon: 'bell-ring', color: COLORS.secondary };
        case 'LEAVE_REQUEST': return { icon: 'account-clock', color: COLORS.warningDark };
        default: return { icon: 'alert-circle-outline', color: COLORS.gray600 };
      }
    };
    const theme = getTheme();

    return (
      <AnimatedView entering={FadeInUp.delay(delay).duration(500)} className="w-[48%] mb-4">
        <StatCard
          icon={theme.icon}
          label={item.label}
          value={item.count}
          color={theme.color}
          onPress={() => {
            if (item.type === 'ATTENDANCE') navigateToTab('AcademicsTab', 'MarkAttendance');
            else if (item.type === 'ASSIGNMENT') navigateToTab('AcademicsTab', 'AssignmentsList');
            else if (item.type === 'LEAVE_REQUEST') navigateToTab('AcademicsTab', 'LeaveRequests');
            else if (item.type === 'NOTIFICATION') navigateToTab('ProfileTab', 'NotificationHistory');
          }}
          className="w-full"
        />
      </AnimatedView>
    );
  };

  return (
    <ScreenWrapper>
      <Header title="Workspace" subtitle={data?.greeting || "Finding your schedule..."} />
      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Urgent Alerts */}
        {data?.urgent_alerts && data.urgent_alerts.length > 0 && (
          <View className="mb-6">
            {data.urgent_alerts.map((alert, idx) => (
              <UrgentAlert key={idx} item={alert} delay={idx * 100} />
            ))}
          </View>
        )}

        {/* Pending Actions Grid */}
        <View className="mb-8">
          <Text className="text-lg font-black text-slate-900 dark:text-slate-100 mb-4 px-1 uppercase tracking-widest text-[10px] text-slate-400">Attention Required</Text>
          <View className="flex-row flex-wrap justify-between">
            {data?.pending_actions.map((action, idx) => (
              <ActionCard key={idx} item={action} delay={200 + idx * 100} />
            ))}
          </View>
        </View>

        {/* Today's Schedule */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest text-[10px] text-slate-400">Today's schedule</Text>
            <TouchableOpacity onPress={() => navigateToTab('AcademicsTab', 'TeacherTimetable')} className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-[10px] font-black text-primary uppercase">Full View</Text>
            </TouchableOpacity>
          </View>

          {data?.timetable && data.timetable.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
              {data.timetable.map((item, idx) => (
                <AnimatedView key={item.id} entering={FadeInRight.delay(500 + idx * 100)}>
                  <Card
                    className={`mr-4 w-52 border-l-4 ${item.status === 'Completed' ? 'border-l-emerald-500' : 'border-l-indigo-500'}`}
                    padding={16}
                    elevation="sm"
                  >
                    <View className="flex-row justify-between mb-3">
                      <View className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                        <Text className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">{item.period}</Text>
                      </View>
                      <Text className="text-[10px] font-bold text-slate-400">{item.start_time.slice(0, 5)}</Text>
                    </View>
                    <Text className="text-base font-black text-slate-900 dark:text-slate-100" numberOfLines={1}>{item.subject}</Text>
                    <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">{item.class_name}</Text>
                    <View className="flex-row items-center mt-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                      <Icon name="map-marker" size={14} color={COLORS.primary} />
                      <Text className="text-[10px] text-slate-500 dark:text-slate-400 ml-1 font-bold">Room {item.room_number}</Text>
                    </View>
                  </Card>
                </AnimatedView>
              ))}
            </ScrollView>
          ) : (
            <Card className="items-center py-10 bg-white/50 dark:bg-slate-900/50">
              <Icon name="calendar-blank" size={32} color={COLORS.gray400} />
              <Text className="text-slate-400 font-bold mt-2 text-xs">No classes scheduled for today.</Text>
            </Card>
          )}
        </View>

        {/* Quick Access */}
        <View className="mb-10">
          <Text className="text-lg font-black text-slate-900 dark:text-slate-100 mb-4 px-1 uppercase tracking-widest text-[10px] text-slate-400">Quick Access</Text>
          <Card className="p-2 py-4">
            <View className="flex-row flex-wrap justify-around">
              {[
                { label: 'Attendance', icon: 'calendar-check', color: COLORS.primary, bg: 'bg-indigo-50 dark:bg-indigo-950/20', screen: 'MarkAttendance' },
                { label: 'Enter Marks', icon: 'format-list-numbered', color: COLORS.secondary, bg: 'bg-violet-50 dark:bg-violet-950/20', screen: 'EnterMarks' },
                { label: 'Leave Hub', icon: 'account-clock', color: COLORS.warningDark, bg: 'bg-amber-50 dark:bg-amber-950/20', screen: 'LeaveRequests' },
                { label: 'Assignments', icon: 'book-open-variant', color: COLORS.info, bg: 'bg-blue-50 dark:bg-blue-950/20', screen: 'AssignmentsList' },
              ].map((action, idx) => (
                <TouchableOpacity
                  key={idx}
                  className="w-[22%] items-center"
                  onPress={() => navigateToTab('AcademicsTab', action.screen)}
                >
                  <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-2 ${action.bg}`}>
                    <Icon name={action.icon} size={26} color={action.color} />
                  </View>
                  <Text className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase text-center">{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
};

export default TeacherDashboard;
