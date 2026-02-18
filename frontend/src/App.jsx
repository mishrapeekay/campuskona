import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import { FeatureGate, ErrorBoundary } from './components/common';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Dashboard
import DashboardPage from './pages/Dashboard/DashboardPage';
import PrincipalDashboard from './pages/Admin/PrincipalDashboard';

// Student Pages
import { StudentList, StudentDetail, StudentForm, BulkUpload, OnboardingWizard } from './pages/Students';
import OnboardingVerification from './pages/Admissions/OnboardingVerification';
import MyProfile from './pages/Student/MyProfile';
import MyGrades from './pages/Student/MyGrades';
import MyFees from './pages/Student/MyFees';
import MyLibrary from './pages/Student/MyLibrary';
import OnboardingReview from './pages/Parent/OnboardingReview';
import AssignmentTracker from './pages/Student/AssignmentTracker';
import AchievementsLocker from './pages/Student/AchievementsLocker';
import StudentAttendance from './pages/Student/StudentAttendance';

// Attendance Pages
import { MarkAttendance, LeaveManagement, AttendanceReports } from './pages/Attendance';

// Staff Pages
import { StaffList, StaffDetail, StaffForm, StaffBulkUpload } from './pages/Staff';

// Academics Pages
import { AcademicsOverview, AcademicYearsList, AcademicYearForm, ClassesList, ClassForm, SubjectsList, SubjectForm } from './pages/Academics';
import LessonPlans from './pages/Academics/LessonPlans';
import LessonPlanForm from './pages/Academics/LessonPlanForm';
import SyllabusCoverage from './pages/Academics/SyllabusCoverage';
import HouseDashboard from './pages/Teacher/HouseDashboard';
import ClubDashboard from './pages/Teacher/ClubDashboard';

// Timetable Pages
import { TimetableView, TimetableManagement, TimetableGenerator } from './pages/Timetable';

// Examinations Pages
import { MarkEntry, ResultsView, ReportCards, ExamScheduler, QuestionBank } from './pages/Examinations';

// Assignments Pages
import { AssignmentsList, AssignmentForm, AssignmentDetail } from './pages/Assignments';

// Finance Pages
import { FeeCollection, ExpenseManagement, FeeCategoryManager, FeeStructureManager, FinanceDashboard } from './pages/Finance';

// Communication Pages
import { NoticeBoard, SchoolCalendar } from './pages/Communication';

// Transport Pages
import { RouteManager, TransportAllocation } from './pages/Transport';
// Note: TransportDashboard and LibraryDashboard are now in 'pages/Dashboard'
import TransportDashboard from './pages/Dashboard/TransportDashboard';

// Library Pages
import { BookCatalog, IssueReturn } from './pages/Library';
import LibraryDashboard from './pages/Dashboard/LibraryDashboard';

// Admissions Pages
import { AdmissionsDashboard, ApplicationList, ApplicationForm, EnquiryList, EnquiryForm } from './pages/Admissions';

// Hostel Pages
import { HostelDashboard, RoomList, RoomAllocation } from './pages/Hostel';

// HR & Payroll Pages
import { HRDashboard, DepartmentList, PayrollList, PayrollRunForm, PayrollRunPayslipsList, PayslipView } from './pages/HRPayroll';

// Reports Pages
import { ReportsDashboard, ReportBuilder, GeneratedReportList } from './pages/Reports';

// Workflow Pages
import ApprovalHub from './pages/Workflows/ApprovalHub';
import WorkflowDetail from './pages/Workflows/WorkflowDetail';

// Front Desk
import FrontDeskDashboard from './pages/Dashboard/FrontDeskDashboard';

// Admin - DPDP Compliance
import AuditLogsDashboard from './pages/Admin/AuditLogs/AuditLogsDashboard';

// Parent Portal - DPDP Compliance
import { ParentDashboard, ConsentManagement, DataRights, GrievancePortal } from './pages/Parent';
import FeeLedger from './pages/Finance/FeeLedger';

// Compliance Pages
import DPDPDashboard from './pages/Compliance/DPDPDashboard';

// Partner Pages
import PartnerDashboard from './pages/Partners/PartnerDashboard';
import LeadsList from './pages/Partners/LeadsList';
import CommissionLedger from './pages/Partners/CommissionLedger';
import PayoutHistory from './pages/Partners/PayoutHistory';

// Analytics Pages
import InvestorDashboard from './pages/Analytics/InvestorDashboard';
import GrowthMetrics from './pages/Analytics/GrowthMetrics';

// Settings Page
import SettingsPage from './pages/Common/SettingsPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Authentication bypass disabled - proper login required for tenant switching
  const bypassAuth = false;

  if (!isAuthenticated && !bypassAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <ToastContainer />
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Main app routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/principal/dashboard" element={<ProtectedRoute><PrincipalDashboard /></ProtectedRoute>} />

          {/* Students Routes */}
          <Route path="/students" element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
          <Route path="/students/new" element={<ProtectedRoute><StudentForm /></ProtectedRoute>} />
          <Route path="/students/onboarding" element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />
          <Route path="/students/bulk-upload" element={<ProtectedRoute><BulkUpload /></ProtectedRoute>} />
          <Route path="/students/:id" element={<ProtectedRoute><StudentDetail /></ProtectedRoute>} />
          <Route path="/students/:id/edit" element={<ProtectedRoute><StudentForm /></ProtectedRoute>} />

          {/* Attendance Routes */}
          <Route path="/attendance/mark" element={<ProtectedRoute><MarkAttendance /></ProtectedRoute>} />
          <Route path="/attendance/reports" element={<ProtectedRoute><AttendanceReports /></ProtectedRoute>} />
          <Route path="/attendance/leaves" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />

          {/* Staff Routes */}
          <Route path="/staff" element={<ProtectedRoute><StaffList /></ProtectedRoute>} />
          <Route path="/staff/new" element={<ProtectedRoute><StaffForm /></ProtectedRoute>} />
          <Route path="/staff/bulk-upload" element={<ProtectedRoute><StaffBulkUpload /></ProtectedRoute>} />
          <Route path="/staff/departments" element={<ProtectedRoute><DepartmentList /></ProtectedRoute>} />
          <Route path="/staff/:id" element={<ProtectedRoute><StaffDetail /></ProtectedRoute>} />
          <Route path="/staff/:id/edit" element={<ProtectedRoute><StaffForm /></ProtectedRoute>} />

          {/* Academics Routes */}
          <Route path="/academics" element={<ProtectedRoute><AcademicsOverview /></ProtectedRoute>} />
          <Route path="/academics/years" element={<ProtectedRoute><AcademicYearsList /></ProtectedRoute>} />
          <Route path="/academics/years/new" element={<ProtectedRoute><AcademicYearForm /></ProtectedRoute>} />
          <Route path="/academics/years/:id/edit" element={<ProtectedRoute><AcademicYearForm /></ProtectedRoute>} />
          <Route path="/academics/classes" element={<ProtectedRoute><ClassesList /></ProtectedRoute>} />
          <Route path="/academics/classes/new" element={<ProtectedRoute><ClassForm /></ProtectedRoute>} />
          <Route path="/academics/classes/:id/edit" element={<ProtectedRoute><ClassForm /></ProtectedRoute>} />
          <Route path="/academics/subjects" element={<ProtectedRoute><SubjectsList /></ProtectedRoute>} />
          <Route path="/academics/subjects/new" element={<ProtectedRoute><SubjectForm /></ProtectedRoute>} />
          <Route path="/academics/subjects/:id/edit" element={<ProtectedRoute><SubjectForm /></ProtectedRoute>} />
          <Route path="/academics/lesson-plans" element={<ProtectedRoute><LessonPlans /></ProtectedRoute>} />
          <Route path="/academics/lesson-plans/new" element={<ProtectedRoute><LessonPlanForm /></ProtectedRoute>} />
          <Route path="/academics/lesson-plans/:id" element={<ProtectedRoute><LessonPlanForm /></ProtectedRoute>} />
          <Route path="/academics/syllabus-coverage" element={<ProtectedRoute><SyllabusCoverage /></ProtectedRoute>} />
          <Route path="/teacher/houses" element={<ProtectedRoute><HouseDashboard /></ProtectedRoute>} />
          <Route path="/teacher/clubs" element={<ProtectedRoute><ClubDashboard /></ProtectedRoute>} />

          {/* Timetable Routes */}
          <Route path="/timetable/view" element={<ProtectedRoute><TimetableView /></ProtectedRoute>} />
          <Route path="/timetable/manage" element={<ProtectedRoute><TimetableManagement /></ProtectedRoute>} />
          <Route path="/timetable/generator" element={<ProtectedRoute><FeatureGate feature="ai_timetable_generator" showUpgrade><TimetableGenerator /></FeatureGate></ProtectedRoute>} />

          {/* Examinations Routes */}
          <Route path="/examinations/mark-entry" element={<ProtectedRoute><MarkEntry /></ProtectedRoute>} />
          <Route path="/examinations/results" element={<ProtectedRoute><ResultsView /></ProtectedRoute>} />
          <Route path="/examinations/report-cards" element={<ProtectedRoute><ReportCards /></ProtectedRoute>} />
          <Route path="/examinations/question-bank" element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
          <Route path="/examinations/ai-scheduler" element={<ProtectedRoute><FeatureGate feature="ai_exam_scheduler" showUpgrade><ExamScheduler /></FeatureGate></ProtectedRoute>} />

          {/* Assignments Routes */}
          <Route path="/assignments" element={<ProtectedRoute><AssignmentsList /></ProtectedRoute>} />
          <Route path="/assignments/new" element={<ProtectedRoute><AssignmentForm /></ProtectedRoute>} />
          <Route path="/assignments/:id" element={<ProtectedRoute><AssignmentDetail /></ProtectedRoute>} />
          <Route path="/assignments/:id/edit" element={<ProtectedRoute><AssignmentForm /></ProtectedRoute>} />

          {/* Finance Routes */}
          <Route path="/finance/fee-collection" element={<ProtectedRoute><FeeCollection /></ProtectedRoute>} />
          <Route path="/finance/expenses" element={<ProtectedRoute><ExpenseManagement /></ProtectedRoute>} />
          <Route path="/finance/categories" element={<ProtectedRoute><FeeCategoryManager /></ProtectedRoute>} />
          <Route path="/finance/structures" element={<ProtectedRoute><FeeStructureManager /></ProtectedRoute>} />
          <Route path="/finance/dashboard" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />

          {/* Communication Routes */}
          <Route path="/communication/notices" element={<ProtectedRoute><NoticeBoard /></ProtectedRoute>} />
          <Route path="/communication/events" element={<ProtectedRoute><SchoolCalendar /></ProtectedRoute>} />

          {/* Transport Routes */}
          <Route path="/transport/dashboard" element={<ProtectedRoute><TransportDashboard /></ProtectedRoute>} />
          <Route path="/transport/routes" element={<ProtectedRoute><RouteManager /></ProtectedRoute>} />
          <Route path="/transport/allocation" element={<ProtectedRoute><TransportAllocation /></ProtectedRoute>} />

          {/* Library Routes */}
          <Route path="/library/dashboard" element={<ProtectedRoute><LibraryDashboard /></ProtectedRoute>} />
          <Route path="/library/catalog" element={<ProtectedRoute><BookCatalog /></ProtectedRoute>} />
          <Route path="/library/issue-return" element={<ProtectedRoute><IssueReturn /></ProtectedRoute>} />

          {/* Admissions Routes */}
          <Route path="/admissions" element={<ProtectedRoute><AdmissionsDashboard /></ProtectedRoute>} />
          <Route path="/admissions/applications" element={<ProtectedRoute><ApplicationList /></ProtectedRoute>} />
          <Route path="/admissions/applications/new" element={<ProtectedRoute><ApplicationForm /></ProtectedRoute>} />
          <Route path="/admissions/applications/:id" element={<ProtectedRoute><ApplicationForm /></ProtectedRoute>} />
          <Route path="/admissions/applications/:id/edit" element={<ProtectedRoute><ApplicationForm /></ProtectedRoute>} />
          <Route path="/admissions/enquiries" element={<ProtectedRoute><EnquiryList /></ProtectedRoute>} />
          <Route path="/admissions/enquiries/new" element={<ProtectedRoute><EnquiryForm /></ProtectedRoute>} />
          <Route path="/admissions/onboarding-verification" element={<ProtectedRoute><OnboardingVerification /></ProtectedRoute>} />

          {/* Hostel Routes */}
          <Route path="/hostel" element={<ProtectedRoute><HostelDashboard /></ProtectedRoute>} />
          <Route path="/hostel/rooms" element={<ProtectedRoute><RoomList /></ProtectedRoute>} />
          <Route path="/hostel/allocations" element={<ProtectedRoute><RoomAllocation /></ProtectedRoute>} />

          {/* HR & Payroll Routes */}
          <Route path="/hr" element={<ProtectedRoute><HRDashboard /></ProtectedRoute>} />
          <Route path="/hr/departments" element={<ProtectedRoute><DepartmentList /></ProtectedRoute>} />
          <Route path="/hr/payroll" element={<ProtectedRoute><PayrollList /></ProtectedRoute>} />
          <Route path="/hr/payroll/new" element={<ProtectedRoute><PayrollRunForm /></ProtectedRoute>} />
          <Route path="/hr/payroll/:id/payslips" element={<ProtectedRoute><PayrollRunPayslipsList /></ProtectedRoute>} />
          <Route path="/hr/payslips/:id" element={<ProtectedRoute><PayslipView /></ProtectedRoute>} />

          {/* Reports Routes */}
          <Route path="/reports" element={<ProtectedRoute><ReportsDashboard /></ProtectedRoute>} />
          <Route path="/reports/builder" element={<ProtectedRoute><ReportBuilder /></ProtectedRoute>} />
          <Route path="/reports/generated" element={<ProtectedRoute><GeneratedReportList /></ProtectedRoute>} />

          {/* Workflow Routes */}
          <Route path="/workflows" element={<ProtectedRoute><ApprovalHub /></ProtectedRoute>} />
          <Route path="/workflows/:id" element={<ProtectedRoute><WorkflowDetail /></ProtectedRoute>} />

          {/* Front Desk */}
          <Route path="/front-desk" element={<ProtectedRoute><FrontDeskDashboard /></ProtectedRoute>} />

          {/* Admin - DPDP Compliance Routes */}
          <Route path="/admin/audit-logs" element={<ProtectedRoute><AuditLogsDashboard /></ProtectedRoute>} />
          <Route path="/compliance/dashboard" element={<ProtectedRoute><DPDPDashboard /></ProtectedRoute>} />

          {/* Student Portal Routes */}
          <Route path="/student/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          <Route path="/student/grades" element={<ProtectedRoute><MyGrades /></ProtectedRoute>} />
          <Route path="/student/fees" element={<ProtectedRoute><MyFees /></ProtectedRoute>} />
          <Route path="/student/library" element={<ProtectedRoute><MyLibrary /></ProtectedRoute>} />
          <Route path="/student/assignments" element={<ProtectedRoute><AssignmentTracker /></ProtectedRoute>} />
          <Route path="/student/achievements" element={<ProtectedRoute><AchievementsLocker /></ProtectedRoute>} />
          <Route path="/student/attendance" element={<ProtectedRoute><StudentAttendance /></ProtectedRoute>} />

          {/* Parent Portal Routes */}
          <Route path="/parent/dashboard" element={<ProtectedRoute><FeatureGate feature="parent_portal" showUpgrade><ParentDashboard /></FeatureGate></ProtectedRoute>} />
          <Route path="/parent/grades" element={<ProtectedRoute><MyGrades /></ProtectedRoute>} />
          <Route path="/parent/fees" element={<ProtectedRoute><MyFees /></ProtectedRoute>} />
          <Route path="/parent/fees/ledger" element={<ProtectedRoute><FeeLedger /></ProtectedRoute>} />
          <Route path="/parent/consent" element={<ProtectedRoute><ConsentManagement /></ProtectedRoute>} />
          <Route path="/parent/data-rights" element={<ProtectedRoute><DataRights /></ProtectedRoute>} />
          <Route path="/parent/grievances" element={<ProtectedRoute><GrievancePortal /></ProtectedRoute>} />
          <Route path="/parent/review" element={<ProtectedRoute><OnboardingReview /></ProtectedRoute>} />
          <Route path="/parent/assignments" element={<ProtectedRoute><AssignmentTracker /></ProtectedRoute>} />
          <Route path="/parent/timetable" element={<ProtectedRoute><TimetableView /></ProtectedRoute>} />

          {/* Partner Portal Routes */}
          <Route path="/partner/dashboard" element={<ProtectedRoute><PartnerDashboard /></ProtectedRoute>} />
          <Route path="/partner/leads" element={<ProtectedRoute><LeadsList /></ProtectedRoute>} />
          <Route path="/partner/commissions" element={<ProtectedRoute><CommissionLedger /></ProtectedRoute>} />
          <Route path="/partner/payouts" element={<ProtectedRoute><PayoutHistory /></ProtectedRoute>} />

          {/* Analytics / Investor Routes */}
          <Route path="/analytics/investor" element={<ProtectedRoute><InvestorDashboard /></ProtectedRoute>} />
          <Route path="/analytics/growth" element={<ProtectedRoute><GrowthMetrics /></ProtectedRoute>} />

          {/* Settings Route */}
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
