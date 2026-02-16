import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { logout } from '../../store/slices/authSlice';
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
    BellIcon,
    UserCircleIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    ShieldCheckIcon,
    ClipboardDocumentListIcon,
    BuildingOfficeIcon,
    BanknotesIcon,
    PresentationChartBarIcon,
    CurrencyRupeeIcon,
    TrophyIcon,
    BoltIcon
} from '@heroicons/react/24/outline';
import { Breadcrumbs } from '../common';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { toggleSidebar } from '../../store/slices/uiSlice';
import NotificationCenter from './NotificationCenter';
import TenantSelector from '../TenantSelector';

const MainLayout = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isSidebarOpen = useSelector((state) => state.ui.sidebar.isOpen);
    const { user, tenantFeatures } = useSelector((state) => state.auth);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({});

    // Map navigation names to translation keys
    const getNavTranslation = (name) => {
        const keyMap = {
            'Dashboard': 'nav.dashboard',
            'Students': 'nav.students',
            'Staff': 'nav.staff',
            'Academics': 'nav.academics',
            'Attendance': 'nav.attendance',
            'Timetable': 'nav.timetable',
            'Assignments': 'nav.assignments',
            'Examinations': 'nav.examinations',
            'Finance': 'nav.finance',
            'Communication': 'nav.communication',
            'Transport': 'nav.transport',
            'Library': 'nav.library',
            'Admissions': 'nav.admissions',
            'Hostel': 'nav.hostel',
            'HR & Payroll': 'nav.hrPayroll',
            'Reports': 'nav.reports',
            'DPDP Compliance': 'nav.compliance',
            'Approvals': 'nav.approvals',
            'Settings': 'nav.settings',
            'My Profile': 'nav.profile',
            'My Grades': 'nav.nav_grades', // Fixed mapping
            'Achievements': 'nav.achievements',
            'My Fees': 'nav.nav_fees',
            'Notices': 'nav.notices',
            'Fees & Payments': 'nav.finance',
            'Report Cards': 'nav.examinations',
            'Privacy & Consent': 'nav.compliance',
            'Marks Entry': 'nav.examinations',
            'Culture & Houses': 'nav.culture',
            'Compliance': 'nav.compliance',
            'Leads': 'nav.leads',
            'Commissions': 'nav.commissions',
            'Payout History': 'nav.payouts',
            'School Health Score': 'nav.analytics',
            'Analytics': 'nav.analytics',
            'Tenants': 'nav.tenants',
            'Overview': 'nav.overview',
            'Academic Years': 'nav.academic_years',
            'Classes': 'nav.classes',
            'Subjects': 'nav.subjects',
            'Lesson Plans': 'nav.lesson_plans',
            'Syllabus Coverage': 'nav.syllabus',
            'Mark Attendance': 'nav.mark_attendance',
            'Leave Management': 'nav.leave_mgmt',
            'View Timetable': 'nav.view_timetable',
            'Manage Timetable': 'nav.manage_timetable',
            'AI Generator': 'nav.ai_generator',
            'All Assignments': 'nav.all_assignments',
            'Create Assignment': 'nav.create_assignment',
            'Mark Entry': 'nav.mark_entry',
            'Results': 'nav.results',
            'Fee Collection': 'nav.fee_collection',
            'Fee Categories': 'nav.fee_categories',
            'Fee Structures': 'nav.fee_structures',
            'Expenses': 'nav.expenses',
            'Notice Board': 'nav.notices',
            'Events': 'nav.events',
            'Route Management': 'nav.routes',
            'Allocation': 'nav.allocation',
            'Book Catalog': 'nav.catalog',
            'Issue & Return': 'nav.issue_return',
            'Applications': 'nav.applications',
            'Enquiries': 'nav.enquiries',
            'Onboarding Verifications': 'nav.onboarding',
            'Rooms': 'nav.rooms',
            'Allocations': 'nav.allocations',
            'Departments': 'nav.departments',
            'Payroll': 'nav.payroll',
            'Build Report': 'nav.build_report',
            'Generated': 'nav.generated_reports',
            'Compliance Hub': 'nav.compliance_hub',
            'Audit Logs': 'nav.audit_logs',
            'Pay Online': 'nav.pay_online',
            'Fee Ledger': 'nav.fee_ledger',
            'Consent Management': 'nav.consent_mgmt',
            'Data Rights': 'nav.data_rights',
            'Onboarding Review': 'nav.onboarding_review',
            'Grievances': 'nav.grievances',
            'House Championship': 'nav.houses',
            'Activities & Clubs': 'nav.clubs',
            'Investor Dashboard': 'nav.investor_dashboard',
            'Growth Metrics': 'nav.growth',
        };
        return t(keyMap[name] || name);
    };

    const adminNavigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        {
            name: 'Students',
            href: '/students',
            icon: UsersIcon
        },
        {
            name: 'Staff',
            href: '/staff',
            icon: UserGroupIcon
        },
        {
            name: 'Academics',
            href: '/academics',
            icon: AcademicCapIcon,
            subItems: [
                { name: 'Overview', href: '/academics' },
                { name: 'Academic Years', href: '/academics/years' },
                { name: 'Classes', href: '/academics/classes' },
                { name: 'Subjects', href: '/academics/subjects' },
                { name: 'Lesson Plans', href: '/academics/lesson-plans' },
                { name: 'Syllabus Coverage', href: '/academics/syllabus-coverage' },
            ]
        },
        {
            name: 'Attendance',
            href: '/attendance/mark',
            icon: CalendarIcon,
            subItems: [
                { name: 'Mark Attendance', href: '/attendance/mark' },
                { name: 'Reports', href: '/attendance/reports' },
                { name: 'Leave Management', href: '/attendance/leaves' },
            ]
        },
        {
            name: 'Timetable',
            href: '/timetable/view',
            icon: DocumentTextIcon,
            subItems: [
                { name: 'View Timetable', href: '/timetable/view' },
                { name: 'Manage Timetable', href: '/timetable/manage' },
                { name: 'AI Generator', href: '/timetable/generator', feature: 'ai_timetable_generator' },
            ]
        },
        {
            name: 'Assignments',
            href: '/assignments',
            icon: ClipboardDocumentListIcon,
            subItems: [
                { name: 'All Assignments', href: '/assignments' },
                { name: 'Create Assignment', href: '/assignments/new' },
            ]
        },
        {
            name: 'Examinations',
            href: '/examinations/mark-entry',
            icon: AcademicCapIcon,
            subItems: [
                { name: 'Mark Entry', href: '/examinations/mark-entry' },
                { name: 'Results', href: '/examinations/results' },
            ]
        },
        {
            name: 'Finance',
            href: '/finance/dashboard',
            icon: ChartBarIcon,
            subItems: [
                { name: 'Dashboard', href: '/finance/dashboard' },
                { name: 'Fee Collection', href: '/finance/fee-collection' },
                { name: 'Fee Categories', href: '/finance/categories' },
                { name: 'Fee Structures', href: '/finance/structures' },
                { name: 'Expenses', href: '/finance/expenses' },
            ]
        },
        {
            name: 'Communication',
            href: '/communication/notices',
            icon: MegaphoneIcon,
            subItems: [
                { name: 'Notice Board', href: '/communication/notices' },
                { name: 'Events', href: '/communication/events' },
            ]
        },
        {
            name: 'Transport',
            href: '/transport/dashboard',
            icon: TruckIcon,
            feature: 'transport_management',
            subItems: [
                { name: 'Dashboard', href: '/transport/dashboard' },
                { name: 'Route Management', href: '/transport/routes' },
                { name: 'Allocation', href: '/transport/allocation' },
            ]
        },
        {
            name: 'Library',
            href: '/library/dashboard',
            icon: BookOpenIcon,
            feature: 'library_management',
            subItems: [
                { name: 'Dashboard', href: '/library/dashboard' },
                { name: 'Book Catalog', href: '/library/catalog' },
                { name: 'Issue & Return', href: '/library/issue-return' },
            ]
        },
        {
            name: 'Admissions',
            href: '/admissions',
            icon: ClipboardDocumentListIcon,
            subItems: [
                { name: 'Dashboard', href: '/admissions' },
                { name: 'Applications', href: '/admissions/applications' },
                { name: 'Enquiries', href: '/admissions/enquiries' },
                { name: 'Onboarding Verifications', href: '/admissions/onboarding-verification' },
            ]
        },
        {
            name: 'Hostel',
            href: '/hostel',
            icon: BuildingOfficeIcon,
            feature: 'hostel_management',
            subItems: [
                { name: 'Dashboard', href: '/hostel' },
                { name: 'Rooms', href: '/hostel/rooms' },
                { name: 'Allocations', href: '/hostel/allocations' },
            ]
        },
        {
            name: 'HR & Payroll',
            href: '/hr',
            icon: BanknotesIcon,
            feature: 'hr_payroll',
            subItems: [
                { name: 'Dashboard', href: '/hr' },
                { name: 'Departments', href: '/hr/departments' },
                { name: 'Payroll', href: '/hr/payroll' },
            ]
        },
        {
            name: 'Reports',
            href: '/reports',
            icon: PresentationChartBarIcon,
            subItems: [
                { name: 'Dashboard', href: '/reports' },
                { name: 'Build Report', href: '/reports/builder' },
                { name: 'Generated', href: '/reports/generated' },
            ]
        },
        {
            name: 'DPDP Compliance',
            href: '/compliance/dashboard',
            icon: ShieldCheckIcon,
            subItems: [
                { name: 'Compliance Hub', href: '/compliance/dashboard' },
                { name: 'Audit Logs', href: '/admin/audit-logs' },
            ]
        },
        {
            name: 'Approvals',
            href: '/workflows',
            icon: ClipboardDocumentListIcon
        },
        { name: 'Settings', href: '/settings', icon: CogIcon },
    ];

    const studentNavigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'My Profile', href: '/student/profile', icon: UserCircleIcon },
        { name: 'My Grades', href: '/student/grades', icon: AcademicCapIcon },
        { name: 'Assignments', href: '/student/assignments', icon: ClipboardDocumentListIcon },
        { name: 'Achievements', href: '/student/achievements', icon: TrophyIcon },
        { name: 'My Fees', href: '/student/fees', icon: ChartBarIcon },
        { name: 'Timetable', href: '/timetable/view', icon: DocumentTextIcon },
        { name: 'Library', href: '/student/library', icon: BookOpenIcon },
        { name: 'Notices', href: '/communication/notices', icon: MegaphoneIcon },
    ];

    const parentNavigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        {
            name: 'Fees & Payments',
            href: '/parent/fees',
            icon: CurrencyRupeeIcon,
            subItems: [
                { name: 'Pay Online', href: '/parent/fees' },
                { name: 'Fee Ledger', href: '/parent/fees/ledger' },
            ]
        },
        { name: 'Report Cards', href: '/parent/grades', icon: AcademicCapIcon },
        {
            name: 'Privacy & Consent',
            href: '/parent/consent',
            icon: ShieldCheckIcon,
            subItems: [
                { name: 'Consent Management', href: '/parent/consent' },
                { name: 'Data Rights', href: '/parent/data-rights' },
                { name: 'Onboarding Review', href: '/parent/review' },
                { name: 'Grievances', href: '/parent/grievances' },
            ]
        },
        { name: 'Notices', href: '/communication/notices', icon: MegaphoneIcon },
    ];

    const teacherNavigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Attendance', href: '/attendance/mark', icon: UsersIcon },
        { name: 'Assignments', href: '/assignments', icon: ClipboardDocumentListIcon },
        { name: 'Marks Entry', href: '/examinations/mark-entry', icon: AcademicCapIcon },
        {
            name: 'Academics',
            href: '/academics/lesson-plans',
            icon: AcademicCapIcon,
            subItems: [
                { name: 'Lesson Plans', href: '/academics/lesson-plans' },
                { name: 'Syllabus Coverage', href: '/academics/syllabus-coverage' },
            ]
        },
        { name: 'Timetable', href: '/timetable/view', icon: CalendarIcon },
        { name: 'Notices', href: '/communication/notices', icon: MegaphoneIcon },
        {
            name: 'Culture & Houses',
            href: '/teacher/houses',
            icon: TrophyIcon,
            subItems: [
                { name: 'House Championship', href: '/teacher/houses' },
                { name: 'Activities & Clubs', href: '/teacher/clubs' },
            ]
        },
        {
            name: 'Compliance',
            href: '/compliance/dashboard',
            icon: ShieldCheckIcon,
            subItems: [
                { name: 'Compliance Hub', href: '/compliance/dashboard' },
            ]
        },
    ];

    const partnerNavigation = [
        { name: 'Dashboard', href: '/partner/dashboard', icon: HomeIcon },
        { name: 'Leads', href: '/partner/leads', icon: UserGroupIcon },
        { name: 'Commissions', href: '/partner/commissions', icon: CurrencyRupeeIcon },
        { name: 'Payout History', href: '/partner/payouts', icon: BanknotesIcon },
    ];

    const superAdminNavigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'School Health Score', href: '/principal/dashboard', icon: BoltIcon },
        {
            name: 'Analytics',
            href: '/analytics/investor',
            icon: ChartBarIcon,
            subItems: [
                { name: 'Investor Dashboard', href: '/analytics/investor' },
                { name: 'Growth Metrics', href: '/analytics/growth' },
            ]
        },
        { name: 'Tenants', href: '/tenants', icon: BuildingOfficeIcon },
        { name: 'Settings', href: '/settings', icon: CogIcon },
    ];

    // Helper: check if a feature is enabled (items without a feature prop are always visible)
    const isFeatureEnabled = (featureCode) => {
        if (!featureCode) return true;
        if (!tenantFeatures) return true; // If features not loaded yet, show everything
        return tenantFeatures[featureCode] ?? true;
    };

    // Filter navigation items by feature flags
    const filterByFeatures = (items) => {
        return items
            .filter((item) => isFeatureEnabled(item.feature))
            .map((item) => {
                if (item.subItems) {
                    return {
                        ...item,
                        subItems: item.subItems.filter((sub) => isFeatureEnabled(sub.feature)),
                    };
                }
                return item;
            });
    };

    let baseNavigation = adminNavigation;
    if (user?.user_type === 'STUDENT') {
        baseNavigation = studentNavigation;
    } else if (user?.user_type === 'PARENT') {
        baseNavigation = parentNavigation;
    } else if (user?.user_type === 'TEACHER') {
        baseNavigation = teacherNavigation;
    } else if (user?.user_type === 'PARTNER') {
        baseNavigation = partnerNavigation;
    } else if (user?.user_type === 'SUPER_ADMIN') {
        baseNavigation = superAdminNavigation;
    }

    const navigation = filterByFeatures(baseNavigation);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div
                className={`flex flex-col fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <Link to="/dashboard" className="flex items-center space-x-2">
                        <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">SchoolMS</span>
                    </Link>
                    <button
                        onClick={() => dispatch(toggleSidebar())}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        const isExpanded = expandedMenus[item.name] !== undefined
                            ? expandedMenus[item.name]
                            : active;

                        const toggleMenu = () => {
                            setExpandedMenus(prev => ({
                                ...prev,
                                [item.name]: !isExpanded
                            }));
                        };

                        if (item.subItems) {
                            return (
                                <div key={item.name}>
                                    <button
                                        onClick={toggleMenu}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${active
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <Icon className={`h-5 w-5 mr-3 ${active ? 'text-blue-700' : 'text-gray-400'}`} />
                                            {getNavTranslation(item.name)}
                                        </div>
                                        <svg
                                            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {isExpanded && (
                                        <div className="mt-1 ml-8 space-y-1">
                                            {item.subItems.map((subItem) => (
                                                <Link
                                                    key={subItem.name}
                                                    to={subItem.href}
                                                    className={`block px-4 py-2 text-sm rounded-lg transition-colors ${location.pathname === subItem.href
                                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                >
                                                    {getNavTranslation(subItem.name)}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${active
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 mr-3 ${active ? 'text-blue-700' : 'text-gray-400'}`} />
                                {getNavTranslation(item.name)}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                                </div>
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{user?.user_type}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sign out"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64'}`}>
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => dispatch(toggleSidebar())}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>

                        {/* Tenant Selector */}
                        <div className="hidden lg:block">
                            <TenantSelector />
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-2xl mx-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search students, staff, classes..."
                                    className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Right side icons */}
                        <div className="flex items-center space-x-4">
                            {/* Language Switcher */}
                            <LanguageSwitcher />

                            {/* Notifications */}
                            <NotificationCenter />

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                                >
                                    <UserCircleIcon className="h-8 w-8" />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Your Profile
                                        </Link>
                                        <Link
                                            to="/settings"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            <div className="flex items-center">
                                                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                                                Sign out
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <Breadcrumbs />
                    <Outlet />
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => dispatch(toggleSidebar())}
                ></div>
            )}
        </div>
    );
};

export default MainLayout;
