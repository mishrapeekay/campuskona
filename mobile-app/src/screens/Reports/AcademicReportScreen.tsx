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

interface OverallStats {
  overall_grade: string;
  overall_percentage: number;
  class_rank: number;
  total_students: number;
  cgpa: number;
}

interface SubjectPerformance {
  subject: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  teacher: string;
  class_average: number;
}

interface ExamComparison {
  exam_name: string;
  percentage: number;
  grade: string;
  rank: number;
}

type ExamType = 'mid-term' | 'final' | 'unit-test' | 'all';

const AcademicReportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [examComparison, setExamComparison] = useState<ExamComparison[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [selectedExam]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await reportsService.getAcademicReport(selectedExam);

      // Mock data
      const mockStats: OverallStats = {
        overall_grade: 'A',
        overall_percentage: 88,
        class_rank: 5,
        total_students: 45,
        cgpa: 8.8,
      };

      const mockSubjects: SubjectPerformance[] = [
        {
          subject: 'Mathematics',
          marks_obtained: 92,
          total_marks: 100,
          percentage: 92,
          grade: 'A+',
          teacher: 'Mr. Anil Verma',
          class_average: 78,
        },
        {
          subject: 'Science',
          marks_obtained: 88,
          total_marks: 100,
          percentage: 88,
          grade: 'A',
          teacher: 'Ms. Neha Gupta',
          class_average: 75,
        },
        {
          subject: 'English',
          marks_obtained: 85,
          total_marks: 100,
          percentage: 85,
          grade: 'A',
          teacher: 'Mrs. Priya Sharma',
          class_average: 80,
        },
        {
          subject: 'Hindi',
          marks_obtained: 82,
          total_marks: 100,
          percentage: 82,
          grade: 'A',
          teacher: 'Mr. Rajesh Kumar',
          class_average: 77,
        },
        {
          subject: 'Social Studies',
          marks_obtained: 90,
          total_marks: 100,
          percentage: 90,
          grade: 'A+',
          teacher: 'Dr. Sunita Roy',
          class_average: 72,
        },
        {
          subject: 'Computer Science',
          marks_obtained: 95,
          total_marks: 100,
          percentage: 95,
          grade: 'A+',
          teacher: 'Mr. Amit Singh',
          class_average: 82,
        },
      ];

      const mockComparison: ExamComparison[] = [
        { exam_name: 'Unit Test 1', percentage: 85, grade: 'A', rank: 7 },
        { exam_name: 'Unit Test 2', percentage: 87, grade: 'A', rank: 6 },
        { exam_name: 'Mid-Term', percentage: 88, grade: 'A', rank: 5 },
        { exam_name: 'Unit Test 3', percentage: 89, grade: 'A', rank: 4 },
      ];

      setStats(mockStats);
      setSubjectPerformance(mockSubjects);
      setExamComparison(mockComparison);
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
    console.log('Export academic report');
  };

  const getGradeColor = (grade: string): string => {
    if (grade.startsWith('A')) return COLORS.success;
    if (grade.startsWith('B')) return COLORS.primary;
    if (grade.startsWith('C')) return COLORS.warning;
    return COLORS.error;
  };

  const getPerformanceIndicator = (studentPercentage: number, classAverage: number) => {
    const diff = studentPercentage - classAverage;
    if (diff > 10) return { icon: 'trending-up', color: COLORS.success, text: 'Excellent' };
    if (diff > 0) return { icon: 'trending-up', color: COLORS.primary, text: 'Above Average' };
    if (diff === 0) return { icon: 'minus', color: COLORS.gray500, text: 'Average' };
    return { icon: 'trending-down', color: COLORS.error, text: 'Below Average' };
  };

  const EXAM_TYPES: { id: ExamType; label: string }[] = [
    { id: 'all', label: 'All Exams' },
    { id: 'mid-term', label: 'Mid-Term' },
    { id: 'final', label: 'Final' },
    { id: 'unit-test', label: 'Unit Tests' },
  ];

  if (!stats) {
    return (
      <ScreenWrapper>
        <Header title="Academic Report" showBackButton onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Icon name="chart-bar" size={64} color={COLORS.gray300} />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const maxPercentage = Math.max(...subjectPerformance.map((s) => s.percentage));

  return (
    <ScreenWrapper>
      <Header
        title="Academic Report"
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
        {/* Exam Type Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {EXAM_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.filterButton,
                selectedExam === type.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedExam(type.id)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedExam === type.id && styles.filterButtonTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Overall Performance */}
        <Card elevation="lg" padding={SPACING.lg} style={styles.overallCard}>
          <Text style={styles.cardTitle}>Overall Performance</Text>
          <View style={styles.overallStats}>
            <View style={styles.gradeCircle}>
              <Text style={[styles.gradeValue, { color: getGradeColor(stats.overall_grade) }]}>
                {stats.overall_grade}
              </Text>
              <Text style={styles.gradeLabel}>Grade</Text>
            </View>
            <View style={styles.statsColumn}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Percentage:</Text>
                <Text style={styles.statValue}>{stats.overall_percentage}%</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>CGPA:</Text>
                <Text style={styles.statValue}>{stats.cgpa}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Class Rank:</Text>
                <Text style={styles.statValue}>
                  {stats.class_rank}/{stats.total_students}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Subject-wise Performance */}
        <Card elevation="md" padding={SPACING.lg} style={styles.subjectCard}>
          <Text style={styles.cardTitle}>Subject-wise Performance</Text>

          {/* Horizontal Bar Chart */}
          <View style={styles.chartSection}>
            {subjectPerformance.map((subject, index) => {
              const barWidth = (subject.percentage / maxPercentage) * (SCREEN_WIDTH - 180);
              return (
                <View key={index} style={styles.subjectRow}>
                  <Text style={styles.subjectName}>{subject.subject}</Text>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.performanceBar,
                        {
                          width: barWidth,
                          backgroundColor: getGradeColor(subject.grade),
                        },
                      ]}
                    />
                    <Text style={styles.percentageLabel}>{subject.percentage}%</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Detailed Subject List */}
          <View style={styles.subjectList}>
            {subjectPerformance.map((subject, index) => {
              const indicator = getPerformanceIndicator(subject.percentage, subject.class_average);
              return (
                <View key={index} style={styles.subjectItem}>
                  <View style={styles.subjectHeader}>
                    <View>
                      <Text style={styles.subjectTitle}>{subject.subject}</Text>
                      <Text style={styles.subjectTeacher}>{subject.teacher}</Text>
                    </View>
                    <View style={styles.subjectScore}>
                      <Text style={[styles.subjectGrade, { color: getGradeColor(subject.grade) }]}>
                        {subject.grade}
                      </Text>
                      <Text style={styles.subjectMarks}>
                        {subject.marks_obtained}/{subject.total_marks}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.comparisonRow}>
                    <View style={styles.comparisonItem}>
                      <Text style={styles.comparisonLabel}>Your Score</Text>
                      <Text style={styles.comparisonValue}>{subject.percentage}%</Text>
                    </View>
                    <View style={styles.comparisonItem}>
                      <Text style={styles.comparisonLabel}>Class Avg</Text>
                      <Text style={styles.comparisonValue}>{subject.class_average}%</Text>
                    </View>
                    <View style={styles.performanceIndicator}>
                      <Icon name={indicator.icon} size={16} color={indicator.color} />
                      <Text style={[styles.indicatorText, { color: indicator.color }]}>
                        {indicator.text}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Exam Comparison */}
        <Card elevation="md" padding={SPACING.lg} style={styles.comparisonCard}>
          <Text style={styles.cardTitle}>Exam Performance Trend</Text>
          {examComparison.map((exam, index) => (
            <View key={index} style={styles.examItem}>
              <View style={styles.examHeader}>
                <Text style={styles.examName}>{exam.exam_name}</Text>
                <View style={styles.examStats}>
                  <Text style={[styles.examGrade, { color: getGradeColor(exam.grade) }]}>
                    {exam.grade}
                  </Text>
                  <Text style={styles.examPercentage}>{exam.percentage}%</Text>
                </View>
              </View>
              <View style={styles.examFooter}>
                <View style={styles.rankBadge}>
                  <Icon name="trophy" size={14} color={COLORS.warning} />
                  <Text style={styles.rankText}>Rank #{exam.rank}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${exam.percentage}%`,
                        backgroundColor: getGradeColor(exam.grade),
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </Card>

        {/* Strengths & Weaknesses */}
        <View style={styles.insightsRow}>
          <Card elevation="md" padding={SPACING.md} style={styles.insightCard}>
            <View style={[styles.insightIcon, { backgroundColor: COLORS.success + '15' }]}>
              <Icon name="thumb-up" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.insightTitle}>Strengths</Text>
            <View style={styles.insightList}>
              <Text style={styles.insightItem}>• Computer Science</Text>
              <Text style={styles.insightItem}>• Mathematics</Text>
              <Text style={styles.insightItem}>• Social Studies</Text>
            </View>
          </Card>

          <Card elevation="md" padding={SPACING.md} style={styles.insightCard}>
            <View style={[styles.insightIcon, { backgroundColor: COLORS.warning + '15' }]}>
              <Icon name="alert-circle" size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.insightTitle}>Focus Areas</Text>
            <View style={styles.insightList}>
              <Text style={styles.insightItem}>• Hindi</Text>
              <Text style={styles.insightItem}>• English</Text>
            </View>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Download Report"
            onPress={handleExport}
            icon="download"
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            title="Share Progress"
            onPress={() => {}}
            icon="share-variant"
            style={styles.actionButton}
          />
        </View>

        {/* Remarks */}
        <Card elevation="sm" padding={SPACING.md} style={styles.remarksCard}>
          <View style={styles.remarksHeader}>
            <Icon name="comment-text" size={20} color={COLORS.primary} />
            <Text style={styles.remarksTitle}>Teacher's Remarks</Text>
          </View>
          <Text style={styles.remarksText}>
            Excellent performance overall. Shows consistent improvement across all subjects.
            Maintain the momentum and focus on regular practice in language subjects.
          </Text>
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
  filterContainer: {
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    marginRight: SPACING.sm,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
  },
  filterButtonTextActive: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  overallCard: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  overallStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xl,
  },
  gradeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.success + '30',
  },
  gradeValue: {
    fontSize: FONTS['3xl'],
    fontFamily: FONTS.bold,
  },
  gradeLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
    marginTop: 4,
  },
  statsColumn: {
    flex: 1,
    gap: SPACING.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  statValue: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  subjectCard: {
    marginBottom: SPACING.md,
  },
  chartSection: {
    marginBottom: SPACING.lg,
  },
  subjectRow: {
    marginBottom: SPACING.md,
  },
  subjectName: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  performanceBar: {
    height: 24,
    borderRadius: 4,
  },
  percentageLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  subjectList: {
    gap: SPACING.md,
  },
  subjectItem: {
    padding: SPACING.md,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  subjectTitle: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: 2,
  },
  subjectTeacher: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  subjectScore: {
    alignItems: 'flex-end',
  },
  subjectGrade: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    marginBottom: 2,
  },
  subjectMarks: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  comparisonValue: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  performanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  indicatorText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.semibold,
  },
  comparisonCard: {
    marginBottom: SPACING.md,
  },
  examItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  examName: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  examStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  examGrade: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
  },
  examPercentage: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
  },
  examFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.warning + '15',
    borderRadius: 8,
  },
  rankText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.semibold,
    color: COLORS.warning,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  insightCard: {
    flex: 1,
    alignItems: 'center',
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  insightTitle: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  insightList: {
    alignSelf: 'stretch',
  },
  insightItem: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
  },
  remarksCard: {
    backgroundColor: COLORS.primary + '08',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  remarksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  remarksTitle: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  remarksText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray700,
    lineHeight: 20,
  },
});

export default AcademicReportScreen;
