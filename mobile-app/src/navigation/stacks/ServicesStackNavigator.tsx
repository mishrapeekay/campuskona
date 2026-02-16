/**
 * ServicesStackNavigator - All Service Modules
 *
 * Contains all service-related screens:
 * - Library management (catalog, books, issues)
 * - Transport management (routes, vehicles, tracking)
 * - Communication (notices, messages, events)
 * - Reports and analytics (custom report builder, templates, saved reports)
 * - Online Admissions (applications, forms, document upload, tracking)
 * - Hostel Management (rooms, attendance, mess, complaints, visitors)
 * - HR & Payroll (staff directory, payroll, payslips, leave management)
 * - Tenant management (super admin)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Types
import { ServicesStackParamList } from '@/types/navigation';

// Library Screens
import LibraryHomeScreen from '@/screens/Library/LibraryHomeScreen';
import LibraryCatalogScreen from '@/screens/Library/LibraryCatalogScreen';
import BookDetailScreen from '@/screens/Library/BookDetailScreen';
import IssueBookScreen from '@/screens/Library/IssueBookScreen';
import ReturnBookScreen from '@/screens/Library/ReturnBookScreen';
import MyBooksScreen from '@/screens/Library/MyBooksScreen';
import IssuedBooksListScreen from '@/screens/Library/IssuedBooksListScreen';
import OverdueBooksScreen from '@/screens/Library/OverdueBooksScreen';

// Transport Screens
import TransportHomeScreen from '@/screens/Transport/TransportHomeScreen';
import RouteListScreen from '@/screens/Transport/RouteListScreen';
import RouteDetailScreen from '@/screens/Transport/RouteDetailScreen';
import VehicleListScreen from '@/screens/Transport/VehicleListScreen';
import MyTransportScreen from '@/screens/Transport/MyTransportScreen';
import BusTrackingScreen from '@/screens/Transport/BusTrackingScreen';
import TransportAttendanceScreen from '@/screens/Transport/TransportAttendanceScreen';

// Communication Screens
import NoticeBoardScreen from '@/screens/Communication/NoticeBoardScreen';
import NoticeDetailScreen from '@/screens/Communication/NoticeDetailScreen';
import CreateNoticeScreen from '@/screens/Communication/CreateNoticeScreen';
import EventCalendarScreen from '@/screens/Communication/EventCalendarScreen';
import MessagesScreen from '@/screens/Communication/MessagesScreen';
import ChatScreen from '@/screens/Communication/ChatScreen';
import BroadcastMessageScreen from '@/screens/Communication/BroadcastMessageScreen';
import AnnouncementsScreen from '@/screens/Communication/AnnouncementsScreen';

// Report Screens
import ReportsDashboardScreen from '@/screens/Reports/ReportsDashboardScreen';
import CustomReportBuilderScreen from '@/screens/Reports/CustomReportBuilderScreen';
import ReportTemplatesScreen from '@/screens/Reports/ReportTemplatesScreen';
import SavedReportsScreen from '@/screens/Reports/SavedReportsScreen';

// Admission Screens
import AdmissionsHomeScreen from '@/screens/Admissions/AdmissionsHomeScreen';
import ApplicationListScreen from '@/screens/Admissions/ApplicationListScreen';
import ApplicationDetailScreen from '@/screens/Admissions/ApplicationDetailScreen';
import AdmissionFormScreen from '@/screens/Admissions/AdmissionFormScreen';

// Hostel Screens
import HostelDashboardScreen from '@/screens/Hostel/HostelDashboardScreen';
import RoomListScreen from '@/screens/Hostel/RoomListScreen';
import HostelAttendanceScreen from '@/screens/Hostel/HostelAttendanceScreen';
import MessMenuScreen from '@/screens/Hostel/MessMenuScreen';

// HR & Payroll Screens
import HRDashboardScreen from '@/screens/HRPayroll/HRDashboardScreen';
import StaffDirectoryScreen from '@/screens/HRPayroll/StaffDirectoryScreen';
import PayrollProcessingScreen from '@/screens/HRPayroll/PayrollProcessingScreen';
import PayslipDetailScreen from '@/screens/HRPayroll/PayslipDetailScreen';
import StaffLeaveManagementScreen from '@/screens/HRPayroll/StaffLeaveManagementScreen';

// Constants
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

// React Native imports for ServicesHomeScreen
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const Stack = createNativeStackNavigator<ServicesStackParamList>();

// ===== SERVICES HOME SCREEN (Hub for all services) =====
const ServicesHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const quickLinks = [
    { label: 'Notice Board', icon: 'bulletin-board', route: 'NoticeBoard', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
    { label: 'Messages', icon: 'chat', route: 'Messages', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Events', icon: 'calendar', route: 'EventCalendar', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'My Books', icon: 'book-account', route: 'MyBooks', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { label: 'My Transport', icon: 'bus', route: 'MyTransport', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Broadcast', icon: 'bullhorn', route: 'BroadcastMessage', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  ];

  const services = [
    { title: 'Library', icon: 'book-open-variant', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30', description: 'Browse catalog, issue & return books', route: 'LibraryHome' },
    { title: 'Transport', icon: 'bus-school', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', description: 'Routes, vehicles, live tracking', route: 'TransportHome' },
    { title: 'Communication', icon: 'message-text', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30', description: 'Notices, messages, events', route: 'NoticeBoard' },
    { title: 'Reports', icon: 'chart-bar', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', description: 'Attendance, academic & financial reports', route: 'ReportsHome' },
    { title: 'Admissions', icon: 'file-document-edit', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30', description: 'Online admission, applications, tracking', route: 'AdmissionsHome' },
    { title: 'Hostel', icon: 'home-city', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', description: 'Rooms, attendance, mess, complaints', route: 'HostelDashboard' },
    { title: 'HR & Payroll', icon: 'account-cash', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-900/30', description: 'Staff directory, salary, leave management', route: 'HRDashboard' },
  ];

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Section */}
        <View className="px-6 pt-12 pb-6">
          <Text className="text-3xl font-black text-slate-900 dark:text-slate-100">Services</Text>
          <Text className="text-slate-500 dark:text-slate-400 font-medium mt-1">Explore all school management modules</Text>
        </View>

        {/* Quick Links */}
        <View className="px-6 mb-8 mt-2">
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-6">Quick Access</Text>
          <View className="flex-row flex-wrap justify-between bg-white dark:bg-slate-900 p-4 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
            {quickLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                className="w-[30%] items-center py-4"
                onPress={() => navigation.navigate(link.route)}
              >
                <View className={`w-14 h-14 rounded-[20px] justify-center items-center mb-2 active:scale-95 transition-all overflow-hidden ${link.bg}`}>
                  <Icon name={link.icon} size={28} className={link.color} />
                </View>
                <Text className="text-[10px] text-slate-600 dark:text-slate-300 text-center font-bold px-1" numberOfLines={1}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Service Cards */}
        <View className="px-6">
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 mb-6">All Modules</Text>
          {services.map((service, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center bg-white dark:bg-slate-900 rounded-[32px] p-5 mb-4 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-all"
              onPress={() => navigation.navigate(service.route)}
            >
              <View className={`w-16 h-16 rounded-[24px] justify-center items-center mr-5 overflow-hidden ${service.bg}`}>
                <Icon name={service.icon} size={32} className={service.color} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-black text-slate-900 dark:text-slate-100">{service.title}</Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-4" numberOfLines={2}>{service.description}</Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 items-center justify-center ml-2">
                <Icon name="chevron-right" size={20} className="text-slate-300 dark:text-slate-600" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const ServicesStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      {/* Services Home - Entry Point */}
      <Stack.Screen name="ServicesHome" component={ServicesHomeScreen} />

      {/* ===== LIBRARY MODULE ===== */}
      <Stack.Screen name="LibraryHome" component={LibraryHomeScreen} />
      <Stack.Screen
        name="LibraryCatalog"
        component={LibraryCatalogScreen}
        options={{
          headerShown: true,
          headerTitle: 'Library Catalog',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Book Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="IssueBook"
        component={IssueBookScreen}
        options={{
          headerShown: true,
          headerTitle: 'Issue Book',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="ReturnBook"
        component={ReturnBookScreen}
        options={{
          headerShown: true,
          headerTitle: 'Return Book',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="MyBooks"
        component={MyBooksScreen}
        options={{
          headerShown: true,
          headerTitle: 'My Books',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="IssuedBooksList"
        component={IssuedBooksListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Issued Books',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="OverdueBooks"
        component={OverdueBooksScreen}
        options={{
          headerShown: true,
          headerTitle: 'Overdue Books',
          headerStyle: { backgroundColor: COLORS.error },
          headerTintColor: COLORS.white,
          headerTitleStyle: { color: COLORS.white },
        }}
      />
      <Stack.Screen
        name="BookSearch"
        component={LibraryCatalogScreen}
        options={{
          headerShown: true,
          headerTitle: 'Search Books',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="BookCategories"
        component={LibraryCatalogScreen}
        options={{
          headerShown: true,
          headerTitle: 'Book Categories',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="LibraryHistory"
        component={IssuedBooksListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Library History',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="LibraryReports"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Library Reports',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== TRANSPORT MODULE ===== */}
      <Stack.Screen name="TransportHome" component={TransportHomeScreen} />
      <Stack.Screen
        name="RouteList"
        component={RouteListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Bus Routes',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="RouteDetail"
        component={RouteDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Route Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="VehicleList"
        component={VehicleListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Vehicles',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="VehicleDetail"
        component={RouteDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Vehicle Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="MyTransport"
        component={MyTransportScreen}
        options={{
          headerShown: true,
          headerTitle: 'My Transport',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="BusTracking"
        component={BusTrackingScreen}
        options={{
          headerShown: true,
          headerTitle: 'Live Bus Tracking',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { color: COLORS.white },
        }}
      />
      <Stack.Screen
        name="TransportAttendance"
        component={TransportAttendanceScreen}
        options={{
          headerShown: true,
          headerTitle: 'Transport Attendance',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="DriverList"
        component={VehicleListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Drivers',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="TransportFees"
        component={TransportHomeScreen}
        options={{
          headerShown: true,
          headerTitle: 'Transport Fees',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="TransportReports"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Transport Reports',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== COMMUNICATION MODULE ===== */}
      <Stack.Screen name="NoticeBoard" component={NoticeBoardScreen} />
      <Stack.Screen
        name="NoticeDetail"
        component={NoticeDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Notice',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="CreateNotice"
        component={CreateNoticeScreen}
        options={{
          headerShown: true,
          headerTitle: 'Create Notice',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="EventCalendar"
        component={EventCalendarScreen}
        options={{
          headerShown: true,
          headerTitle: 'Events & Calendar',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="EventDetail"
        component={NoticeDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Event Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="CreateEvent"
        component={CreateNoticeScreen}
        options={{
          headerShown: true,
          headerTitle: 'Create Event',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          headerShown: true,
          headerTitle: 'Messages',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{
          headerShown: true,
          headerTitle: 'Chat',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="BroadcastMessage"
        component={BroadcastMessageScreen}
        options={{
          headerShown: true,
          headerTitle: 'Broadcast Message',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
          presentation: 'modal',
        }}
      />
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
      <Stack.Screen
        name="Circulars"
        component={NoticeBoardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Circulars',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== REPORTS MODULE ===== */}
      <Stack.Screen name="ReportsHome" component={ReportsDashboardScreen} />
      <Stack.Screen
        name="AttendanceReport"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Attendance Report',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="AcademicReport"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Academic Report',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="FinancialReport"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Financial Report',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="CustomReport"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Custom Report',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== ADMISSIONS MODULE ===== */}
      <Stack.Screen name="AdmissionsHome" component={AdmissionsHomeScreen} />
      <Stack.Screen
        name="NewAdmission"
        component={AdmissionFormScreen}
        options={{
          headerShown: true,
          headerTitle: 'New Admission',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="AdmissionForm"
        component={AdmissionFormScreen}
        options={{
          headerShown: true,
          headerTitle: 'Admission Form',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="ApplicationList"
        component={ApplicationListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Applications',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="ApplicationDetail"
        component={ApplicationDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Application Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="ApplicationReview"
        component={ApplicationDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Review Application',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="DocumentUpload"
        component={AdmissionFormScreen}
        options={{
          headerShown: true,
          headerTitle: 'Upload Documents',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="AdmissionStatus"
        component={ApplicationDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Admission Status',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="AdmissionSettings"
        component={AdmissionsHomeScreen}
        options={{
          headerShown: true,
          headerTitle: 'Admission Settings',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="EnquiryList"
        component={ApplicationListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Enquiries',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="NewEnquiry"
        component={AdmissionFormScreen}
        options={{
          headerShown: true,
          headerTitle: 'New Enquiry',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
          presentation: 'modal',
        }}
      />

      {/* ===== HOSTEL MODULE ===== */}
      <Stack.Screen name="HostelDashboard" component={HostelDashboardScreen} />
      <Stack.Screen
        name="HostelList"
        component={HostelDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'All Hostels',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="HostelDetail"
        component={HostelDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Hostel Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="RoomList"
        component={RoomListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Rooms',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="RoomDetail"
        component={RoomListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Room Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="RoomAllocation"
        component={RoomListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Room Allocation',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="AllocateStudent"
        component={RoomListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Allocate Student',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="HostelAttendance"
        component={HostelAttendanceScreen}
        options={{
          headerShown: true,
          headerTitle: 'Hostel Attendance',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="HostelFees"
        component={HostelDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Hostel Fees',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="WardenList"
        component={HostelDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Wardens',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="WardenDetail"
        component={HostelDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Warden Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="MessMenu"
        component={MessMenuScreen}
        options={{
          headerShown: true,
          headerTitle: 'Mess Menu',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="HostelComplaints"
        component={HostelDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Complaints',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="NewComplaint"
        component={HostelDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'New Complaint',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="HostelVisitors"
        component={HostelDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Visitors',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== HR & PAYROLL MODULE ===== */}
      <Stack.Screen name="HRDashboard" component={HRDashboardScreen} />
      <Stack.Screen
        name="StaffDirectory"
        component={StaffDirectoryScreen}
        options={{
          headerShown: true,
          headerTitle: 'Staff Directory',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="StaffProfile"
        component={StaffDirectoryScreen}
        options={{
          headerShown: true,
          headerTitle: 'Staff Profile',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="PayrollDashboard"
        component={PayrollProcessingScreen}
        options={{
          headerShown: true,
          headerTitle: 'Payroll',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="PayrollProcessing"
        component={PayrollProcessingScreen}
        options={{
          headerShown: true,
          headerTitle: 'Process Payroll',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="PayslipList"
        component={PayrollProcessingScreen}
        options={{
          headerShown: true,
          headerTitle: 'Payslips',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="PayslipDetail"
        component={PayslipDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Payslip',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="SalaryStructure"
        component={PayrollProcessingScreen}
        options={{
          headerShown: true,
          headerTitle: 'Salary Structure',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="EditSalary"
        component={PayrollProcessingScreen}
        options={{
          headerShown: true,
          headerTitle: 'Edit Salary',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="StaffLeaveManagement"
        component={StaffLeaveManagementScreen}
        options={{
          headerShown: true,
          headerTitle: 'Leave Management',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="StaffLeaveDetail"
        component={StaffLeaveManagementScreen}
        options={{
          headerShown: true,
          headerTitle: 'Leave Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="ApplyStaffLeave"
        component={StaffLeaveManagementScreen}
        options={{
          headerShown: true,
          headerTitle: 'Apply Leave',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="StaffAttendance"
        component={HRDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Staff Attendance',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="DepartmentList"
        component={StaffDirectoryScreen}
        options={{
          headerShown: true,
          headerTitle: 'Departments',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="DesignationList"
        component={StaffDirectoryScreen}
        options={{
          headerShown: true,
          headerTitle: 'Designations',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== ENHANCED REPORTS MODULE ===== */}
      <Stack.Screen
        name="CustomReportBuilder"
        component={CustomReportBuilderScreen}
        options={{
          headerShown: true,
          headerTitle: 'Build Report',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="ReportTemplates"
        component={ReportTemplatesScreen}
        options={{
          headerShown: true,
          headerTitle: 'Report Templates',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="SavedReports"
        component={SavedReportsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Saved Reports',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="ReportExport"
        component={SavedReportsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Export Report',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== TENANT MANAGEMENT (Super Admin) ===== */}
      <Stack.Screen
        name="TenantList"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'All Schools',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="TenantDetail"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'School Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="CreateTenant"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Create School',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="TenantSettings"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'School Settings',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
    </Stack.Navigator>
  );
};

export default ServicesStackNavigator;
