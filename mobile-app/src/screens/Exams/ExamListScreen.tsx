import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { examService } from '@/services/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Exam as ExamModel, UserType } from '@/types/models';

interface ExamItem {
  id: string;
  name: string;
  type_code?: string;
  type_label: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  status_raw?: ExamModel['status'];
  status_label?: string;
  academic_year?: string;
  is_published?: boolean;
  percentage?: number;
  grade?: string;
}

const ExamListScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, [user?.student_id]);

  const loadExams = async () => {
    setLoading(true);
    try {
      const params = user?.student_id ? { student: user.student_id } : undefined;
      const response = await examService.getExams(params);
      const mapped = response.results.map((exam) => mapExamToItem(exam));
      setExams(mapped);
    } catch (error) {
      console.error('Failed to load exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExams();
    setRefreshing(false);
  };

  const mapExamStatusToFilter = (
    statusRaw: ExamModel['status'] | undefined,
    start: Date,
    end: Date
  ): ExamItem['status'] => {
    if (statusRaw) {
      switch (statusRaw) {
        case 'ONGOING':
          return 'ongoing';
        case 'COMPLETED':
        case 'CANCELLED':
          return 'completed';
        case 'SCHEDULED':
        case 'POSTPONED':
          return 'upcoming';
        default:
          break;
      }
    }

    const now = new Date();
    if (now < start) return 'upcoming';
    if (now <= end) return 'ongoing';
    return 'completed';
  };

  const mapExamToItem = (exam: ExamModel): ExamItem => {
    const start = new Date(exam.start_date);
    const end = new Date(exam.end_date);
    const status = mapExamStatusToFilter(exam.status, start, end);

    const detail = exam as ExamModel & {
      percentage?: number;
      grade?: string;
    };

    return {
      id: exam.id,
      name: exam.name,
      type_code: exam.exam_type,
      type_label: exam.exam_type_name || exam.exam_type || 'Exam',
      start_date: exam.start_date,
      end_date: exam.end_date,
      status,
      status_raw: exam.status,
      status_label: exam.status_display,
      academic_year: exam.academic_year_name || exam.academic_year,
      is_published: exam.is_published,
      percentage: detail.percentage,
      grade: detail.grade,
    };
  };

  const getExamTypeConfig = (type: string) => {
    const key = type?.toUpperCase?.() || type;
    const configs = {
      MIDTERM: { icon: 'book-open-page-variant', color: '#4F46E5', label: 'Mid-Term' },
      FINAL: { icon: 'certificate', color: '#EF4444', label: 'Final' },
      UNIT_TEST: { icon: 'clipboard-text', color: '#F59E0B', label: 'Unit Test' },
      PRACTICAL: { icon: 'flask', color: '#0EA5E9', label: 'Practical' },
      FORMATIVE: { icon: 'book-open-variant', color: '#4F46E5', label: 'Formative' },
      SUMMATIVE: { icon: 'certificate-outline', color: '#EF4444', label: 'Summative' },
      DIAGNOSTIC: { icon: 'stethoscope', color: '#0EA5E9', label: 'Diagnostic' },
      BENCHMARK: { icon: 'flag-checkered', color: '#F59E0B', label: 'Benchmark' },
    };
    return configs[key as keyof typeof configs] || {
      icon: 'book-open-page-variant',
      color: '#64748B',
      label: type || 'Exam',
    };
  };

  const getStatusConfig = (status: string) => {
    const key = status?.toUpperCase?.() || status;
    const configs = {
      UPCOMING: { icon: 'clock-outline', color: '#0EA5E9', label: 'Upcoming' },
      ONGOING: { icon: 'timer-sand', color: '#F59E0B', label: 'Ongoing' },
      COMPLETED: { icon: 'check-circle', color: '#10B981', label: 'Completed' },
      SCHEDULED: { icon: 'clock-outline', color: '#0EA5E9', label: 'Scheduled' },
      POSTPONED: { icon: 'calendar-sync', color: '#F59E0B', label: 'Postponed' },
      CANCELLED: { icon: 'cancel', color: '#EF4444', label: 'Cancelled' },
    };
    return configs[key as keyof typeof configs] || configs.UPCOMING;
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}-${end.getDate()} ${start.toLocaleDateString('en-IN', { month: 'short' })}`;
    }
    return `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
  };

  const getDaysUntilExam = (startDate: string): number => {
    const today = new Date();
    const examDate = new Date(startDate);
    const diffTime = examDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const FilterButton: React.FC<{
    type: 'all' | 'upcoming' | 'completed';
    label: string;
    icon: string;
  }> = ({ type, label, icon }) => {
    const isActive = filter === type;
    return (
      <TouchableOpacity
        className={`flex-row items-center px-4 py-2 rounded-full border gap-2 ${isActive
            ? 'bg-indigo-600 border-indigo-600'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        onPress={() => setFilter(type)}
      >
        <Icon
          name={icon}
          size={16}
          color={isActive ? '#FFFFFF' : '#64748B'}
        />
        <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderExamItem = ({ item }: { item: ExamItem }) => {
    const typeConfig = getExamTypeConfig(item.type_code || item.type_label);
    const statusConfig = getStatusConfig(item.status_raw || item.status);
    const statusLabel = item.status_label || statusConfig.label;
    const daysUntil = getDaysUntilExam(item.start_date);
    const hasResultDetails = item.percentage !== undefined || item.grade !== undefined;
    const isCompleted = item.status_raw ? item.status_raw === 'COMPLETED' : item.status === 'completed';

    return (
      <TouchableOpacity
        className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-4 shadow-sm border border-slate-100 dark:border-slate-800"
        onPress={() => {
          if (item.status === 'completed' && hasResultDetails) {
            // @ts-ignore
            navigation.navigate('ExamResults', { examId: item.id });
          } else {
            // @ts-ignore
            navigation.navigate('ExamDetail', { examId: item.id });
          }
        }}
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-row flex-1 mr-2">
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
              style={{ backgroundColor: typeConfig.color + '15' }}
            >
              <Icon name={typeConfig.icon} size={24} color={typeConfig.color} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{item.name}</Text>
              <View className="flex-row items-center gap-2">
                <View
                  className="px-2 py-0.5 rounded"
                  style={{ backgroundColor: typeConfig.color + '15' }}
                >
                  <Text
                    className="text-[10px] font-bold uppercase"
                    style={{ color: typeConfig.color }}
                  >
                    {item.type_label}
                  </Text>
                </View>
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDateRange(item.start_date, item.end_date)}
                </Text>
              </View>
            </View>
          </View>
          <View
            className="flex-row items-center px-2.5 py-1 rounded-full gap-1"
            style={{ backgroundColor: statusConfig.color + '15' }}
          >
            <Icon name={statusConfig.icon} size={14} color={statusConfig.color} />
            <Text
              className="text-[10px] font-bold"
              style={{ color: statusConfig.color }}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        {item.status === 'upcoming' && daysUntil > 0 && (
          <View className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mb-4 gap-2">
            <Icon name="calendar-clock" size={16} color="#3B82F6" />
            <Text className="text-sm font-bold text-blue-600 dark:text-blue-400">
              Starts in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
            </Text>
          </View>
        )}

        <View className="flex-row items-center gap-6 mb-4">
          {item.academic_year && (
            <View className="flex-row items-center gap-1.5">
              <Icon name="calendar-range" size={16} color="#64748B" />
              <Text className="text-sm text-slate-600 dark:text-slate-400">{item.academic_year}</Text>
            </View>
          )}
          {item.is_published !== undefined && (
            <View className="flex-row items-center gap-1.5">
              <Icon
                name={item.is_published ? 'check-circle' : 'clock-outline'}
                size={16}
                color={item.is_published ? '#10B981' : '#64748B'}
              />
              <Text className="text-sm text-slate-600 dark:text-slate-400">
                {item.is_published ? 'Published' : 'Not published'}
              </Text>
            </View>
          )}
        </View>

        {isCompleted && hasResultDetails && (
          <View className="flex-row items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
            <View className="flex-1 items-center">
              <Text className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">Percentage</Text>
              <Text className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {item.percentage?.toFixed(1) ?? 'N/A'}%
              </Text>
            </View>
            <View className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <View className="flex-1 items-center">
              <Text className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">Grade</Text>
              <View className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-0.5 rounded-full">
                <Text className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {item.grade || 'N/A'}
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} className="text-indigo-600 ml-2" />
          </View>
        )}

        {isCompleted && !hasResultDetails && (
          <View className="flex-row items-center bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg gap-2">
            <Icon name="clock-outline" size={16} color="#F59E0B" />
            <Text className="text-sm font-medium text-amber-600 dark:text-amber-400">Results pending</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const filteredExams = exams.filter((exam) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return exam.status === 'upcoming' || exam.status === 'ongoing';
    if (filter === 'completed') return exam.status === 'completed';
    return true;
  });

  const isTeacher = user?.user_type === UserType.TEACHER;
  const headerRight = isTeacher ? (
    <TouchableOpacity
      onPress={() => {
        // @ts-ignore
        navigation.navigate('EnterMarks');
      }}
      className="flex-row items-center px-4 py-1 gap-1"
    >
      <Icon name="plus-circle" size={20} color="#4F46E5" />
      <Text className="text-sm font-semibold text-indigo-600">Marks</Text>
    </TouchableOpacity>
  ) : null;

  if (loading && exams.length === 0) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-950">
        <Header title="Examinations" rightComponent={headerRight} />
        <LoadingSpinner fullScreen text="Loading exams..." />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Header
        title="Examinations"
        rightComponent={headerRight}
      />
      <View className="flex-1">
        <View className="flex-row px-4 py-4 gap-3">
          <FilterButton type="all" label="All" icon="format-list-bulleted" />
          <FilterButton type="upcoming" label="Upcoming" icon="clock-outline" />
          <FilterButton type="completed" label="Completed" icon="check-circle" />
        </View>

        <FlatList
          data={filteredExams}
          keyExtractor={(item) => item.id}
          renderItem={renderExamItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Icon name="calendar-blank" size={64} color="#CBD5E1" />
              <Text className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-2">No Exams Found</Text>
              <Text className="text-base text-slate-500 dark:text-slate-400 text-center">
                {filter === 'all'
                  ? 'No examinations scheduled yet.'
                  : `No ${filter} examinations.`}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  addButtonText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    gap: SPACING.xs,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  examCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  examHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  examLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  examIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  examInfo: {
    flex: 1,
  },
  examName: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  examMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.semibold,
    textTransform: 'uppercase',
  },
  examDate: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.semibold,
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '10',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  countdownText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.info,
  },
  examDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
  },
  resultSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray500,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
  },
  resultDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.gray200,
  },
  gradeBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  gradeText: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
  },
  resultArrow: {
    marginLeft: SPACING.sm,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '10',
    padding: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  pendingText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.warning,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyStateTitle: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
    textAlign: 'center',
  },
});

export default ExamListScreen;
