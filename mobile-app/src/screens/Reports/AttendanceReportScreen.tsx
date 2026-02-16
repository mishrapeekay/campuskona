import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { reportsService } from '@/services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - SPACING.md * 4;

interface AttendanceStats {
  overall_percentage: number;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  leave_days: number;
}

interface MonthlyData {
  month: string;
  percentage: number;
  present: number;
  absent: number;
  total: number;
}

interface SubjectAttendance {
  subject: string;
  percentage: number;
  present: number;
  total: number;
  teacher: string;
}

type PeriodType = 'week' | 'month' | 'term' | 'year';

const AttendanceReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [subjectData, setSubjectData] = useState<SubjectAttendance[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await reportsService.getAttendanceReport(selectedPeriod);

      // Mock data
      const mockStats: AttendanceStats = {
        overall_percentage: 92,
        total_days: 120,
        present_days: 110,
        absent_days: 5,
        late_days: 3,
        leave_days: 2,
      };

      const mockMonthly: MonthlyData[] = [
        { month: 'Aug', percentage: 88, present: 21, absent: 3, total: 24 },
        { month: 'Sep', percentage: 90, present: 22, absent: 2, total: 24 },
        { month: 'Oct', percentage: 95, present: 23, absent: 1, total: 24 },
        { month: 'Nov', percentage: 91, present: 21, absent: 2, total: 23 },
        { month: 'Dec', percentage: 93, present: 20, absent: 1, total: 21 },
        { month: 'Jan', percentage: 92, present: 3, absent: 0, total: 3 },
      ];

      const mockSubjects: SubjectAttendance[] = [
        { subject: 'Mathematics', percentage: 95, present: 57, total: 60, teacher: 'Mr. Anil Verma' },
        { subject: 'Science', percentage: 90, present: 54, total: 60, teacher: 'Ms. Neha Gupta' },
        { subject: 'English', percentage: 93, present: 56, total: 60, teacher: 'Mrs. Priya Sharma' },
        { subject: 'Hindi', percentage: 88, present: 53, total: 60, teacher: 'Mr. Rajesh Kumar' },
        { subject: 'Social Studies', percentage: 92, present: 55, total: 60, teacher: 'Dr. Sunita Roy' },
        { subject: 'Computer Science', percentage: 96, present: 29, total: 30, teacher: 'Mr. Amit Singh' },
      ];

      setStats(mockStats);
      setMonthlyData(mockMonthly);
      setSubjectData(mockSubjects);
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export attendance report');
  };

  const getPercentageColor = (percentage: number): string => {
    if (percentage >= 90) return COLORS.success;
    if (percentage >= 75) return COLORS.warning;
    return COLORS.error;
  };

  const PERIODS: { id: PeriodType; label: string }[] = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'term', label: 'Term' },
    { id: 'year', label: 'Year' },
  ];

  if (!stats) {
    return (
      <ScreenWrapper>
        <Header title="Attendance Report" showBackButton onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Icon name="chart-line" size={64} color={COLORS.gray300} />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const maxPercentage = Math.max(...monthlyData.map((d) => d.percentage));

  return (
    <ScreenWrapper>
      <Header
        title="Attendance Report"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={handleExport} style={styles.headerButton}>
            <Icon name="download" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Filter */}
        <View style={styles.periodFilter}>
          {PERIODS.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodButton,
                selectedPeriod === period.id && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.id)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.id && styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overall Stats */}
        <Card elevation="lg" padding={SPACING.lg} style={styles.overallCard}>
          <Text style={styles.cardTitle}>Overall Attendance</Text>
          <View style={styles.percentageContainer}>
            <View style={styles.percentageCircle}>
              <Text style={[styles.percentageValue, { color: getPercentageColor(stats.overall_percentage) }]}>
                {stats.overall_percentage}%
              </Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.success + '15' }]}>
                <Icon name="check-circle" size={20} color={COLORS.success} />
              </View>
              <Text style={styles.statValue}>{stats.present_days}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.error + '15' }]}>
                <Icon name="close-circle" size={20} color={COLORS.error} />
              </View>
              <Text style={styles.statValue}>{stats.absent_days}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.warning + '15' }]}>
                <Icon name="clock-alert" size={20} color={COLORS.warning} />
              </View>
              <Text style={styles.statValue}>{stats.late_days}</Text>
              <Text style={styles.statLabel}>Late</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.info + '15' }]}>
                <Icon name="calendar-remove" size={20} color={COLORS.info} />
              </View>
              <Text style={styles.statValue}>{stats.leave_days}</Text>
              <Text style={styles.statLabel}>Leave</Text>
            </View>
          </View>
        </Card>

        {/* Monthly Trend Chart */}
        <Card elevation="md" padding={SPACING.lg} style={styles.chartCard}>
          <Text style={styles.cardTitle}>Monthly Attendance Trend</Text>
          <View style={styles.chartContainer}>
            {monthlyData.map((data, index) => {
              const barHeight = (data.percentage / maxPercentage) * 120;
              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: getPercentageColor(data.percentage),
                        },
                      ]}
                    >
                      <Text style={styles.barLabel}>{data.percentage}%</Text>
                    </View>
                  </View>
                  <Text style={styles.monthLabel}>{data.month}</Text>
                  <Text style={styles.monthData}>
                    {data.present}/{data.total}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.success }]} />
              <Text style={styles.legendText}>&gt;90%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.legendText}>75-90%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.error }]} />
              <Text style={styles.legendText}>&lt;75%</Text>
            </View>
          </View>
        </Card>

        {/* Subject-wise Attendance */}
        <Card elevation="md" padding={SPACING.lg} style={styles.subjectCard}>
          <Text style={styles.cardTitle}>Subject-wise Attendance</Text>
          {subjectData.map((subject, index) => (
            <View key={index} style={styles.subjectItem}>
              <View style={styles.subjectHeader}>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectName}>{subject.subject}</Text>
                  <Text style={styles.subjectTeacher}>{subject.teacher}</Text>
                </View>
                <View style={styles.subjectStats}>
                  <Text style={[styles.subjectPercentage, { color: getPercentageColor(subject.percentage) }]}>
                    {subject.percentage}%
                  </Text>
                  <Text style={styles.subjectCount}>
                    {subject.present}/{subject.total}
                  </Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${subject.percentage}%`,
                      backgroundColor: getPercentageColor(subject.percentage),
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Export as PDF"
            onPress={handleExport}
            icon="file-pdf-box"
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            title="Share Report"
            onPress={() => {}}
            icon="share-variant"
            style={styles.actionButton}
          />
        </View>

        {/* Info Card */}
        <Card elevation="sm" padding={SPACING.md} style={styles.infoCard}>
          <Icon name="information" size={20} color={COLORS.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              Attendance below 75% may affect exam eligibility. Please maintain regular
              attendance.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </ScreenWrapper>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.semibold,
    color: COLORS.gray500,
    marginTop: SPACING.md,
  },
  periodFilter: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
  },
  periodButtonTextActive: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  overallCard: {
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  percentageContainer: {
    marginBottom: SPACING.lg,
  },
  percentageCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: COLORS.success + '30',
  },
  percentageValue: {
    fontSize: FONTS['3xl'],
    fontFamily: FONTS.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  chartCard: {
    marginBottom: SPACING.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    marginBottom: SPACING.md,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 32,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  barLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  monthLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.semibold,
    color: COLORS.gray700,
    marginTop: SPACING.xs,
  },
  monthData: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  subjectCard: {
    marginBottom: SPACING.md,
  },
  subjectItem: {
    marginBottom: SPACING.lg,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
    marginBottom: 2,
  },
  subjectTeacher: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  subjectStats: {
    alignItems: 'flex-end',
  },
  subjectPercentage: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    marginBottom: 2,
  },
  subjectCount: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.info + '08',
    borderWidth: 1,
    borderColor: COLORS.info + '30',
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.info,
    lineHeight: 18,
  },
});

export default AttendanceReportScreen;
