import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  FadeInRight,
  FadeInUp,
  Layout
} from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import attendanceService from '@/services/api/attendance.service';
import useOfflineMode from '@/hooks/useOfflineMode';
import { storageService } from '@/services/storage.service';

const AnimatedView = Animated.createAnimatedComponent(View);
cssInterop(AnimatedView, { className: 'style' });
cssInterop(Card, { className: 'style' });
cssInterop(Icon, { className: 'style' });

interface Student {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  roll_number: number;
}

const MarkAttendanceScreen: React.FC = () => {
  const navigation = useNavigation();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late' | 'leave'>>({});
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { isOffline } = useOfflineMode();

  useEffect(() => {
    loadClassStudents();
  }, [selectedClass]);

  const loadClassStudents = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockStudents: Student[] = Array.from({ length: 35 }, (_, i) => ({
        id: `student-${i + 1}`,
        admission_number: `2025${(i + 1).toString().padStart(3, '0')}`,
        first_name: ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan'][i % 8],
        last_name: ['Kumar', 'Sharma', 'Patel', 'Singh', 'Verma', 'Reddy', 'Joshi', 'Nair'][i % 8],
        roll_number: i + 1,
      }));

      setStudents(mockStudents);
      const initialAttendance: Record<string, 'present' | 'absent' | 'late' | 'leave'> = {};
      mockStudents.forEach((student) => { initialAttendance[student.id] = 'present'; });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (studentId: string, status: 'present' | 'absent' | 'late' | 'leave') => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    const newAttendance = { ...attendance };
    students.forEach((student) => { newAttendance[student.id] = status; });
    setAttendance(newAttendance);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance)
        .filter(([_, status]) => status !== 'present')
        .map(([studentId, status]) => ({
          student_id: parseInt(studentId.replace('student-', '')),
          status: status.toUpperCase(),
          remarks: '',
        }));

      const payload = {
        pushes: [{
          sync_id: 'sync-' + Date.now(),
          section_id: 1,
          date: selectedDate,
          period_id: null,
          client_timestamp: new Date().toISOString(),
          records,
        }],
      };

      if (isOffline) {
        await storageService.addToSyncQueue({
          endpoint: '/mobile/attendance/sync/',
          method: 'POST',
          data: payload,
          timestamp: Date.now(),
          id: 'attendance-' + Date.now()
        });
        Alert.alert('Offline Mode', `Attendance queued for ${students.length} students.`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await attendanceService.bulkSyncAttendance(payload);
        Alert.alert('Success', 'Attendance marked successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const statusCounts = Object.values(attendance).reduce((acc, status) => {
    acc[status]++;
    return acc;
  }, { present: 0, absent: 0, late: 0, leave: 0 });

  const filteredStudents = students.filter((student) =>
    `${student.first_name} ${student.last_name} ${student.admission_number}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatusButton: React.FC<{
    status: 'present' | 'absent' | 'late' | 'leave';
    studentId: string;
  }> = ({ status, studentId }) => {
    const isSelected = attendance[studentId] === status;
    const config = {
      present: { icon: 'check-circle', activeColor: 'bg-emerald-100 text-emerald-600', color: 'slate-300' },
      absent: { icon: 'close-circle', activeColor: 'bg-rose-100 text-rose-600', color: 'slate-300' },
      late: { icon: 'clock-alert', activeColor: 'bg-amber-100 text-amber-600', color: 'slate-300' },
      leave: { icon: 'calendar-remove', activeColor: 'bg-blue-100 text-blue-600', color: 'slate-300' },
    }[status];

    return (
      <TouchableOpacity
        className={`w-10 h-10 rounded-full items-center justify-center border ${isSelected
            ? `${config.activeColor.split(' ')[0]} border-transparent`
            : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
          }`}
        onPress={() => handleToggleStatus(studentId, status)}
      >
        <Icon
          name={config.icon}
          size={20}
          className={isSelected ? config.activeColor.split(' ')[1] : `text-${config.color}`}
        />
      </TouchableOpacity>
    );
  };

  const renderStudentItem = ({ item, index }: { item: Student; index: number }) => (
    <AnimatedView entering={FadeInRight.delay(index * 20)} layout={Layout.springify()} className="mb-3 px-4">
      <Card className="flex-row items-center justify-between shadow-sm bg-white dark:bg-slate-900" padding={12}>
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mr-3">
            <Text className="text-slate-500 font-bold">{item.roll_number}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.first_name} {item.last_name}</Text>
            <Text className="text-[10px] text-slate-400 font-medium">#{item.admission_number}</Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <StatusButton status="present" studentId={item.id} />
          <StatusButton status="absent" studentId={item.id} />
          <StatusButton status="late" studentId={item.id} />
          <StatusButton status="leave" studentId={item.id} />
        </View>
      </Card>
    </AnimatedView>
  );

  return (
    <ScreenWrapper>
      <Header title="Mark Attendance" showBackButton onBackPress={() => navigation.goBack()} />
      <View className="flex-1 bg-slate-50 dark:bg-slate-950">

        {/* Class Overview Card */}
        <AnimatedView entering={FadeInUp.duration(600)} className="px-4 mt-4">
          <Card className="bg-indigo-600 dark:bg-indigo-700 mb-6" padding={16}>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Class / Section</Text>
                <Text className="text-white text-lg font-bold">Grade 10-A</Text>
              </View>
              <View className="h-10 w-px bg-white/20" />
              <View>
                <Text className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Total Students</Text>
                <Text className="text-white text-lg font-bold text-center">{students.length}</Text>
              </View>
              <View className="h-10 w-px bg-white/20" />
              <View className="items-end">
                <Text className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Date</Text>
                <Text className="text-white text-lg font-bold">{new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
              </View>
            </View>
          </Card>
        </AnimatedView>

        {/* Quick Selection & Search */}
        <View className="px-4 mb-4">
          <View className="flex-row justify-between mb-4">
            <TouchableOpacity
              className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 py-3 rounded-xl items-center mr-2 flex-row justify-center"
              onPress={() => handleMarkAll('present')}
            >
              <Icon name="check-all" size={18} className="text-emerald-600 mr-2" />
              <Text className="text-emerald-700 dark:text-emerald-400 font-bold text-xs">All Present</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 py-3 rounded-xl items-center ml-2 flex-row justify-center"
              onPress={() => handleMarkAll('absent')}
            >
              <Icon name="close-circle-multiple" size={18} className="text-rose-600 mr-2" />
              <Text className="text-rose-700 dark:text-rose-400 font-bold text-xs">All Absent</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white dark:bg-slate-900 flex-row items-center px-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <Icon name="magnify" size={20} className="text-slate-400" />
            <TextInput
              className="flex-1 py-3 ml-2 text-sm text-slate-900 dark:text-slate-100"
              placeholder="Search students..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* List Header Labels */}
        <View className="flex-row justify-between px-6 mb-2">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Info</Text>
          <View className="flex-row gap-4">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">P</Text>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">A</Text>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">L</Text>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">V</Text>
          </View>
        </View>

        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          renderItem={renderStudentItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? <LoadingSpinner text="Fetching student list..." /> : <EmptyState icon="account-group" title="No results" description="Try refining your search" />
          }
        />

        {/* Action Footer */}
        <View className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/80 p-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            title={saving ? 'Submitting...' : (isOffline ? 'Queue for later' : 'Submit Attendance')}
            onPress={handleSave}
            disabled={saving}
            loading={saving}
            className="rounded-2xl h-14"
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default MarkAttendanceScreen;
