import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  MegaphoneIcon,
  TruckIcon,
  BookOpenIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  PresentationChartBarIcon,
  CurrencyRupeeIcon,
  TrophyIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

/**
 * Centralized navigation configuration.
 * Each item specifies which roles can see it and optional feature flags.
 * roles: ["*"] means all roles. Otherwise, list specific user_type values.
 */
export const navigationConfig = [
  {
    section: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: HomeIcon,
        roles: ["*"],
      },
    ],
  },
  {
    section: "Academics",
    items: [
      {
        name: "Students",
        href: "/students",
        icon: UsersIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL", "TEACHER", "ACCOUNTANT", "LIBRARIAN"],
      },
      {
        name: "Staff",
        href: "/staff",
        icon: UserGroupIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL"],
      },
      {
        name: "Academics",
        href: "/academics",
        icon: AcademicCapIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL", "TEACHER"],
        subItems: [
          { name: "Overview", href: "/academics" },
          { name: "Academic Years", href: "/academics/years" },
          { name: "Classes", href: "/academics/classes" },
          { name: "Subjects", href: "/academics/subjects" },
          { name: "Lesson Plans", href: "/academics/lesson-plans" },
          { name: "Syllabus Coverage", href: "/academics/syllabus-coverage" },
        ],
      },
      {
        name: "Attendance",
        href: "/attendance/mark",
        icon: CalendarIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL", "TEACHER"],
        subItems: [
          { name: "Mark Attendance", href: "/attendance/mark" },
          { name: "Reports", href: "/attendance/reports" },
          { name: "Leave Management", href: "/attendance/leaves" },
        ],
      },
      {
        name: "Timetable",
        href: "/timetable/view",
        icon: DocumentTextIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL", "TEACHER", "STUDENT"],
        subItems: [
          { name: "View Timetable", href: "/timetable/view" },
          { name: "Manage Timetable", href: "/timetable/manage", roles: ["SCHOOL_ADMIN", "PRINCIPAL"] },
          { name: "AI Generator", href: "/timetable/generator", feature: "ai_timetable_generator", roles: ["SCHOOL_ADMIN"] },
        ],
      },
      {
        name: "Assignments",
        href: "/assignments",
        icon: ClipboardDocumentListIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL", "TEACHER", "STUDENT"],
        subItems: [
          { name: "All Assignments", href: "/assignments" },
          { name: "Create Assignment", href: "/assignments/new", roles: ["SCHOOL_ADMIN", "TEACHER"] },
        ],
      },
      {
        name: "Examinations",
        href: "/examinations/mark-entry",
        icon: AcademicCapIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL", "TEACHER"],
        subItems: [
          { name: "Mark Entry", href: "/examinations/mark-entry" },
          { name: "Results", href: "/examinations/results" },
          { name: "Report Cards", href: "/examinations/report-cards" },
          { name: "Question Bank", href: "/examinations/question-bank" },
        ],
      },
    ],
  },
  {
    section: "Management",
    items: [
      {
        name: "Finance",
        href: "/finance/dashboard",
        icon: ChartBarIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL", "ACCOUNTANT"],
        subItems: [
          { name: "Dashboard", href: "/finance/dashboard" },
          { name: "Fee Collection", href: "/finance/fee-collection" },
          { name: "Fee Categories", href: "/finance/categories" },
          { name: "Fee Structures", href: "/finance/structures" },
          { name: "Expenses", href: "/finance/expenses" },
        ],
      },
      {
        name: "Admissions",
        href: "/admissions",
        icon: ClipboardDocumentListIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL"],
        subItems: [
          { name: "Dashboard", href: "/admissions" },
          { name: "Applications", href: "/admissions/applications" },
          { name: "Enquiries", href: "/admissions/enquiries" },
          { name: "Onboarding Verifications", href: "/admissions/onboarding-verification" },
        ],
      },
      {
        name: "Communication",
        href: "/communication/notices",
        icon: MegaphoneIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL", "TEACHER", "STUDENT"],
        subItems: [
          { name: "Notice Board", href: "/communication/notices" },
          { name: "Events", href: "/communication/events" },
        ],
      },
      {
        name: "Transport",
        href: "/transport/dashboard",
        icon: TruckIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL", "TRANSPORT_MANAGER"],
        feature: "transport_management",
        subItems: [
          { name: "Dashboard", href: "/transport/dashboard" },
          { name: "Route Management", href: "/transport/routes" },
          { name: "Allocation", href: "/transport/allocation" },
        ],
      },
      {
        name: "Library",
        href: "/library/dashboard",
        icon: BookOpenIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL", "LIBRARIAN"],
        feature: "library_management",
        subItems: [
          { name: "Dashboard", href: "/library/dashboard" },
          { name: "Book Catalog", href: "/library/catalog" },
          { name: "Issue & Return", href: "/library/issue-return" },
        ],
      },
      {
        name: "Hostel",
        href: "/hostel",
        icon: BuildingOfficeIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL"],
        feature: "hostel_management",
        subItems: [
          { name: "Dashboard", href: "/hostel" },
          { name: "Rooms", href: "/hostel/rooms" },
          { name: "Allocations", href: "/hostel/allocations" },
        ],
      },
      {
        name: "HR & Payroll",
        href: "/hr",
        icon: BanknotesIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL"],
        feature: "hr_payroll",
        subItems: [
          { name: "Dashboard", href: "/hr" },
          { name: "Departments", href: "/hr/departments" },
          { name: "Payroll", href: "/hr/payroll" },
        ],
      },
    ],
  },
  {
    section: "Student Portal",
    roles: ["STUDENT"],
    items: [
      { name: "My Profile", href: "/student/profile", icon: UserCircleIcon, roles: ["STUDENT"] },
      { name: "My Grades", href: "/student/grades", icon: AcademicCapIcon, roles: ["STUDENT"] },
      { name: "My Fees", href: "/student/fees", icon: ChartBarIcon, roles: ["STUDENT"] },
      { name: "Assignments", href: "/student/assignments", icon: ClipboardDocumentListIcon, roles: ["STUDENT"] },
      { name: "Achievements", href: "/student/achievements", icon: TrophyIcon, roles: ["STUDENT"] },
      { name: "Library", href: "/student/library", icon: BookOpenIcon, roles: ["STUDENT"] },
    ],
  },
  {
    section: "Parent Portal",
    roles: ["PARENT"],
    items: [
      {
        name: "Fees & Payments",
        href: "/parent/fees",
        icon: CurrencyRupeeIcon,
        roles: ["PARENT"],
        subItems: [
          { name: "Pay Online", href: "/parent/fees" },
          { name: "Fee Ledger", href: "/parent/fees/ledger" },
        ],
      },
      { name: "Report Cards", href: "/parent/grades", icon: AcademicCapIcon, roles: ["PARENT"] },
      { name: "Assignments", href: "/parent/assignments", icon: ClipboardDocumentListIcon, roles: ["PARENT"] },
      {
        name: "Privacy & Consent",
        href: "/parent/consent",
        icon: ShieldCheckIcon,
        roles: ["PARENT"],
        subItems: [
          { name: "Consent Management", href: "/parent/consent" },
          { name: "Data Rights", href: "/parent/data-rights" },
          { name: "Onboarding Review", href: "/parent/review" },
          { name: "Grievances", href: "/parent/grievances" },
        ],
      },
    ],
  },
  {
    section: "Partner Portal",
    roles: ["PARTNER"],
    items: [
      { name: "Dashboard", href: "/partner/dashboard", icon: HomeIcon, roles: ["PARTNER"] },
      { name: "Leads", href: "/partner/leads", icon: UserGroupIcon, roles: ["PARTNER"] },
      { name: "Commissions", href: "/partner/commissions", icon: CurrencyRupeeIcon, roles: ["PARTNER"] },
      { name: "Payout History", href: "/partner/payouts", icon: BanknotesIcon, roles: ["PARTNER"] },
    ],
  },
  {
    section: "Reports & Compliance",
    items: [
      {
        name: "Reports",
        href: "/reports",
        icon: PresentationChartBarIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL"],
        subItems: [
          { name: "Dashboard", href: "/reports" },
          { name: "Build Report", href: "/reports/builder" },
          { name: "Generated", href: "/reports/generated" },
        ],
      },
      {
        name: "DPDP Compliance",
        href: "/compliance/dashboard",
        icon: ShieldCheckIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL", "TEACHER"],
        subItems: [
          { name: "Compliance Hub", href: "/compliance/dashboard" },
          { name: "Audit Logs", href: "/admin/audit-logs" },
        ],
      },
      {
        name: "Approvals",
        href: "/workflows",
        icon: ClipboardDocumentListIcon,
        roles: ["SCHOOL_ADMIN", "PRINCIPAL"],
      },
    ],
  },
  {
    section: "Super Admin",
    roles: ["SUPER_ADMIN"],
    items: [
      { name: "School Health Score", href: "/principal/dashboard", icon: BoltIcon, roles: ["SUPER_ADMIN"] },
      {
        name: "Analytics",
        href: "/analytics/investor",
        icon: ChartBarIcon,
        roles: ["SUPER_ADMIN"],
        subItems: [
          { name: "Investor Dashboard", href: "/analytics/investor" },
          { name: "Growth Metrics", href: "/analytics/growth" },
        ],
      },
      { name: "Tenants", href: "/tenants", icon: BuildingOfficeIcon, roles: ["SUPER_ADMIN"] },
    ],
  },
  {
    section: "System",
    items: [
      { name: "Settings", href: "/settings", icon: CogIcon, roles: ["*"] },
    ],
  },
];

/**
 * Filter navigation for a specific user role and tenant features.
 */
export function getFilteredNavigation(userType, tenantFeatures = {}) {
  const isFeatureEnabled = (feature) => {
    if (!feature) return true;
    return tenantFeatures[feature] ?? true;
  };

  const hasRole = (roles) => {
    if (!roles || roles.includes("*")) return true;
    return roles.includes(userType);
  };

  return navigationConfig
    .filter((section) => hasRole(section.roles))
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => hasRole(item.roles) && isFeatureEnabled(item.feature))
        .map((item) => ({
          ...item,
          subItems: item.subItems
            ?.filter((sub) => hasRole(sub.roles) && isFeatureEnabled(sub.feature)),
        })),
    }))
    .filter((section) => section.items.length > 0);
}
