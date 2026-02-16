import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import { reportsService } from '@/services/api';
import { RootState } from '@/store';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { fileService } from '@/services/file.service';

interface ReportCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  count?: number;
  screen: string;
  roles: string[];
}

interface QuickStat {
  label: string;
  value: string;
  icon: string;
  color: string;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
}

const ReportsDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const REPORT_CATEGORIES: ReportCategory[] = [
    {
      id: 'attendance',
      title: 'Attendance Reports',
      description: 'View attendance statistics, trends, and detailed records',
      icon: 'calendar-check',
      color: '#10B981',
      screen: 'AttendanceReport',
      roles: ['student', 'parent', 'teacher', 'admin', 'principal'],
    },
    {
      id: 'academic',
      title: 'Academic Performance',
      description: 'Analyze exam results, grades, and subject-wise performance',
      icon: 'chart-line',
      color: '#4F46E5',
      screen: 'AcademicReport',
      roles: ['student', 'parent', 'teacher', 'admin', 'principal'],
    },
    {
      id: 'fees',
      title: 'Fee Reports',
      description: 'Track fee payments, pending amounts, and collection analytics',
      icon: 'currency-inr',
      color: '#F59E0B',
      screen: 'FeeReport',
      roles: ['student', 'parent', 'accountant', 'admin', 'principal'],
    },
    {
      id: 'student',
      title: 'Student Progress',
      description: 'Comprehensive student progress tracking and growth analysis',
      icon: 'account-details',
      color: '#0EA5E9',
      screen: 'StudentProgressReport',
      roles: ['student', 'parent', 'teacher', 'admin', 'principal'],
    },
    {
      id: 'class',
      title: 'Class Analytics',
      description: 'Class-wise performance comparison and insights',
      icon: 'google-classroom',
      color: '#8B5CF6',
      screen: 'ClassAnalytics',
      roles: ['teacher', 'admin', 'principal'],
    },
    {
      id: 'library',
      title: 'Library Reports',
      description: 'Book circulation, overdue items, and reading statistics',
      icon: 'bookshelf',
      color: '#06B6D4',
      screen: 'LibraryReport',
      roles: ['librarian', 'admin', 'principal'],
    },
    {
      id: 'transport',
      title: 'Transport Analytics',
      description: 'Route efficiency, attendance, and transport utilization',
      icon: 'bus-school',
      color: '#F97316',
      screen: 'TransportReport',
      roles: ['transport_manager', 'admin', 'principal'],
    },
    {
      id: 'custom',
      title: 'Custom Reports',
      description: 'Build custom reports with flexible parameters',
      icon: 'file-chart',
      color: '#EF4444',
      screen: 'CustomReportBuilder',
      roles: ['admin', 'principal'],
    },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const mockStats: QuickStat[] = [];

      if ((user?.user_type as any) === 'student' || (user?.user_type as any) === 'parent') {
        mockStats.push(
          {
            label: 'Attendance',
            value: '92%',
            icon: 'calendar-check',
            color: '#10B981',
            trend: { direction: 'up', percentage: 3 },
          },
          {
            label: 'Average Grade',
            value: 'A',
            icon: 'certificate',
            color: '#4F46E5',
          },
          {
            label: 'Pending Fees',
            value: '₹12,000',
            icon: 'currency-inr',
            color: '#F59E0B',
          },
          {
            label: 'Books Issued',
            value: '3',
            icon: 'book-open-variant',
            color: '#0EA5E9',
          }
        );
      } else if ((user?.user_type as any) === 'teacher') {
        mockStats.push(
          {
            label: 'Classes',
            value: '5',
            icon: 'google-classroom',
            color: '#4F46E5',
          },
          {
            label: 'Total Students',
            value: '142',
            icon: 'account-group',
            color: '#0EA5E9',
          },
          {
            label: 'Avg Attendance',
            value: '88%',
            icon: 'calendar-check',
            color: '#10B981',
            trend: { direction: 'down', percentage: 2 },
          },
          {
            label: 'Pending Marks',
            value: '12',
            icon: 'file-edit',
            color: '#F59E0B',
          }
        );
      } else if ((user?.user_type as any) === 'principal' || (user?.user_type as any) === 'admin') {
        mockStats.push(
          {
            label: 'Total Students',
            value: '1,247',
            icon: 'account-group',
            color: '#4F46E5',
            trend: { direction: 'up', percentage: 5 },
          },
          {
            label: 'Staff Members',
            value: '87',
            icon: 'account-tie',
            color: '#0EA5E9',
          },
          {
            label: 'Fee Collection',
            value: '₹45.2L',
            icon: 'currency-inr',
            color: '#10B981',
            trend: { direction: 'up', percentage: 12 },
          },
          {
            label: 'Avg Attendance',
            value: '89%',
            icon: 'calendar-check',
            color: '#F59E0B',
          }
        );
      }

      setQuickStats(mockStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getAvailableReports = (): ReportCategory[] => {
    return REPORT_CATEGORIES.filter((category) =>
      category.roles.includes((user?.user_type as any) || '')
    );
  };

  const handleReportPress = (category: ReportCategory) => {
    // @ts-ignore
    navigation.navigate(category.screen);
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header
        title="Reports & Analytics"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      >
        {/* Quick Stats Grid */}
        {quickStats.length > 0 && (
          <View className="mt-6">
            <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Quick Overview</Text>
            <View className="flex-row flex-wrap gap-4">
              {quickStats.map((stat, index) => (
                <View key={index} className="w-[47%] bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 items-center">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-3"
                    style={{ backgroundColor: stat.color + '15' }}
                  >
                    <Icon name={stat.icon} size={24} color={stat.color} />
                  </View>
                  <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{stat.value}</Text>
                  <Text className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 text-center">{stat.label}</Text>
                  {stat.trend && (
                    <View className="flex-row items-center gap-1 mt-2">
                      <Icon
                        name={stat.trend.direction === 'up' ? 'trending-up' : 'trending-down'}
                        size={14}
                        color={stat.trend.direction === 'up' ? '#10B981' : '#EF4444'}
                      />
                      <Text
                        className={`text-[10px] font-bold ${stat.trend.direction === 'up' ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                      >
                        {stat.trend.percentage}%
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Performance Chart */}
        <View className="mt-8 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Performance Trend</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  {
                    data: [65, 59, 80, 81, 56, 75],
                  },
                ],
              }}
              width={Dimensions.get('window').width - 64}
              height={220}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#4F46E5',
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
                paddingRight: 40,
              }}
            />
          </ScrollView>
        </View>

        {/* Report Categories */}
        <View className="mt-8">
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Available Reports</Text>
          {getAvailableReports().map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleReportPress(category)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <View className="flex-row items-center">
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: category.color + '15' }}
                >
                  <Icon name={category.icon} size={32} color={category.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{category.title}</Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 leading-4">{category.description}</Text>
                </View>
                <Icon name="chevron-right" size={24} className="text-slate-300 dark:text-slate-700" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="mt-8">
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap gap-4">
            {[
              { label: 'Export Reports', icon: 'file-export', color: '#4F46E5' },
              { label: 'Share Reports', icon: 'share-variant', color: '#10B981' },
              { label: 'Date Range', icon: 'calendar-range', color: '#0EA5E9' },
              { label: 'Filters', icon: 'filter-variant', color: '#F59E0B' },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                className="w-[47%] bg-white dark:bg-slate-900 rounded-2xl p-4 items-center shadow-sm border border-slate-100 dark:border-slate-800"
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: action.color + '15' }}
                >
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300">{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Banner */}
        <View className="mt-8 flex-row items-start gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <Icon name="information" size={20} className="text-blue-500 mt-0.5" />
          <View className="flex-1">
            <Text className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">Report Generation</Text>
            <Text className="text-xs text-blue-500 dark:text-blue-300 leading-4">
              All reports can be exported as PDF or CSV. Use filters to customize the data range and parameters.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  statsSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONTS['2xl'],
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  trendText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.bold,
  },
  categoriesSection: {
    marginBottom: SPACING.lg,
  },
  categoryCard: {
    marginBottom: SPACING.md,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    lineHeight: 18,
  },
  actionsSection: {
    marginBottom: SPACING.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
    textAlign: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.info + '08',
    borderWidth: 1,
    borderColor: COLORS.info + '30',
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.bold,
    color: COLORS.info,
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.info,
    lineHeight: 18,
  },
  chartSection: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginHorizontal: SPACING.md, // Add margin to match other cards if needed, or remove if full width
    // Actually container has padding SPACING.md so this will double pad if not careful, 
    // but styles.container uses background gray50.
    // Let's remove marginHorizontal and let container padding handle it.
  },
});

export default ReportsDashboardScreen;
