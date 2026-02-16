import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Header from '@/components/layout/Header';
import { RootState } from '@/store';

type BookDetailRouteParams = {
  bookId: string;
};

interface BookDetail {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  publication_year: number;
  total_copies: number;
  available_copies: number;
  cover_image?: string;
  description: string;
  rating: number;
  total_ratings: number;
  language: string;
  pages: number;
  shelf_location: string;
  tags: string[];
  similar_books: string[];
}

interface UserBookStatus {
  is_issued: boolean;
  issue_date?: string;
  due_date?: string;
  is_reserved: boolean;
  reservation_date?: string;
}

const BookDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: BookDetailRouteParams }, 'params'>>();
  const { bookId } = route.params;
  const user = useSelector((state: RootState) => state.user);

  const [book, setBook] = useState<BookDetail | null>(null);
  const [userStatus, setUserStatus] = useState<UserBookStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBookDetail();
  }, [bookId]);

  const loadBookDetail = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockBook: BookDetail = {
        id: bookId,
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0-06-112008-4',
        category: 'fiction',
        publisher: 'J.B. Lippincott & Co.',
        publication_year: 1960,
        total_copies: 5,
        available_copies: 2,
        description:
          'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. "To Kill A Mockingbird" became both an instant bestseller and a critical success when it was first published in 1960. It went on to win the Pulitzer Prize in 1961 and was later made into an Academy Award-winning film, also a classic.\n\nCompassionate, dramatic, and deeply moving, "To Kill A Mockingbird" takes readers to the roots of human behavior - to innocence and experience, kindness and cruelty, love and hatred, humor and pathos. Now with over 18 million copies in print and translated into forty languages, this regional story by a young Alabama woman claims universal appeal.',
        rating: 4.8,
        total_ratings: 1247,
        language: 'English',
        pages: 324,
        shelf_location: 'A-12',
        tags: ['Classic', 'American Literature', 'Race', 'Justice', 'Coming of Age'],
        similar_books: ['book-3', 'book-7', 'book-9'],
      };

      const mockStatus: UserBookStatus = {
        is_issued: false,
        is_reserved: false,
      };

      setBook(mockBook);
      setUserStatus(mockStatus);
    } catch (error) {
      console.error('Failed to load book detail:', error);
      Alert.alert('Error', 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueBook = async () => {
    if (!book || !userStatus) return;
    setActionLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Book issue request submitted successfully');
      loadBookDetail();
    } catch (error) {
      Alert.alert('Error', 'Failed to issue book');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReserveBook = async () => {
    if (!book || !userStatus) return;
    setActionLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Book reserved successfully');
      loadBookDetail();
    } catch (error) {
      Alert.alert('Error', 'Failed to reserve book');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!book || !userStatus) return;
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            setActionLoading(true);
            try {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              Alert.alert('Success', 'Reservation cancelled');
              loadBookDetail();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel reservation');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={`full-${i}`} name="star" size={16} className="text-amber-500" />);
    }
    if (hasHalfStar) {
      stars.push(<Icon key="half" name="star-half-full" size={16} className="text-amber-500" />);
    }
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Icon key={`empty-${i}`} name="star-outline" size={16} className="text-slate-300 dark:text-slate-700" />);
    }
    return stars;
  };

  if (loading || !book || !userStatus) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-950">
        <Header title="Book Details" showBackButton onBackPress={() => navigation.goBack()} />
        <View className="flex-1 items-center justify-center">
          <Icon name="book-open-variant" size={64} className="text-slate-200 dark:text-slate-800" />
          <Text className="text-lg font-bold text-slate-400 dark:text-slate-500 mt-4">Loading details...</Text>
        </View>
      </View>
    );
  }

  const isAvailable = book.available_copies > 0;
  const canIssue = isAvailable && !userStatus.is_issued && !userStatus.is_reserved;
  const canReserve = !isAvailable && !userStatus.is_issued && !userStatus.is_reserved;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Book Details" showBackButton onBackPress={() => navigation.goBack()} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Cover & Hero Section */}
          <View className="bg-white dark:bg-slate-900 rounded-[40px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 items-center mb-6">
            <View className="shadow-2xl shadow-slate-400 dark:shadow-none mb-6">
              {book.cover_image ? (
                <Image source={{ uri: book.cover_image }} className="w-44 h-64 rounded-2xl" />
              ) : (
                <View className="w-44 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl items-center justify-center">
                  <Icon name="book-open-variant" size={80} className="text-indigo-600 dark:text-indigo-400" />
                </View>
              )}
            </View>

            <Text className="text-2xl font-black text-slate-900 dark:text-slate-100 text-center">{book.title}</Text>
            <Text className="text-base text-slate-500 dark:text-slate-400 font-medium mt-1 mb-4">by {book.author}</Text>

            <View className="flex-row items-center gap-2 mb-6">
              <View className="flex-row gap-1">{renderStars(book.rating)}</View>
              <Text className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                {book.rating.toFixed(1)} ({book.total_ratings})
              </Text>
            </View>

            <View className={`flex-row items-center px-4 py-2 rounded-full gap-2 ${isAvailable ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-rose-50 dark:bg-rose-900/10'}`}>
              <Icon name={isAvailable ? 'check-circle' : 'close-circle'} size={18} className={isAvailable ? 'text-emerald-500' : 'text-rose-500'} />
              <Text className={`text-xs font-black uppercase tracking-widest ${isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isAvailable ? `${book.available_copies} Available` : 'Currently Unavailable'}
              </Text>
            </View>
          </View>

          {/* User Status Card */}
          {(userStatus.is_issued || userStatus.is_reserved) && (
            <View className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl p-5 mb-6 flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center">
                <Icon name={userStatus.is_issued ? 'book-check' : 'bookmark-check'} size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter">
                  {userStatus.is_issued ? 'Currently Issued' : 'Reserved'}
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {userStatus.is_issued ? `Due: ${userStatus.due_date}` : `Reserved on: ${userStatus.reservation_date}`}
                </Text>
              </View>
              {userStatus.is_reserved && (
                <TouchableOpacity onPress={handleCancelReservation} className="bg-rose-600 px-4 py-2 rounded-xl">
                  <Text className="text-[10px] font-black text-white uppercase tracking-widest">Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Information Section */}
          <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
            <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-6">Book Information</Text>
            <View className="flex-row flex-wrap">
              {[
                { icon: 'barcode', label: 'ISBN', value: book.isbn },
                { icon: 'shape', label: 'Category', value: book.category, isCap: true },
                { icon: 'domain', label: 'Publisher', value: book.publisher },
                { icon: 'calendar', label: 'Year', value: book.publication_year.toString() },
                { icon: 'file-document', label: 'Pages', value: book.pages.toString() },
                { icon: 'translate', label: 'Language', value: book.language },
                { icon: 'map-marker', label: 'Location', value: book.shelf_location },
              ].map((item, idx) => (
                <View key={idx} className="w-1/2 mb-6 pr-2">
                  <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-1">{item.label}</Text>
                  <View className="flex-row items-center gap-2">
                    <Icon name={item.icon} size={14} className="text-slate-300 dark:text-slate-600" />
                    <Text className={`text-sm font-bold text-slate-900 dark:text-slate-100 ${item.isCap ? 'capitalize' : ''}`} numberOfLines={1}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
            <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-4">Description</Text>
            <Text className="text-sm text-slate-600 dark:text-slate-300 leading-6 font-medium">{book.description}</Text>

            {/* Tags */}
            <View className="flex-row flex-wrap gap-2 mt-6 pt-6 border-t border-slate-50 dark:border-slate-800">
              {book.tags.map((tag, index) => (
                <View key={index} className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                  <Text className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-4 pb-10">
            {canIssue && (
              <TouchableOpacity
                disabled={actionLoading}
                onPress={handleIssueBook}
                className="bg-indigo-600 h-16 rounded-2xl flex-row items-center justify-center gap-3 shadow-xl shadow-indigo-300 dark:shadow-none"
              >
                <Icon name="book-plus" size={24} color="white" />
                <Text className="text-white text-lg font-black">Issue this Book</Text>
              </TouchableOpacity>
            )}
            {canReserve && (
              <TouchableOpacity
                disabled={actionLoading}
                onPress={handleReserveBook}
                className="bg-amber-500 h-16 rounded-2xl flex-row items-center justify-center gap-3 shadow-xl shadow-amber-200 dark:shadow-none"
              >
                <Icon name="bookmark-plus" size={24} color="white" />
                <Text className="text-white text-lg font-black">Reserve Book</Text>
              </TouchableOpacity>
            )}
            {!canIssue && !canReserve && !userStatus.is_issued && !userStatus.is_reserved && (
              <View className="bg-slate-100 dark:bg-slate-900 p-6 rounded-3xl flex-row items-center gap-4">
                <Icon name="information" size={24} className="text-slate-400" />
                <Text className="text-sm font-medium text-slate-500 dark:text-slate-400 flex-1">
                  This book is currently unavailable and cannot be reserved.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default BookDetailScreen;
