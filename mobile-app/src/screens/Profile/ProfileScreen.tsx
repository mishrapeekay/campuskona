import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp, FadeInDown, FadeIn, Layout, SlideInRight } from 'react-native-reanimated';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import { Card, Button, Badge } from '@/components/ui';
import { COLORS, USER_TYPE_ICONS } from '@/constants';
import { ProfileStackParamList } from '@/types/navigation';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedTenant } = useAppSelector((state) => state.tenant);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => dispatch(logout()),
          style: 'destructive',
        },
      ]
    );
  };

  const roleIcon = user?.user_type ? (USER_TYPE_ICONS as any)[user.user_type] || 'account' : 'account';

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Modern Header */}
      <Animated.View entering={FadeInDown.duration(600)} className="px-6 pt-10 pb-6 bg-white dark:bg-slate-900 shadow-sm shadow-slate-200 dark:shadow-none border-b border-slate-100 dark:border-slate-800">
        <Text className="text-3xl font-black text-slate-900 dark:text-slate-100">Profile</Text>
        <Text className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your identity and preferences</Text>
      </Animated.View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Personality Card */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          <View className="bg-white dark:bg-slate-900 p-6 rounded-[40px] shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800 mb-8 overflow-hidden">
            <View className="flex-row items-center mb-6">
              <View className="relative">
                <View className="w-24 h-24 rounded-[32px] bg-indigo-600 items-center justify-center p-1">
                  {user?.avatar ? (
                    <Image source={{ uri: user.avatar }} className="w-full h-full rounded-[28px]" />
                  ) : (
                    <Icon name={roleIcon} size={48} color="white" />
                  )}
                </View>
                <TouchableOpacity
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-900 items-center justify-center shadow-lg"
                  onPress={() => navigation.navigate('EditProfile')}
                >
                  <Icon name="pencil" size={14} className="text-indigo-600 dark:text-indigo-400" />
                </TouchableOpacity>
              </View>

              <View className="flex-1 ml-6">
                <Text className="text-2xl font-black text-slate-900 dark:text-slate-100" numberOfLines={1}>
                  {user?.first_name} {user?.last_name || 'Admin'}
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 font-medium text-xs mb-3" numberOfLines={1}>{user?.email}</Text>
                <Badge
                  label={user?.user_type?.replace('_', ' ') || 'User'}
                  variant="primary"
                  className="rounded-lg scale-90 -translate-x-2"
                />
              </View>
            </View>

            <View className="h-[1px] bg-slate-100 dark:bg-slate-800 mb-6" />

            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 items-center justify-center mr-4">
                <Icon name="school" size={20} className="text-indigo-600 dark:text-indigo-400" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-black text-slate-800 dark:text-slate-200">
                  {user?.user_type === 'SUPER_ADMIN' ? 'Platform Administration' : (selectedTenant?.school_name || 'School Not Set')}
                </Text>
                <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                  {user?.user_type === 'SUPER_ADMIN' ? 'Global Node' : `Node ID: ${selectedTenant?.school_code || '---'}`}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Account Actions */}
        <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Account & Security</Text>
        <Animated.View entering={FadeInUp.delay(400).duration(800)}>
          <View className="bg-white dark:bg-slate-900 mb-8 overflow-hidden border border-slate-100 dark:border-slate-800 rounded-3xl">
            <ProfileMenuItem
              icon="account-circle-outline"
              title="Personal Information"
              onPress={() => navigation.navigate('EditProfile')}
              color="text-indigo-600"
            />
            <ProfileMenuItem
              icon="lock-outline"
              title="Change Password"
              onPress={() => navigation.navigate('ChangePassword')}
              color="text-emerald-600"
            />
            <ProfileMenuItem
              icon="bell-badge-outline"
              title="Notification History"
              onPress={() => navigation.navigate('NotificationHistory')}
              color="text-amber-600"
            />
            <ProfileMenuItem
              icon="shield-check-outline"
              title="Privacy Settings"
              onPress={() => navigation.navigate('SettingsHome')}
              color="text-blue-600"
              isLast
            />
          </View>
        </Animated.View>

        {/* General Actions */}
        <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4 px-1">Global</Text>
        <Animated.View entering={FadeInUp.delay(600).duration(800)}>
          <View className="bg-white dark:bg-slate-900 mb-8 overflow-hidden border border-slate-100 dark:border-slate-800 rounded-3xl">
            <ProfileMenuItem
              icon="help-circle-outline"
              title="Help & Support"
              onPress={() => { }}
              color="text-slate-500"
            />
            <ProfileMenuItem
              icon="information-outline"
              title="About Platform"
              onPress={() => navigation.navigate('About' as any)}
              color="text-slate-500"
              isLast
            />
          </View>
        </Animated.View>

        {/* Logout Section */}
        <Animated.View entering={FadeInUp.delay(800).duration(800)}>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-rose-50 dark:bg-rose-950/20 py-4 rounded-3xl border border-rose-100 dark:border-rose-900/30 flex-row items-center justify-center"
          >
            <Icon name="logout" size={20} className="text-rose-600 dark:text-rose-400 mr-2" />
            <Text className="text-rose-600 dark:text-rose-400 font-black text-sm uppercase tracking-wider">Log out session</Text>
          </TouchableOpacity>

          <Text className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-8 uppercase tracking-[3px]">
            Version 1.0.0 (Build 102)
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const ProfileMenuItem = ({ icon, title, onPress, color, isLast }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center p-5 ${!isLast ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}
  >
    <View className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800/50 items-center justify-center mr-4">
      <Icon name={icon} size={22} className={color} />
    </View>
    <Text className="flex-1 text-base font-bold text-slate-700 dark:text-slate-200">{title}</Text>
    <Icon name="chevron-right" size={20} className="text-slate-300 dark:text-slate-700" />
  </TouchableOpacity>
);

export default ProfileScreen;
