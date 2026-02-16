import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { examService, studentService } from '@/services/api';
import { RootState } from '@/store';
import { Exam, ExamSchedule, UserType } from '@/types/models';

const ExamDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { examId } = route.params as { examId: string };

  const user = useSelector((state: RootState) => state.auth.user);
  const isTeacher = user?.user_type === UserType.TEACHER;

  const [exam, setExam] = useState<Exam | null>(null);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExam();
  }, [examId]);

  const loadExam = async () => {
    setLoading(true);
    try {
      const data = await examService.getExam(examId);
      setExam(data);

      const scheduleParams: Record<string, string | number | boolean> = {
        examination: data.id,
        page_size: 100,
      };

      if (user?.student_id) {
        try {
          const enrollments = await studentService.getStudentEnrollment(user.student_id);
          const active = enrollments.find((entry) => entry.is_active) || enrollments[0];
          if (active?.class_id) {
            scheduleParams.class_obj = active.class_id;
          }
          if (active?.section) {
            scheduleParams.section = active.section;
          }
        } catch (error) {
          console.warn('Unable to load student enrollment:', error);
        }
      }

      try {
        const scheduleResponse = await examService.getExamSchedules(scheduleParams);
        setSchedules(scheduleResponse.results || []);
      } catch (error) {
        console.warn('Unable to load exam schedules:', error);
        setSchedules([]);
      }
    } catch (error) {
      console.error('Failed to load exam:', error);
      setExam(null);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}-${end.getDate()} ${start.toLocaleDateString('en-IN', { month: 'short' })}`;
    }

    return `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
  };

  const formatScheduleDate = (date?: string): string => {
    if (!date) return 'Date TBD';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatScheduleTime = (time?: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const parsed = new Date();
    parsed.setHours(Number(hours), Number(minutes || 0), 0, 0);
    return parsed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusConfig = (examData: Exam) => {
    const statusMap: Record<Exam['status'], { label: string; color: string }> = {
      SCHEDULED: { label: 'Scheduled', color: COLORS.info },
      ONGOING: { label: 'Ongoing', color: COLORS.warning },
      COMPLETED: { label: 'Completed', color: COLORS.success },
      CANCELLED: { label: 'Cancelled', color: COLORS.error },
      POSTPONED: { label: 'Postponed', color: COLORS.warning },
    };

    if (examData.status && statusMap[examData.status]) {
      return statusMap[examData.status];
    }

    const now = new Date();
    const start = new Date(examData.start_date);
    const end = new Date(examData.end_date);
    if (now < start) {
      return { label: 'Upcoming', color: COLORS.info };
    }
    if (now >= start && now <= end) {
      return { label: 'Ongoing', color: COLORS.warning };
    }
    return { label: 'Completed', color: COLORS.success };
  };

  const InfoRow: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? 'N/A'}</Text>
    </View>
  );

  const scheduleData = useMemo(() => {
    const sortedSchedules = [...schedules].sort((a, b) => {
      const aTime = new Date(`${a.exam_date}T${a.start_time || '00:00:00'}`).getTime();
      const bTime = new Date(`${b.exam_date}T${b.start_time || '00:00:00'}`).getTime();
      return aTime - bTime;
    });

    const subjectMap = new Map<
      string,
      { name: string; maxMarks?: number; minMarks?: number }
    >();
    const rooms = new Set<string>();

    sortedSchedules.forEach((item) => {
      const name = item.subject_name || item.subject;
      if (name && !subjectMap.has(name)) {
        subjectMap.set(name, {
          name,
          maxMarks: item.max_marks,
          minMarks: item.min_passing_marks,
        });
      }
      if (item.room_number) {
        rooms.add(item.room_number);
      }
    });

    return {
      sortedSchedules,
      subjects: Array.from(subjectMap.values()),
      rooms: Array.from(rooms),
    };
  }, [schedules]);

  if (loading) {
    return (
      <ScreenWrapper>
        <Header title="Exam Details" showBackButton onBackPress={() => navigation.goBack()} />
        <LoadingSpinner fullScreen text="Loading exam details..." />
      </ScreenWrapper>
    );
  }

  if (!exam) {
    return (
      <ScreenWrapper>
        <Header title="Exam Details" showBackButton onBackPress={() => navigation.goBack()} />
        <EmptyState
          icon="file-document-outline"
          title="Exam Not Found"
          description="We could not load this exam right now."
          actionLabel="Retry"
          onActionPress={loadExam}
        />
      </ScreenWrapper>
    );
  }

  const statusConfig = getStatusConfig(exam);
  const statusLabel = exam.status_display || statusConfig.label;
  const infoRows = [
    { label: 'Exam Type', value: exam.exam_type_name || exam.exam_type },
    { label: 'Academic Year', value: exam.academic_year_name || exam.academic_year },
    { label: 'Status', value: exam.status_display || exam.status },
    { label: 'Start Date', value: new Date(exam.start_date).toLocaleDateString('en-IN') },
    { label: 'End Date', value: new Date(exam.end_date).toLocaleDateString('en-IN') },
    {
      label: 'Result Date',
      value: exam.result_date ? new Date(exam.result_date).toLocaleDateString('en-IN') : undefined,
    },
    { label: 'Grade Scale', value: exam.grade_scale_name },
    {
      label: 'Published',
      value: exam.is_published !== undefined ? (exam.is_published ? 'Yes' : 'No') : undefined,
    },
  ];

  return (
    <ScreenWrapper>
      <Header title="Exam Details" showBackButton onBackPress={() => navigation.goBack()} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Card elevation="lg" padding={SPACING.lg} style={styles.summaryCard}>
          <Text style={styles.examName}>{exam.name}</Text>
          <Text style={styles.examType}>{exam.exam_type_name || exam.exam_type}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15' }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusLabel}</Text>
          </View>
          <Text style={styles.dateRange}>{formatDateRange(exam.start_date, exam.end_date)}</Text>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exam Information</Text>
          <Card elevation="sm" padding={SPACING.md}>
            {infoRows.map((row) =>
              row.value ? <InfoRow key={row.label} label={row.label} value={row.value} /> : null
            )}
          </Card>
        </View>

        {(exam.description || exam.instructions) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Card elevation="sm" padding={SPACING.md}>
              {exam.description ? (
                <Text style={styles.bodyText}>{exam.description}</Text>
              ) : null}
              {exam.instructions ? (
                <Text style={styles.bodyText}>{exam.instructions}</Text>
              ) : null}
            </Card>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <Card elevation="sm" padding={SPACING.md}>
            {scheduleData.sortedSchedules.length === 0 && (
              <Text style={styles.emptyText}>Schedule not published yet.</Text>
            )}
            {scheduleData.sortedSchedules.map((item) => {
              const subject = item.subject_name || item.subject || 'Subject';
              const timeRange = [formatScheduleTime(item.start_time), formatScheduleTime(item.end_time)]
                .filter(Boolean)
                .join(' - ');
              const metaParts = [
                formatScheduleDate(item.exam_date),
                timeRange,
                item.room_number ? `Room ${item.room_number}` : undefined,
              ].filter(Boolean);

              return (
                <View key={item.id} style={styles.listRow}>
                  <Text style={styles.listText}>{subject}</Text>
                  {metaParts.length > 0 && (
                    <Text style={styles.listMeta}>{metaParts.join(' | ')}</Text>
                  )}
                </View>
              );
            })}
          </Card>
        </View>

        {scheduleData.subjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subjects</Text>
            <Card elevation="sm" padding={SPACING.md}>
              {scheduleData.subjects.map((subject) => (
                <View key={subject.name} style={styles.listRow}>
                  <Text style={styles.listText}>{subject.name}</Text>
                  {(subject.maxMarks || subject.minMarks) && (
                    <Text style={styles.listMeta}>
                      {subject.maxMarks ? `Max: ${subject.maxMarks}` : 'Max: N/A'}
                      {subject.minMarks ? ` | Pass: ${subject.minMarks}` : ''}
                    </Text>
                  )}
                </View>
              ))}
            </Card>
          </View>
        )}

        {scheduleData.rooms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rooms</Text>
            <Card elevation="sm" padding={SPACING.md}>
              {scheduleData.rooms.map((room) => (
                <View key={room} style={styles.listRow}>
                  <Text style={styles.listText}>{room}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="View Results"
            onPress={() => {
              // @ts-ignore
              navigation.navigate('ExamResults', { examId: exam.id });
            }}
            variant="secondary"
          />
          {isTeacher && (
            <>
              <Button
                title="Enter Marks"
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('EnterMarks', { examId: exam.id });
                }}
                style={styles.actionButton}
              />
              <Button
                title="View Analytics"
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('ExamAnalytics', { examId: exam.id });
                }}
                variant="outline"
              />
            </>
          )}
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
  summaryCard: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.lg,
    alignItems: 'flex-start',
  },
  examName: {
    fontSize: FONTS['2xl'],
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: 4,
  },
  examType: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  statusText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
  },
  dateRange: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  infoValue: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  bodyText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  actions: {
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  actionButton: {
    marginBottom: SPACING.xs,
  },
  listRow: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  listText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  listMeta: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
    marginTop: 2,
  },
});

export default ExamDetailScreen;
