import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    UsersIcon,
    UserGroupIcon,
    AcademicCapIcon,
    CalendarIcon,
    MegaphoneIcon,
    ChartBarIcon,
    ClockIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Skeleton } from '@/ui/primitives/skeleton';
import { Badge } from '@/ui/primitives/badge';
import { StatsCard } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { fetchStudentStats } from '../../store/slices/studentsSlice';
import { fetchStaffStats } from '../../store/slices/staffSlice';
import { fetchNotices, fetchEvents } from '../../store/slices/communicationSlice';
import { getAttendanceSummary } from '../../api/attendance';
import ExceptionsWidget from '../../components/dashboard/ExceptionsWidget';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const EnhancedAdminDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { stats: studentStats, loading: studentsLoading } = useSelector((state) => state.students);
    const { stats: staffStats, loading: staffLoading } = useSelector((state) => state.staff);
    const { notices, events } = useSelector((state) => state.communication);

    const [attendanceData, setAttendanceData] = useState(null);
    const [attendanceLoading, setAttendanceLoading] = useState(true);

    useEffect(() => {
        dispatch(fetchStudentStats());
        dispatch(fetchStaffStats());
        dispatch(fetchNotices({ page: 1, page_size: 5 }));
        dispatch(fetchEvents({ page: 1, page_size: 6 }));

        const fetchAttendance = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const response = await getAttendanceSummary({ date: today });
                setAttendanceData(response.data);
            } catch (error) {
                console.error('Error fetching attendance:', error);
            } finally {
                setAttendanceLoading(false);
            }
        };
        fetchAttendance();
    }, [dispatch]);

    const calculateAttendancePercentage = () => {
        if (!attendanceData || !studentStats) return 0;
        const totalPresent = attendanceData.results?.reduce(
            (sum, record) => sum + (record.status === 'PRESENT' ? 1 : 0), 0
        ) || 0;
        return Math.round((totalPresent / (studentStats.total || 1)) * 100);
    };

    const studentsByGenderData = {
        labels: ['Male', 'Female', 'Other'],
        datasets: [{
            data: [studentStats?.by_gender?.male || 0, studentStats?.by_gender?.female || 0, studentStats?.by_gender?.other || 0],
            backgroundColor: ['#3B82F6', '#EC4899', '#10B981'],
            borderWidth: 0,
        }],
    };

    const studentsByCategoryData = {
        labels: ['General', 'OBC', 'SC', 'ST', 'Other'],
        datasets: [{
            label: 'Students',
            data: [studentStats?.by_category?.general || 0, studentStats?.by_category?.obc || 0, studentStats?.by_category?.sc || 0, studentStats?.by_category?.st || 0, studentStats?.by_category?.other || 0],
            backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#6B7280'],
            borderWidth: 0,
            borderRadius: 6,
        }],
    };

    const staffByDepartmentData = {
        labels: staffStats?.by_department?.map(d => d.name) || [],
        datasets: [{
            label: 'Staff',
            data: staffStats?.by_department?.map(d => d.count) || [],
            backgroundColor: '#8B5CF6',
            borderWidth: 0,
            borderRadius: 6,
        }],
    };

    const chartText = 'hsl(var(--muted-foreground))';
    const chartGrid = 'hsl(var(--border))';
    const doughnutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: chartText, padding: 16 } } } };
    const barOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0, color: chartText }, grid: { color: chartGrid } }, x: { ticks: { color: chartText }, grid: { display: false } } } };

    const stats = [
        { name: 'Total Students', value: studentStats?.total || 0, change: '+12%', type: 'up', icon: <UsersIcon className="h-5 w-5" />, link: '/students' },
        { name: 'Total Staff', value: staffStats?.total || 0, change: '+5%', type: 'up', icon: <UserGroupIcon className="h-5 w-5" />, link: '/staff' },
        { name: 'Active Classes', value: studentStats?.total_classes || 24, change: '+2', type: 'up', icon: <AcademicCapIcon className="h-5 w-5" />, link: '/academics/classes' },
        { name: 'Attendance', value: attendanceLoading ? '...' : `${calculateAttendancePercentage()}%`, change: '-3%', type: 'down', icon: <CalendarIcon className="h-5 w-5" />, link: '/attendance' },
    ];

    const quickActions = [
        { name: 'Add Student', desc: 'Register a new student', href: '/students/new', icon: UsersIcon },
        { name: 'Add Staff', desc: 'Add new staff member', href: '/staff/new', icon: UserGroupIcon },
        { name: 'Mark Attendance', desc: 'Take class attendance', href: '/attendance', icon: CalendarIcon },
        { name: 'View Reports', desc: 'Generate reports', href: '/reports', icon: ChartBarIcon },
    ];

    const activities = [
        { id: 1, title: 'New student admitted', desc: 'John Doe admitted to Grade 10-A', time: '2h ago', icon: UsersIcon, cls: 'text-blue-500 bg-blue-500/10' },
        { id: 2, title: 'Attendance marked', desc: 'Grade 9-B attendance marked', time: '3h ago', icon: CheckCircleIcon, cls: 'text-emerald-500 bg-emerald-500/10' },
        { id: 3, title: 'Exam results published', desc: 'Mid-term results for Grade 8', time: '5h ago', icon: AcademicCapIcon, cls: 'text-violet-500 bg-violet-500/10' },
        { id: 4, title: 'Fee payment received', desc: '₹25,000 received from parent', time: '6h ago', icon: ClockIcon, cls: 'text-amber-500 bg-amber-500/10' },
    ];

    if (studentsLoading || staffLoading) {
        return (
            <AnimatedPage>
                <div className="space-y-6 p-6">
                    <Skeleton className="h-8 w-72" />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.first_name || 'Admin'}!</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Here's what's happening with your school today.</p>
                    </div>
                    <p className="hidden md:block text-sm text-muted-foreground">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map(s => (
                        <Link key={s.name} to={s.link}>
                            <StatsCard title={s.name} value={s.value} icon={s.icon} trend={s.type} trendValue={s.change} />
                        </Link>
                    ))}
                </div>

                <ExceptionsWidget />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card><CardHeader><CardTitle className="text-sm">Students by Gender</CardTitle></CardHeader><CardContent><div className="h-64"><Doughnut data={studentsByGenderData} options={doughnutOpts} /></div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-sm">Students by Category</CardTitle></CardHeader><CardContent><div className="h-64"><Bar data={studentsByCategoryData} options={barOpts} /></div></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-sm">Staff by Department</CardTitle></CardHeader><CardContent><div className="h-64">{staffStats?.by_department?.length > 0 ? <Bar data={staffByDepartmentData} options={barOpts} /> : <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No department data</div>}</div></CardContent></Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {quickActions.map(a => {
                                    const Icon = a.icon;
                                    return (
                                        <Link key={a.name} to={a.href} className="flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent">
                                            <div className="shrink-0 rounded-lg bg-primary/10 p-2.5"><Icon className="h-5 w-5 text-primary" /></div>
                                            <div><p className="text-sm font-medium text-foreground">{a.name}</p><p className="text-xs text-muted-foreground">{a.desc}</p></div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {activities.map(a => (
                                    <div key={a.id} className="flex items-start gap-3">
                                        <div className={`shrink-0 rounded-lg p-2 ${a.cls}`}><a.icon className="h-4 w-4" /></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground">{a.title}</p>
                                            <p className="text-xs text-muted-foreground">{a.desc}</p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>Recent Notices</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {notices.data?.slice(0, 5).map(n => (
                                    <div key={n.id} className="flex items-start gap-3">
                                        <div className="shrink-0 mt-0.5 rounded-full bg-primary/10 p-1.5"><MegaphoneIcon className="h-3.5 w-3.5 text-primary" /></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground">{n.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{n.content}</p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</span>
                                    </div>
                                ))}
                                {(!notices.data || notices.data.length === 0) && <p className="text-sm text-muted-foreground text-center py-4">No recent notices</p>}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Upcoming Events</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {events.data?.slice(0, 5).map(e => (
                                    <div key={e.id} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                                        <div className="shrink-0 rounded-lg border bg-card p-2 text-center min-w-[52px]">
                                            <div className="text-[10px] font-bold text-destructive uppercase">{new Date(e.start_date).toLocaleString('default', { month: 'short' })}</div>
                                            <div className="text-lg font-bold text-foreground">{new Date(e.start_date).getDate()}</div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground">{e.title}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(e.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <Badge variant="secondary">{e.event_type}</Badge>
                                    </div>
                                ))}
                                {(!events.data || events.data.length === 0) && <div className="text-center py-4 text-sm text-muted-foreground">No upcoming events</div>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default EnhancedAdminDashboard;
