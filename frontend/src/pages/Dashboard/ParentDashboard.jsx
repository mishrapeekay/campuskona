import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    IndianRupee,
    Calendar,
    GraduationCap,
    BookOpen,
    Clock,
    MessageCircle,
    Bell,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    FileText,
    Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { Skeleton } from '@/ui/primitives/skeleton';
import { Button } from '@/ui/primitives/button';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { fetchParentDashboard } from '../../store/slices/parentPortalSlice';

const ParentDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { dashboard, loading } = useSelector((state) => state.parentPortal);
    const [selectedChildId, setSelectedChildId] = useState(null);

    useEffect(() => {
        dispatch(fetchParentDashboard());
    }, [dispatch]);

    useEffect(() => {
        if (dashboard.data?.children?.length > 0 && !selectedChildId) {
            setSelectedChildId(dashboard.data.children[0].student_id);
        }
    }, [dashboard.data, selectedChildId]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading && !dashboard.data) {
        return (
            <div className="space-y-6 p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 rounded-xl" />
                        <Skeleton className="h-48 rounded-xl" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-32 rounded-xl" />
                        <Skeleton className="h-64 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!dashboard.data || dashboard.data.children?.length === 0) {
        return (
            <AnimatedPage>
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
                    <div className="bg-muted p-6 rounded-full mb-6">
                        <GraduationCap className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">No Linked Students</h2>
                    <p className="text-muted-foreground max-w-md mt-2 mb-8">
                        We couldn't find any students linked to your account. Please contact the school administration to verify your profile linking.
                    </p>
                    <Button onClick={() => navigate('/settings')}>Contact Support</Button>
                </div>
            </AnimatedPage>
        );
    }

    const currentChild = dashboard.data.children.find(c => c.student_id === selectedChildId) || dashboard.data.children[0];
    const { notices, events } = dashboard.data;
    const stats = [
        {
            label: 'Attendance',
            value: `${currentChild.attendance?.attendance_percentage || 0}%`,
            sub: 'This Month',
            icon: Calendar,
            accent: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
        },
        {
            label: 'Fees Due',
            value: currentChild.fee_summary?.outstanding > 0 ? `₹${currentChild.fee_summary.outstanding}` : 'Paid',
            sub: currentChild.fee_summary?.outstanding > 0 ? 'Due Now' : 'All Clear',
            icon: IndianRupee,
            accent: currentChild.fee_summary?.outstanding > 0
                ? 'text-destructive bg-destructive/10'
                : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
        },
        {
            label: 'Assignments',
            value: '3',
            sub: 'Pending',
            icon: FileText,
            accent: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
        },
        {
            label: 'GPA',
            value: currentChild.recent_exam_results?.[0]?.grade || '--',
            sub: 'Last Exam',
            icon: GraduationCap,
            accent: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400'
        },
    ];

    return (
        <AnimatedPage>
            <div className="space-y-8 p-6 max-w-7xl mx-auto pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {getGreeting()}, {user?.first_name}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Here is what's happening with <span className="font-semibold text-foreground">{currentChild.name}</span> today.
                        </p>
                    </div>

                    {/* Child Switcher */}
                    {dashboard.data.children.length > 1 && (
                        <div className="flex bg-muted p-1 rounded-full">
                            {dashboard.data.children.map(child => (
                                <button
                                    key={child.student_id}
                                    onClick={() => setSelectedChildId(child.student_id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedChildId === child.student_id
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${selectedChildId === child.student_id ? 'bg-primary' : 'bg-transparent'}`} />
                                    {child.name.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Summary Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {stats.map((stat) => (
                                <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-4 flex flex-col items-center text-center">
                                        <div className={`p-3 rounded-full mb-3 ${stat.accent}`}>
                                            <stat.icon className="h-5 w-5" />
                                        </div>
                                        <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">{stat.label}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Today's Schedule Card */}
                        <Card className="overflow-hidden border-l-4 border-l-primary/50">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Today's Schedule</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="font-normal">
                                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border">
                                    {/* Mock Schedule Data - Replace with real data when available */}
                                    {[
                                        { time: '09:00 AM', subject: 'Mathematics', room: 'Room 101', status: 'completed' },
                                        { time: '10:00 AM', subject: 'Physics', room: 'Lab 2', status: 'current' },
                                        { time: '11:15 AM', subject: 'English Literature', room: 'Room 104', status: 'upcoming' },
                                        { time: '12:15 PM', subject: 'Computer Science', room: 'Lab 1', status: 'upcoming' },
                                    ].map((classItem, idx) => (
                                        <div key={idx} className={`flex items-center p-4 gap-4 ${classItem.status === 'current' ? 'bg-primary/5' : ''}`}>
                                            <div className="w-20 text-xs font-medium text-muted-foreground text-right shrink-0">
                                                {classItem.time}
                                            </div>
                                            <div className="w-1 rounded-full h-10 bg-border relative">
                                                {classItem.status === 'completed' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />}
                                                {classItem.status === 'current' && <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background animate-pulse" />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`font-semibold text-sm ${classItem.status === 'current' ? 'text-primary' : 'text-foreground'}`}>
                                                    {classItem.subject}
                                                </h4>
                                                <p className="text-xs text-muted-foreground">{classItem.room}</p>
                                            </div>
                                            {classItem.status === 'current' && <Badge>Now</Badge>}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 bg-muted/30 text-center border-t border-border">
                                    <Button variant="link" size="sm" onClick={() => navigate('/parent/timetable')} className="text-xs font-semibold text-primary hover:underline">View Full Timetable</Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Teacher Note */}
                        {currentChild.latest_note && (
                            <div className="flex gap-4 p-5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20">
                                <div className="shrink-0">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                                        <MessageCircle className="h-6 w-6" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">Note from {currentChild.latest_note.teacher_name}</h3>
                                    <p className="text-amber-800 dark:text-amber-300 text-sm mt-1 leading-relaxed">"{currentChild.latest_note.content}"</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 font-medium">Shared on {new Date(currentChild.latest_note.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        )}

                        {/* Homework / Assignments */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Pending Homework</CardTitle>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => navigate('/parent/assignments')}>
                                        View All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 p-1.5 rounded bg-primary/10 text-primary">
                                                <BookOpen className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm group-hover:text-primary transition-colors">Complete Chapter 5 Exercises</p>
                                                <p className="text-xs text-muted-foreground">Mathematics • Due Tomorrow</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Quick Access</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Pay Fees', icon: IndianRupee, href: '/parent/fees', color: 'text-emerald-600' },
                                    { label: 'Report Card', icon: FileText, href: '/parent/grades', color: 'text-blue-600' },
                                    { label: 'Leaves', icon: Calendar, href: '/parent/leaves', color: 'text-orange-600' },
                                    { label: 'Consent', icon: Shield, href: '/parent/consent', color: 'text-violet-600' },
                                ].map((action) => (
                                    <button
                                        key={action.label}
                                        onClick={() => navigate(action.href)}
                                        className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all gap-2 text-center"
                                    >
                                        <action.icon className={`h-6 w-6 ${action.color}`} />
                                        <span className="text-xs font-semibold text-foreground">{action.label}</span>
                                    </button>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Recent Notices */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base">School Circulars</CardTitle>
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => navigate('/communication/notices')}>
                                    View All
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {notices?.slice(0, 3).map(n => (
                                    <div key={n.id} className="flex gap-3 group cursor-pointer" onClick={() => navigate('/communication/notices')}>
                                        <div className="mt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
                                                {n.title}
                                            </h5>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {n.content}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-1 opacity-70">
                                                {new Date(n.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default ParentDashboard;
