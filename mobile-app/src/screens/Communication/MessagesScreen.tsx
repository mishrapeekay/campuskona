import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_role: string;
  participant_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_online: boolean;
}

type FilterType = 'all' | 'teachers' | 'parents' | 'admin' | 'unread';

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    filterConversations();
  }, [searchQuery, activeFilter, conversations]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const mockConversations: Conversation[] = [
        {
          id: 'conv-1',
          participant_id: 'teacher-1',
          participant_name: 'Mrs. Priya Sharma',
          participant_role: 'Class Teacher',
          last_message: 'Please submit the assignment by tomorrow.',
          last_message_time: '2026-01-16T10:30:00Z',
          unread_count: 2,
          is_online: true,
        },
        {
          id: 'conv-2',
          participant_id: 'parent-1',
          participant_name: 'Mr. Rajesh Kumar',
          participant_role: 'Parent',
          last_message: 'Thank you for the update.',
          last_message_time: '2026-01-16T09:15:00Z',
          unread_count: 0,
          is_online: false,
        },
        {
          id: 'conv-3',
          participant_id: 'admin-1',
          participant_name: 'School Admin',
          participant_role: 'Administration',
          last_message: 'Your fee payment has been confirmed.',
          last_message_time: '2026-01-15T16:45:00Z',
          unread_count: 1,
          is_online: true,
        },
        {
          id: 'conv-4',
          participant_id: 'teacher-2',
          participant_name: 'Mr. Anil Verma',
          participant_role: 'Math Teacher',
          last_message: 'Great work on the test!',
          last_message_time: '2026-01-15T14:20:00Z',
          unread_count: 0,
          is_online: false,
        },
        {
          id: 'conv-5',
          participant_id: 'teacher-3',
          participant_name: 'Ms. Neha Gupta',
          participant_role: 'Science Teacher',
          last_message: 'Lab session tomorrow at 2 PM.',
          last_message_time: '2026-01-14T11:00:00Z',
          unread_count: 3,
          is_online: true,
        },
      ];

      setConversations(mockConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterConversations = () => {
    let filtered = conversations;

    if (activeFilter !== 'all') {
      if (activeFilter === 'unread') {
        filtered = filtered.filter((conv) => conv.unread_count > 0);
      } else if (activeFilter === 'teachers') {
        filtered = filtered.filter((conv) => conv.participant_role.toLowerCase().includes('teacher'));
      } else if (activeFilter === 'parents') {
        filtered = filtered.filter((conv) => conv.participant_role.toLowerCase() === 'parent');
      } else if (activeFilter === 'admin') {
        filtered = filtered.filter((conv) => conv.participant_role.toLowerCase().includes('admin'));
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (conv) =>
          conv.participant_name.toLowerCase().includes(query) ||
          conv.last_message.toLowerCase().includes(query) ||
          conv.participant_role.toLowerCase().includes(query)
      );
    }

    setFilteredConversations(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('ChatScreen', {
      conversationId: conversation.id,
      participantName: conversation.participant_name,
      participantRole: conversation.participant_role,
    });
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    return (
      <TouchableOpacity
        onPress={() => handleConversationPress(item)}
        className="bg-white dark:bg-slate-900 rounded-[32px] p-6 mb-4 flex-row items-center border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.98]"
      >
        {/* Avatar */}
        <View className="mr-4 relative">
          <View className="w-16 h-16 rounded-[24px] bg-indigo-600 items-center justify-center">
            <Icon name="account" size={36} color="#FFFFFF" />
          </View>
          {item.is_online && (
            <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-white dark:border-slate-900" />
          )}
        </View>

        {/* Message Info */}
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <View className="flex-1 mr-2">
              <Text className="text-base font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter" numberOfLines={1}>
                {item.participant_name}
              </Text>
              <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5" numberOfLines={1}>
                {item.participant_role}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                {formatTime(item.last_message_time)}
              </Text>
              {item.unread_count > 0 && (
                <View className="bg-indigo-600 h-5 px-1.5 rounded-full items-center justify-center">
                  <Text className="text-[10px] font-black text-white">{item.unread_count}</Text>
                </View>
              )}
            </View>
          </View>
          <Text
            className={`text-sm leading-5 mt-1 ${item.unread_count > 0 ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            numberOfLines={1}
          >
            {item.last_message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const FILTERS: { id: FilterType; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'message-text-outline' },
    { id: 'unread', label: 'Unread', icon: 'message-badge-outline' },
    { id: 'teachers', label: 'Teachers', icon: 'account-tie-outline' },
    { id: 'parents', label: 'Parents', icon: 'account-group-outline' },
    { id: 'admin', label: 'Admin', icon: 'shield-account-outline' },
  ];

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header
        title="Messages"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightIcon="message-plus-outline"
        onRightIconPress={() => navigation.navigate('NewMessage')}
      />

      <View className="flex-1">
        {/* Search Bar */}
        <View className="p-6">
          <View className="flex-row items-center bg-white dark:bg-slate-900 px-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <Icon name="magnify" size={20} className="text-slate-400 dark:text-slate-500 mr-3" />
            <TextInput
              className="flex-1 text-sm font-bold text-slate-900 dark:text-slate-100 py-5"
              placeholder="Search messages..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} className="text-slate-400 dark:text-slate-500" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {FILTERS.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setActiveFilter(item.id)}
                className={`flex-row items-center px-6 py-3 rounded-2xl mr-3 border ${activeFilter === item.id
                    ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-none'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'
                  } active:scale-95 transition-all`}
              >
                <Icon
                  name={item.icon}
                  size={16}
                  className={activeFilter === item.id ? 'text-white' : 'text-slate-400 dark:text-slate-500'}
                />
                <Text
                  className={`ml-2 text-[10px] font-black uppercase tracking-widest ${activeFilter === item.id ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                    }`}
                >
                  {item.label}
                </Text>
                {item.id === 'unread' && totalUnread > 0 && (
                  <View className="ml-2 bg-rose-500 px-1.5 py-0.5 rounded-full min-w-[18px] items-center">
                    <Text className="text-[10px] font-black text-white">{totalUnread}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Conversations List */}
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4F46E5"
              colors={['#4F46E5']}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 px-8">
              <View className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[32px] items-center justify-center mb-6">
                <Icon name="message-off-outline" size={48} className="text-slate-200 dark:text-slate-800" />
              </View>
              <Text className="text-base font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest text-center">
                {searchQuery ? 'No Results Found' : 'No Conversations'}
              </Text>
              <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center mt-3 leading-5">
                {searchQuery
                  ? 'Try searching with different keywords'
                  : 'Start a new conversation with teachers or staff'}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default MessagesScreen;
