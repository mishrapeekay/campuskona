import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { examService } from '@/services/api';

interface SubjectResult {
  id: string;
  subject_name: string;
  marks_obtained: number;
  total_marks: number;
  grade: string;
  remarks?: string;
  teacher_name: string;
}

interface ExamResult {
  id: string;
  exam_name: string;
  total_marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  rank?: number;
  total_students?: number;
  remarks?: string;
  subjects: SubjectResult[];
}

const ExamResultsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { examId } = route.params as { examId: string };

  const [result, setResult] = useState<ExamResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [examId]);

  const loadResults = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await examService.getExamResults(examId);

      // Mock data for now
      const mockResult: ExamResult = {
        id: examId,
        exam_name: 'Mid-Term Examination',
        total_marks_obtained: 437,
        total_marks: 500,
        percentage: 87.4,
        grade: 'A+',
        rank: 5,
        total_students: 45,
        remarks: 'Excellent performance! Keep up the good work.',
        subjects: [
          {
            id: 'sub-1',
            subject_name: 'Mathematics',
            marks_obtained: 92,
            total_marks: 100,
            grade: 'A+',
            teacher_name: 'Mrs. Sharma',
            remarks: 'Outstanding work in algebra',
          },
          {
            id: 'sub-2',
            subject_name: 'Science',
            marks_obtained: 88,
            total_marks: 100,
            grade: 'A+',
            teacher_name: 'Mr. Patel',
          },
          {
            id: 'sub-3',
            subject_name: 'English',
            marks_obtained: 85,
            total_marks: 100,
            grade: 'A',
            teacher_name: 'Ms. Gupta',
          },
          {
            id: 'sub-4',
            subject_name: 'Social Studies',
            marks_obtained: 90,
            total_marks: 100,
            grade: 'A+',
            teacher_name: 'Mr. Singh',
          },
          {
            id: 'sub-5',
            subject_name: 'Hindi',
            marks_obtained: 82,
            total_marks: 100,
            grade: 'A',
            teacher_name: 'Mrs. Verma',
          },
        ],
      };

      setResult(mockResult);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadResults();
    setRefreshing(false);
  };

  const getGradeColor = (grade: string): string => {
    const gradeColors: Record<string, string> = {
      'A+': COLORS.success,
      'A': COLORS.success,
      'B+': COLORS.info,
      'B': COLORS.info,
      'C+': COLORS.warning,
      'C': COLORS.warning,
      'D': COLORS.error,
      'F': COLORS.error,
    };
    return gradeColors[grade] || COLORS.gray500;
  };

  const handleShare = async () => {
    if (!result) return;

    const message = `
${result.exam_name} Results

Overall Performance:
Marks: ${result.total_marks_obtained}/${result.total_marks}
Percentage: ${result.percentage.toFixed(2)}%
Grade: ${result.grade}
${result.rank ? `Rank: ${result.rank}/${result.total_students}` : ''}

Subject-wise Performance:
${result.subjects.map((s) =>
      `${s.subject_name}: ${s.marks_obtained}/${s.total_marks} (${s.grade})`
    ).join('\n')}
    `.trim();

    try {
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownloadReportCard = () => {
    // TODO: Implement PDF generation and download
    console.log('Download Report Card - Phase 4');
  };

  if (!result) {
    return (
      <ScreenWrapper>
        <Header
          title="Exam Results"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Icon name="sync" size={48} color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const SubjectCard: React.FC<{ subject: SubjectResult }> = ({ subject }) => {
    const percentage = (subject.marks_obtained / subject.total_marks) * 100;
    const gradeColor = getGradeColor(subject.grade);

    return (
      <Card elevation="sm" padding={SPACING.md} style={styles.subjectCard}>
        <View style={styles.subjectHeader}>
          <View style={styles.subjectLeft}>
            <View style={[styles.subjectIcon, { backgroundColor: gradeColor + '15' }]}>
              <Icon name="book-open-variant" size={20} color={gradeColor} />
            </View>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{subject.subject_name}</Text>
              <Text style={styles.teacherName}>by {subject.teacher_name}</Text>
            </View>
          </View>
          <View style={[styles.gradeBadge, { backgroundColor: gradeColor + '15' }]}>
            <Text style={[styles.gradeText, { color: gradeColor }]}>
              {subject.grade}
            </Text>
          </View>
        </View>

        <View style={styles.marksRow}>
          <View style={styles.marksItem}>
            <Text style={styles.marksLabel}>Marks Obtained</Text>
            <Text style={styles.marksValue}>
              {subject.marks_obtained} / {subject.total_marks}
            </Text>
          </View>
          <View style={styles.marksItem}>
            <Text style={styles.marksLabel}>Percentage</Text>
            <Text style={[styles.marksValue, { color: gradeColor }]}>
              {percentage.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${percentage}%`, backgroundColor: gradeColor },
            ]}
          />
        </View>

        {subject.remarks && (
          <View style={styles.remarksBox}>
            <Icon name="comment-text" size={14} color={COLORS.gray500} />
            <Text style={styles.remarksText}>{subject.remarks}</Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <ScreenWrapper>
      <Header
        title="Exam Results"
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Icon name="share-variant" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Result Card */}
        <Card elevation="lg" padding={SPACING.xl} style={styles.overallCard}>
          <Text style={styles.examTitle}>{result.exam_name}</Text>
          <View style={styles.overallStats}>
            <View style={styles.percentageCircle}>
              <Text style={styles.percentageValue}>{result.percentage.toFixed(1)}%</Text>
              <Text style={styles.percentageLabel}>Overall</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{result.total_marks_obtained}</Text>
                <Text style={styles.statLabel}>Marks Obtained</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{result.total_marks}</Text>
                <Text style={styles.statLabel}>Total Marks</Text>
              </View>
              <View style={styles.statBox}>
                <View style={[styles.overallGradeBadge, { backgroundColor: getGradeColor(result.grade) }]}>
                  <Text style={styles.overallGradeText}>{result.grade}</Text>
                </View>
                <Text style={styles.statLabel}>Grade</Text>
              </View>
              {result.rank && (
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>#{result.rank}</Text>
                  <Text style={styles.statLabel}>Class Rank</Text>
                </View>
              )}
            </View>
          </View>

          {result.remarks && (
            <View style={styles.overallRemarksBox}>
              <Icon name="star" size={20} color={COLORS.warning} />
              <Text style={styles.overallRemarksText}>{result.remarks}</Text>
            </View>
          )}
        </Card>

        {/* Performance Graph */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <Card elevation="sm" padding={SPACING.md}>
            <View style={styles.performanceChart}>
              {result.subjects.map((subject) => {
                const percentage = (subject.marks_obtained / subject.total_marks) * 100;
                const gradeColor = getGradeColor(subject.grade);

                return (
                  <View key={subject.id} style={styles.chartItem}>
                    <Text style={styles.chartLabel} numberOfLines={1}>
                      {subject.subject_name}
                    </Text>
                    <View style={styles.chartBar}>
                      <View
                        style={[
                          styles.chartFill,
                          { width: `${percentage}%`, backgroundColor: gradeColor },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartValue}>{percentage.toFixed(0)}%</Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </View>

        {/* Subject-wise Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject-wise Performance</Text>
          {result.subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Button
            title="Download Report Card"
            onPress={handleDownloadReportCard}
            icon="download"
            style={styles.actionButton}
          />
          <Button
            title="View Analytics"
            onPress={() => {
              // @ts-ignore
              navigation.navigate('ExamAnalytics', { examId: result.id });
            }}
            variant="outline"
            icon="chart-line"
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
    marginTop: SPACING.md,
  },
  shareButton: {
    padding: SPACING.sm,
  },
  overallCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  examTitle: {
    fontSize: FONTS['2xl'],
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  overallStats: {
    alignItems: 'center',
  },
  percentageCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  percentageValue: {
    fontSize: FONTS['3xl'],
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  percentageLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  statBox: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  statLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray500,
    marginTop: 4,
    textAlign: 'center',
  },
  overallGradeBadge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  overallGradeText: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  overallRemarksBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '10',
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  overallRemarksText: {
    flex: 1,
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  performanceChart: {
    gap: SPACING.md,
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  chartLabel: {
    width: 100,
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
  },
  chartBar: {
    flex: 1,
    height: 24,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chartFill: {
    height: '100%',
    borderRadius: 12,
  },
  chartValue: {
    width: 45,
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray700,
    textAlign: 'right',
  },
  subjectCard: {
    marginBottom: SPACING.md,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  subjectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  teacherName: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
    marginTop: 2,
  },
  gradeBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  gradeText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
  },
  marksRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  marksItem: {
    alignItems: 'center',
  },
  marksLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray500,
    marginBottom: 4,
  },
  marksValue: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  remarksBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.gray50,
    padding: SPACING.sm,
    borderRadius: 6,
    gap: SPACING.xs,
  },
  remarksText: {
    flex: 1,
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    fontStyle: 'italic',
  },
  actionsSection: {
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  actionButton: {
    marginBottom: SPACING.xs,
  },
});

export default ExamResultsScreen;
