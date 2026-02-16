import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchTemplatesByModule,
    fetchReportStats,
    fetchSavedReports,
    selectTemplatesByModule,
    selectReportStats,
    selectSavedReports,
    selectReportLoading,
} from '../../store/slices/reportsSlice';
import {
    ChartBar,
    CheckCircle,
    Clock,
    Bookmark,
    FileText,
    Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Skeleton } from '@/ui/primitives/skeleton';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';

const MODULE_ICONS = {
    STUDENTS: FileText,
    ACADEMICS: FileText,
    ATTENDANCE: FileText,
    FEE: FileText,
    EXAM: FileText,
    LIBRARY: FileText,
    TRANSPORT: FileText,
    HOSTEL: FileText,
    HR_PAYROLL: FileText,
    ADMISSIONS: FileText,
    CUSTOM: FileText,
};

const ReportsDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const templatesByModule = useSelector(selectTemplatesByModule);
    const stats = useSelector(selectReportStats);
    const savedReports = useSelector(selectSavedReports);
    const loading = useSelector(selectReportLoading);

    useEffect(() => {
        dispatch(fetchTemplatesByModule());
        dispatch(fetchReportStats());
        dispatch(fetchSavedReports());
    }, [dispatch]);

    if (loading && !stats) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    const statsCards = [
        { title: 'Total Reports', value: stats?.total || 0, icon: ChartBar, color: 'primary' },
        { title: 'Completed', value: stats?.by_status?.COMPLETED || 0, icon: CheckCircle, color: 'emerald' },
        { title: 'Pending', value: stats?.by_status?.PENDING || 0, icon: Clock, color: 'amber' },
        { title: 'Saved Reports', value: savedReports?.length || 0, icon: Bookmark, color: 'violet' },
    ];

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Reports & Analytics"
                    description="Generate, schedule, and manage school reports"
                    action={
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => navigate('/reports/generated')}>
                                View Reports
                            </Button>
                            <Button onClick={() => navigate('/reports/builder')}>
                                Build Report
                            </Button>
                        </div>
                    }
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsCards.map((card, idx) => {
                        const Icon = card.icon;
                        const colorClasses = {
                            primary: 'bg-primary/5 border-primary/20 text-primary',
                            emerald: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
                            amber: 'bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400',
                            violet: 'bg-violet-500/5 border-violet-500/20 text-violet-600 dark:text-violet-400',
                        };

                        return (
                            <Card key={idx} className={colorClasses[card.color]}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium opacity-80">{card.title}</p>
                                            <p className="text-2xl font-bold text-foreground">{card.value}</p>
                                        </div>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Templates by Module */}
                <Card>
                    <CardHeader>
                        <CardTitle>Report Templates by Module</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {templatesByModule ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(templatesByModule).map(([key, group]) => {
                                    const Icon = MODULE_ICONS[key] || FileText;
                                    return (
                                        <div
                                            key={key}
                                            className="border border-border rounded-lg p-4 hover:bg-muted/50 hover:shadow-md transition-all cursor-pointer"
                                            onClick={() => navigate(`/reports/builder?module=${key}`)}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                    <Icon className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground">{group.label}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {group.count} template{group.count !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                No templates available. Create your first report template.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Access: Saved Reports */}
                {savedReports && savedReports.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Saved Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {savedReports.slice(0, 5).map((report) => (
                                    <div
                                        key={report.id}
                                        className="flex justify-between items-center p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground">{report.name}</span>
                                            <Badge variant="secondary">{report.output_format}</Badge>
                                            {report.is_pinned && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => navigate(`/reports/builder?template=${report.template}`)}
                                        >
                                            Run
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AnimatedPage>
    );
};

export default ReportsDashboard;
