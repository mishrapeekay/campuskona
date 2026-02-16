import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '@/components/layout/Header';
import { useNavigation } from '@react-navigation/native';

const ReturnBookScreen: React.FC = () => {
  const navigation = useNavigation();
  const [bookId, setBookId] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  const handleScanBook = () => {
    // Implement barcode scanning
  };

  const handleReturnBook = () => {
    // Implement book return logic
  };

  // Mock data for issued book
  const mockIssue = {
    book: {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0-7432-7356-5',
    },
    borrower: {
      name: 'John Doe',
      role: 'Student - Class X-A',
      id: 'STU-2024-001',
    },
    issueDate: '2024-01-15',
    dueDate: '2024-01-29',
    isOverdue: true,
    daysOverdue: 3,
    fine: 30,
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Return Book" showBackButton onBackPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="p-6">
          {/* Book Search */}
          <View className="mb-8">
            <Text className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Scan or Enter Book ID</Text>
            <View className="flex-row gap-3">
              <View className="flex-1 flex-row items-center bg-white dark:bg-slate-900 h-14 rounded-2xl border border-slate-100 dark:border-slate-800 px-4 shadow-sm shadow-slate-200 dark:shadow-none">
                <Icon name="barcode" size={22} className="text-slate-400 dark:text-slate-500 mr-3" />
                <TextInput
                  className="flex-1 text-slate-900 dark:text-slate-100 font-medium"
                  placeholder="Enter Book ID or ISBN"
                  value={bookId}
                  onChangeText={setBookId}
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <TouchableOpacity
                className="w-14 h-14 bg-indigo-600 rounded-2xl items-center justify-center shadow-sm shadow-indigo-300"
                onPress={handleScanBook}
              >
                <Icon name="barcode-scan" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Issue Details */}
          {selectedIssue || true ? (
            <>
              {/* Book & Borrower Cards */}
              <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                <View className="flex-row items-center border-b border-slate-50 dark:border-slate-800 pb-5 mb-5">
                  <View className="w-16 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl items-center justify-center mr-4">
                    <Icon name="book" size={32} className="text-indigo-600 dark:text-indigo-400" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Book Details</Text>
                    <Text className="text-base font-bold text-slate-900 dark:text-slate-100" numberOfLines={1}>{mockIssue.book.title}</Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">by {mockIssue.book.author}</Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-full items-center justify-center mr-4">
                    <Icon name="account" size={30} className="text-emerald-600 dark:text-emerald-400" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Borrower</Text>
                    <Text className="text-base font-bold text-slate-900 dark:text-slate-100">{mockIssue.borrower.name}</Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{mockIssue.borrower.role}</Text>
                  </View>
                </View>
              </View>

              {/* Issue Info Grid */}
              <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-5">Issue Information</Text>
                <View className="flex-row flex-wrap">
                  <View className="w-1/2 mb-5">
                    <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Issue Date</Text>
                    <Text className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{mockIssue.issueDate}</Text>
                  </View>
                  <View className="w-1/2 mb-5">
                    <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Due Date</Text>
                    <Text className={`text-sm font-bold mt-1 ${mockIssue.isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {mockIssue.dueDate}
                    </Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Return Date</Text>
                    <Text className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{new Date().toISOString().split('T')[0]}</Text>
                  </View>
                  <View className="w-1/2">
                    <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Status</Text>
                    <View className={`self-start px-2 py-0.5 rounded-lg mt-1 ${mockIssue.isOverdue ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                      <Text className={`text-[10px] font-black uppercase tracking-tighter ${mockIssue.isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {mockIssue.isOverdue ? `${mockIssue.daysOverdue} Days Overdue` : 'On Time'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Fine Card (if overdue) */}
              {mockIssue.isOverdue && (
                <View className="bg-rose-50/50 dark:bg-rose-900/10 rounded-3xl p-5 mb-8 border border-rose-100 dark:border-rose-900/30">
                  <View className="flex-row items-center gap-2 mb-4">
                    <Icon name="currency-inr" size={20} className="text-rose-600 dark:text-rose-400" />
                    <Text className="text-sm font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">Fine Details</Text>
                  </View>
                  <View className="gap-3">
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-slate-500 dark:text-slate-400">Days Overdue</Text>
                      <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">{mockIssue.daysOverdue} days</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-slate-500 dark:text-slate-400">Fine per Day</Text>
                      <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">₹10</Text>
                    </View>
                    <View className="flex-row justify-between items-center pt-3 border-t border-rose-100 dark:border-rose-900/30 mt-1">
                      <Text className="text-base font-bold text-slate-900 dark:text-slate-100">Total Fine</Text>
                      <Text className="text-2xl font-black text-rose-600 dark:text-rose-400">₹{mockIssue.fine}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Return Button */}
              <TouchableOpacity
                className="flex-row items-center justify-center bg-indigo-600 h-14 rounded-2xl gap-3 shadow-sm shadow-indigo-300"
                onPress={handleReturnBook}
              >
                <Icon name="book-arrow-left" size={24} color="white" />
                <Text className="text-white font-black text-lg">
                  {mockIssue.isOverdue ? `Return & Collect Fine` : 'Confirm Return'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="items-center justify-center py-20">
              <Icon name="book-search" size={80} className="text-slate-200 dark:text-slate-800" />
              <Text className="text-base text-slate-500 dark:text-slate-400 mt-6 text-center px-10">Scan or enter a book ID to process return</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ReturnBookScreen;
