import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    AcademicCapIcon,
    ClockIcon,
    UserGroupIcon,
    CalendarIcon,
    MegaphoneIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    FireIcon,
    StarIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { Skeleton } from '@/ui/primitives/skeleton';
import { StatsCard } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { fetchNotices, fetchEvents } from '../../store/slices/communicationSlice';
import { fetchDashboardStats } from '../../store/slices/staffSlice';
import { getMyTimetable } from '../../api/timetable';

const TeacherDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { notices, events, loading: commLoading } = useSelector((state) => state.communication);
    const { statistics: teacherStats, loading: statsLoading } = useSelector((state) => state.staff);

    const [timetable, setTimetable] = useState([]);
    const [timetableLoading, setTimetableLoading] = useState(true);

    useEffect(() => {
        dispatch(fetchNotices());
        dispatch(fetchEvents());
        dispatch(fetchDashboardStats());
        const fetchTT = async () => {
            try {
                const res = await getMyTimetable();
                setTimetable(res.data || []);
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

    const sd = teacherStats || { total_students: 0, attendance_marked: false, today_classes_count: todaySchedule.length, assigned_class: null };

    const stats = [
        { name: "Today's Classes", value: sd.today_classes_count?.toString() || todaySchedule.length.toString(), trendVal: 'View Timetable', trend: 'neutral', icon: ClockIcon, onClick: () => navigate('/timetable/view') },
        { name: 'My Students', value: sd.total_students?.toString() || '0', trendVal: sd.assigned_class || 'View Students', trend: 'neutral', icon: UserGroupIcon, onClick: () => navigate('/students') },
        { name: 'Attendance', value: sd.attendance_marked ? 'Done' : 'Pending', trendVal: sd.attendance_marked ? 'All marked' : 'Mark Now', trend: sd.attendance_marked ? 'up' : 'down', icon: sd.attendance_marked ? CheckCircleIcon : ExclamationTriangleIcon, onClick: () => navigate('/attendance/mark') },
        { name: 'Notices', value: notices.data?.filter(n => !n.is_read).length?.toString() || '0', trendVal: 'View All', trend: 'neutral', icon: MegaphoneIcon, onClick: () => navigate('/communication/notices') },
    ];

    const loadingState = commLoading || statsLoading;

    if (loadingState && timetableLoading) {
        return (
            <AnimatedPage>
                <div className="space-y-6 p-6">
                    <Skeleton className="h-8 w-64" />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6 p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.first_name} {user?.last_name}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Teacher Dashboard {sd.assigned_class && `| Class Teacher: ${sd.assigned_class}`}
                        </p>
                    </div>
                    <p className="hidden sm:block text-sm text-muted-foreground">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map(s => (
                        <div key={s.name} onClick={s.onClick} className="cursor-pointer">
                            <StatsCard title={s.name} value={s.value} icon={s.icon} trend={s.trend} trendValue={s.trendVal} />
                        </div>
                    ))}
                </div>

                {/* Trust & Badges */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Profile & Trust</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center py-4">
                                <div className="relative">
                                    <svg className="h-24 w-24">
                                        <circle className="text-muted" strokeWidth="6" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                                        <circle className="text-primary" strokeWidth="6" strokeDasharray={251.2} strokeDashoffset={251.2 * 0.15} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground">85%</span>
                                </div>
                                <h3 className="mt-3 font-bold text-foreground">Profile Verified</h3>
                                <p className="text-xs text-muted-foreground mt-1">Add certifications to reach 100%</p>
                                <div className="mt-4 w-full">
                                    <div className="flex items-center justify-between rounded-lg bg-amber-500/10 p-2.5">
                                        <div className="flex items-center gap-2">
                                            <FireIcon className="h-4 w-4 text-amber-500" />
                                            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">12 Days Streak</span>
                                        </div>
                                        <Badge variant="warning" className="text-[10px]">EXCELLENT</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader><CardTitle className="text-sm">Badges & Recognition</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { name: 'Punctual', icon: ClockIcon, cls: 'text-blue-500 bg-blue-500/10', desc: '100% Attendance' },
                                    { name: 'Lead Mentor', icon: UserGroupIcon, cls: 'text-violet-500 bg-violet-500/10', desc: 'Curriculum Guidance' },
                                    { name: 'Subject Expert', icon: AcademicCapIcon, cls: 'text-emerald-500 bg-emerald-500/10', desc: 'Math HOD Choice' },
                                    { name: 'Star Contributor', icon: StarIcon, cls: 'text-amber-500 bg-amber-500/10', desc: 'Active in Workflows' },
                                ].map((b, i) => (
                                    <div key={i} className="flex flex-col items-center text-center rounded-xl border p-3 hover:bg-accent transition-colors">
                                        <div className={`rounded-full p-2.5 ${b.cls} mb-2`}><b.icon className="h-5 w-5" /></div>
                                        <p className="text-xs font-bold text-foreground">{b.name}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{b.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <span className="text-sm font-medium text-foreground">Level 4 Educator</span>
                                <button className="text-xs text-primary font-bold hover:underline">Portfolio →</button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Today's Schedule */}
                    <Card>
                        <CardHeader><CardTitle>Today's Schedule</CardTitle></CardHeader>
                        <CardContent>
                            {timetableLoading ? (
                                <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
                            ) : todaySchedule.length === 0 ? (
                                <div className="text-center py-8">
                                    <ClockIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">No classes today.</p>
                                    <button onClick={() => navigate('/timetable/view')} className="mt-2 text-xs text-primary hover:underline">View full timetable</button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {todaySchedule.map((entry, idx) => {
                                        const isCurrent = isCurrentPeriod(entry);
                                        return (
                                            <div key={entry.id || idx} className={`flex items-center gap-3 rounded-lg border p-3 ${isCurrent ? 'border-primary bg-primary/5' : 'bg-muted/30'}`}>
                                                <div className="shrink-0 w-16 text-center">
                                                    <div className={`text-sm font-semibold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>{entry.start_time || entry.time_slot?.start_time || '-'}</div>
                                                    <div className="text-xs text-muted-foreground">{entry.end_time || entry.time_slot?.end_time || '-'}</div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : 'text-foreground'}`}>{entry.subject?.name || entry.subject_name || 'Subject'}</p>
                                                        {isCurrent && <Badge className="text-[10px]">Now</Badge>}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {entry.section?.class_info?.name || entry.class_name || 'Class'}
                                                        {entry.section?.name && ` - ${entry.section.name}`}
                                                        {entry.room && ` | ${entry.room.name || entry.room}`}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary" className="text-[10px]">P{entry.period || idx + 1}</Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Upcoming Events</CardTitle>
                            <button onClick={() => navigate('/communication/events')} className="text-xs text-primary hover:underline">View all</button>
                        </CardHeader>
                        <CardContent>
                            {events.data?.length === 0 ? (
                                <div className="text-center py-8">
                                    <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">No upcoming events.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {events.data?.slice(0, 5).map(ev => (
                                        <div key={ev.id} className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                                            <div className="shrink-0 w-12 text-center">
                                                <div className="text-[10px] font-bold text-destructive uppercase">{new Date(ev.start_date).toLocaleString('default', { month: 'short' })}</div>
                                                <div className="text-lg font-bold text-foreground">{new Date(ev.start_date).getDate()}</div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-foreground">{ev.title}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(ev.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            {ev.event_type && <Badge variant="secondary">{ev.event_type}</Badge>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Tasks */}
                {!sd.attendance_marked && (
                    <Card className="border-l-4 border-l-amber-500">
                        <CardHeader><CardTitle className="text-sm">Pending Tasks</CardTitle></CardHeader>
                        <CardContent>
                            <div onClick={() => navigate('/attendance/mark')} className="flex items-center gap-3 rounded-lg bg-amber-500/10 p-3 cursor-pointer hover:bg-amber-500/15 transition-colors">
                                <div className="rounded-lg bg-amber-500/20 p-2"><UserGroupIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">Mark Attendance</p>
                                    <p className="text-xs text-muted-foreground">{sd.assigned_class ? `For class ${sd.assigned_class}` : 'Mark student attendance'}</p>
                                </div>
                                <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'Enter Marks', desc: 'Update exam results', icon: AcademicCapIcon, href: '/examinations/mark-entry' },
                        { label: 'Take Attendance', desc: 'Mark student attendance', icon: UserGroupIcon, href: '/attendance/mark' },
                        { label: 'View Timetable', desc: 'See your schedule', icon: ClockIcon, href: '/timetable/view' },
                        { label: 'Notices', desc: 'View announcements', icon: MegaphoneIcon, href: '/communication/notices' },
                    ].map(a => (
                        <div key={a.label} onClick={() => navigate(a.href)} className="flex items-center gap-3 rounded-xl border bg-card p-4 cursor-pointer transition-colors hover:bg-accent">
                            <div className="shrink-0 rounded-lg bg-primary/10 p-2"><a.icon className="h-5 w-5 text-primary" /></div>
                            <div><p className="text-sm font-semibold text-foreground">{a.label}</p><p className="text-xs text-muted-foreground">{a.desc}</p></div>
                        </div>
                    ))}
                </div>

                {/* Recent Notices */}
                <Card>
                    <CardHeader><CardTitle>Recent Notices</CardTitle></CardHeader>
                    <CardContent>
                        {notices.data?.length === 0 ? (
                            <p className="text-center py-4 text-sm text-muted-foreground">No recent notices.</p>
                        ) : (
                            <div className="space-y-2">
                                {notices.data?.slice(0, 3).map(n => (
                                    <div key={n.id} onClick={() => navigate('/communication/notices')} className="flex items-start gap-3 rounded-lg bg-muted/30 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground">{n.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.content}</p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AnimatedPage>
    );
};

export default TeacherDashboard;
