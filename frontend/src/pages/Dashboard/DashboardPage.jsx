import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    UsersIcon,
    UserGroupIcon,
    AcademicCapIcon,
    CalendarIcon,
    MegaphoneIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Skeleton } from '@/ui/primitives/skeleton';
import { StatsCard } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { fetchStudentStats } from '../../store/slices/studentsSlice';
import { fetchStaffStats } from '../../store/slices/staffSlice';
import { fetchNotices, fetchEvents } from '../../store/slices/communicationSlice';
import StudentDashboard from './StudentDashboard';
import ParentDashboard from './ParentDashboard';
import TeacherDashboard from './TeacherDashboard';
import LibraryDashboard from './LibraryDashboard';
import TransportDashboard from './TransportDashboard';
import EnhancedAdminDashboard from './EnhancedAdminDashboard';
import SuperAdminDashboard from '../SuperAdmin/Dashboard';
import PartnerDashboard from '../Partners/PartnerDashboard';
import FinanceAdminDashboard from './FinanceAdminDashboard';
import AcademicAdminDashboard from './AcademicAdminDashboard';

const DashboardPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { stats: studentStats, loading: studentsLoading } = useSelector((state) => state.students);
    const { stats: staffStats, loading: staffLoading } = useSelector((state) => state.staff);
    const { notices, events } = useSelector((state) => state.communication);

    useEffect(() => {
        const specialRoles = ['STUDENT', 'PARENT', 'TEACHER', 'LIBRARIAN', 'TRANSPORT_MANAGER', 'SUPER_ADMIN', 'PARTNER'];
        if (!specialRoles.includes(user?.user_type)) {
            dispatch(fetchStudentStats());
            dispatch(fetchStaffStats());
        }
        dispatch(fetchNotices());
        dispatch(fetchEvents());
    }, [dispatch, user]);

    // Role-based Dashboard Routing
    if (user?.user_type === 'SUPER_ADMIN') return <SuperAdminDashboard />;
    if (user?.user_type === 'STUDENT') return <StudentDashboard />;
    if (user?.user_type === 'PARENT') return <ParentDashboard />;
    if (user?.user_type === 'TEACHER') return <TeacherDashboard />;
    if (user?.user_type === 'LIBRARIAN') return <LibraryDashboard />;
    if (user?.user_type === 'TRANSPORT_MANAGER') return <TransportDashboard />;
    if (user?.user_type === 'PARTNER') return <PartnerDashboard />;
    if (user?.user_type === 'ACCOUNTANT') return <FinanceAdminDashboard />;
    if (user?.user_type === 'PRINCIPAL') return <AcademicAdminDashboard />;
    if (user?.user_type === 'SCHOOL_ADMIN') return <EnhancedAdminDashboard />;

    // Legacy simple dashboard (fallback)
    const stats = [
        { name: t('dashboard.totalStudents', 'Total Students'), value: studentStats?.total || 0, change: '+12%', changeType: 'increase', icon: <UsersIcon className="h-5 w-5" />, link: '/students' },
        { name: t('dashboard.totalTeachers', 'Total Staff'), value: staffStats?.total || 0, change: '+5%', changeType: 'increase', icon: <UserGroupIcon className="h-5 w-5" />, link: '/staff' },
        { name: t('nav.classes', 'Active Classes'), value: 24, change: '+2', changeType: 'increase', icon: <AcademicCapIcon className="h-5 w-5" />, link: '/academics/classes' },
        { name: t('dashboard.todayAttendance', 'Attendance Today'), value: '92%', change: '-3%', changeType: 'decrease', icon: <CalendarIcon className="h-5 w-5" />, link: '/attendance' },
    ];

    const quickActions = [
        { name: t('students.addStudent', 'Add Student'), description: t('students.addStudentDesc', 'Register a new student'), href: '/students/new', icon: UsersIcon },
        { name: t('staff.addStaff', 'Add Staff'), description: t('staff.addStaffDesc', 'Add new staff member'), href: '/staff/new', icon: UserGroupIcon },
        { name: t('nav.mark_attendance', 'Mark Attendance'), description: t('attendance.markAttendanceDesc', 'Take class attendance'), href: '/attendance', icon: CalendarIcon },
        { name: t('nav.reports', 'View Reports'), description: t('reports.viewReportsDesc', 'Generate reports'), href: '/reports', icon: AcademicCapIcon },
    ];

    if (studentsLoading || staffLoading) {
        return (
            <AnimatedPage>
                <div className="space-y-6 p-6">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-32 rounded-xl" />
                        ))}
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {t('dashboard.welcome', 'Welcome back')}, {user?.first_name || 'Admin'}!
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('dashboard.overview_desc', "Here's what's happening with your school today.")}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Link key={stat.name} to={stat.link}>
                            <StatsCard
                                title={stat.name}
                                value={stat.value}
                                icon={stat.icon}
                                trend={stat.changeType === 'increase' ? 'up' : 'down'}
                                trendValue={stat.change}
                            />
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {quickActions.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <Link
                                            key={action.name}
                                            to={action.href}
                                            className="flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
                                        >
                                            <div className="shrink-0 rounded-lg bg-primary/10 p-2.5">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground">{action.name}</p>
                                                <p className="text-xs text-muted-foreground">{action.description}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Notices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {notices.data?.slice(0, 5).map((notice) => (
                                    <div key={notice.id} className="flex items-start gap-3">
                                        <div className="shrink-0 mt-0.5 rounded-full bg-primary/10 p-1.5">
                                            <MegaphoneIcon className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground">{notice.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{notice.content}</p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {new Date(notice.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                                {(!notices.data || notices.data.length === 0) && (
                                    <p className="text-sm text-muted-foreground text-center py-4">No recent notices</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Upcoming Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {events.data?.slice(0, 6).map((event) => (
                                    <div key={event.id} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                                        <div className="shrink-0 rounded-lg border bg-card p-2 text-center min-w-[52px]">
                                            <div className="text-[10px] font-bold text-destructive uppercase">
                                                {new Date(event.start_date).toLocaleString('default', { month: 'short' })}
                                            </div>
                                            <div className="text-lg font-bold text-foreground">
                                                {new Date(event.start_date).getDate()}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {(!events.data || events.data.length === 0) && (
                                    <div className="col-span-full text-center py-4 text-sm text-muted-foreground">No upcoming events</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default DashboardPage;
