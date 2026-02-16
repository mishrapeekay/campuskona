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

const IssueBookScreen: React.FC = () => {
  const navigation = useNavigation();
  const [bookId, setBookId] = useState('');
  const [userId, setUserId] = useState('');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleScanBook = () => {
    // Implement barcode scanning
  };

  const handleIssueBook = () => {
    // Implement book issue logic
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Issue Book" showBackButton onBackPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="p-6">
          {/* Book Search */}
          <View className="mb-8">
            <Text className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Book Details</Text>
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

            {(selectedBook || true) && (
              <View className="mt-4 flex-row items-center bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <View className="w-16 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl items-center justify-center mr-4">
                  <Icon name="book" size={32} className="text-indigo-600 dark:text-indigo-400" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedBook?.title || 'Enter book ID to search'}
                  </Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedBook?.author || 'Scan barcode to automatically fetch book'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* User Search */}
          <View className="mb-8">
            <Text className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Borrower Details</Text>
            <View className="flex-row items-center bg-white dark:bg-slate-900 h-14 rounded-2xl border border-slate-100 dark:border-slate-800 px-4 shadow-sm shadow-slate-200 dark:shadow-none">
              <Icon name="account-search" size={22} className="text-slate-400 dark:text-slate-500 mr-3" />
              <TextInput
                className="flex-1 text-slate-900 dark:text-slate-100 font-medium"
                placeholder="Enter Student/Staff ID"
                value={userId}
                onChangeText={setUserId}
                placeholderTextColor="#94A3B8"
              />
            </View>

            {(selectedUser || true) && (
              <View className="mt-4 flex-row items-center bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <View className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full items-center justify-center mr-4">
                  <Icon name="account" size={32} className="text-emerald-600 dark:text-emerald-400" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedUser?.name || 'Enter ID to find student/staff'}
                  </Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedUser?.role || 'Check details before issuing book'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Issue Details */}
          <View className="mb-8">
            <Text className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Issue Details</Text>
            <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
              <View className="flex-row justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
                <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">Issue Date</Text>
                <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">{new Date().toLocaleDateString()}</Text>
              </View>
              <View className="flex-row justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
                <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">Due Date</Text>
                <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-3">
                <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">Duration</Text>
                <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">14 Days</Text>
              </View>
            </View>
          </View>

          {/* Issue Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-emerald-600 h-14 rounded-2xl gap-3 shadow-sm shadow-emerald-300"
            onPress={handleIssueBook}
          >
            <Icon name="book-arrow-right" size={24} color="white" />
            <Text className="text-white font-black text-lg">Issue Book</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default IssueBookScreen;

