import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'academic' | 'event' | 'holiday' | 'exam' | 'urgent';
  priority: 'high' | 'medium' | 'low';
  published_by: string;
  published_by_role: string;
  published_date: string;
  valid_until?: string;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
  read: boolean;
}

type FilterType = 'all' | 'general' | 'academic' | 'event' | 'holiday' | 'exam' | 'urgent';

const AnnouncementsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [activeFilter, announcements]);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const mockAnnouncements: Announcement[] = [
        {
          id: 'ann-1',
          title: 'Mid-Term Exams Schedule Released',
          content: 'The mid-term examination schedule for Class 10 has been released. Exams will commence from February 1st, 2026. Please check the detailed schedule on the school portal. Students are advised to prepare accordingly and maintain discipline during the examination period.',
          category: 'exam',
          priority: 'high',
          published_by: 'Dr. Sunita Verma',
          published_by_role: 'Principal',
          published_date: '2026-01-16T09:00:00Z',
          valid_until: '2026-02-01',
          attachments: [
            {
              id: 'att-1',
              name: 'Exam_Schedule_Class10.pdf',
              type: 'pdf',
              url: 'https://example.com/schedule.pdf',
            },
          ],
          read: false,
        },
        {
          id: 'ann-2',
          title: 'Republic Day Celebration',
          content: 'The school will celebrate Republic Day on January 26th. All students are required to attend the flag hoisting ceremony at 8:00 AM sharp. Cultural programs will follow. Students participating in the parade should report by 7:30 AM.',
          category: 'event',
          priority: 'medium',
          published_by: 'Mr. Anil Kumar',
          published_by_role: 'Vice Principal',
          published_date: '2026-01-15T14:30:00Z',
          valid_until: '2026-01-26',
          read: false,
        },
        {
          id: 'ann-3',
          title: 'Parent-Teacher Meeting',
          content: 'A parent-teacher meeting has been scheduled for January 28th from 10:00 AM to 1:00 PM. Parents are requested to meet their ward\'s class teacher to discuss academic progress and any concerns. Please collect your meeting schedule from the reception.',
          category: 'general',
          priority: 'medium',
          published_by: 'Mrs. Priya Sharma',
          published_by_role: 'Academic Coordinator',
          published_date: '2026-01-14T11:00:00Z',
          valid_until: '2026-01-28',
          read: true,
        },
        {
          id: 'ann-5',
          title: 'Science Fair Registration Open',
          content: 'Registration for the Annual Science Fair is now open. Interested students can register with their science teacher by January 25th. The fair will be held on February 15th. Exciting prizes await the winners!',
          category: 'academic',
          priority: 'medium',
          published_by: 'Dr. Neha Gupta',
          published_by_role: 'Science Department Head',
          published_date: '2026-01-12T16:00:00Z',
          valid_until: '2026-01-25',
          read: true,
        },
        {
          id: 'ann-6',
          title: 'URGENT: School Timing Change',
          content: 'Due to extreme weather conditions, school timing has been changed temporarily. School will now start at 9:00 AM instead of 8:00 AM. This change is effective from January 17th until further notice. Transport timings have also been adjusted accordingly.',
          category: 'urgent',
          priority: 'high',
          published_by: 'Dr. Sunita Verma',
          published_by_role: 'Principal',
          published_date: '2026-01-16T07:00:00Z',
          read: false,
        },
      ];

      setAnnouncements(mockAnnouncements);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAnnouncements = () => {
    let filtered = announcements;
    if (activeFilter !== 'all') {
      filtered = filtered.filter((ann) => ann.category === activeFilter);
    }
    setFilteredAnnouncements(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
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

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryConfig = (category: string) => {
    const configs = {
      general: { icon: 'bullhorn', color: 'text-blue-600', label: 'General', bg: 'bg-blue-50 dark:bg-blue-900/20' },
      academic: { icon: 'book-open-variant', color: 'text-indigo-600', label: 'Academic', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
      event: { icon: 'calendar-star', color: 'text-emerald-600', label: 'Event', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
      holiday: { icon: 'beach', color: 'text-amber-600', label: 'Holiday', bg: 'bg-amber-50 dark:bg-amber-900/20' },
      exam: { icon: 'certificate', color: 'text-rose-600', label: 'Exam', bg: 'bg-rose-50 dark:bg-rose-900/20' },
      urgent: { icon: 'alert-octagon', color: 'text-rose-600', label: 'Urgent', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    };
    return configs[category as keyof typeof configs] || configs.general;
  };

  const handleAnnouncementPress = async (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setModalVisible(true);

    if (!announcement.read) {
      setAnnouncements((prev) =>
        prev.map((ann) => (ann.id === announcement.id ? { ...ann, read: true } : ann))
      );
    }
  };

  const renderAnnouncementItem = ({ item }: { item: Announcement }) => {
    const config = getCategoryConfig(item.category);

    return (
      <TouchableOpacity
        onPress={() => handleAnnouncementPress(item)}
        className="mb-4 active:scale-[0.98] transition-all"
      >
        <View className={`bg-white dark:bg-slate-900 rounded-[32px] p-6 border ${!item.read ? 'border-indigo-600/30' : 'border-slate-100 dark:border-slate-800'
          } shadow-sm`}>
          {/* Header */}
          <View className="flex-row items-center mb-4">
            <View className={`w-12 h-12 rounded-[18px] items-center justify-center mr-4 ${config.bg}`}>
              <Icon name={config.icon} size={24} className={config.color} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-black text-slate-900 dark:text-slate-100 flex-1 mr-2" numberOfLines={2}>
                  {item.title}
                </Text>
                {!item.read && <View className="w-2 h-2 rounded-full bg-indigo-600" />}
              </View>
              <Text className={`text-[10px] font-black uppercase tracking-widest mt-1 ${config.color}`}>
                {config.label}
              </Text>
            </View>
          </View>

          {/* Content Preview */}
          <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-5 mb-4" numberOfLines={2}>
            {item.content}
          </Text>

          {/* Footer */}
          <View className="flex-row justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-800/50">
            <View className="flex-row items-center">
              <Icon name="account" size={14} className="text-slate-400 dark:text-slate-500 mr-1.5" />
              <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {item.published_by} • {formatDate(item.published_date)}
              </Text>
            </View>
            {item.attachments && item.attachments.length > 0 && (
              <View className="flex-row items-center bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                <Icon name="paperclip" size={12} className="text-slate-400 dark:text-slate-500 mr-1" />
                <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500">{item.attachments.length}</Text>
              </View>
            )}
          </View>

          {item.priority === 'high' && (
            <View className="mt-4 pt-4 border-t border-rose-100 dark:border-rose-900/30 flex-row items-center">
              <Icon name="alert-circle" size={14} className="text-rose-600 mr-2" />
              <Text className="text-[10px] font-black text-rose-600 uppercase tracking-widest">High Priority</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const FILTERS: { id: FilterType; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'bullhorn' },
    { id: 'urgent', label: 'Urgent', icon: 'alert-octagon' },
    { id: 'exam', label: 'Exam', icon: 'certificate' },
    { id: 'event', label: 'Event', icon: 'calendar-star' },
    { id: 'academic', label: 'Academic', icon: 'book-open-variant' },
    { id: 'holiday', label: 'Holiday', icon: 'beach' },
  ];

  const unreadCount = announcements.filter((ann) => !ann.read).length;

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header
        title="Announcements"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <View className="flex-1">
        {/* Summary Card */}
        {unreadCount > 0 && (
          <View className="m-6 bg-indigo-600 rounded-[32px] p-6 shadow-lg shadow-indigo-200 dark:shadow-none flex-row items-center">
            <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mr-4">
              <Icon name="bell-ring" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-black text-base">New Updates</Text>
              <Text className="text-white/80 font-bold text-xs">
                You have {unreadCount} unread {unreadCount === 1 ? 'announcement' : 'announcements'}
              </Text>
            </View>
          </View>
        )}

        {/* Filters */}
        <View className="mb-4">
          <FlatList
            horizontal
            data={FILTERS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setActiveFilter(item.id)}
                className={`flex-row items-center px-6 py-3 rounded-full border mr-3 ${activeFilter === item.id
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                  } active:scale-95 transition-all shadow-sm`}
              >
                <Icon
                  name={item.icon}
                  size={16}
                  color={activeFilter === item.id ? 'white' : '#94a3b8'}
                />
                <Text className={`ml-2 text-[10px] font-black uppercase tracking-widest ${activeFilter === item.id ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 10 }}
          />
        </View>

        {/* Announcements List */}
        <FlatList
          data={filteredAnnouncements}
          keyExtractor={(item) => item.id}
          renderItem={renderAnnouncementItem}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 px-8">
              <Icon name="bullhorn-outline" size={80} className="text-slate-200 dark:text-slate-800" />
              <Text className="text-base font-black text-slate-400 dark:text-slate-600 mt-6 uppercase tracking-widest">No Announcements</Text>
            </View>
          }
        />

        {/* Detail Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white dark:bg-slate-900 rounded-t-[40px] px-8 pt-8 pb-12 shadow-2xl">
              {selectedAnnouncement && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Pull bar */}
                  <View className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full self-center mb-8" />

                  <View className="flex-row items-center justify-between mb-8">
                    <View className={`px-4 py-2 rounded-xl ${getCategoryConfig(selectedAnnouncement.category).bg}`}>
                      <Text className={`text-[10px] font-black uppercase tracking-widest ${getCategoryConfig(selectedAnnouncement.category).color}`}>
                        {getCategoryConfig(selectedAnnouncement.category).label}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center"
                    >
                      <Icon name="close" size={24} className="text-slate-600 dark:text-slate-400" />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-4 leading-tight">
                    {selectedAnnouncement.title}
                  </Text>

                  <View className="flex-row items-center mb-2">
                    <Icon name="account-circle" size={16} className="text-indigo-600 mr-2" />
                    <Text className="text-xs font-black text-slate-700 dark:text-slate-300">
                      {selectedAnnouncement.published_by}
                    </Text>
                    <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-2">
                      ({selectedAnnouncement.published_by_role})
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-8">
                    <Icon name="calendar-clock" size={16} className="text-slate-400 dark:text-slate-500 mr-2" />
                    <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      {formatDateTime(selectedAnnouncement.published_date)}
                    </Text>
                  </View>

                  <View className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[24px] mb-8">
                    <Text className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-6">
                      {selectedAnnouncement.content}
                    </Text>
                  </View>

                  {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                    <View className="mb-8">
                      <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-4">Attachments</Text>
                      {selectedAnnouncement.attachments.map((attachment) => (
                        <TouchableOpacity
                          key={attachment.id}
                          className="flex-row items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl mb-3 shadow-sm active:scale-[0.98]"
                        >
                          <View className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl items-center justify-center mr-4">
                            <Icon name="file-pdf-box" size={24} className="text-rose-500" />
                          </View>
                          <Text className="flex-1 text-xs font-bold text-slate-900 dark:text-slate-100 mr-4" numberOfLines={1}>{attachment.name}</Text>
                          <Icon name="download" size={20} className="text-indigo-600" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="bg-indigo-600 py-5 rounded-[24px] items-center shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                    <Text className="text-white font-black uppercase tracking-widest text-xs">Acknowledge</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

export default AnnouncementsScreen;
