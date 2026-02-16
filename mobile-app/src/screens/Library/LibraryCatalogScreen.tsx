import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import { libraryService } from '@/services/api';
import { Book } from '@/types/models';

// Local Book interface removed in favor of shared model

const CATEGORIES = [
  { id: 'all', label: 'All Books', icon: 'book-open-variant' },
  { id: 'fiction', label: 'Fiction', icon: 'book-open-page-variant' },
  { id: 'non-fiction', label: 'Non-Fiction', icon: 'book-open' },
  { id: 'science', label: 'Science', icon: 'flask' },
  { id: 'mathematics', label: 'Mathematics', icon: 'calculator' },
  { id: 'history', label: 'History', icon: 'clock-outline' },
  { id: 'literature', label: 'Literature', icon: 'feather' },
  { id: 'reference', label: 'Reference', icon: 'book-alphabet' },
];

const LibraryCatalogScreen: React.FC = () => {
  const navigation = useNavigation();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBooks();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery.trim()) params.search = searchQuery;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const response = await libraryService.getBooks(params);
      setBooks(response.results);
      setFilteredBooks(response.results);
    } catch (error) {
      console.error('Failed to load books:', error);
      setBooks([]);
      setFilteredBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  };

  const handleBookPress = (book: Book) => {
    // @ts-ignore
    navigation.navigate('BookDetail', { bookId: book.id });
  };

  const renderBookItem = ({ item }: { item: Book }) => {
    const isAvailable = item.available_copies > 0;

    return (
      <TouchableOpacity onPress={() => handleBookPress(item)} activeOpacity={0.7}>
        <View className="bg-white dark:bg-slate-900 rounded-3xl p-4 mb-4 border border-slate-100 dark:border-slate-800 shadow-sm">
          <View className="flex-row">
            {/* Book Cover */}
            <View className="mr-4">
              {item.cover_image ? (
                <Image source={{ uri: item.cover_image }} className="w-20 h-28 rounded-xl" resizeMode="cover" />
              ) : (
                <View className="w-20 h-28 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 items-center justify-center">
                  <Icon name="book-open-variant" size={32} className="text-indigo-600 dark:text-indigo-400" />
                </View>
              )}
            </View>

            {/* Book Info */}
            <View className="flex-1">
              <Text className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1" numberOfLines={2}>
                {item.title}
              </Text>
              <Text className="text-sm text-slate-500 dark:text-slate-400 mb-3" numberOfLines={1}>
                {item.author}
              </Text>

              {/* Category & Location */}
              <View className="flex-row items-center gap-3 mb-3">
                <View className="bg-sky-50 dark:bg-sky-900/20 px-2 py-0.5 rounded-lg border border-sky-100/50 dark:border-sky-800/50">
                  <Text className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-tighter">{item.category}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Icon name="map-marker" size={12} className="text-slate-400 dark:text-slate-500" />
                  <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{item.location || 'N/A'}</Text>
                </View>
              </View>

              {/* Availability */}
              <View className={`flex-row items-center self-start px-2 py-1 rounded-lg border ${isAvailable ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30'} gap-1.5`}>
                <Icon
                  name={isAvailable ? 'check-circle' : 'close-circle'}
                  size={12}
                  className={isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}
                />
                <Text className={`text-[10px] font-black uppercase ${isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {isAvailable
                    ? `${item.available_copies}/${item.quantity} available`
                    : 'Not Available'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Library Catalog" showBackButton onBackPress={() => navigation.goBack()} />

      {/* Search Bar */}
      <View className="bg-white dark:bg-slate-900 mx-5 my-4 px-4 h-14 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200 dark:shadow-none flex-row items-center">
        <Icon name="magnify" size={22} className="text-slate-400 dark:text-slate-500 mr-3" />
        <TextInput
          className="flex-1 text-slate-900 dark:text-slate-100 font-medium text-sm"
          placeholder="Search by title, author, or ISBN..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94A3B8"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} className="text-slate-300 dark:text-slate-600" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <View className="mb-4">
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`flex-row items-center px-5 py-2.5 rounded-2xl mr-3 border gap-2 ${selectedCategory === item.id
                ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Icon
                name={item.icon}
                size={16}
                className={selectedCategory === item.id ? 'text-white' : 'text-slate-500 dark:text-slate-400'}
              />
              <Text
                className={`text-xs font-bold ${selectedCategory === item.id ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      </View>

      {/* Results Count */}
      <View className="px-5 mb-3">
        <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} found
        </Text>
      </View>

      {/* Books List */}
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={renderBookItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Icon name="book-off" size={80} className="text-slate-200 dark:text-slate-800" />
            <Text className="text-xl font-black text-slate-900 dark:text-slate-100 mt-6 mb-2">No Books Found</Text>
            <Text className="text-base text-slate-500 dark:text-slate-400 text-center px-10">
              {searchQuery
                ? 'Try adjusting your search or category filter to find what you need.'
                : 'No books are currently available in this category.'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default LibraryCatalogScreen;
