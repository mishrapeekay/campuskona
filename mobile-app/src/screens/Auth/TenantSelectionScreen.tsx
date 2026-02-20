import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAppDispatch } from '@/store/hooks';
import { setSelectedTenant, setSuperAdminMode } from '@/store/slices/tenantSlice';
import { fetchBranding } from '@/store/slices/brandingSlice';
import { School } from '@/types/models';
import { COLORS, API_CONFIG, STORAGE_KEYS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import { Card, SearchBar, Button, EmptyState } from '@/components/ui';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInUp, FadeIn, FadeInDown, Layout } from 'react-native-reanimated';

const TenantSelectionScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_CONFIG.BASE_URL}/tenants/public/list/`, {
        timeout: API_CONFIG.TIMEOUT,
      });

      if (response.data && response.data.results) {
        setSchools(response.data.results);
        setFilteredSchools(response.data.results);
      }
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err.response?.data?.message || 'Failed to establish connection. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolsData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSchools(schools);
    } else {
      const filtered = schools.filter(school =>
        school.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.school_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSchools(filtered);
    }
  }, [searchQuery, schools]);

  const handleSelectSchool = async (school: School) => {
    try {
      // Persist for ApiClient (which reads directly from AsyncStorage)
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_TENANT, JSON.stringify(school));

      // Update Redux state
      dispatch(setSelectedTenant(school));
      dispatch(fetchBranding(school.subdomain));
    } catch (err) {
      console.error('Error saving tenant:', err);
    }
  };

  const handleSuperAdminAccess = () => {
    // Setting super admin mode causes AppNavigator to render Auth instead of TenantSelection.
    // AuthNavigator starts at Login by default, so we store a flag telling LoginScreen
    // to redirect to SuperAdminLogin on mount.
    dispatch(setSuperAdminMode(true));
  };

  const renderSchoolItem = ({ item, index }: { item: School; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(500).springify()}
      layout={Layout.springify()}
    >
      <TouchableOpacity
        onPress={() => handleSelectSchool(item)}
        activeOpacity={0.7}
      >
        <Card className="bg-white dark:bg-slate-900 mb-4 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200 dark:shadow-none">
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 items-center justify-center mr-4">
              <Icon name="school" size={28} className="text-indigo-600 dark:text-indigo-400" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-black text-slate-900 dark:text-slate-100" numberOfLines={1}>
                {item.school_name}
              </Text>
              <View className="flex-row items-center mt-1">
                <View className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mr-2">
                  <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Code: {item.school_code}</Text>
                </View>
                <Text className="text-xs text-slate-500 font-medium" numberOfLines={1}>
                  {item.city}, {item.state}
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} className="text-slate-300" />
          </View>

          <View className="flex-row mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
            <View className="flex-row items-center mr-4">
              <Icon name="phone-outline" size={14} className="text-slate-400 mr-1.5" />
              <Text className="text-[11px] text-slate-500 font-medium">{item.contact_phone}</Text>
            </View>
            <View className="flex-row items-center">
              <Icon name="calendar-check-outline" size={14} className="text-slate-400 mr-1.5" />
              <Text className="text-[11px] text-slate-500 font-medium">Session 2024-25</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ScreenWrapper>
      <View className="flex-1 bg-slate-950">
        <View className="px-6 pt-16 pb-6">
          <Animated.View entering={FadeInDown.duration(600)} className="items-center">
            <View className="w-16 h-16 rounded-2xl bg-indigo-600 items-center justify-center mb-5 shadow-xl shadow-indigo-900/50">
              <Icon name="domain" size={32} color="white" />
            </View>
            <View className="items-center mb-8">
              <Text className="text-3xl font-black text-white text-center">Find Your School</Text>
              <Text className="text-slate-400 font-medium text-sm text-center mt-2">Select a school node to begin</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(300).duration(600)}>
            <SearchBar
              placeholder="Search by name, city or code..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="bg-slate-900 border border-slate-800 shadow-none h-12 rounded-xl px-4 text-white"
              placeholderTextColor={COLORS.gray500}
            />
          </Animated.View>
        </View>

        <View className="flex-1 px-6 mt-2">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text className="text-slate-500 font-bold mt-4 uppercase tracking-widest text-xs">Fetching Platform Nodes...</Text>
            </View>
          ) : error ? (
            <EmptyState
              title="Connection Error"
              description={error}
              icon="wifi-off"
              actionLabel="Retry Connection"
              onAction={fetchSchoolsData}
            />
          ) : filteredSchools.length === 0 ? (
            <EmptyState
              title="No Results Found"
              description={`We couldn't find any school matching "${searchQuery}"`}
              icon="school-off-outline"
              actionLabel="Clear Search"
              onAction={() => setSearchQuery('')}
            />
          ) : (
            <Animated.FlatList
              data={filteredSchools}
              renderItem={renderSchoolItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              itemLayoutAnimation={Layout.springify()}
            />
          )}
        </View>

        {/* Super Admin / Platform Access */}
        <Animated.View entering={FadeIn.delay(600).duration(800)} className="px-6 pb-8 pt-2 items-center">
          <TouchableOpacity
            onPress={handleSuperAdminAccess}
            className="py-2 px-6 rounded-full bg-slate-800 border border-slate-700 flex-row items-center"
            activeOpacity={0.7}
          >
            <Icon name="shield-crown" size={16} className="text-indigo-400 mr-2" />
            <Text className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Platform Admin Access
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
};

export default TenantSelectionScreen;
