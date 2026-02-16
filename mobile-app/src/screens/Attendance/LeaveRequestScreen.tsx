import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInUp, FadeInDown, FadeIn, Layout, SlideInUp } from 'react-native-reanimated';

import { COLORS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import { Card, Button } from '@/components/ui';

type LeaveType = 'sick' | 'casual' | 'emergency' | 'other';

const LEAVE_TYPES: { id: LeaveType; label: string; icon: string; color: string; bg: string }[] = [
  { id: 'sick', label: 'Sick', icon: 'hospital-box-outline', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/20' },
  { id: 'casual', label: 'Casual', icon: 'island', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
  { id: 'emergency', label: 'Urgent', icon: 'alert-decagram-outline', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  { id: 'other', label: 'Misc', icon: 'dots-horizontal-circle-outline', color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800' },
];

const LeaveRequestScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState<LeaveType | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedType) e.type = 'Select a category';
    if (endDate < startDate) e.date = 'End date is invalid';
    if (reason.length < 10) e.reason = 'Please explain further';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApply = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    Alert.alert('Protocol Initiated', 'Your leave request has been broadcasted to the department heads.', [{ text: 'Acknowledge', onPress: () => navigation.goBack() }]);
  };

  const calculateDays = () => {
    const diff = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <ScreenWrapper>
      <Header title="Leave Protocol" subtitle="Temporary exit request" showBackButton />

      <ScrollView
        className="flex-1 bg-slate-50 dark:bg-slate-950"
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(600)} className="mb-8">
          <View className="bg-indigo-600 p-6 rounded-[32px] flex-row items-center shadow-xl shadow-indigo-100 dark:shadow-none">
            <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center mr-4">
              <Icon name="information-variant" size={24} color="white" />
            </View>
            <Text className="flex-1 text-white text-xs font-medium leading-5">
              Leave requests are processed by the automated node system and require final sign-off from your designated supervisor.
            </Text>
          </View>
        </Animated.View>

        {/* Type Selection */}
        <Animated.View entering={FadeInUp.delay(200).duration(800)} className="mb-8">
          <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 px-1">Classification</Text>
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {LEAVE_TYPES.map((type, idx) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedType(type.id)}
                className={`w-[48%] p-5 rounded-[32px] border ${selectedType === type.id ? 'border-indigo-600 bg-white dark:bg-slate-900 shadow-xl shadow-indigo-100' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
              >
                <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-4 ${type.bg}`}>
                  <Icon name={type.icon} size={28} className={type.color} />
                </View>
                <Text className={`text-sm font-black ${selectedType === type.id ? 'text-indigo-600' : 'text-slate-800 dark:text-slate-200'}`}>{type.label}</Text>
                {selectedType === type.id && (
                  <View className="absolute top-4 right-4">
                    <Icon name="check-decagram" size={20} className="text-indigo-600" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          {errors.type && <Text className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-3 ml-2">{errors.type}</Text>}
        </Animated.View>

        {/* Duration */}
        <Animated.View entering={FadeInUp.delay(400).duration(800)} className="mb-8">
          <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 px-1">Duration Matrix</Text>
          <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] p-8">
            <View className="flex-row justify-between mb-8">
              <TouchableOpacity onPress={() => setShowStartPicker(true)} className="flex-1 mr-4">
                <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Engage From</Text>
                <View className="flex-row items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Icon name="calendar-import" size={18} className="text-indigo-600 mr-2" />
                  <Text className="text-base font-black text-slate-800 dark:text-slate-100">{startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowEndPicker(true)} className="flex-1">
                <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Resume Duty</Text>
                <View className="flex-row items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Icon name="calendar-export" size={18} className="text-indigo-600 mr-2" />
                  <Text className="text-base font-black text-slate-800 dark:text-slate-100">{endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex-row items-center justify-center">
              <Icon name="timer-sand" size={16} className="text-slate-400 mr-2" />
              <Text className="text-xs font-black text-slate-500 uppercase tracking-widest">Calculated Span: {calculateDays()} Days</Text>
            </View>
          </Card>
        </Animated.View>

        {/* Reason */}
        <Animated.View entering={FadeInUp.delay(600).duration(800)} className="mb-10">
          <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 px-1">Log Specification</Text>
          <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] p-8">
            <TextInput
              className="text-slate-800 dark:text-slate-100 text-sm font-medium leading-6"
              placeholder="Detail your operational exit requirements..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
              textAlignVertical="top"
            />
            <View className="flex-row justify-end mt-4">
              <Text className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{reason.length} / 500 CTS</Text>
            </View>
          </Card>
          {errors.reason && <Text className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-3 ml-2">{errors.reason}</Text>}
        </Animated.View>

        <Button
          title={loading ? 'Broadcasting...' : 'Dispatch Request'}
          onPress={handleApply}
          loading={loading}
          disabled={loading}
          size="lg"
          className="rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-none mb-10"
        />

        {showStartPicker && (
          <DateTimePicker value={startDate} mode="date" display="default" minimumDate={new Date()} onChange={(e, d) => { setShowStartPicker(false); if (d) setStartDate(d); }} />
        )}
        {showEndPicker && (
          <DateTimePicker value={endDate} mode="date" display="default" minimumDate={startDate} onChange={(e, d) => { setShowEndPicker(false); if (d) setEndDate(d); }} />
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default LeaveRequestScreen;
