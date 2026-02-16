import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { libraryService } from '@/services/api';

interface IssuedBook {
  id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  isbn: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: 'issued' | 'returned' | 'overdue';
  fine_amount: number;
  renewal_count: number;
  max_renewals: number;
}

interface ReservedBook {
  id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  reservation_date: string;
  expected_available_date: string;
  status: 'pending' | 'ready' | 'cancelled' | 'expired';
  position_in_queue: number;
}

type TabType = 'issued' | 'reserved' | 'history';

const MyBooksScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('issued');
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
  const [reservedBooks, setReservedBooks] = useState<ReservedBook[]>([]);
  const [history, setHistory] = useState<IssuedBook[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockIssued: IssuedBook[] = [
        {
          id: 'issue-1',
          book_id: 'book-1',
          book_title: 'To Kill a Mockingbird',
          book_author: 'Harper Lee',
          isbn: '978-0-06-112008-4',
          issue_date: '2026-01-01',
          due_date: '2026-01-22',
          status: 'issued',
          fine_amount: 0,
          renewal_count: 0,
          max_renewals: 2,
        },
        {
          id: 'issue-2',
          book_id: 'book-2',
          book_title: 'A Brief History of Time',
          book_author: 'Stephen Hawking',
          isbn: '978-0-553-10953-5',
          issue_date: '2025-12-20',
          due_date: '2026-01-10',
          status: 'overdue',
          fine_amount: 30,
          renewal_count: 1,
          max_renewals: 2,
        },
      ];

      const mockReserved: ReservedBook[] = [
        {
          id: 'res-1',
          book_id: 'book-3',
          book_title: '1984',
          book_author: 'George Orwell',
          reservation_date: '2026-01-10',
          expected_available_date: '2026-01-25',
          status: 'pending',
          position_in_queue: 2,
        },
        {
          id: 'res-2',
          book_id: 'book-5',
          book_title: 'Introduction to Algorithms',
          book_author: 'Thomas H. Cormen',
          reservation_date: '2026-01-12',
          expected_available_date: '2026-01-18',
          status: 'ready',
          position_in_queue: 1,
        },
      ];

      const mockHistory: IssuedBook[] = [
        {
          id: 'hist-1',
          book_id: 'book-4',
          book_title: 'The Elements of Style',
          book_author: 'William Strunk Jr.',
          isbn: '978-0-205-30902-3',
          issue_date: '2025-11-15',
          due_date: '2025-12-06',
          return_date: '2025-12-05',
          status: 'returned',
          fine_amount: 0,
          renewal_count: 0,
          max_renewals: 2,
        },
        {
          id: 'hist-2',
          book_id: 'book-6',
          book_title: 'Sapiens: A Brief History of Humankind',
          book_author: 'Yuval Noah Harari',
          isbn: '978-0-062-31609-7',
          issue_date: '2025-10-20',
          due_date: '2025-11-10',
          return_date: '2025-11-15',
          status: 'returned',
          fine_amount: 25,
          renewal_count: 1,
          max_renewals: 2,
        },
      ];

      setIssuedBooks(mockIssued);
      setReservedBooks(mockReserved);
      setHistory(mockHistory);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRenewBook = async (bookId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Book renewed successfully. New due date updated.');
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to renew book');
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    Alert.alert('Cancel Reservation', 'Are you sure you want to cancel this reservation?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            Alert.alert('Success', 'Reservation cancelled successfully');
            await loadData();
          } catch (error) {
            Alert.alert('Error', 'Failed to cancel reservation');
          }
        },
      },
    ]);
  };

  const handlePayFine = (issueId: string, amount: number) => {
    // @ts-ignore
    navigation.navigate('PaymentGateway', {
      type: 'library_fine',
      issueId,
      amount,
    });
  };

  const renderIssuedBook = ({ item }: { item: IssuedBook }) => {
    const daysRemaining = getDaysRemaining(item.due_date);
    const isOverdue = daysRemaining < 0;
    const canRenew = item.renewal_count < item.max_renewals && !isOverdue;

    return (
      <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-800 shadow-sm">
        <View className="flex-row items-start mb-5">
          <View className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 items-center justify-center mr-4">
            <Icon name="book-open-variant" size={26} className="text-indigo-600 dark:text-indigo-400" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1" numberOfLines={2}>
              {item.book_title}
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400" numberOfLines={1}>
              {item.book_author}
            </Text>
          </View>
          {isOverdue && (
            <View className="flex-row items-center px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 gap-1 ml-2">
              <Icon name="alert-circle" size={14} className="text-rose-600 dark:text-rose-400" />
              <Text className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">Overdue</Text>
            </View>
          )}
        </View>

        <View className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-5 border border-slate-Inst/20 dark:border-slate-700/30">
          <View className="flex-row items-center gap-3 mb-2">
            <Icon name="calendar-check" size={16} className="text-slate-400 dark:text-slate-500" />
            <Text className="text-sm text-slate-600 dark:text-slate-300">Issued: {formatDate(item.issue_date)}</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Icon name="calendar-clock" size={16} className={isOverdue ? "text-rose-500" : "text-slate-400 dark:text-slate-500"} />
            <Text className={`text-sm ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
              Due: {formatDate(item.due_date)}
              {isOverdue && ` (${Math.abs(daysRemaining)} days overdue)`}
              {!isOverdue && daysRemaining <= 3 && ` (${daysRemaining} days left)`}
            </Text>
          </View>
          {item.fine_amount > 0 && (
            <View className="flex-row items-center gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <Icon name="alert" size={16} className="text-rose-600" />
              <Text className="text-sm font-bold text-rose-600">Fine: ₹{item.fine_amount}</Text>
            </View>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Renewals: {item.renewal_count}/{item.max_renewals}
          </Text>
        </View>

        <View className="flex-row gap-3">
          {item.fine_amount > 0 && (
            <TouchableOpacity
              className="flex-1 bg-indigo-600 py-3.5 rounded-2xl items-center justify-center shadow-sm shadow-indigo-200"
              onPress={() => handlePayFine(item.id, item.fine_amount)}
            >
              <Text className="text-white font-bold text-sm">Pay Fine ₹{item.fine_amount}</Text>
            </TouchableOpacity>
          )}
          {canRenew && (
            <TouchableOpacity
              className="flex-1 bg-slate-100 dark:bg-slate-800 py-3.5 rounded-2xl flex-row items-center justify-center gap-2"
              onPress={() => handleRenewBook(item.id)}
            >
              <Icon name="refresh" size={18} className="text-slate-600 dark:text-slate-300" />
              <Text className="text-slate-700 dark:text-slate-200 font-bold text-sm">Renew</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderReservedBook = ({ item }: { item: ReservedBook }) => {
    const getStatusConfig = (status: string) => {
      const configs = {
        pending: { icon: 'clock-outline', colorClass: 'text-amber-600 dark:text-amber-400', label: 'Pending', bgClass: 'bg-amber-50 dark:bg-amber-900/20' },
        ready: { icon: 'check-circle', colorClass: 'text-emerald-600 dark:text-emerald-400', label: 'Ready to Collect', bgClass: 'bg-emerald-50 dark:bg-emerald-900/20' },
        cancelled: { icon: 'close-circle', colorClass: 'text-rose-600 dark:text-rose-400', label: 'Cancelled', bgClass: 'bg-rose-50 dark:bg-rose-900/20' },
        expired: { icon: 'alert-circle', colorClass: 'text-slate-500 dark:text-slate-400', label: 'Expired', bgClass: 'bg-slate-100 dark:bg-slate-800' },
      };
      return configs[status as keyof typeof configs] || configs.pending;
    };

    const statusConfig = getStatusConfig(item.status);

    return (
      <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-800 shadow-sm">
        <View className="flex-row items-start mb-5">
          <View className={`w-12 h-12 rounded-2xl ${statusConfig.bgClass} items-center justify-center mr-4`}>
            <Icon name="bookmark" size={26} className={statusConfig.colorClass} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1" numberOfLines={2}>
              {item.book_title}
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400" numberOfLines={1}>
              {item.book_author}
            </Text>
          </View>
          <View className={`flex-row items-center px-2.5 py-1 rounded-full ${statusConfig.bgClass} gap-1 ml-2`}>
            <Icon name={statusConfig.icon} size={14} className={statusConfig.colorClass} />
            <Text className={`text-[10px] font-bold uppercase ${statusConfig.colorClass}`}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-5 border border-slate-100/20 dark:border-slate-700/30">
          <View className="flex-row items-center gap-3 mb-2">
            <Icon name="calendar-plus" size={16} className="text-slate-400 dark:text-slate-500" />
            <Text className="text-sm text-slate-600 dark:text-slate-300">Reserved: {formatDate(item.reservation_date)}</Text>
          </View>
          <View className="flex-row items-center gap-3 mb-2">
            <Icon name="calendar-clock" size={16} className="text-slate-400 dark:text-slate-500" />
            <Text className="text-sm text-slate-600 dark:text-slate-300">
              Expected: {formatDate(item.expected_available_date)}
            </Text>
          </View>
          {item.status === 'pending' && (
            <View className="flex-row items-center gap-3">
              <Icon name="format-list-numbered" size={16} className="text-slate-400 dark:text-slate-500" />
              <Text className="text-sm text-slate-600 dark:text-slate-300">Position in queue: {item.position_in_queue}</Text>
            </View>
          )}
        </View>

        {item.status === 'ready' && (
          <View className="flex-row items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl mb-5 border border-emerald-100 dark:border-emerald-800/30">
            <Icon name="information" size={20} className="text-emerald-600 dark:text-emerald-400" />
            <Text className="flex-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Your book is ready! Please collect it from the library within 2 days.
            </Text>
          </View>
        )}

        {(item.status === 'pending' || item.status === 'ready') && (
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-slate-100 dark:bg-slate-800 py-3.5 rounded-2xl items-center justify-center border border-slate-200 dark:border-slate-700"
              onPress={() => handleCancelReservation(item.id)}
            >
              <Text className="text-slate-600 dark:text-slate-300 font-bold text-sm">Cancel Reservation</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderHistoryItem = ({ item }: { item: IssuedBook }) => {
    const isLate = item.return_date && item.return_date > item.due_date;

    return (
      <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-3 border border-slate-100 dark:border-slate-800 shadow-sm">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center mr-4">
            <Icon name="history" size={22} className="text-slate-500 dark:text-slate-400" />
          </View>
          <View className="flex-1 mr-2">
            <Text className="text-base font-bold text-slate-900 dark:text-slate-100 mb-0.5" numberOfLines={1}>
              {item.book_title}
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400" numberOfLines={1}>
              {item.book_author}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} className="text-slate-300 dark:text-slate-700" />
        </View>

        <View className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
          <View className="flex-row justify-between mb-2">
            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">Issued:</Text>
            <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatDate(item.issue_date)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">Returned:</Text>
            <Text className={`text-xs font-bold ${isLate ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
              {formatDate(item.return_date!)}
              {isLate && ' (Late)'}
            </Text>
          </View>
          {item.fine_amount > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">Fine Paid:</Text>
              <Text className="text-xs font-black text-rose-600">
                ₹{item.fine_amount}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (activeTab === 'issued') {
      return (
        <FlatList
          data={issuedBooks}
          keyExtractor={(item) => item.id}
          renderItem={renderIssuedBook}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeTab === 'issued' ? '#4F46E5' : undefined} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Icon name="book-off-outline" size={80} className="text-slate-200 dark:text-slate-800" />
              <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mt-6 mb-2">No Issued Books</Text>
              <Text className="text-base text-slate-500 dark:text-slate-400 text-center px-10">
                You don't have any books currently issued from the library.
              </Text>
            </View>
          }
        />
      );
    }

    if (activeTab === 'reserved') {
      return (
        <FlatList
          data={reservedBooks}
          keyExtractor={(item) => item.id}
          renderItem={renderReservedBook}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Icon name="bookmark-off-outline" size={80} className="text-slate-200 dark:text-slate-800" />
              <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mt-6 mb-2">No Reserved Books</Text>
              <Text className="text-base text-slate-500 dark:text-slate-400 text-center px-10">You don't have any pending reservations.</Text>
            </View>
          }
        />
      );
    }

    return (
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Icon name="history" size={80} className="text-slate-200 dark:text-slate-800" />
            <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mt-6 mb-2">No History</Text>
            <Text className="text-base text-slate-500 dark:text-slate-400 text-center px-10">You haven't borrowed any books from the library yet.</Text>
          </View>
        }
      />
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="My Books" showBackButton onBackPress={() => navigation.goBack()} />

      {/* Tabs */}
      <View className="flex-row bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-4 gap-2 border-b-2 ${activeTab === 'issued' ? 'border-indigo-600' : 'border-transparent'}`}
          onPress={() => setActiveTab('issued')}
        >
          <Icon
            name="book-open-variant"
            size={18}
            className={activeTab === 'issued' ? 'text-indigo-600' : 'text-slate-400 dark:text-slate-500'}
          />
          <Text className={`text-xs font-bold ${activeTab === 'issued' ? 'text-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}>
            Issued ({issuedBooks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-4 gap-2 border-b-2 ${activeTab === 'reserved' ? 'border-indigo-600' : 'border-transparent'}`}
          onPress={() => setActiveTab('reserved')}
        >
          <Icon
            name="bookmark"
            size={18}
            className={activeTab === 'reserved' ? 'text-indigo-600' : 'text-slate-400 dark:text-slate-500'}
          />
          <Text className={`text-xs font-bold ${activeTab === 'reserved' ? 'text-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}>
            Reserved ({reservedBooks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-4 gap-2 border-b-2 ${activeTab === 'history' ? 'border-indigo-600' : 'border-transparent'}`}
          onPress={() => setActiveTab('history')}
        >
          <Icon
            name="history"
            size={18}
            className={activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400 dark:text-slate-500'}
          />
          <Text className={`text-xs font-bold ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}>
            History ({history.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
};

export default MyBooksScreen;
