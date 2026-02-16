import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    fetchLessonPlans
} from '../../store/slices/lessonPlansSlice';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Card, CardContent } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Skeleton } from '@/ui/primitives/skeleton';
import {
    Calendar,
    Plus,
    BookOpen,
    ChevronRight,
    School,
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    Loader2
} from 'lucide-react';

const LessonPlans = () => {
    const dispatch = useDispatch();
    const { plans, error, loading } = useSelector((state) => state.lessonPlans);

    useEffect(() => {
        dispatch(fetchLessonPlans());
    }, [dispatch]);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'APPROVED':
                return { color: 'success', icon: CheckCircle2, label: 'Approved' };
            case 'REJECTED':
                return { color: 'destructive', icon: XCircle, label: 'Rejected' };
            case 'SUBMITTED':
                return { color: 'warning', icon: Clock, label: 'Submitted' };
            case 'DRAFT':
                return { color: 'secondary', icon: FileText, label: 'Draft' };
            default:
                return { color: 'outline', icon: FileText, label: status };
        }
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Lesson Plans"
                    description="Plan, track, and manage your weekly teaching schedules and topics."
                    breadcrumbs={[
                        { label: 'Academics', href: '/academics' },
                        { label: 'Lesson Plans', active: true },
                    ]}
                    action={
                        <Link to="/academics/lesson-plans/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                New Plan
                            </Button>
                        </Link>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="p-0">
                                {loading && !plans.data?.length ? (
                                    <div className="p-6 space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <Skeleton className="h-12 w-12 rounded-full" />
                                                <div className="space-y-2 flex-1">
                                                    <Skeleton className="h-4 w-1/3" />
                                                    <Skeleton className="h-3 w-1/4" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : plans.data?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                        <div className="bg-primary/5 p-6 rounded-full mb-4">
                                            <BookOpen className="h-12 w-12 text-primary/40" />
                                        </div>
                                        <h3 className="text-lg font-medium text-foreground">No lesson plans found</h3>
                                        <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                                            Start creating lesson plans to organize your curriculum delivery and track progress.
                                        </p>
                                        <Link to="/academics/lesson-plans/new">
                                            <Button variant="outline">Create First Plan</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {plans.data?.map((plan) => {
                                            const statusConfig = getStatusConfig(plan.status);
                                            const StatusIcon = statusConfig.icon;

                                            return (
                                                <Link
                                                    key={plan.id}
                                                    to={`/academics/lesson-plans/${plan.id}`}
                                                    className="block hover:bg-muted/40 transition-colors"
                                                >
                                                    <div className="p-5 flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                                <Calendar className="h-6 w-6" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="font-semibold text-foreground truncate">
                                                                    {plan.subject_name}
                                                                </h4>
                                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-sm text-muted-foreground">
                                                                    <span className="flex items-center gap-1">
                                                                        <School className="w-3.5 h-3.5" />
                                                                        {plan.section_name}
                                                                    </span>
                                                                    <span className="text-border">•</span>
                                                                    <span>
                                                                        {new Date(plan.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                        {' - '}
                                                                        {new Date(plan.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                    </span>
                                                                    <span className="text-border">•</span>
                                                                    <span>{plan.items?.length || 0} Topics</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 shrink-0">
                                                            <Badge variant={statusConfig.color} className="gap-1.5 hidden sm:flex">
                                                                <StatusIcon className="w-3.5 h-3.5" />
                                                                {statusConfig.label}
                                                            </Badge>
                                                            <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-primary" />
                                        Syllabus Tracker
                                    </h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Keep track of your curriculum progress across all subjects and sections.
                                </p>
                                <Link to="/academics/syllabus-coverage">
                                    <Button className="w-full" variant="outline">
                                        View Full Coverage
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Quick Stats or Tips could go here */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Active Plans</span>
                                        <span className="font-medium">{plans.data?.filter(p => p.status === 'APPROVED').length || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Drafts</span>
                                        <span className="font-medium">{plans.data?.filter(p => p.status === 'DRAFT').length || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">This Week</span>
                                        <span className="font-medium text-primary">
                                            {plans.data?.filter(p => {
                                                const now = new Date();
                                                const start = new Date(p.start_date);
                                                const end = new Date(p.end_date);
                                                return now >= start && now <= end;
                                            }).length || 0}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default LessonPlans;
