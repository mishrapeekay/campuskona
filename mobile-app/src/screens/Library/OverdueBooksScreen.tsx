import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

interface OverdueBook {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  borrowerName: string;
  borrowerClass: string;
  borrowerPhone: string;
  dueDate: string;
  daysOverdue: number;
  fineAmount: number;
}

const OverdueBooksScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const overdueBooks: OverdueBook[] = [
    {
      id: '1',
      bookTitle: 'The Great Gatsby',
      bookAuthor: 'F. Scott Fitzgerald',
      borrowerName: 'John Doe',
      borrowerClass: 'Class X-A',
      borrowerPhone: '+91 98765 43210',
      dueDate: '2024-01-20',
      daysOverdue: 7,
      fineAmount: 70,
    },
    {
      id: '2',
      bookTitle: 'Pride and Prejudice',
      bookAuthor: 'Jane Austen',
      borrowerName: 'Sarah Wilson',
      borrowerClass: 'Class IX-B',
      borrowerPhone: '+91 87654 32109',
      dueDate: '2024-01-18',
      daysOverdue: 9,
      fineAmount: 90,
    },
    {
      id: '3',
      bookTitle: 'The Catcher in the Rye',
      bookAuthor: 'J.D. Salinger',
      borrowerName: 'Alex Brown',
      borrowerClass: 'Class XI-A',
      borrowerPhone: '+91 76543 21098',
      dueDate: '2024-01-22',
      daysOverdue: 5,
      fineAmount: 50,
    },
  ];

  const totalFine = overdueBooks.reduce((sum, book) => sum + book.fineAmount, 0);

  const renderBookItem = ({ item }: { item: OverdueBook }) => (
    <View className="bg-white dark:bg-slate-900 rounded-3xl mb-5 overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
      <View className="flex-row items-center bg-rose-50 dark:bg-rose-900/20 px-4 py-2 gap-2">
        <Icon name="alert-circle" size={18} className="text-rose-600 dark:text-rose-400" />
        <Text className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">{item.daysOverdue} days overdue</Text>
      </View>

      <View className="p-5">
        <View className="mb-4">
          <Text className="text-base font-bold text-slate-900 dark:text-slate-100">{item.bookTitle}</Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">by {item.bookAuthor}</Text>
        </View>

        <View className="flex-row items-center py-4 border-t border-b border-slate-50 dark:border-slate-800">
          <View className="w-11 h-11 rounded-full bg-rose-600 items-center justify-center mr-3">
            <Icon name="account" size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.borrowerName}</Text>
            <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{item.borrowerClass}</Text>
            <Text className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">{item.borrowerPhone}</Text>
          </View>
        </View>

        <View className="flex-row py-4">
          <View className="flex-1">
            <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Due Date</Text>
            <Text className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{item.dueDate}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">Fine Amount</Text>
            <Text className="text-lg font-black text-rose-600 dark:text-rose-400 text-right mt-0.5">₹{item.fineAmount}</Text>
          </View>
        </View>

        <View className="flex-row gap-2 mt-2">
          <TouchableOpacity className="flex-row items-center justify-center px-4 py-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10 gap-1.5">
            <Icon name="phone" size={16} className="text-indigo-600 dark:text-indigo-400" />
            <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Call</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center justify-center px-4 py-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10 gap-1.5">
            <Icon name="message" size={16} className="text-indigo-600 dark:text-indigo-400" />
            <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400">SMS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl bg-indigo-600 gap-1.5"
            onPress={() => navigation.navigate('ReturnBook')}
          >
            <Icon name="book-arrow-left" size={18} color="white" />
            <Text className="text-xs font-bold text-white">Process Return</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Overdue Books" showBackButton onBackPress={() => navigation.goBack()} />

      {/* Summary Card */}
      <View className="flex-row bg-white dark:bg-slate-900 mx-5 mt-4 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <View className="flex-1 items-center">
          <Icon name="book-alert" size={28} className="text-rose-600 dark:text-rose-400" />
          <Text className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">{overdueBooks.length}</Text>
          <Text className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">Overdue</Text>
        </View>
        <View className="w-[1px] bg-slate-100 dark:bg-slate-800 h-full mx-4" />
        <View className="flex-1 items-center">
          <Icon name="currency-inr" size={28} className="text-amber-500 dark:text-amber-400" />
          <Text className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">₹{totalFine}</Text>
          <Text className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">Total Fine</Text>
        </View>
      </View>

      {/* Send Bulk Reminder */}
      <TouchableOpacity className="flex-row items-center justify-center bg-amber-500 mx-5 my-4 h-14 rounded-2xl gap-3 shadow-sm shadow-amber-200">
        <Icon name="bell-ring" size={20} color="white" />
        <Text className="text-white font-black">Send Reminder to All ({overdueBooks.length})</Text>
      </TouchableOpacity>

      {/* Overdue List */}
      <FlatList
        data={overdueBooks}
        keyExtractor={(item) => item.id}
        renderItem={renderBookItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Icon name="check-circle" size={80} className="text-emerald-500/20 dark:text-emerald-500/10" />
            <Text className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-6 mb-2">All Clear!</Text>
            <Text className="text-base text-slate-500 dark:text-slate-400 text-center px-10">No overdue books at the moment. Good job!</Text>
          </View>
        }
      />
    </View>
  );
};

export default OverdueBooksScreen;
