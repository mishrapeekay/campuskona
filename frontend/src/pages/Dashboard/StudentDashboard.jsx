import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    Calendar,
    BookOpen,
    IndianRupee,
    Clock,
    Megaphone,
    FileText,
    BarChart3,
    Trophy,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    PlayCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { Skeleton } from '@/ui/primitives/skeleton';
import { Button } from '@/ui/primitives/button';
import { Progress } from '@/ui/primitives/progress';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { fetchNotices, fetchEvents } from '../../store/slices/communicationSlice';
import { getClassTimetable } from '../../api/timetable';

const StudentDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { notices, loading } = useSelector((state) => state.communication);

    const [timetable, setTimetable] = useState([]);
    const [timetableLoading, setTimetableLoading] = useState(true);

    // Mock Stats - Replace with real data from a studentStatsSlice
    const [studentStats] = useState({
        attendance_percent: 92,
        pending_assignments: 4,
        library_books: 1,
        fees_due: 0,
        house_points: 120
    });

    const [upcomingExams] = useState([
        { id: 1, subject: 'Mathematics', date: '2024-02-15', time: '10:00 AM', days_remaining: 5 },
        { id: 2, subject: 'Physics', date: '2024-02-18', time: '10:00 AM', days_remaining: 8 },
    ]);

    useEffect(() => {
        dispatch(fetchNotices());
        const fetchTT = async () => {
            try {
                const res = await getClassTimetable({});
                setTimetable(res.data?.results || res.data || []);
            } catch (err) {
                console.error('Failed to fetch timetable:', err);
            } finally {
                setTimetableLoading(false);
            }
        };
        fetchTT();
    }, [dispatch]);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const todaySchedule = timetable
        .filter(e => e.day_of_week === today || e.day === today)
        .sort((a, b) => (a.start_time || a.time_slot?.start_time || '').localeCompare(b.start_time || b.time_slot?.start_time || ''));

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const isCurrentPeriod = (entry) => {
        const s = entry.start_time || entry.time_slot?.start_time;
        const e = entry.end_time || entry.time_slot?.end_time;
        return s && e && currentTime >= s && currentTime <= e;
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading && timetableLoading) {
        return (
            <div className="space-y-6 p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-64 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        );
    }

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
                            Ready for another productive day? Here is your overview.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium bg-muted px-3 py-1.5 rounded-full">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/student/attendance')}>
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Attendance</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-bold text-foreground">{studentStats.attendance_percent}%</span>
                                    <span className={`text-xs font-semibold ${studentStats.attendance_percent >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {studentStats.attendance_percent >= 90 ? 'Excellent' : 'Average'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-full dark:bg-emerald-900/20 dark:text-emerald-400">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/student/assignments')}>
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Assignments</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-bold text-foreground">{studentStats.pending_assignments}</span>
                                    <span className="text-xs font-semibold text-amber-500">Pending</span>
                                </div>
                            </div>
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                                <FileText className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/student/achievements')}>
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">House Points</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-bold text-foreground">{studentStats.house_points}</span>
                                    <span className="text-xs font-semibold text-violet-500">Rising Star</span>
                                </div>
                            </div>
                            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-full dark:bg-violet-900/20 dark:text-violet-400">
                                <Trophy className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/student/fees')}>
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Fees Due</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-bold text-foreground">
                                        {studentStats.fees_due > 0 ? `₹${studentStats.fees_due}` : 'Paid'}
                                    </span>
                                    <span className={`text-xs font-semibold ${studentStats.fees_due > 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                                        {studentStats.fees_due > 0 ? 'Action Reqd' : 'All Clear'}
                                    </span>
                                </div>
                            </div>
                            <div className={`p-2.5 rounded-full ${studentStats.fees_due > 0 ? 'bg-destructive/10 text-destructive' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>
                                <IndianRupee className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Timeline & Assignments) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Today's Schedule */}
                        <Card className="overflow-hidden border-l-4 border-l-primary/50">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Today's Schedule</CardTitle>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => navigate('/timetable/view')}>
                                        View Full
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {timetableLoading ? (
                                    <div className="p-4 space-y-3">
                                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-md" />)}
                                    </div>
                                ) : todaySchedule.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="bg-muted p-3 rounded-full mb-3">
                                            <Calendar className="h-6 w-6 text-muted-foreground/50" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground">No classes scheduled</p>
                                        <p className="text-xs text-muted-foreground mt-1">Enjoy your free day!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {todaySchedule.slice(0, 5).map((entry, idx) => {
                                            const isCurrent = isCurrentPeriod(entry);
                                            return (
                                                <div key={idx} className={`flex items-center p-4 gap-4 ${isCurrent ? 'bg-primary/5 relative overflow-hidden' : 'hover:bg-muted/20 transition-colors'}`}>
                                                    {isCurrent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                                                    <div className="w-16 text-center shrink-0">
                                                        <p className="text-sm font-bold text-foreground">{entry.start_time || entry.time_slot?.start_time}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase">{entry.end_time || entry.time_slot?.end_time}</p>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                                                                {entry.subject?.name || entry.subject_name || 'Subject'}
                                                            </h4>
                                                            {isCurrent && (
                                                                <Badge variant="default" className="h-4 px-1.5 text-[10px]">Now</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                            <span>{entry.teacher?.name || entry.teacher_name || 'Teacher'}</span>
                                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                                            <span>{entry.room?.name || entry.room || 'Room'}</span>
                                                        </p>
                                                    </div>
                                                    {isCurrent && (
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-primary">
                                                            <PlayCircle className="h-5 w-5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Assignments Progress */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">My Assignments</CardTitle>
                                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate('/student/assignments')}>
                                        View All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-5">
                                {[
                                    { title: 'Physics Project', due: 'Tomorrow', progress: 75, color: 'bg-emerald-500' },
                                    { title: 'History Essay', due: 'Feb 15', progress: 30, color: 'bg-blue-500' },
                                    { title: 'Math Worksheet', due: 'Feb 12', progress: 0, color: 'bg-gray-300' },
                                ].map((task, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between items-end mb-1.5">
                                            <div>
                                                <p className="font-medium text-sm group-hover:text-primary transition-colors">{task.title}</p>
                                                <p className="text-xs text-muted-foreground">Due: {task.due}</p>
                                            </div>
                                            <span className="text-xs font-semibold">{task.progress}%</span>
                                        </div>
                                        <Progress value={task.progress} className="h-2" indicatorClassName={task.color} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Column (Exams, Notices, Quick Links) */}
                    <div className="space-y-6">

                        {/* Upcoming Exams */}
                        <Card className="border-l-4 border-l-destructive/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                    Upcoming Exams
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {upcomingExams.map(exam => (
                                    <div key={exam.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="shrink-0 w-12 text-center bg-destructive/10 rounded p-1">
                                            <div className="text-[10px] font-bold text-destructive uppercase">
                                                {new Date(exam.date).toLocaleString('default', { month: 'short' })}
                                            </div>
                                            <div className="text-lg font-bold text-foreground">
                                                {new Date(exam.date).getDate()}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{exam.subject}</p>
                                            <p className="text-xs text-muted-foreground">{exam.time}</p>
                                        </div>
                                        <Badge variant={exam.days_remaining <= 5 ? 'destructive' : 'secondary'} className="ml-auto text-[10px]">
                                            {exam.days_remaining}d Left
                                        </Badge>
                                    </div>
                                ))}
                                {upcomingExams.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-2">No exams scheduled.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Notices */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-base">Notice Board</CardTitle>
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => navigate('/communication/notices')}>
                                    View All
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {notices.data?.slice(0, 3).map(n => (
                                    <div key={n.id} className="flex gap-3 cursor-pointer group" onClick={() => navigate('/communication/notices')}>
                                        <Megaphone className="h-4 w-4 text-muted-foreground mt-0.5 group-hover:text-primary transition-colors" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
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

                        {/* Quick Links */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Library', icon: BookOpen, href: '/student/library', color: 'text-orange-500' },
                                { label: 'Grades', icon: BarChart3, href: '/student/grades', color: 'text-blue-500' },
                                { label: 'Profile', icon: GraduationCap, href: '/student/profile', color: 'text-violet-500' },
                                { label: 'Awards', icon: Trophy, href: '/student/achievements', color: 'text-amber-500' },
                            ].map(link => (
                                <button
                                    key={link.label}
                                    onClick={() => navigate(link.href)}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-card border hover:border-primary/50 hover:bg-accent/50 transition-all gap-1.5"
                                >
                                    <link.icon className={`h-5 w-5 ${link.color}`} />
                                    <span className="text-xs font-semibold text-foreground">{link.label}</span>
                                </button>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default StudentDashboard;
