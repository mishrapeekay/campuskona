import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface FeeItem {
  id: string;
  fee_type: string;
  amount: number;
  paid_amount: number;
  balance_amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  installments?: number;
  paid_installments?: number;
}

interface FeeSummary {
  total_fee: number;
  total_paid: number;
  total_balance: number;
  next_due_date: string;
  next_due_amount: number;
}

const FeeOverviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [summary, setSummary] = useState<FeeSummary>({
    total_fee: 0,
    total_paid: 0,
    total_balance: 0,
    next_due_date: '',
    next_due_amount: 0,
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeeData();
  }, []);

  const loadFeeData = async () => {
    setLoading(true);
    try {
      const mockFees: FeeItem[] = [
        {
          id: 'fee-1',
          fee_type: 'Tuition Fee - Term 2',
          amount: 25000,
          paid_amount: 0,
          balance_amount: 25000,
          due_date: '2026-02-15',
          status: 'overdue',
          installments: 3,
          paid_installments: 0,
        },
        {
          id: 'fee-2',
          fee_type: 'Transport Fee - Annual',
          amount: 12000,
          paid_amount: 6000,
          balance_amount: 6000,
          due_date: '2026-03-01',
          status: 'partial',
          installments: 2,
          paid_installments: 1,
        },
        {
          id: 'fee-3',
          fee_type: 'Library Fee',
          amount: 2000,
          paid_amount: 0,
          balance_amount: 2000,
          due_date: '2026-02-28',
          status: 'pending',
        },
        {
          id: 'fee-4',
          fee_type: 'Exam Fee - Mid-Term',
          amount: 1500,
          paid_amount: 1500,
          balance_amount: 0,
          due_date: '2025-11-30',
          status: 'paid',
        },
        {
          id: 'fee-5',
          fee_type: 'Sports Fee',
          amount: 3000,
          paid_amount: 3000,
          balance_amount: 0,
          due_date: '2025-10-15',
          status: 'paid',
        },
      ];

      setFees(mockFees);

      const totalFee = mockFees.reduce((sum, f) => sum + f.amount, 0);
      const totalPaid = mockFees.reduce((sum, f) => sum + f.paid_amount, 0);
      const totalBalance = mockFees.reduce((sum, f) => sum + f.balance_amount, 0);

      const pendingFees = mockFees.filter((f) => f.balance_amount > 0);
      const nextDue = pendingFees.sort(
        (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      )[0];

      setSummary({
        total_fee: totalFee,
        total_paid: totalPaid,
        total_balance: totalBalance,
        next_due_date: nextDue?.due_date || '',
        next_due_amount: nextDue?.balance_amount || 0,
      });
    } catch (error) {
      console.error('Failed to load fee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeeData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number): string => `₹${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;

  const getStatusConfig = (status: string) => {
    const configs: any = {
      paid: { icon: 'check-circle-outline', color: 'text-emerald-500', label: 'Paid', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
      pending: { icon: 'clock-outline', color: 'text-amber-500', label: 'Pending', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
      overdue: { icon: 'alert-circle-outline', color: 'text-rose-500', label: 'Overdue', bgColor: 'bg-rose-50 dark:bg-rose-900/20' },
      partial: { icon: 'progress-check', color: 'text-blue-500', label: 'Partial', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    };
    return configs[status] || configs.pending;
  };

  const handlePayFee = (feeItem: FeeItem) => {
    navigation.navigate('PaymentGateway', { feeItem });
  };

  const FilterButton: React.FC<{
    type: 'all' | 'pending' | 'paid';
    label: string;
    icon: string;
  }> = ({ type, label, icon }) => {
    const isActive = filter === type;
    return (
      <TouchableOpacity
        className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl border transition-all ${isActive
            ? 'bg-indigo-600 border-indigo-600'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
          } active:scale-95`}
        onPress={() => setFilter(type)}
      >
        <Icon name={icon} size={18} color={isActive ? '#FFFFFF' : '#94a3b8'} />
        <Text className={`ml-2 text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const FeeCard: React.FC<{ item: FeeItem }> = ({ item }) => {
    const statusConfig = getStatusConfig(item.status);
    const dueDate = new Date(item.due_date);

    return (
      <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 mb-6 border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none">
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-row flex-1 items-center">
            <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${statusConfig.bgColor}`}>
              <Icon name="cash-multiple" size={28} className={statusConfig.color} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-black text-slate-900 dark:text-white mb-1">{item.fee_type}</Text>
              <Text className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                Due: {dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          </View>
          <View className={`flex-row items-center px-4 py-1.5 rounded-xl ${statusConfig.bgColor}`}>
            <Text className={`text-[10px] font-black uppercase tracking-widest ${statusConfig.color}`}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl mb-6 border border-slate-100 dark:border-slate-800/30">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total</Text>
            <Text className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(item.amount)}</Text>
          </View>
          <View className="flex-row justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Balance</Text>
            <Text className={`text-xl font-black ${item.balance_amount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
              {formatCurrency(item.balance_amount)}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          {item.balance_amount > 0 && (
            <TouchableOpacity
              className="flex-1 bg-indigo-600 py-4 rounded-xl flex-row items-center justify-center active:scale-95 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
              onPress={() => handlePayFee(item)}
            >
              <Icon name="credit-card-outline" size={18} color="white" />
              <Text className="ml-2 text-white font-black uppercase tracking-widest text-xs">Pay Now</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="flex-1 bg-slate-50 dark:bg-slate-800/50 py-4 rounded-xl flex-row items-center justify-center active:scale-95 transition-all border border-slate-100 dark:border-slate-700"
            onPress={() => navigation.navigate('FeeDetails', { feeId: item.id })}
          >
            <Text className="text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest text-xs">Details</Text>
            <Icon name="chevron-right" size={18} className="text-slate-400 dark:text-slate-500" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const filteredFees = fees.filter((fee) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return fee.balance_amount > 0;
    if (filter === 'paid') return fee.balance_amount === 0;
    return true;
  });

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-950">
        <Header title="Fee Overview" />
        <LoadingSpinner fullScreen text="Loading fees..." />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Fees" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Summary Card */}
        <View className="p-6">
          <View className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
            <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-8">Overall Summary</Text>
            <View className="flex-row justify-between items-center mb-10">
              <View className="items-center flex-1">
                <Text className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(summary.total_fee)}</Text>
                <Text className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Total</Text>
              </View>
              <View className="w-px h-12 bg-slate-100 dark:bg-slate-800" />
              <View className="items-center flex-1">
                <Text className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(summary.total_paid)}</Text>
                <Text className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Paid</Text>
              </View>
              <View className="w-px h-12 bg-slate-100 dark:bg-slate-800" />
              <View className="items-center flex-1">
                <Text className="text-2xl font-black text-rose-600 dark:text-rose-400">{formatCurrency(summary.total_balance)}</Text>
                <Text className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Balance</Text>
              </View>
            </View>

            {summary.next_due_amount > 0 && (
              <View className="flex-row items-center bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                <View className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 items-center justify-center mr-4">
                  <Icon name="calendar-clock" size={20} color="#D97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-[8px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1">Next Payment Due</Text>
                  <Text className="text-sm font-black text-slate-900 dark:text-white">
                    {formatCurrency(summary.next_due_amount)} • {new Date(summary.next_due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row px-6 gap-4 mb-10">
          <TouchableOpacity
            className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-[24px] items-center border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-all"
            onPress={() => navigation.navigate('PaymentHistory')}
          >
            <View className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 items-center justify-center mb-4">
              <Icon name="history" size={24} color="#2563EB" />
            </View>
            <Text className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-[24px] items-center border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-all"
            onPress={() => navigation.navigate('FeeStructure')}
          >
            <View className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 items-center justify-center mb-4">
              <Icon name="file-document-outline" size={24} color="#059669" />
            </View>
            <Text className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Structure</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View className="flex-row px-6 gap-3 mb-8">
          <FilterButton type="all" label="All" icon="card-bulleted-outline" />
          <FilterButton type="pending" label="Pending" icon="clock-fast" />
          <FilterButton type="paid" label="Paid" icon="check-all" />
        </View>

        {/* Fee Items */}
        <View className="px-6">
          {filteredFees.length > 0 ? (
            filteredFees.map((fee) => <FeeCard key={fee.id} item={fee} />)
          ) : (
            <View className="items-center py-20 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800">
              <Icon name="cash-check" size={64} color="#E2E8F0" />
              <Text className="text-xl font-black text-slate-300 dark:text-slate-700 mt-6 uppercase tracking-widest">Clear!</Text>
              <Text className="text-xs font-black text-slate-400 dark:text-slate-500 text-center px-10 mt-2 uppercase tracking-widest">
                No fee records found.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default FeeOverviewScreen;
