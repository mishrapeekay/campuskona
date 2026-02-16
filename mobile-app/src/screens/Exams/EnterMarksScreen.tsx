import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { examService, classService } from '@/services/api';

interface Student {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  roll_number: number;
}

interface StudentMarks {
  studentId: string;
  marks?: number;
  grade?: string;
  remarks?: string;
}

const EnterMarksScreen: React.FC = () => {
  const navigation = useNavigation();
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<string, StudentMarks>>({});
  const [selectedExam, setSelectedExam] = useState<string>('exam-1');
  const [selectedSubject, setSelectedSubject] = useState<string>('math');
  const [totalMarks, setTotalMarks] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      // TODO: Replace with actual API call
      // const classStudents = await classService.getTeacherClassStudents();

      // Mock data
      const mockStudents: Student[] = Array.from({ length: 40 }, (_, i) => ({
        id: `student-${i + 1}`,
        admission_number: `2025${(i + 1).toString().padStart(3, '0')}`,
        first_name: ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan'][i % 8],
        last_name: ['Kumar', 'Sharma', 'Patel', 'Singh', 'Verma', 'Reddy', 'Joshi', 'Nair'][i % 8],
        roll_number: i + 1,
      }));

      setStudents(mockStudents);

      // Initialize marks object
      const initialMarks: Record<string, StudentMarks> = {};
      mockStudents.forEach((student) => {
        initialMarks[student.id] = { studentId: student.id };
      });
      setMarks(initialMarks);
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const calculateGrade = (obtainedMarks: number): string => {
    const percentage = (obtainedMarks / totalMarks) * 100;

    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'F';
  };

  const handleMarksChange = (studentId: string, value: string) => {
    const numValue = parseFloat(value);

    if (value === '' || isNaN(numValue)) {
      setMarks({
        ...marks,
        [studentId]: { ...marks[studentId], marks: undefined, grade: undefined },
      });
      return;
    }

    if (numValue > totalMarks) {
      Alert.alert('Invalid Marks', `Marks cannot exceed ${totalMarks}`);
      return;
    }

    const grade = calculateGrade(numValue);

    setMarks({
      ...marks,
      [studentId]: {
        ...marks[studentId],
        marks: numValue,
        grade,
      },
    });
  };

  const handleRemarksChange = (studentId: string, value: string) => {
    setMarks({
      ...marks,
      [studentId]: { ...marks[studentId], remarks: value },
    });
  };

  const handleSave = async () => {
    // Validate that all students have marks
    const invalidStudents = students.filter(
      (student) => marks[student.id].marks === undefined
    );

    if (invalidStudents.length > 0) {
      Alert.alert(
        'Incomplete Data',
        `Please enter marks for all students. ${invalidStudents.length} students pending.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Anyway', onPress: () => saveMarks() },
        ]
      );
      return;
    }

    await saveMarks();
  };

  const saveMarks = async () => {
    setSaving(true);

    try {
      // Prepare marks data
      const marksData = Object.values(marks).filter((m) => m.marks !== undefined);

      // TODO: Replace with actual API call
      // await examService.submitMarks(selectedExam, selectedSubject, marksData);

      // Mock save
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        'Success',
        `Marks saved successfully for ${marksData.length} students`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to save marks:', error);
      Alert.alert('Error', error.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  const getStatistics = () => {
    const validMarks = Object.values(marks).filter((m) => m.marks !== undefined);
    const total = validMarks.length;
    const sum = validMarks.reduce((acc, m) => acc + (m.marks || 0), 0);
    const average = total > 0 ? sum / total : 0;

    const highest = Math.max(...validMarks.map((m) => m.marks || 0));
    const lowest = Math.min(...validMarks.map((m) => m.marks || 0));

    return {
      total,
      average: average.toFixed(2),
      highest: highest > 0 ? highest : '-',
      lowest: lowest < Infinity ? lowest : '-',
    };
  };

  const filteredStudents = students.filter((student) =>
    `${student.first_name} ${student.last_name} ${student.admission_number}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const stats = getStatistics();

  const renderStudentItem = ({ item }: { item: Student }) => {
    const studentMarks = marks[item.id];
    const marksValue = studentMarks.marks?.toString() || '';

    return (
      <View style={styles.studentCard}>
        <View style={styles.studentInfo}>
          <View style={styles.studentAvatar}>
            <Icon name="account" size={20} color={COLORS.gray600} />
          </View>
          <View style={styles.studentDetails}>
            <Text style={styles.studentName}>
              {item.roll_number}. {item.first_name} {item.last_name}
            </Text>
            <Text style={styles.studentId}>{item.admission_number}</Text>
          </View>
        </View>

        <View style={styles.marksInputSection}>
          <View style={styles.marksInputContainer}>
            <TextInput
              style={styles.marksInput}
              placeholder="0"
              value={marksValue}
              onChangeText={(value) => handleMarksChange(item.id, value)}
              keyboardType="decimal-pad"
              maxLength={5}
              placeholderTextColor={COLORS.gray400}
            />
            <Text style={styles.maxMarks}>/ {totalMarks}</Text>
          </View>

          {studentMarks.grade && (
            <View
              style={[
                styles.gradeChip,
                {
                  backgroundColor:
                    studentMarks.grade.includes('A')
                      ? COLORS.success + '15'
                      : studentMarks.grade.includes('B')
                      ? COLORS.info + '15'
                      : studentMarks.grade.includes('C')
                      ? COLORS.warning + '15'
                      : COLORS.error + '15',
                },
              ]}
            >
              <Text
                style={[
                  styles.gradeText,
                  {
                    color: studentMarks.grade.includes('A')
                      ? COLORS.success
                      : studentMarks.grade.includes('B')
                      ? COLORS.info
                      : studentMarks.grade.includes('C')
                      ? COLORS.warning
                      : COLORS.error,
                  },
                ]}
              >
                {studentMarks.grade}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <Header
        title="Enter Marks"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.container}>
        {/* Header Info */}
        <Card elevation="md" padding={SPACING.md} style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>Exam</Text>
              <Text style={styles.headerValue}>Mid-Term</Text>
            </View>
            <View style={styles.headerDivider} />
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>Subject</Text>
              <Text style={styles.headerValue}>Mathematics</Text>
            </View>
            <View style={styles.headerDivider} />
            <View style={styles.headerItem}>
              <Text style={styles.headerLabel}>Class</Text>
              <Text style={styles.headerValue}>10-A</Text>
            </View>
          </View>
        </Card>

        {/* Statistics */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}/{students.length}</Text>
            <Text style={styles.statLabel}>Entered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{stats.average}</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: COLORS.success }]}>{stats.highest}</Text>
            <Text style={styles.statLabel}>Highest</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: COLORS.error }]}>{stats.lowest}</Text>
            <Text style={styles.statLabel}>Lowest</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={COLORS.gray400} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or admission number..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.gray400}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Students List */}
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          renderItem={renderStudentItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Save Button */}
        <View style={styles.footer}>
          <Button
            title={saving ? 'Saving...' : `Save Marks (${stats.total}/${students.length})`}
            onPress={handleSave}
            disabled={saving || stats.total === 0}
            loading={saving}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  headerCard: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  headerItem: {
    alignItems: 'center',
    flex: 1,
  },
  headerLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  headerValue: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  headerDivider: {
    width: 1,
    backgroundColor: COLORS.gray200,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  statLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray500,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.gray900,
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  studentId: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
    marginTop: 2,
  },
  marksInputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  marksInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
  },
  marksInput: {
    width: 50,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
    textAlign: 'center',
  },
  maxMarks: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  gradeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  gradeText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.bold,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
});

export default EnterMarksScreen;
