/**
 * Navigation Types - Complete Type Definitions for School Management App
 *
 * This file defines all navigation parameter lists for type-safe navigation.
 * Architecture: Drawer + Bottom Tabs + Stacks
 */

import { NavigatorScreenParams } from '@react-navigation/native';

// ============================================================================
// USER TYPES (for role-based navigation)
// ============================================================================

export type UserType =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'PRINCIPAL'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT'
  | 'ACCOUNTANT'
  | 'LIBRARIAN'
  | 'TRANSPORT_MANAGER'
  | 'PARTNER'
  | 'INVESTOR';

// ============================================================================
// ROOT NAVIGATION
// ============================================================================

export type RootStackParamList = {
  // Onboarding & Initial
  Onboarding: undefined;
  TenantSelection: undefined;

  // Auth
  Auth: NavigatorScreenParams<AuthStackParamList>;

  // Main App (Drawer Navigator)
  MainDrawer: NavigatorScreenParams<DrawerParamList>;

  // Global Modal Screens
  NotificationCenter: undefined;
  GlobalSearch: undefined;
  QRScanner: { mode?: 'attendance' | 'library' | 'general' };
  ImageViewer: { uri: string; title?: string };
  PDFViewer: { uri: string; title: string };
  WebViewer: { uri: string; title: string };
};

// ============================================================================
// AUTH STACK
// ============================================================================

export type AuthStackParamList = {
  Login: undefined;
  SuperAdminLogin: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string; email?: string };
  EmailVerification: { email: string };
  BiometricSetup: undefined;
  OTPLogin: undefined;
};

// ============================================================================
// DRAWER NAVIGATION
// ============================================================================

export type DrawerParamList = {
  // Main Tab Navigator
  MainTabs: NavigatorScreenParams<MainTabParamList>;

  // Drawer Menu Items
  DrawerProfile: undefined;
  DrawerSettings: undefined;
  DrawerNotifications: undefined;
  DrawerHelp: undefined;
  DrawerFeedback: undefined;
  DrawerAbout: undefined;
};

// ============================================================================
// MAIN TAB NAVIGATION
// ============================================================================

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  AcademicsTab: NavigatorScreenParams<AcademicsStackParamList>;
  FinanceTab: NavigatorScreenParams<FinanceStackParamList>;
  ServicesTab: NavigatorScreenParams<ServicesStackParamList>;
  TenantsTab: NavigatorScreenParams<TenantsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;

  // Specific module tabs for distinct access
  AttendanceTab: NavigatorScreenParams<AttendanceStackParamList>;
  ExamsTab: NavigatorScreenParams<ExamStackParamList>;
  FeesTab: NavigatorScreenParams<FeeStackParamList>;
  LibraryTab: NavigatorScreenParams<LibraryStackParamList>;
  TransportTab: NavigatorScreenParams<TransportStackParamList>;

  // Specific tabs for Partner and Investor
  PartnerTab: NavigatorScreenParams<PartnerStackParamList>;
  InvestorTab: NavigatorScreenParams<InvestorStackParamList>;
};

// ============================================================================
// HOME/DASHBOARD STACK
// ============================================================================

export type HomeStackParamList = {
  // Dashboard (role-based)
  Dashboard: undefined;
  SuperAdminDashboard: undefined;
  AdminDashboard: undefined;
  PrincipalDashboard: undefined;
  TeacherDashboard: undefined;
  StudentDashboard: undefined;
  ParentDashboard: undefined;
  AccountantDashboard: undefined;
  LibrarianDashboard: undefined;
  TransportManagerDashboard: undefined;
  PartnerDashboard: undefined;
  InvestorDashboard: undefined;

  // Quick Actions from Dashboard
  QuickAttendance: { classId?: string; sectionId?: string };
  QuickMarksEntry: { examId?: string; classId?: string };
  TodaySchedule: undefined;

  // Announcements
  Announcements: undefined;
  AnnouncementDetail: { id: string };

  // Admin Management (from admin dashboards)
  StudentManagement: undefined;
  StudentDetail: { studentId: string };
  AddStudent: undefined;
  EditStudent: { studentId: string };
  StaffManagement: undefined;
  StaffDetail: { staffId: string };
  AddStaff: undefined;
  EditStaff: { staffId: string };
  StudentNotes: { studentId: string; studentName?: string };

  // Super Admin
  TenantManagement: undefined;
  TenantDetail: { tenantId: string };
  TenantSetupWizard: undefined;
  PlatformDashboard: undefined;
  DeploymentTracker: undefined;
  AuditLogs: { type?: 'platform' | 'tenant'; tenantId?: string } | undefined;
};

// ============================================================================
// ACADEMICS STACK (Attendance, Exams, Timetable)
// ============================================================================

export type AcademicsStackParamList = {
  // Academics Home
  AcademicsHome: undefined;

  // Attendance
  AttendanceOverview: undefined;
  MarkAttendance: { classId?: string; sectionId?: string; date?: string };
  AttendanceHistory: { studentId?: string; classId?: string };
  AttendanceReport: { type?: 'daily' | 'weekly' | 'monthly'; classId?: string };
  BulkAttendance: { classId: string; sectionId: string };

  // Leave Management
  LeaveRequests: undefined;
  LeaveRequestDetail: { id: string };
  ApplyLeave: { studentId?: string; staffId?: string };
  LeaveApproval: { id: string };

  // Examinations
  ExamList: { status?: 'upcoming' | 'ongoing' | 'completed' };
  ExamDetail: { examId: string };
  CreateExam: undefined;
  EditExam: { examId: string };
  ExamSchedule: { examId: string };

  // Marks & Results
  EnterMarks: { examId: string; subjectId?: string; classId?: string };
  ViewMarks: { examId?: string; studentId?: string };
  ExamResults: { examId?: string; studentId?: string };
  ExamAnalytics: { examId: string };
  ReportCard: { studentId: string; academicYearId?: string };
  BulkMarksEntry: { examId: string; classId: string };

  // Timetable
  Timetable: { type?: 'class' | 'teacher'; id?: string };
  TimetableEdit: { classId: string; sectionId: string };
  TeacherTimetable: { teacherId?: string };

  // Calendar & Holidays
  AcademicCalendar: undefined;
  HolidayList: undefined;

  // Progress & Performance
  StudentProgress: { studentId: string };
  ClassPerformance: { classId: string; sectionId?: string };

  // --- Assignments & Homework Module ---
  AssignmentsList: {
    classId?: string;
    sectionId?: string;
    subjectId?: string;
    studentId?: string;
  } | undefined;
  AssignmentDetail: { assignmentId: string };
  CreateAssignment: { classId?: string; sectionId?: string; subjectId?: string };
  EditAssignment: { assignmentId: string };
  SubmitAssignment: { assignmentId: string };
  SubmissionDetail: { submissionId: string };
  GradeSubmission: { submissionId: string };
};

// ============================================================================
// FINANCE STACK (Fees, Payments, Invoices)
// ============================================================================

export type FinanceStackParamList = {
  // Finance Home
  FinanceHome: undefined;

  // Fee Overview
  FeeOverview: undefined;
  FeeStructure: { classId?: string };
  FeeCategories: undefined;
  CreateFeeStructure: undefined;
  EditFeeStructure: { id: string };

  // Student Fees
  StudentFeeList: { status?: 'pending' | 'paid' | 'overdue' | 'partial' };
  StudentFeeDetail: { studentId: string };
  FeeDetails: { feeId: string };
  FeeBreakdown: { studentId: string; academicYearId?: string };

  // Payments
  PaymentGateway: { feeId?: string; feeIds?: string[]; amount: number; studentId: string };
  PaymentMethods: undefined;
  PaymentProcessing: { orderId: string };
  PaymentSuccess: { paymentId: string; receiptNumber: string; amount: number };
  PaymentFailed: { reason?: string; orderId?: string };
  PaymentHistory: { studentId?: string };
  PaymentDetail: { paymentId?: string; transactionId?: string };

  // Receipts & Invoices
  ReceiptView: { paymentId?: string; transactionId?: string };
  ReceiptDownload: { paymentId?: string; transactionId?: string };
  InvoiceList: { studentId?: string };
  InvoiceDetail: { invoiceId: string };
  GenerateInvoice: { studentId: string; feeIds?: string[] };

  // Fee Reminders
  FeeReminders: undefined;
  SendReminder: { studentIds?: string[]; feeIds?: string[] };

  // Reports (Accountant/Admin)
  FeeCollectionReport: { dateRange?: { from: string; to: string } };
  OutstandingReport: { classId?: string };
  ExpenseManagement: undefined;
  AddExpense: undefined;
  EditExpense: { id: string };
  ExpenseDetail: { id: string };
  ExpenseApproval: { id: string };
  FinancialSummary: { academicYearId?: string };
  FinancialReports: undefined;
};

// ============================================================================
// SERVICES STACK (Library, Transport, Communication)
// ============================================================================

export type ServicesStackParamList = {
  // Services Home
  ServicesHome: undefined;

  // ---- LIBRARY MODULE ----
  LibraryHome: undefined;
  LibraryCatalog: { categoryId?: string; searchQuery?: string };
  BookDetail: { bookId: string };
  BookSearch: { query?: string };
  BookCategories: undefined;
  AddBook: undefined;
  EditBook: { bookId: string };
  IssueBook: { bookId?: string; studentId?: string };
  ReturnBook: { issueId: string };
  RenewBook: { issueId: string };
  MyBooks: undefined;
  IssuedBooksList: { status?: 'active' | 'returned' | 'overdue' };
  OverdueBooks: undefined;
  BookReservation: { bookId: string };
  LibraryCard: { studentId?: string };
  LibraryFines: { studentId?: string };
  LibraryHistory: { status?: 'active' | 'returned' | 'overdue' };
  LibraryReports: undefined;

  // ---- TRANSPORT MODULE ----
  TransportHome: undefined;
  RouteList: undefined;
  RouteDetail: { routeId: string };
  RouteMap: { routeId: string };
  AddRoute: undefined;
  EditRoute: { routeId: string };
  VehicleList: undefined;
  VehicleDetail: { vehicleId: string };
  AddVehicle: undefined;
  EditVehicle: { vehicleId: string };
  DriverList: undefined;
  DriverDetail: { driverId: string };
  AddDriver: undefined;
  EditDriver: { driverId: string };
  StudentAllocation: { routeId?: string; stopId?: string };
  MyTransport: undefined;
  BusTracking: { routeId: string; vehicleId?: string };
  TransportAttendance: { routeId: string; date?: string };
  TransportFee: { studentId?: string };
  TransportFees: undefined;
  TransportReports: undefined;

  // ---- COMMUNICATION MODULE ----
  CommunicationHome: undefined;
  NoticeBoard: { type?: 'general' | 'academic' | 'event' | 'urgent' };
  NoticeDetail: { noticeId: string };
  CreateNotice: undefined;
  EditNotice: { noticeId: string };
  EventCalendar: undefined;
  EventDetail: { eventId: string };
  CreateEvent: undefined;
  EditEvent: { eventId: string };
  Messages: undefined;
  ChatScreen: { recipientId: string; recipientName: string; recipientType: string };
  NewMessage: undefined;
  BroadcastMessage: { type?: 'class' | 'section' | 'all' };
  MessageTemplates: undefined;
  SMSHistory: undefined;
  Announcements: undefined;
  Circulars: { type?: 'general' | 'academic' | 'event' | 'urgent' };

  // ---- REPORTS MODULE ----
  ReportsHome: undefined;
  AttendanceReportScreen: undefined;
  AcademicReportScreen: undefined;
  FinanceReportScreen: undefined;
  AttendanceReport: undefined;
  AcademicReport: undefined;
  FinancialReport: undefined;
  CustomReport: undefined;
  CustomReportBuilder: undefined;
  ReportViewer: { reportId: string; reportType: string };
  ReportTemplates: undefined;
  SavedReports: undefined;
  ReportExport: { reportId: string; format?: 'pdf' | 'excel' | 'csv' };

  // ---- TENANT MANAGEMENT (Super Admin) ----
  TenantList: undefined;
  TenantDetail: { tenantId: string };
  CreateTenant: undefined;
  TenantSettings: { tenantId: string } | undefined;

  // ---- ADMISSIONS MODULE ----
  AdmissionsHome: undefined;
  NewAdmission: undefined;
  AdmissionForm: { applicationId?: string };
  ApplicationList: { status?: 'all' | 'pending' | 'approved' | 'rejected' | 'enrolled' };
  ApplicationDetail: { applicationId: string };
  ApplicationReview: { applicationId: string };
  DocumentUpload: { applicationId: string };
  AdmissionStatus: { applicationId: string };
  AdmissionSettings: undefined;
  EnquiryList: undefined;
  NewEnquiry: undefined;

  // ---- HOSTEL MODULE ----
  HostelDashboard: undefined;
  HostelList: undefined;
  HostelDetail: { hostelId: string };
  RoomList: { hostelId?: string; floorId?: string };
  RoomDetail: { roomId: string };
  RoomAllocation: { roomId?: string; studentId?: string };
  AllocateStudent: { roomId: string };
  HostelAttendance: { hostelId?: string; date?: string };
  HostelFees: { studentId?: string };
  WardenList: undefined;
  WardenDetail: { wardenId: string };
  MessMenu: { hostelId?: string; weekOffset?: number };
  HostelComplaints: { hostelId?: string };
  NewComplaint: { hostelId?: string };
  HostelVisitors: { hostelId?: string };

  // ---- HR & PAYROLL MODULE ----
  HRDashboard: undefined;
  StaffDirectory: { departmentId?: string };
  StaffProfile: { staffId: string };
  PayrollDashboard: undefined;
  PayrollProcessing: { month?: string; year?: string };
  PayslipList: { staffId?: string };
  PayslipDetail: { payslipId: string };
  SalaryStructure: { staffId?: string };
  EditSalary: { staffId: string };
  StaffLeaveManagement: undefined;
  StaffLeaveDetail: { leaveId: string };
  ApplyStaffLeave: undefined;
  StaffAttendance: { date?: string };
  DepartmentList: undefined;
  DesignationList: undefined;
};

// ============================================================================
// PROFILE STACK
// ============================================================================

export type ProfileStackParamList = {
  // Profile Overview
  ProfileOverview: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  ChangePhoto: undefined;
  CreateNotice: undefined;

  // Timetable & Schedule
  MyTimetable: undefined;

  // Settings
  SettingsHome: undefined;
  NotificationSettings: undefined;
  LanguageSettings: undefined;
  ThemeSettings: undefined;
  SecuritySettings: undefined;
  BiometricSettings: undefined;
  PrivacySettings: undefined;

  // Help & Support
  HelpCenter: undefined;
  FAQs: undefined;
  ContactSupport: undefined;
  FeedbackScreen: undefined;

  // Notifications
  NotificationHistory: undefined;

  // Data & Privacy
  DataExport: undefined;
  ConsentManagement: undefined;
  DataDeletion: undefined;

  // About
  About: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  Licenses: undefined;
  Subscription: undefined;
};


// ============================================================================
// LEGACY SUPPORT (for backward compatibility)
// ============================================================================

// Old navigation types - mapped to new structure
export type AttendanceStackParamList = Pick<
  AcademicsStackParamList,
  'AttendanceOverview' | 'MarkAttendance' | 'AttendanceHistory' | 'LeaveRequests' | 'LeaveRequestDetail'
>;

export type ExamStackParamList = Pick<
  AcademicsStackParamList,
  'ExamList' | 'ExamDetail' | 'EnterMarks' | 'ExamResults' | 'ExamAnalytics'
>;

export type FeeStackParamList = Pick<
  FinanceStackParamList,
  'FeeOverview' | 'FeeStructure' | 'StudentFeeList' | 'PaymentHistory' | 'PaymentGateway'
>;

export type LibraryStackParamList = Pick<
  ServicesStackParamList,
  'LibraryHome' | 'LibraryCatalog' | 'BookDetail' | 'MyBooks' | 'IssuedBooksList'
>;

export type TransportStackParamList = Pick<
  ServicesStackParamList,
  'TransportHome' | 'RouteList' | 'RouteDetail' | 'VehicleList' | 'MyTransport' | 'BusTracking'
>;

export type CommunicationStackParamList = Pick<
  ServicesStackParamList,
  'NoticeBoard' | 'NoticeDetail' | 'CreateNotice' | 'EventCalendar' | 'Messages'
>;

export type AdmissionsStackParamList = Pick<
  ServicesStackParamList,
  'AdmissionsHome' | 'NewAdmission' | 'ApplicationList' | 'ApplicationDetail' | 'AdmissionForm'
>;

export type HostelStackParamList = Pick<
  ServicesStackParamList,
  'HostelDashboard' | 'HostelList' | 'RoomList' | 'RoomAllocation' | 'HostelAttendance' | 'HostelFees'
>;

export type HRPayrollStackParamList = Pick<
  ServicesStackParamList,
  'HRDashboard' | 'StaffDirectory' | 'PayrollDashboard' | 'PayrollProcessing' | 'PayslipList' | 'StaffLeaveManagement'
>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Screen props helper
export interface ScreenProps<T extends object = object> {
  navigation: any;
  route: {
    params?: T;
    name: string;
    key: string;
  };
}

// Tab configuration
export interface TabConfig {
  name: keyof MainTabParamList;
  label: string;
  icon: string;
  activeIcon?: string;
  badge?: number;
  feature?: string; // Feature code required to show this tab
}

// Role-based navigation config
export interface RoleNavigationConfig {
  role: UserType;
  tabs: TabConfig[];
  drawerItems: (keyof DrawerParamList)[];
  defaultRoute: string;
}

// Role-based tab configuration
export const ROLE_TAB_CONFIG: Record<UserType, TabConfig[]> = {
  SUPER_ADMIN: [
    { name: 'HomeTab', label: 'Dashboard', icon: 'view-dashboard-outline', activeIcon: 'view-dashboard' },
    { name: 'TenantsTab', label: 'Tenants', icon: 'domain', activeIcon: 'domain' },
    { name: 'ProfileTab', label: 'More', icon: 'menu', activeIcon: 'menu' },
  ],
  SCHOOL_ADMIN: [
    { name: 'HomeTab', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'AcademicsTab', label: 'Academics', icon: 'school-outline', activeIcon: 'school' },
    { name: 'FinanceTab', label: 'Finance', icon: 'cash-multiple', activeIcon: 'cash-multiple' },
    { name: 'ServicesTab', label: 'Services', icon: 'apps', activeIcon: 'apps' },
    { name: 'ProfileTab', label: 'More', icon: 'menu', activeIcon: 'menu' },
  ],
  PRINCIPAL: [
    { name: 'HomeTab', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'AcademicsTab', label: 'Academics', icon: 'school-outline', activeIcon: 'school' },
    { name: 'FinanceTab', label: 'Finance', icon: 'cash-multiple', activeIcon: 'cash-multiple' },
    { name: 'ServicesTab', label: 'Services', icon: 'apps', activeIcon: 'apps' },
    { name: 'ProfileTab', label: 'More', icon: 'menu', activeIcon: 'menu' },
  ],
  TEACHER: [
    { name: 'HomeTab', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'AcademicsTab', label: 'Classes', icon: 'google-classroom', activeIcon: 'google-classroom' },
    { name: 'ServicesTab', label: 'Services', icon: 'apps', activeIcon: 'apps' },
    { name: 'ProfileTab', label: 'Profile', icon: 'account-outline', activeIcon: 'account' },
  ],
  STUDENT: [
    { name: 'HomeTab', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'AcademicsTab', label: 'Academics', icon: 'book-open-outline', activeIcon: 'book-open' },
    { name: 'FinanceTab', label: 'Fees', icon: 'credit-card-outline', activeIcon: 'credit-card' },
    { name: 'ServicesTab', label: 'Services', icon: 'apps', activeIcon: 'apps' },
    { name: 'ProfileTab', label: 'Profile', icon: 'account-outline', activeIcon: 'account' },
  ],
  PARENT: [
    { name: 'HomeTab', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'AcademicsTab', label: 'Academics', icon: 'school-outline', activeIcon: 'school' },
    { name: 'FinanceTab', label: 'Fees', icon: 'credit-card-outline', activeIcon: 'credit-card' },
    { name: 'ProfileTab', label: 'Profile', icon: 'account-outline', activeIcon: 'account' },
  ],
  ACCOUNTANT: [
    { name: 'HomeTab', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'FinanceTab', label: 'Finance', icon: 'cash-multiple', activeIcon: 'cash-multiple' },
    { name: 'ServicesTab', label: 'Reports', icon: 'chart-box-outline', activeIcon: 'chart-box' },
    { name: 'ProfileTab', label: 'Profile', icon: 'account-outline', activeIcon: 'account' },
  ],
  LIBRARIAN: [
    { name: 'HomeTab', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'ServicesTab', label: 'Library', icon: 'book-open-page-variant-outline', activeIcon: 'book-open-page-variant' },
    { name: 'ProfileTab', label: 'Profile', icon: 'account-outline', activeIcon: 'account' },
  ],
  TRANSPORT_MANAGER: [
    { name: 'HomeTab', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { name: 'ServicesTab', label: 'Transport', icon: 'bus-outline', activeIcon: 'bus' },
    { name: 'ProfileTab', label: 'Profile', icon: 'account-outline', activeIcon: 'account' },
  ],
  PARTNER: [
    { name: 'HomeTab', label: 'Dashboard', icon: 'view-dashboard-outline', activeIcon: 'view-dashboard' },
    { name: 'PartnerTab', label: 'Partners', icon: 'handshake-outline', activeIcon: 'handshake' },
    { name: 'ProfileTab', label: 'Profile', icon: 'account-outline', activeIcon: 'account' },
  ],
  INVESTOR: [
    { name: 'HomeTab', label: 'Dashboard', icon: 'view-dashboard-outline', activeIcon: 'view-dashboard' },
    { name: 'InvestorTab', label: 'Overview', icon: 'chart-line', activeIcon: 'chart-line' },
    { name: 'ProfileTab', label: 'Profile', icon: 'account-outline', activeIcon: 'account' },
  ],
};

export default {
  ROLE_TAB_CONFIG,
};

// Tenants Stack for Super Admin
export type TenantsStackParamList = {
  TenantManagement: undefined;
  TenantDetail: { tenantId: string };
  TenantSetupWizard: undefined;
  DeploymentTracker: { tenantId?: string } | undefined;
  AuditLogs: { type?: 'platform' | 'tenant'; tenantId?: string } | undefined;
  PlatformAnalytics: undefined;
  PlatformSettings: undefined;
  PlatformDashboard: undefined;
};

// Partner Stack
export type PartnerStackParamList = {
  PartnerDashboard: undefined;
  LeadList: undefined;
  LeadDetail: { leadId: string };
  CommissionLedger: undefined;
  PayoutHistory: undefined;
  RegisterLead: undefined;
};

// Investor Stack
export type InvestorStackParamList = {
  InvestorDashboard: undefined;
  FinancialReports: undefined;
  GrowthMetrics: undefined;
  SchoolPerformance: undefined;
};
