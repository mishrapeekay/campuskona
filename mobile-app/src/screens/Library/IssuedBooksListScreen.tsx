import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '@/components/layout/Header';
import { useNavigation } from '@react-navigation/native';

interface IssuedBook {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  borrowerName: string;
  borrowerClass: string;
  issueDate: string;
  dueDate: string;
  isOverdue: boolean;
  daysRemaining: number;
}

const IssuedBooksListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'overdue' | 'due_soon'>('all');

  const issuedBooks: IssuedBook[] = [
    {
      id: '1',
      bookTitle: 'The Great Gatsby',
      bookAuthor: 'F. Scott Fitzgerald',
      borrowerName: 'John Doe',
      borrowerClass: 'Class X-A',
      issueDate: '2024-01-10',
      dueDate: '2024-01-24',
      isOverdue: true,
      daysRemaining: -3,
    },
    {
      id: '2',
      bookTitle: 'To Kill a Mockingbird',
      bookAuthor: 'Harper Lee',
      borrowerName: 'Jane Smith',
      borrowerClass: 'Class IX-B',
      issueDate: '2024-01-15',
      dueDate: '2024-01-29',
      isOverdue: false,
      daysRemaining: 2,
    },
    {
      id: '3',
      bookTitle: '1984',
      bookAuthor: 'George Orwell',
      borrowerName: 'Mike Johnson',
      borrowerClass: 'Class XI-A',
      issueDate: '2024-01-12',
      dueDate: '2024-01-26',
      isOverdue: false,
      daysRemaining: 5,
    },
  ];

  const filters = [
    { key: 'all', label: 'All', count: issuedBooks.length },
    { key: 'overdue', label: 'Overdue', count: issuedBooks.filter(b => b.isOverdue).length },
    { key: 'due_soon', label: 'Due Soon', count: issuedBooks.filter(b => !b.isOverdue && b.daysRemaining <= 3).length },
  ];

  const filteredBooks = issuedBooks.filter(book => {
    const matchesSearch = book.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.borrowerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'overdue') return matchesSearch && book.isOverdue;
    if (filter === 'due_soon') return matchesSearch && !book.isOverdue && book.daysRemaining <= 3;
    return matchesSearch;
  });

  const renderBookItem = ({ item }: { item: IssuedBook }) => (
    <TouchableOpacity
      className="bg-white dark:bg-slate-900 rounded-[28px] p-5 mb-5 shadow-sm border border-slate-100 dark:border-slate-800"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-base font-black text-slate-900 dark:text-slate-100 mb-1" numberOfLines={1}>{item.bookTitle}</Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium">by {item.bookAuthor}</Text>
        </View>
        <View className={`px-2.5 py-1 rounded-lg ${item.isOverdue ? 'bg-rose-50 dark:bg-rose-900/20' :
          item.daysRemaining <= 3 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'
          }`}>
          <Text className={`text-[10px] font-black uppercase tracking-tighter ${item.isOverdue ? 'text-rose-600 dark:text-rose-400' :
            item.daysRemaining <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
            {item.isOverdue ? `${Math.abs(item.daysRemaining)}d overdue` : `${item.daysRemaining}d left`}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center border-t border-slate-50 dark:border-slate-800 pt-4 mb-4 gap-3">
        <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
          <Icon name="account" size={20} className="text-slate-500 dark:text-slate-400" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.borrowerName}</Text>
          <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{item.borrowerClass}</Text>
        </View>
      </View>

      <View className="flex-row justify-between bg-slate-50/50 dark:bg-slate-950/50 p-3 rounded-2xl">
        <View>
          <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-tighter">Issue Date</Text>
          <Text className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{item.issueDate}</Text>
        </View>
        <View className="items-end">
          <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-tighter">Due Date</Text>
          <Text className={`text-sm font-bold mt-0.5 ${item.isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>{item.dueDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Issued Books" showBackButton onBackPress={() => navigation.goBack()} />

      {/* Search & Filter Container */}
      <View className="px-6 py-4">
        <View className="flex-row items-center bg-white dark:bg-slate-900 h-14 px-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200 dark:shadow-none">
          <Icon name="magnify" size={22} className="text-slate-400 dark:text-slate-500" />
          <TextInput
            className="flex-1 ml-3 text-sm font-medium text-slate-900 dark:text-slate-100"
            placeholder="Search book or borrower..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View className="flex-row mt-6 gap-3">
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              className={`flex-row items-center px-4 py-2.5 rounded-xl border ${filter === f.key
                ? 'bg-indigo-600 border-indigo-600'
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                }`}
              onPress={() => setFilter(f.key as any)}
            >
              <Text className={`text-xs font-black uppercase tracking-tighter ${filter === f.key ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                {f.label}
              </Text>
              <View className={`ml-2 px-1.5 rounded-lg min-w-[18px] items-center ${filter === f.key ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Text className={`text-[10px] font-black ${filter === f.key ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {f.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={renderBookItem}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Icon name="book-off-outline" size={80} className="text-slate-200 dark:text-slate-800" />
            <Text className="text-base font-bold text-slate-400 dark:text-slate-500 mt-6">No records found</Text>
          </View>
        }
      />
    </View>
  );
};

export default IssuedBooksListScreen;
