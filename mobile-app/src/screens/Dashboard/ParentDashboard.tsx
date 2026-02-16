import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

import { useAppSelector } from '@/store/hooks';
import { COLORS, SPACING } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card, Button, StatCard, Badge } from '@/components/ui';
import {
  authService,
  todayViewService,
} from '@/services/api';
import { ParentTodayViewResponse } from '@/types/todayView';

const AnimatedView = Animated.createAnimatedComponent(View);
cssInterop(AnimatedView, { className: "style" });

const ParentDashboard: React.FC = () => {
  const navigation = useNavigation<any>();
  const [todayData, setTodayData] = useState<ParentTodayViewResponse | null>(null);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string>('Parent');

  const selectedChild = todayData?.children[selectedChildIndex];

  const navigateToTab = (tabName: string, screenName?: string, params?: object) => {
    const payload = screenName ? { screen: screenName, params } : undefined;
    navigation.navigate(tabName, payload);
  };

  const loadDashboardData = async (force: boolean = false) => {
    try {
      const user = await authService.getStoredUser();
      if (user) setUserName(user.first_name);

      const response = await todayViewService.getParentToday(force);
      setTodayData(response);
    } catch (error) {
      console.error('Error loading parent dashboard data:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData(true);
    setRefreshing(false);
  };

  const WardSelector: React.FC = () => {
    if (!todayData || todayData.children_count <= 1) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-8 px-4"
        contentContainerStyle={{ gap: 12 }}
      >
        {todayData.children.map((child, index) => {
          const isSelected = selectedChildIndex === index;
          return (
            <TouchableOpacity
              key={child.student.id}
              onPress={() => setSelectedChildIndex(index)}
              className={`flex-row items-center p-2 pr-5 rounded-[24px] border-2 ${isSelected
                ? 'bg-primary/10 border-primary'
                : 'bg-white dark:bg-slate-900 border-transparent'
                }`}
            >
              <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mr-3 overflow-hidden">
                <Icon name="account" size={24} color={isSelected ? COLORS.primary : COLORS.gray400} />
              </View>
              <View>
                <Text className={`text-xs font-black ${isSelected ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}>
                  {child.student.name}
                </Text>
                <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Class {child.student.class}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const SectionHeader: React.FC<{ title: string; action?: string; onAction?: () => void }> = ({ title, action, onAction }) => (
    <View className="flex-row justify-between items-center mb-4 px-4">
      <Text className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest text-[10px] text-slate-400">{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction} className="bg-primary/10 px-3 py-1 rounded-full">
          <Text className="text-[10px] font-black text-primary uppercase">{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScreenWrapper>
      <Header title="Guardian Hub" subtitle={`Welcome back, ${userName}`} />
      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ paddingVertical: SPACING.lg }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <WardSelector />

        {selectedChild ? (
          <View>
            {/* Stats Grid */}
            <View className="px-4 flex-row flex-wrap justify-between gap-y-4">
              <StatCard
                icon="currency-inr"
                label="Pending Fees"
                value={`₹${selectedChild.fees_due.total_due || 0}`}
                color={COLORS.error}
                onPress={() => navigateToTab('FinanceTab', 'FeeOverview')}
                className="w-[48%]"
              />
              <StatCard
                icon="calendar-check"
                label="Attendance"
                value={`${selectedChild.attendance.summary.percentage}%`}
                color={selectedChild.attendance.summary.percentage < 75 ? COLORS.error : COLORS.success}
                onPress={() => navigateToTab('AcademicsTab', 'AttendanceHistory', { studentId: selectedChild.student.id })}
                className="w-[48%]"
              />
              <StatCard
                icon="notebook-edit"
                label="Homework"
                value={`${selectedChild.homework.length} Tasks`}
                color={COLORS.primary}
                onPress={() => navigateToTab('AcademicsTab', 'AssignmentsList', { studentId: selectedChild.student.id })}
                className="w-[48%]"
              />
              <StatCard
                icon="file-document-edit"
                label="Exams"
                value={`${selectedChild.exams.length} Active`}
                color={COLORS.warningDark}
                onPress={() => navigateToTab('AcademicsTab', 'ExamResults', { studentId: selectedChild.student.id })}
                className="w-[48%]"
              />
            </View>

            {/* Quick Links */}
            <View className="mt-8">
              <SectionHeader title="Student Quick Links" />
              <View className="px-4 flex-row flex-wrap justify-between gap-y-4">
                {[
                  { label: 'Timetable', icon: 'calendar-clock', color: COLORS.primary, bg: 'bg-indigo-50 dark:bg-indigo-950/20', screen: 'MyTimetable', tab: 'ProfileTab' },
                  { label: 'Track Bus', icon: 'bus', color: COLORS.info, bg: 'bg-blue-50 dark:bg-blue-950/20', screen: 'MyTransport', tab: 'ServicesTab' },
                  { label: 'Reports', icon: 'file-chart', color: COLORS.secondary, bg: 'bg-violet-50 dark:bg-violet-950/20', screen: 'ReportList', tab: 'ServicesTab' },
                  { label: 'Messages', icon: 'email-outline', color: COLORS.success, bg: 'bg-emerald-50 dark:bg-emerald-950/20', screen: 'Messages', tab: 'ServicesTab' },
                ].map((action, idx) => (
                  <TouchableOpacity
                    key={idx}
                    className="w-[23%] items-center"
                    onPress={() => navigateToTab(action.tab, action.screen, { studentId: selectedChild.student.id })}
                  >
                    <View className={`w-14 h-14 rounded-2xl items-center justify-center mb-2 ${action.bg}`}>
                      <Icon name={action.icon} size={24} color={action.color} />
                    </View>
                    <Text className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase text-center">{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Critical Action Banner */}
            {selectedChild.fees_due.overdue_amount > 0 && (
              <AnimatedView entering={FadeInDown.delay(200)} className="px-4 mt-8">
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigateToTab('FinanceTab', 'FeeOverview')}
                  className="bg-rose-600 p-5 rounded-[28px] flex-row items-center border border-white/10"
                >
                  <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center mr-4">
                    <Icon name="alert-circle" size={28} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-black text-base">Payment Overdue</Text>
                    <Text className="text-white/60 text-xs font-medium">₹{selectedChild.fees_due.overdue_amount} requires attention</Text>
                  </View>
                  <View className="bg-white px-4 py-2 rounded-xl">
                    <Text className="text-rose-600 text-[10px] font-black uppercase">Pay Hub</Text>
                  </View>
                </TouchableOpacity>
              </AnimatedView>
            )}

            {/* Privacy Section */}
            <View className="mt-10 mb-8 px-4">
              <Card className="bg-slate-900 dark:bg-slate-900 border-0 overflow-hidden" padding={20}>
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 rounded-2xl bg-indigo-500 items-center justify-center mr-4">
                    <Icon name="shield-check" size={24} color="white" />
                  </View>
                  <View>
                    <Text className="text-white font-black text-base">Privacy Hub</Text>
                    <Text className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">DPDP Act Compliant</Text>
                  </View>
                </View>
                <Text className="text-slate-400 text-xs leading-5 font-medium mb-6">
                  Manage your child's data consents and export historical records securely.
                </Text>
                <View className="flex-row gap-3">
                  <Button
                    title="CONSENTS"
                    onPress={() => navigateToTab('ProfileTab', 'ConsentManagement')}
                    variant="outline"
                    className="flex-1 border-white/20"
                    textStyle={{ color: 'white', fontSize: 10 }}
                  />
                  <Button
                    title="SETTINGS"
                    onPress={() => navigateToTab('ProfileTab', 'PrivacySettings')}
                    variant="primary"
                    className="flex-1"
                    textStyle={{ fontSize: 10 }}
                  />
                </View>
              </Card>
            </View>
          </View>
        ) : (
          <View className="items-center py-20 px-4">
            <Card className="items-center p-10 w-full" variant="outlined">
              <Icon name="account-search" size={48} color={COLORS.gray300} />
              <Text className="text-slate-500 font-black mt-4 text-xs uppercase tracking-widest">No Children Linked</Text>
            </Card>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ParentDashboard;
