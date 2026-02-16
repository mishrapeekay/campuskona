/**
 * AcademicsStackNavigator - Attendance, Exams, Timetable
 *
 * Contains all academic-related screens:
 * - Attendance marking and reports
 * - Leave management
 * - Examinations and marks
 * - Timetable views
 * - Academic calendar
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Types
import { AcademicsStackParamList } from '@/types/navigation';

// Attendance Screens
import AttendanceOverviewScreen from '@/screens/Attendance/AttendanceOverviewScreen';
import MarkAttendanceScreen from '@/screens/Attendance/MarkAttendanceScreen';
import AttendanceHistoryScreen from '@/screens/Attendance/AttendanceHistoryScreen';

// Leave Screens
import LeaveRequestScreen from '@/screens/Attendance/LeaveRequestScreen';

// Exam Screens
import ExamListScreen from '@/screens/Exams/ExamListScreen';
import ExamDetailScreen from '@/screens/Exams/ExamDetailScreen';
import EnterMarksScreen from '@/screens/Exams/EnterMarksScreen';
import ExamResultsScreen from '@/screens/Exams/ExamResultsScreen';
import ExamAnalyticsScreen from '@/screens/Exams/ExamAnalyticsScreen';

// Timetable Screens
import TimetableScreen from '@/screens/Timetable/TimetableScreen';

// Reports
import AttendanceReportScreen from '@/screens/Reports/AttendanceReportScreen';
import AcademicReportScreen from '@/screens/Reports/AcademicReportScreen';

// Assignment Screens
import AssignmentsScreen from '@/screens/Assignments/AssignmentsScreen';
import AssignmentDetailScreen from '@/screens/Assignments/AssignmentDetailScreen';
import CreateAssignmentScreen from '@/screens/Assignments/CreateAssignmentScreen';
import SubmitAssignmentScreen from '@/screens/Assignments/SubmitAssignmentScreen';
import GradeSubmissionScreen from '@/screens/Assignments/GradeSubmissionScreen';


// Constants
import { COLORS } from '@/constants';

const Stack = createNativeStackNavigator<AcademicsStackParamList>();

// Academics Home Screen - Entry point for academics tab
const AcademicsHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // This will redirect to AttendanceOverview by default
  // Or could be a custom academics hub screen
  return <AttendanceOverviewScreen />;
};

const AcademicsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      {/* Academics Home - Entry Point */}
      <Stack.Screen name="AcademicsHome" component={AcademicsHomeScreen} />

      {/* ===== ATTENDANCE MODULE ===== */}
      <Stack.Screen name="AttendanceOverview" component={AttendanceOverviewScreen} />
      <Stack.Screen
        name="MarkAttendance"
        component={MarkAttendanceScreen}
        options={{
          headerShown: true,
          headerTitle: 'Mark Attendance',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="AttendanceHistory"
        component={AttendanceHistoryScreen}
        options={{
          headerShown: true,
          headerTitle: 'Attendance History',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="AttendanceReport"
        component={AttendanceReportScreen}
        options={{
          headerShown: true,
          headerTitle: 'Attendance Report',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== LEAVE MODULE ===== */}
      <Stack.Screen
        name="LeaveRequests"
        component={LeaveRequestScreen}
        options={{
          headerShown: true,
          headerTitle: 'Leave Requests',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="ApplyLeave"
        component={LeaveRequestScreen}
        options={{
          headerShown: true,
          headerTitle: 'Apply for Leave',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== EXAMINATIONS MODULE ===== */}
      <Stack.Screen
        name="ExamList"
        component={ExamListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Examinations',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="ExamDetail"
        component={ExamDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Exam Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="EnterMarks"
        component={EnterMarksScreen}
        options={{
          headerShown: true,
          headerTitle: 'Enter Marks',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="ExamResults"
        component={ExamResultsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Exam Results',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="ExamAnalytics"
        component={ExamAnalyticsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Exam Analytics',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== TIMETABLE MODULE ===== */}
      <Stack.Screen
        name="Timetable"
        component={TimetableScreen}
        options={{
          headerShown: true,
          headerTitle: 'Timetable',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="TeacherTimetable"
        component={TimetableScreen}
        options={{
          headerShown: true,
          headerTitle: 'My Timetable',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== REPORTS MODULE ===== */}
      <Stack.Screen
        name="AcademicCalendar"
        component={AcademicReportScreen}
        options={{
          headerShown: true,
          headerTitle: 'Academic Calendar',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== ASSIGNMENTS MODULE ===== */}
      <Stack.Screen
        name="AssignmentsList"
        component={AssignmentsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Assignments',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="AssignmentDetail"
        component={AssignmentDetailScreen}
        options={{
          headerShown: false, // Custom header in screen
        }}
      />
      <Stack.Screen
        name="CreateAssignment"
        component={CreateAssignmentScreen}
        options={{
          headerShown: false, // Custom header in screen
        }}
      />
      <Stack.Screen
        name="EditAssignment"
        component={CreateAssignmentScreen} // Reusing Create for now, might need separate or logic in Create
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SubmitAssignment"
        component={SubmitAssignmentScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GradeSubmission"
        component={GradeSubmissionScreen}
        options={{
          headerShown: false,
        }}
      />

    </Stack.Navigator>
  );
};

export default AcademicsStackNavigator;
