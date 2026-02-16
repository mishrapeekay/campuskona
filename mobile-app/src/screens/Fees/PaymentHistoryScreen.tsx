import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Share,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { feeService, studentService } from '@/services/api';
import { RootState } from '@/store';
import { Student, UserType } from '@/types/models';

type PaymentHistoryRoute = RouteProp<{ params?: { studentId?: string } }, 'params'>;
type StatusFilter = 'all' | 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled';
type DateFilter = 'all' | '30d' | '90d' | '1y';

interface PaymentItem {
  id: string;
  payment_id: string;
  transaction_id: string;
  fee_type: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled';
}

interface GroupedPayments {
  month: string;
  payments: PaymentItem[];
  total: number;
}

const PaymentHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<PaymentHistoryRoute>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [payments, setPayments] = useState<GroupedPayments[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('90d');
  const [wards, setWards] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(
    route.params?.studentId || user?.student_id
  );
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.user_type === UserType.PARENT) {
      loadWards();
    }
    loadPaymentHistory();
  }, [selectedStudentId, statusFilter, dateFilter]);

  const loadWards = async () => {
    try {
      const data = await studentService.getWards();
      setWards(data);
    } catch (err) {
      console.warn('Failed to load wards:', err);
    }
  };

  const loadPaymentHistory = async () => {
    setLoading(true);
    try {
      const mockPayments: PaymentItem[] = [
        { id: '1', payment_id: 'PAY-001', transaction_id: 'TXN-992831', fee_type: 'Tuition Fee - Term 1', amount: 25000, payment_method: 'UPI', payment_date: '2025-12-15T10:30:00Z', status: 'completed' },
        { id: '2', payment_id: 'PAY-002', transaction_id: 'TXN-992832', fee_type: 'Transport Fee', amount: 6000, payment_method: 'Credit Card', payment_date: '2025-12-10T14:20:00Z', status: 'completed' },
        { id: '3', payment_id: 'PAY-003', transaction_id: 'TXN-992833', fee_type: 'Library Fee', amount: 2000, payment_method: 'Net Banking', payment_date: '2025-11-28T09:15:00Z', status: 'completed' },
      ];
      groupAndSetPayments(mockPayments);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupAndSetPayments = (items: PaymentItem[]) => {
    const grouped: Record<string, PaymentItem[]> = {};
    items.forEach((p) => {
      const month = new Date(p.payment_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(p);
    });
    setPayments(Object.entries(grouped).map(([month, ps]) => ({
      month,
      payments: ps,
      total: ps.reduce((sum, item) => sum + item.amount, 0),
    })));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPaymentHistory();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`;

  const getStatusConfig = (status: string) => {
    const configs: any = {
      completed: { color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Completed', icon: 'check-circle' },
      pending: { color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Pending', icon: 'clock-outline' },
      failed: { color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', label: 'Failed', icon: 'alert-circle' },
    };
    return configs[status] || configs.pending;
  };

  const FilterChip: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
    <TouchableOpacity
      className={`px-6 py-2.5 rounded-2xl mr-3 border transition-all ${active ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
        } active:scale-95`}
      onPress={onPress}
    >
      <Text className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderPaymentCard = (item: PaymentItem) => {
    const config = getStatusConfig(item.status);
    const date = new Date(item.payment_date);

    return (
      <TouchableOpacity
        className="bg-white dark:bg-slate-900 rounded-[32px] p-6 mb-6 border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none active:scale-[0.98] transition-all"
        onPress={() => navigation.navigate('ReceiptView', { paymentId: item.payment_id })}
      >
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-row flex-1 items-center">
            <View className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 items-center justify-center mr-4">
              <Icon name="receipt" size={24} className="text-indigo-600 dark:text-indigo-400" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-black text-slate-900 dark:text-white mb-1">{item.fee_type}</Text>
              <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {item.payment_method}
              </Text>
            </View>
          </View>
          <View className={`px-3 py-1.5 rounded-xl ${config.bg}`}>
            <Text className={`text-[8px] font-black uppercase tracking-widest ${config.color}`}>{config.label}</Text>
          </View>
        </View>

        <View className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl mb-6 flex-row justify-between items-center border border-slate-100 dark:border-slate-800/30">
          <View>
            <Text className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Amount Paid</Text>
            <Text className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(item.amount)}</Text>
          </View>
          <View className="items-end">
            <Text className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Transaction ID</Text>
            <Text className="text-xs font-black text-slate-600 dark:text-slate-300">#{item.transaction_id}</Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-white dark:bg-slate-800/50 h-12 rounded-xl flex-row items-center justify-center border border-slate-100 dark:border-slate-700 active:scale-95 transition-all"
            onPress={() => { }}
          >
            <Icon name="share-variant-outline" size={16} className="text-slate-600 dark:text-slate-300" />
            <Text className="ml-2 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-indigo-600 h-12 rounded-xl flex-row items-center justify-center active:scale-95 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
            onPress={() => { }}
          >
            <Icon name="download-outline" size={16} color="white" />
            <Text className="ml-2 text-[10px] font-black text-white uppercase tracking-widest">Receipt</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && payments.length === 0) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-950">
        <Header title="History" />
        <LoadingSpinner fullScreen text="Loading transactions..." />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Payment History" showBackButton onBackPress={() => navigation.goBack()} />

      <View className="py-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 mb-8">
          {(['all', 'completed', 'pending', 'failed'] as StatusFilter[]).map((s) => (
            <FilterChip key={s} label={s} active={statusFilter === s} onPress={() => setStatusFilter(s)} />
          ))}
        </ScrollView>

        <FlatList
          data={payments}
          keyExtractor={(item) => item.month}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
          renderItem={({ item }) => (
            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">{item.month}</Text>
                <View className="h-px flex-1 bg-slate-100 dark:bg-slate-800 mx-4" />
                <Text className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{formatCurrency(item.total)}</Text>
              </View>
              {item.payments.map((p) => (
                <View key={p.id}>{renderPaymentCard(p)}</View>
              ))}
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center py-20 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 px-10">
              <Icon name="history" size={64} className="text-slate-200 dark:text-slate-800" />
              <Text className="text-xl font-black text-slate-300 dark:text-slate-700 mt-6 uppercase tracking-widest">No Records</Text>
              <Text className="text-xs font-black text-slate-400 dark:text-slate-500 text-center mt-2 uppercase tracking-widest leading-5">
                We couldn't find any payment history for the selected filters.
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default PaymentHistoryScreen;
