import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '@/store/hooks';
import { UserType } from '@/types/models';
import { COLORS, ICONS } from '@/constants';
import {
  MainTabParamList,
  AttendanceStackParamList,
  ExamStackParamList,
  FeeStackParamList,
  LibraryStackParamList,
  TransportStackParamList,
  ProfileStackParamList,
} from '@/types/navigation';

// Import Dashboard Screens
import SuperAdminDashboard from '@/screens/Dashboard/SuperAdminDashboard';
import PrincipalDashboard from '@/screens/Dashboard/PrincipalDashboard';
import AdminDashboard from '@/screens/Dashboard/AdminDashboard';
import TeacherDashboard from '@/screens/Dashboard/TeacherDashboard';
import StudentDashboard from '@/screens/Dashboard/StudentDashboard';
import ParentDashboard from '@/screens/Dashboard/ParentDashboard';
import AccountantDashboard from '@/screens/Dashboard/AccountantDashboard';
import LibrarianDashboard from '@/screens/Dashboard/LibrarianDashboard';
import TransportManagerDashboard from '@/screens/Dashboard/TransportManagerDashboard';

// Import Attendance Stack Screens
import AttendanceScreen from '@/screens/Attendance/AttendanceScreen';
import MarkAttendanceScreen from '@/screens/Attendance/MarkAttendanceScreen';
import AttendanceOverviewScreen from '@/screens/Attendance/AttendanceOverviewScreen';
import AttendanceHistoryScreen from '@/screens/Attendance/AttendanceHistoryScreen';
import LeaveRequestScreen from '@/screens/Attendance/LeaveRequestScreen';

// Import Exam Stack Screens
import ExamListScreen from '@/screens/Exams/ExamListScreen';
import EnterMarksScreen from '@/screens/Exams/EnterMarksScreen';
import ExamResultsScreen from '@/screens/Exams/ExamResultsScreen';
import ExamAnalyticsScreen from '@/screens/Exams/ExamAnalyticsScreen';

// Import Fee Stack Screens
import FeeScreen from '@/screens/Fee/FeeScreen';

// Import Library Stack Screens
import LibraryScreen from '@/screens/Library/LibraryScreen';

// Import Transport Stack Screens
import TransportScreen from '@/screens/Transport/TransportScreen';

// Import Profile Stack Screens
import ProfileScreen from '@/screens/Profile/ProfileScreen';
import EditProfileScreen from '@/screens/Profile/EditProfileScreen';
import ChangePasswordScreen from '@/screens/Profile/ChangePasswordScreen';
import SettingsScreen from '@/screens/Profile/SettingsScreen';
import NotificationCenterScreen from '@/screens/Profile/NotificationCenterScreen';
import FeedbackScreen from '@/screens/Profile/FeedbackScreen';
import HelpCenterScreen from '@/screens/Profile/HelpCenterScreen';
import AboutScreen from '@/screens/Profile/AboutScreen';
import SubscriptionScreen from '@/screens/Profile/SubscriptionScreen';


// Import Modal Screens
import TimetableScreen from '@/screens/Timetable/TimetableScreen';
import CreateNoticeScreen from '@/screens/Communication/CreateNoticeScreen';

// Import Admin Management Screens
import StudentManagementScreen from '@/screens/Admin/StudentManagementScreen';
import StaffManagementScreen from '@/screens/Admin/StaffManagementScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator();

// Stack Navigators for each tab
const AttendanceStack = createNativeStackNavigator<AttendanceStackParamList>();
const ExamStack = createNativeStackNavigator<ExamStackParamList>();
const FeeStack = createNativeStackNavigator<FeeStackParamList>();
const LibraryStack = createNativeStackNavigator<LibraryStackParamList>();
const TransportStack = createNativeStackNavigator<TransportStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Import Tenants Stack Navigator
import TenantsStackNavigator from './stacks/TenantsStackNavigator';
import AcademicsStackNavigator from './stacks/AcademicsStackNavigator';
import ServicesStackNavigator from './stacks/ServicesStackNavigator';

// Attendance Stack Navigator
const AttendanceStackNavigator = () => (
  <AttendanceStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <AttendanceStack.Screen
      name="AttendanceOverview"
      component={AttendanceOverviewScreen}
      options={{ title: 'Attendance' }}
    />
    <AttendanceStack.Screen
      name="MarkAttendance"
      component={MarkAttendanceScreen}
      options={{ title: 'Mark Attendance' }}
    />
    <AttendanceStack.Screen
      name="AttendanceHistory"
      component={AttendanceHistoryScreen}
      options={{ title: 'Attendance History' }}
    />
    <AttendanceStack.Screen
      name="LeaveRequests"
      component={LeaveRequestScreen}
      options={{ title: 'Leave Requests' }}
    />
  </AttendanceStack.Navigator>
);

// Exam Stack Navigator
const ExamStackNavigator = () => (
  <ExamStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <ExamStack.Screen
      name="ExamList"
      component={ExamListScreen}
      options={{ title: 'Exams' }}
    />
    <ExamStack.Screen
      name="EnterMarks"
      component={EnterMarksScreen}
      options={{ title: 'Enter Marks' }}
    />
    <ExamStack.Screen
      name="ExamResults"
      component={ExamResultsScreen}
      options={{ title: 'Exam Results' }}
    />
    <ExamStack.Screen
      name="ExamAnalytics"
      component={ExamAnalyticsScreen}
      options={{ title: 'Exam Analytics' }}
    />
  </ExamStack.Navigator>
);

// Fee Stack Navigator
const FeeStackNavigator = () => (
  <FeeStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <FeeStack.Screen
      name="FeeOverview"
      component={FeeScreen}
      options={{ title: 'Fees' }}
    />
    {/* Additional screens will be added in Phase 6:
    <FeeStack.Screen name="StudentFeeDetails" component={StudentFeeDetailsScreen} />
    <FeeStack.Screen name="PaymentEntry" component={PaymentEntryScreen} />
    <FeeStack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
    */}
  </FeeStack.Navigator>
);

// Library Stack Navigator
const LibraryStackNavigator = () => (
  <LibraryStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <LibraryStack.Screen
      name="LibraryHome"
      component={LibraryScreen}
      options={{ title: 'Library' }}
    />
    {/* Additional screens will be added in Phase 7:
    <LibraryStack.Screen name="BookCatalog" component={BookCatalogScreen} />
    <LibraryStack.Screen name="IssueBook" component={IssueBookScreen} />
    <LibraryStack.Screen name="MyIssuedBooks" component={MyIssuedBooksScreen} />
    */}
  </LibraryStack.Navigator>
);

// Transport Stack Navigator
const TransportStackNavigator = () => (
  <TransportStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <TransportStack.Screen
      name="TransportHome"
      component={TransportScreen}
      options={{ title: 'Transport' }}
    />
    {/* Additional screens will be added in Phase 7:
    <TransportStack.Screen name="RouteList" component={RouteListScreen} />
    <TransportStack.Screen name="VehicleList" component={VehicleListScreen} />
    <TransportStack.Screen name="MyTransportDetails" component={MyTransportDetailsScreen} />
    */}
  </TransportStack.Navigator>
);

// Import Privacy Screens
import ConsentManagementScreen from '@/screens/Privacy/ConsentManagementScreen';
import DataExportRequestScreen from '@/screens/Privacy/DataExportRequestScreen';
import DataDeletionRequestScreen from '@/screens/Privacy/DataDeletionRequestScreen';

// Profile Stack Navigator
export const ProfileStackNavigator = () => (
  <ProfileStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <ProfileStack.Screen
      name="ProfileOverview"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <ProfileStack.Screen
      name="MyTimetable"
      component={TimetableScreen}
      options={{ title: 'My Timetable' }}
    />
    <ProfileStack.Screen
      name="CreateNotice"
      component={CreateNoticeScreen}
      options={{ title: 'Create Notice' }}
    />
    <ProfileStack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: 'Edit Profile' }}
    />
    <ProfileStack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={{ title: 'Change Password' }}
    />
    <ProfileStack.Screen
      name="SettingsHome"
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
    <ProfileStack.Screen
      name="NotificationHistory"
      component={NotificationCenterScreen}
      options={{ title: 'Notifications' }}
    />
    <ProfileStack.Screen
      name="FeedbackScreen"
      component={FeedbackScreen}
      options={{ title: 'Feedback' }}
    />
    <ProfileStack.Screen
      name="HelpCenter"
      component={HelpCenterScreen}
      options={{ title: 'Help Center' }}
    />
    <ProfileStack.Screen
      name="About"
      component={AboutScreen}
      options={{ title: 'About' }}
    />
    <ProfileStack.Screen
      name="ConsentManagement"
      component={ConsentManagementScreen}
      options={{ title: 'Consent Management' }}
    />
    <ProfileStack.Screen
      name="DataExport"
      component={DataExportRequestScreen}
      options={{ title: 'Data Export' }}
    />
    <ProfileStack.Screen
      name="DataDeletion"
      component={DataDeletionRequestScreen}
      options={{ title: 'Data Deletion' }}
    />
    <ProfileStack.Screen
      name="Subscription"
      component={SubscriptionScreen}
      options={{ title: 'Subscription' }}
    />
  </ProfileStack.Navigator>

);

const MainNavigator: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const getDashboardComponent = () => {
    switch (user?.user_type) {
      case UserType.SUPER_ADMIN:
        return SuperAdminDashboard;
      case UserType.SCHOOL_ADMIN:
        return AdminDashboard;
      case UserType.PRINCIPAL:
        return PrincipalDashboard;
      case UserType.TEACHER:
        return TeacherDashboard;
      case UserType.STUDENT:
        return StudentDashboard;
      case UserType.PARENT:
        return ParentDashboard;
      case UserType.ACCOUNTANT:
        return AccountantDashboard;
      case UserType.LIBRARIAN:
        return LibrarianDashboard;
      case UserType.TRANSPORT_MANAGER:
        return TransportManagerDashboard;
      default:
        return AdminDashboard;
    }
  };

  const getTabsForUserType = () => {
    const commonTabs = [
      {
        name: 'HomeTab' as keyof MainTabParamList,
        component: getDashboardComponent(),
        icon: ICONS.dashboard,
        label: 'Dashboard',
      },
    ];

    switch (user?.user_type) {
      case UserType.SUPER_ADMIN:
        return [
          ...commonTabs,
          { name: 'TenantsTab' as keyof MainTabParamList, component: TenantsStackNavigator, icon: 'domain', label: 'Tenants' },
          { name: 'ProfileTab' as keyof MainTabParamList, component: ProfileStackNavigator, icon: ICONS.profile, label: 'More' },
        ];

      case UserType.SCHOOL_ADMIN:
      case UserType.PRINCIPAL:
        return [
          ...commonTabs,
          { name: 'AttendanceTab', component: AttendanceStackNavigator, icon: ICONS.attendance, label: 'Attendance' },
          { name: 'ExamsTab', component: ExamStackNavigator, icon: ICONS.exams, label: 'Exams' },
          { name: 'FeesTab', component: FeeStackNavigator, icon: ICONS.fees, label: 'Fees' },
          { name: 'ProfileTab', component: ProfileStackNavigator, icon: ICONS.profile, label: 'Profile' },
        ];

      case UserType.TEACHER:
        return [
          ...commonTabs,
          { name: 'AcademicsTab', component: AcademicsStackNavigator, icon: ICONS.students, label: 'Classes' },
          { name: 'ServicesTab', component: ServicesStackNavigator, icon: 'apps', label: 'Services' },
          { name: 'ProfileTab', component: ProfileStackNavigator, icon: ICONS.profile, label: 'Profile' },
        ];

      case UserType.STUDENT:
        return [
          ...commonTabs,
          { name: 'ExamsTab', component: ExamStackNavigator, icon: ICONS.exams, label: 'My Exams' },
          { name: 'FeesTab', component: FeeStackNavigator, icon: ICONS.fees, label: 'My Fees' },
          { name: 'LibraryTab', component: LibraryStackNavigator, icon: ICONS.library, label: 'Library' },
          { name: 'ProfileTab', component: ProfileStackNavigator, icon: ICONS.profile, label: 'Profile' },
        ];

      case UserType.PARENT:
        return [
          ...commonTabs,
          { name: 'FeesTab', component: FeeStackNavigator, icon: ICONS.fees, label: 'Fees' },
          { name: 'ProfileTab', component: ProfileStackNavigator, icon: ICONS.profile, label: 'Profile' },
        ];

      case UserType.ACCOUNTANT:
        return [
          ...commonTabs,
          { name: 'FeesTab', component: FeeStackNavigator, icon: ICONS.fees, label: 'Fees' },
          { name: 'ProfileTab', component: ProfileStackNavigator, icon: ICONS.profile, label: 'Profile' },
        ];

      case UserType.LIBRARIAN:
        return [
          ...commonTabs,
          { name: 'LibraryTab', component: LibraryStackNavigator, icon: ICONS.library, label: 'Library' },
          { name: 'ProfileTab', component: ProfileStackNavigator, icon: ICONS.profile, label: 'Profile' },
        ];

      case UserType.TRANSPORT_MANAGER:
        return [
          ...commonTabs,
          { name: 'TransportTab', component: TransportStackNavigator, icon: ICONS.transport, label: 'Transport' },
          { name: 'ProfileTab', component: ProfileStackNavigator, icon: ICONS.profile, label: 'Profile' },
        ];

      default:
        return [...commonTabs, { name: 'ProfileTab', component: ProfileStackNavigator, icon: ICONS.profile, label: 'Profile' }];
    }
  };

  const tabs = getTabsForUserType();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray500,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name as keyof MainTabParamList}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ color, size }) => <Icon name={tab.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default MainNavigator;
