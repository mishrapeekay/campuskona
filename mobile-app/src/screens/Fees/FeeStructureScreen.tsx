import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

interface FeeCategory {
  id: string;
  name: string;
  amount: number;
  description: string;
  mandatory: boolean;
  icon: string;
}

interface Installment {
  id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
}

interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
}

interface FeeStructure {
  academic_year: string;
  class: string;
  section: string;
  categories: FeeCategory[];
  installments: Installment[];
  discounts: Discount[];
  total_amount: number;
  discount_amount: number;
  payable_amount: number;
}

const FeeStructureScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [feeStructure, setFeeStructure] = useState<FeeStructure | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeeStructure();
  }, []);

  const loadFeeStructure = async () => {
    setLoading(true);
    try {
      const mockStructure: FeeStructure = {
        academic_year: '2025-2026',
        class: 'Class 10',
        section: 'A',
        categories: [
          { id: 'cat-1', name: 'Tuition Fee', amount: 50000, description: 'Annual tuition fee for academic year 2025-2026', mandatory: true, icon: 'book-open-variant' },
          { id: 'cat-2', name: 'Transport Fee', amount: 12000, description: 'Annual school bus service (Route: Sector 15)', mandatory: false, icon: 'bus-school' },
          { id: 'cat-3', name: 'Library Fee', amount: 2000, description: 'Library access and book borrowing facility', mandatory: true, icon: 'bookshelf' },
          { id: 'cat-4', name: 'Sports Fee', amount: 5000, description: 'Sports facilities and annual sports day', mandatory: true, icon: 'soccer' },
          { id: 'cat-5', name: 'Lab Fee', amount: 8000, description: 'Science and computer lab usage', mandatory: true, icon: 'flask' },
          { id: 'cat-6', name: 'Exam Fee', amount: 3000, description: 'Mid-term and final examination fees', mandatory: true, icon: 'certificate' },
        ],
        installments: [
          { id: 'inst-1', installment_number: 1, amount: 28000, due_date: '2025-04-15', status: 'paid' },
          { id: 'inst-2', installment_number: 2, amount: 28000, due_date: '2025-07-15', status: 'pending' },
          { id: 'inst-3', installment_number: 3, amount: 28000, due_date: '2025-10-15', status: 'pending' },
        ],
        discounts: [
          { id: 'disc-1', name: 'Sibling Discount', type: 'percentage', value: 10, description: 'Second child gets 10% discount on tuition fee' },
        ],
        total_amount: 84000,
        discount_amount: 7000,
        payable_amount: 77000,
      };

      setFeeStructure(mockStructure);
    } catch (error) {
      console.error('Failed to load fee structure:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeeStructure();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`;

  const getStatusConfig = (status: string) => {
    const configs: any = {
      paid: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Paid' },
      pending: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Pending' },
      overdue: { color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', label: 'Overdue' },
    };
    return configs[status] || configs.pending;
  };

  const handleShare = async () => {
    if (!feeStructure) return;
    const message = `Fee Structure ${feeStructure.academic_year}\nTotal: ${formatCurrency(feeStructure.payable_amount)}`;
    try { await Share.share({ message }); } catch (e) { console.error(e); }
  };

  if (loading || !feeStructure) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-950">
        <Header title="Fee Structure" showBackButton onBackPress={() => navigation.goBack()} />
        <View className="flex-1 items-center justify-center p-10">
          <Icon name="file-document-outline" size={64} className="text-slate-200 dark:text-slate-800" />
          <Text className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-6">Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header
        title="Fee Structure"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={handleShare} className="p-2">
            <Icon name="share-variant-outline" size={24} className="text-indigo-600 dark:text-indigo-400" />
          </TouchableOpacity>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Info Card */}
        <View className="p-6">
          <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex-row justify-between">
            <View>
              <Text className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Academic Year</Text>
              <Text className="text-base font-black text-slate-900 dark:text-white">{feeStructure.academic_year}</Text>
            </View>
            <View className="items-end">
              <Text className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Class & Section</Text>
              <Text className="text-base font-black text-slate-900 dark:text-white">{feeStructure.class} - {feeStructure.section}</Text>
            </View>
          </View>
        </View>

        {/* Summary Card */}
        <View className="px-6 mb-8">
          <View className="bg-indigo-600 rounded-[32px] p-8 shadow-xl shadow-indigo-200 dark:shadow-none">
            <Text className="text-[10px] font-black text-indigo-200 uppercase tracking-[2px] mb-8">Payable Summary</Text>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white/70 font-bold">Total Base Fee</Text>
              <Text className="text-xl font-black text-white">{formatCurrency(feeStructure.total_amount)}</Text>
            </View>
            {feeStructure.discount_amount > 0 && (
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-emerald-300 font-bold">Discounts Applied</Text>
                <Text className="text-xl font-black text-emerald-300">- {formatCurrency(feeStructure.discount_amount)}</Text>
              </View>
            )}
            <View className="h-px bg-white/10 mb-6" />
            <View className="flex-row justify-between items-center">
              <Text className="text-white font-black text-lg">Net Payable</Text>
              <Text className="text-3xl font-black text-white">{formatCurrency(feeStructure.payable_amount)}</Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        <View className="px-6 mb-8">
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-6">Fee Categories</Text>
          {feeStructure.categories.map((cat) => (
            <View key={cat.id} className="bg-white dark:bg-slate-900 rounded-[28px] p-6 mb-4 border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 items-center justify-center mr-4">
                    <Icon name={cat.icon} size={24} className="text-indigo-600 dark:text-indigo-400" />
                  </View>
                  <View className="flex-1 mr-2">
                    <Text className="text-base font-black text-slate-900 dark:text-white">{cat.name}</Text>
                    {cat.mandatory && (
                      <Text className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1">Required</Text>
                    )}
                  </View>
                </View>
                <Text className="text-lg font-black text-slate-900 dark:text-white">{formatCurrency(cat.amount)}</Text>
              </View>
              <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-5">{cat.description}</Text>
            </View>
          ))}
        </View>

        {/* Installments */}
        <View className="px-6 mb-8">
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-6">Installment Plan</Text>
          <View className="bg-white dark:bg-slate-900 rounded-[32px] p-2 border border-slate-100 dark:border-slate-800">
            {feeStructure.installments.map((inst, idx) => {
              const config = getStatusConfig(inst.status);
              return (
                <View key={inst.id} className={`p-6 flex-row items-center justify-between ${idx !== feeStructure.installments.length - 1 ? 'border-b border-slate-50 dark:border-slate-800/50' : ''}`}>
                  <View>
                    <Text className="text-sm font-black text-slate-900 dark:text-white">Installment {inst.installment_number}</Text>
                    <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Due: {new Date(inst.due_date).toLocaleDateString()}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-base font-black text-slate-900 dark:text-white mb-2">{formatCurrency(inst.amount)}</Text>
                    <View className={`px-3 py-1 rounded-lg ${config.bg}`}>
                      <Text className={`text-[8px] font-black uppercase tracking-widest ${config.color}`}>{config.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Action Button */}
        <View className="px-6 mt-4">
          <TouchableOpacity
            className="bg-slate-900 dark:bg-white h-16 rounded-[24px] flex-row items-center justify-center active:scale-95 transition-all shadow-xl shadow-slate-200 dark:shadow-none"
            onPress={() => { }} // Download PDF
          >
            <Icon name="file-pdf-box" size={24} className="text-white dark:text-slate-900" />
            <Text className="ml-3 text-white dark:text-slate-900 font-black uppercase tracking-widest text-sm">Download PDF Structure</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default FeeStructureScreen;
