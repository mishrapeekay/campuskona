/**
 * HomeStackNavigator - Dashboard and Home Screens
 *
 * Contains:
 * - Role-specific dashboards
 * - Quick actions
 * - Admin management screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSelector } from '@/store/hooks';

// Types
import { HomeStackParamList, UserType } from '@/types/navigation';

// Dashboard Screens
import SuperAdminDashboard from '@/screens/Dashboard/SuperAdminDashboard';
import PrincipalDashboard from '@/screens/Dashboard/PrincipalDashboard';
import AdminDashboard from '@/screens/Dashboard/AdminDashboard';
import TeacherDashboard from '@/screens/Dashboard/TeacherDashboard';
import StudentDashboard from '@/screens/Dashboard/StudentDashboard';
import ParentDashboard from '@/screens/Dashboard/ParentDashboard';
import AccountantDashboard from '@/screens/Dashboard/AccountantDashboard';
import LibrarianDashboard from '@/screens/Dashboard/LibrarianDashboard';
import TransportManagerDashboard from '@/screens/Dashboard/TransportManagerDashboard';
import PartnerDashboardScreen from '@/screens/Partner/PartnerDashboardScreen';
import InvestorDashboardScreen from '@/screens/Investor/InvestorDashboardScreen';

// Admin Management Screens
import StudentManagementScreen from '@/screens/Admin/StudentManagementScreen';
import StudentRegistrationScreen from '@/screens/Admin/StudentRegistrationScreen';
import StudentEditScreen from '@/screens/Admin/StudentEditScreen';
import StaffManagementScreen from '@/screens/Admin/StaffManagementScreen';
import StaffRegistrationScreen from '@/screens/Admin/StaffRegistrationScreen';
import StaffEditScreen from '@/screens/Admin/StaffEditScreen';
import StudentNotesScreen from '@/screens/Admin/StudentNotesScreen';
import AuditLogsScreen from '@/screens/Admin/AuditLogsScreen';

// Super Admin Screens
import TenantManagementScreen from '@/screens/SuperAdmin/TenantManagementScreen';
import TenantDetailScreen from '@/screens/SuperAdmin/TenantDetailScreen';
import TenantSetupWizardScreen from '@/screens/SuperAdmin/TenantSetupWizardScreen';
import PlatformDashboardScreen from '@/screens/SuperAdmin/PlatformDashboardScreen';
import DeploymentTrackerScreen from '@/screens/SuperAdmin/DeploymentTrackerScreen';

// Communication
import AnnouncementsScreen from '@/screens/Communication/AnnouncementsScreen';

// Constants
import { COLORS } from '@/constants';

const Stack = createNativeStackNavigator<HomeStackParamList>();

// Dashboard component selector based on user role
const DashboardSelector: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const userType = user?.user_type as UserType;

  switch (userType) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
    case 'SCHOOL_ADMIN':
      return <AdminDashboard />;
    case 'PRINCIPAL':
      return <PrincipalDashboard />;
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    case 'PARENT':
      return <ParentDashboard />;
    case 'ACCOUNTANT':
      return <AccountantDashboard />;
    case 'LIBRARIAN':
      return <LibrarianDashboard />;
    case 'TRANSPORT_MANAGER':
      return <TransportManagerDashboard />;
    case 'PARTNER':
      return <PartnerDashboardScreen />;
    case 'INVESTOR':
      return <InvestorDashboardScreen />;
    default:
      return <StudentDashboard />;
  }
};

const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      {/* Main Dashboard (role-specific) */}
      <Stack.Screen name="Dashboard" component={DashboardSelector} />

      {/* Individual Dashboards (for direct navigation) */}
      <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboard} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="PrincipalDashboard" component={PrincipalDashboard} />
      <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
      <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
      <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
      <Stack.Screen name="AccountantDashboard" component={AccountantDashboard} />
      <Stack.Screen name="LibrarianDashboard" component={LibrarianDashboard} />
      <Stack.Screen name="TransportManagerDashboard" component={TransportManagerDashboard} />
      <Stack.Screen name="PartnerDashboard" component={PartnerDashboardScreen} />
      <Stack.Screen name="InvestorDashboard" component={InvestorDashboardScreen} />

      {/* Announcements */}
      <Stack.Screen
        name="Announcements"
        component={AnnouncementsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Announcements',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* Admin Management */}
      <Stack.Screen
        name="StudentManagement"
        component={StudentManagementScreen}
        options={{
          headerShown: true,
          headerTitle: 'Student Management',
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />
      <Stack.Screen
        name="AddStudent"
        component={StudentRegistrationScreen}
        options={{
          headerShown: true,
          headerTitle: 'New Student Registration',
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />
      <Stack.Screen
        name="StaffManagement"
        component={StaffManagementScreen}
        options={{
          headerShown: true,
          headerTitle: 'Staff Management',
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />
      <Stack.Screen
        name="AddStaff"
        component={StaffRegistrationScreen}
        options={{
          headerShown: true,
          headerTitle: 'Staff Registration',
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />
      <Stack.Screen
        name="EditStudent"
        component={StudentEditScreen}
        options={{
          headerShown: true,
          headerTitle: 'Edit Student',
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />
      <Stack.Screen
        name="StudentNotes"
        component={StudentNotesScreen}
        options={{
          headerShown: false, // Custom header
        }}
      />
      <Stack.Screen
        name="EditStaff"
        component={StaffEditScreen}
        options={{
          headerShown: true,
          headerTitle: 'Edit Staff Member',
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />
      <Stack.Screen
        name="AuditLogs"
        component={AuditLogsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Audit Logs',
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />

      {/* Super Admin Screens */}
      <Stack.Screen
        name="TenantManagement"
        component={TenantManagementScreen}
        options={{
          headerShown: true,
          headerTitle: 'Tenant Management',
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />
      <Stack.Screen
        name="TenantDetail"
        component={TenantDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Tenant Details',
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />
      <Stack.Screen
        name="TenantSetupWizard"
        component={TenantSetupWizardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Setup New School',
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />
      <Stack.Screen
        name="PlatformDashboard"
        component={PlatformDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Platform Dashboard',
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />
      <Stack.Screen
        name="DeploymentTracker"
        component={DeploymentTrackerScreen}
        options={{
          headerShown: true,
          headerTitle: 'Deployment Status',
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />
      <Stack.Screen
        name="StaffDetail"
        component={StaffManagementScreen}
        options={{
          headerShown: true,
          headerTitle: 'Staff Details',
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
