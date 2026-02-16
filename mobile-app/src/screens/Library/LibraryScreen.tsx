import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '@/components/layout/Header';
import { libraryService, authService } from '@/services/api';
import { BookIssue } from '@/types/models';
import { useNavigation } from '@react-navigation/native';

const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadIssuedBooks = async () => {
    try {
      const user = await authService.getStoredUser();
      if (!user?.student_id) {
        throw new Error('Student profile not found');
      }

      const response = await libraryService.getIssuedBooks(user.student_id);
      setIssues(response);
    } catch (error) {
      console.error('Error loading issued books:', error);
      Alert.alert('Error', 'Failed to load library records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIssuedBooks();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIssuedBooks();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RETURNED': return 'text-emerald-600 dark:text-emerald-400';
      case 'ISSUED': return 'text-indigo-600 dark:text-indigo-400';
      case 'OVERDUE': return 'text-rose-600 dark:text-rose-400';
      default: return 'text-slate-500 dark:text-slate-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'RETURNED': return 'bg-emerald-50 dark:bg-emerald-900/10';
      case 'ISSUED': return 'bg-indigo-50 dark:bg-indigo-900/10';
      case 'OVERDUE': return 'bg-rose-50 dark:bg-rose-900/10';
      default: return 'bg-slate-50 dark:bg-slate-900/50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'RETURNED') return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const activeIssues = issues.filter(i => (i.status === 'ISSUED' || i.status === 'OVERDUE') && (i.book.includes(searchQuery)));
  const returnedIssues = issues.filter(i => i.status === 'RETURNED' && (i.book.includes(searchQuery)));

  const SummarySection = () => {
    const totalIssued = issues.filter(i => i.status === 'ISSUED' || i.status === 'OVERDUE').length;
    const totalOverdue = issues.filter(i => i.status === 'OVERDUE').length;
    const totalFines = issues.reduce((sum, i) => sum + i.fine_amount, 0);

    return (
      <View className="flex-row gap-4 mb-8">
        {[
          { label: 'Issued', value: totalIssued, icon: 'book-open-page-variant', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Overdue', value: totalOverdue, icon: 'alert-circle', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: 'Fines', value: `₹${totalFines}`, icon: 'currency-inr', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((item, idx) => (
          <View key={idx} className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-4 items-center shadow-sm border border-slate-100 dark:border-slate-800">
            <View className={`w-10 h-10 rounded-2xl items-center justify-center mb-3 ${item.bg}`}>
              <Icon name={item.icon} size={20} className={item.color} />
            </View>
            <Text className="text-lg font-black text-slate-900 dark:text-slate-100">{item.value}</Text>
            <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{item.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  const BookIssueCard: React.FC<{ issue: BookIssue }> = ({ issue }) => {
    const overdue = isOverdue(issue.due_date, issue.status);
    const daysRemaining = getDaysRemaining(issue.due_date);

    return (
      <TouchableOpacity
        className="bg-white dark:bg-slate-900 rounded-[28px] p-5 mb-5 shadow-sm border border-slate-100 dark:border-slate-800"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 items-center justify-center mr-4">
            <Icon name="book" size={28} className="text-indigo-600 dark:text-indigo-400" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-black text-slate-900 dark:text-slate-100" numberOfLines={1}>Book ID: {issue.book}</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Library Record #{issue.id}</Text>
          </View>
          <View className={`px-2.5 py-1 rounded-lg ${getStatusBg(issue.status)}`}>
            <Text className={`text-[10px] font-black uppercase tracking-tighter ${getStatusColor(issue.status)}`}>
              {issue.status}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between border-t border-slate-50 dark:border-slate-800 pt-4 mb-4">
          <View>
            <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-tighter mb-1">Issued On</Text>
            <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatDate(issue.issue_date)}</Text>
          </View>
          <View className="items-end">
            <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-tighter mb-1">Due Date</Text>
            <Text className={`text-sm font-bold ${overdue ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'}`}>{formatDate(issue.due_date)}</Text>
          </View>
        </View>

        {(issue.status === 'ISSUED' || overdue) && (
          <View className={`flex-row items-center p-3 rounded-2xl mb-1 ${overdue ? 'bg-rose-50 dark:bg-rose-900/10' : 'bg-indigo-50 dark:bg-indigo-900/10'}`}>
            <Icon name={overdue ? 'alert-circle' : 'clock-outline'} size={16} className={overdue ? 'text-rose-600' : 'text-indigo-600'} />
            <Text className={`text-xs font-bold ml-2 ${overdue ? 'text-rose-600' : 'text-indigo-600'}`}>
              {overdue ? `Overdue by ${Math.abs(daysRemaining)} days` : `${daysRemaining} days remaining`}
            </Text>
          </View>
        )}

        {issue.return_date && (
          <View className="flex-row items-center p-3 rounded-2xl mb-1 bg-emerald-50 dark:bg-emerald-900/10">
            <Icon name="check-circle" size={16} className="text-emerald-600" />
            <Text className="text-xs font-bold ml-2 text-emerald-600">Returned on {formatDate(issue.return_date)}</Text>
          </View>
        )}

        {issue.fine_amount > 0 && (
          <View className="flex-row items-center p-3 rounded-2xl mt-2 bg-amber-50 dark:bg-amber-900/10">
            <Icon name="currency-inr" size={16} className="text-amber-600" />
            <Text className="text-xs font-black ml-2 text-amber-600 uppercase tracking-widest">Fine Charged: ₹{issue.fine_amount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Library" showBackButton onBackPress={() => navigation.goBack()} />
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <SummarySection />

        <View className="flex-row items-center bg-white dark:bg-slate-900 h-14 px-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200 dark:shadow-none mb-8">
          <Icon name="magnify" size={22} className="text-slate-400 dark:text-slate-500" />
          <TextInput
            className="flex-1 ml-3 text-sm font-medium text-slate-900 dark:text-slate-100"
            placeholder="Search by book ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>

        {loading ? (
          <View className="items-center justify-center py-20">
            <Text className="text-slate-400 font-bold uppercase tracking-widest">Fetching records...</Text>
          </View>
        ) : (
          <>
            <View className="mb-8">
              <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-4">Currently Issued</Text>
              {activeIssues.length > 0 ? (
                activeIssues.map((issue) => <BookIssueCard key={issue.id} issue={issue} />)
              ) : (
                <View className="bg-white dark:bg-slate-900 rounded-3xl p-8 items-center border border-slate-100 dark:border-slate-800 border-dashed">
                  <Icon name="book-open-outline" size={32} className="text-slate-200 dark:text-slate-700 mb-2" />
                  <Text className="text-sm font-black text-slate-300 dark:text-slate-600 uppercase tracking-tighter">No active issues</Text>
                </View>
              )}
            </View>

            <View>
              <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-4">Return History</Text>
              {returnedIssues.length > 0 ? (
                returnedIssues.map((issue) => <BookIssueCard key={issue.id} issue={issue} />)
              ) : (
                <View className="bg-white dark:bg-slate-900 rounded-3xl p-8 items-center border border-slate-100 dark:border-slate-800 border-dashed">
                  <Icon name="history" size={32} className="text-slate-200 dark:text-slate-700 mb-2" />
                  <Text className="text-sm font-black text-slate-300 dark:text-slate-600 uppercase tracking-tighter">No history found</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default LibraryScreen;
