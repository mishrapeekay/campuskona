import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/layout/Header';

interface QuickStat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  color: string;
  bgColor: string;
}

const LibraryHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const stats: QuickStat[] = [
    { label: 'Total Books', value: '2,450', icon: 'book-multiple', color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20', textColor: 'text-indigo-600' },
    { label: 'Issued', value: '180', icon: 'book-arrow-right', color: 'text-amber-500 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-500' },
    { label: 'Available', value: '2,270', icon: 'book-check', color: 'text-emerald-500 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-500' },
    { label: 'Overdue', value: '12', icon: 'book-alert', color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-50 dark:bg-rose-900/20', textColor: 'text-rose-600' },
  ];

  const quickActions: QuickAction[] = [
    { label: 'Browse Catalog', icon: 'magnify', route: 'LibraryCatalog', color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'My Books', icon: 'book-account', route: 'MyBooks', color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-50 dark:bg-violet-900/20' },
    { label: 'Issue Book', icon: 'book-plus', route: 'IssueBook', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Return Book', icon: 'book-minus', route: 'ReturnBook', color: 'text-amber-500 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Issued Books', icon: 'book-open-page-variant', route: 'IssuedBooksList', color: 'text-sky-600 dark:text-sky-400', bgColor: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Overdue Books', icon: 'book-clock', route: 'OverdueBooks', color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  const recentActivity = [
    { id: 1, action: 'Book Issued', book: 'The Great Gatsby', user: 'John Doe', time: '2 hours ago', icon: 'book-arrow-right', color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
    { id: 2, action: 'Book Returned', book: 'To Kill a Mockingbird', user: 'Jane Smith', time: '4 hours ago', icon: 'book-arrow-left', color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { id: 3, action: 'New Book Added', book: '1984 by George Orwell', user: 'Librarian', time: '1 day ago', icon: 'book-plus', color: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header title="Library Dashboard" showBackButton onBackPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Welcome Section */}
        <View className="px-6 py-6">
          <Text className="text-2xl font-black text-slate-900 dark:text-slate-100">Welcome to Library</Text>
          <Text className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage books and library records</Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap px-4">
          {stats.map((stat, index) => (
            <View key={index} className="w-1/2 p-2">
              <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                <View className={`w-12 h-12 rounded-2xl justify-center items-center mb-4 ${stat.bgColor}`}>
                  <Icon name={stat.icon} size={24} className={stat.color} />
                </View>
                <Text className="text-2xl font-black text-slate-900 dark:text-slate-100">{stat.value}</Text>
                <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="mt-8 px-6">
          <Text className="text-xs font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between bg-white dark:bg-slate-900 p-4 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                className="w-[30%] items-center py-4 rounded-2xl"
                onPress={() => navigation.navigate(action.route)}
              >
                <View className={`w-14 h-14 rounded-2xl justify-center items-center mb-2 active:scale-95 transition-all ${action.bgColor}`}>
                  <Icon name={action.icon} size={28} className={action.color} />
                </View>
                <Text className="text-[10px] text-slate-600 dark:text-slate-300 text-center font-bold px-1" numberOfLines={1}>{action.label.split(' ')[0]}</Text>
                <Text className="text-[10px] text-slate-600 dark:text-slate-300 text-center font-bold px-1" numberOfLines={1}>{action.label.split(' ')[1] || ''}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mt-8 px-6 mb-12">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xs font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500">Recent Activity</Text>
            <TouchableOpacity>
              <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400">View All</Text>
            </TouchableOpacity>
          </View>
          <View className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            {recentActivity.map((activity, index) => (
              <TouchableOpacity
                key={activity.id}
                className={`flex-row items-start p-5 ${index !== recentActivity.length - 1 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}
              >
                <View className={`w-12 h-12 rounded-2xl justify-center items-center mr-4 ${activity.bgColor}`}>
                  <Icon name={activity.icon} size={22} color={activity.color.includes('amber') ? '#F59E0B' : activity.color.includes('emerald') ? '#10B981' : '#4F46E5'} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-slate-900 dark:text-slate-100">{activity.action}</Text>
                  <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">{activity.book}</Text>
                  <View className="flex-row items-center mt-2">
                    <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                      {activity.user} • {activity.time}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} className="text-slate-300 dark:text-slate-700 self-center" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LibraryHomeScreen;

