import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    AcademicCapIcon,
    UserGroupIcon,
    BookOpenIcon,
    ClipboardDocumentCheckIcon,
    ArrowUpRightIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';
import { StatsCard } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const AcademicAdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // Mock academic stats
        setTimeout(() => {
            setStats({
                syllabus_coverage: 68,
                avg_attendance: 94,
                exam_readiness: 82,
                teacher_attendance: 98,
                class_performance: {
                    labels: ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
                    datasets: [
                        {
                            label: 'Avg Grade %',
                            data: [78, 82, 75, 88, 72, 85],
                            backgroundColor: 'rgba(139, 92, 246, 0.6)',
                        }
                    ]
                },
                critical_alerts: [
                    { id: 1, message: 'Class 9B Syllabus for Science is 20% behind schedule', priority: 'HIGH' },
                    { id: 2, message: '5 Teachers have not submitted weekly lesson plans', priority: 'MEDIUM' },
                    { id: 3, message: 'Monthly attendance report for Section 8A pending', priority: 'LOW' }
                ]
            });
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <Skeleton className="h-9 w-28" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <StatsCard key={i} loading />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-80 lg:col-span-2 rounded-xl" />
                    <Skeleton className="h-80 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <AnimatedPage>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Academic Leadership Console</h1>
                        <p className="text-sm text-muted-foreground">Overseeing curriculum delivery and student outcomes.</p>
                    </div>
                    <Button variant="secondary" onClick={() => window.location.reload()}>
                        <ArrowPathIcon className="h-5 w-5 mr-2" />
                        Sync Data
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Syllabus Coverage"
                        value={`${stats.syllabus_coverage}%`}
                        icon={<BookOpenIcon className="h-6 w-6" />}
                        trend="up"
                        trendValue="+4%"
                    />
                    <StatsCard
                        title="Student Attendance"
                        value={`${stats.avg_attendance}%`}
                        icon={<UserGroupIcon className="h-6 w-6" />}
                        trend="neutral"
                        trendValue="Consistent"
                    />
                    <StatsCard
                        title="Exam Readiness"
                        value={`${stats.exam_readiness}%`}
                        icon={<ClipboardDocumentCheckIcon className="h-6 w-6" />}
                        trend="up"
                        trendValue="High"
                    />
                    <StatsCard
                        title="Teacher Presence"
                        value={`${stats.teacher_attendance}%`}
                        icon={<AcademicCapIcon className="h-6 w-6" />}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Class-wise Performance Average</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <Bar
                                    data={stats.class_performance}
                                    options={{
                                        maintainAspectRatio: false,
                                        scales: {
                                            x: {
                                                ticks: { color: 'hsl(var(--muted-foreground))' },
                                                grid: { color: 'hsl(var(--border))' },
                                            },
                                            y: {
                                                ticks: { color: 'hsl(var(--muted-foreground))' },
                                                grid: { color: 'hsl(var(--border))' },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900">
                        <CardHeader>
                            <CardTitle>Academic Action Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.critical_alerts.map(alert => (
                                    <div key={alert.id} className="flex items-start gap-3 p-3 bg-card rounded-xl border-l-4 border-l-amber-500">
                                        <ArrowUpRightIcon className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-foreground font-medium">{alert.message}</p>
                                            <Badge
                                                variant={alert.priority === 'HIGH' ? 'destructive' : 'warning'}
                                                className="mt-2 text-[10px]"
                                            >
                                                {alert.priority} PRIORITY
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="default" className="w-full text-sm">Open Academic Hub</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Formative Assessments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border">
                                {[
                                    { class: '10A', subject: 'Calculus', date: 'Next Tuesday', status: 'Question Paper Ready' },
                                    { class: '9B', subject: 'History', date: 'Next Wednesday', status: 'Drafting' },
                                    { class: '8C', subject: 'Physics', date: 'Next Friday', status: 'Pending Approval' }
                                ].map((exam, i) => (
                                    <div key={i} className="py-3 flex justify-between items-center text-sm">
                                        <div>
                                            <span className="font-bold text-foreground">{exam.class} - {exam.subject}</span>
                                            <p className="text-muted-foreground text-xs">{exam.date}</p>
                                        </div>
                                        <Badge variant={exam.status === 'Drafting' ? 'warning' : 'secondary'}>{exam.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Teacher Professional Development</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">MS</div>
                                        <div>
                                            <p className="font-medium">Meera Singh</p>
                                            <p className="text-xs text-muted-foreground">CBSE Workshop - Completed</p>
                                        </div>
                                    </div>
                                    <Badge variant="success">Certified</Badge>
                                </div>
                                <div className="flex items-center justify-between font-bold text-sm text-primary cursor-pointer hover:underline pt-2">
                                    View all staff development tracking &rarr;
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default AcademicAdminDashboard;
