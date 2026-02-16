import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    CalendarRange,
    BookOpen,
    GraduationCap,
    Users,
    Plus,
    School,
    BookMarked,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';
import {
    fetchAcademicStats,
    fetchAcademicYears,
} from '../../store/slices/academicsSlice';

const AcademicsOverview = () => {
    const dispatch = useDispatch();
    const { stats, academicYears, loading } = useSelector((state) => state.academics);

    useEffect(() => {
        dispatch(fetchAcademicStats());
        dispatch(fetchAcademicYears());
    }, [dispatch]);

    const currentYear = academicYears.find((year) => year.is_current);

    const statsData = [
        {
            name: 'Academic Years',
            value: stats?.total_years || 0,
            icon: CalendarRange,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-500/10',
            link: '/academics/years',
        },
        {
            name: 'Total Classes',
            value: stats?.total_classes || 0,
            icon: School,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            link: '/academics/classes',
        },
        {
            name: 'Total Subjects',
            value: stats?.total_subjects || 0,
            icon: BookOpen,
            color: 'text-violet-600 dark:text-violet-400',
            bgColor: 'bg-violet-500/10',
            link: '/academics/subjects',
        },
        {
            name: 'Total Sections',
            value: stats?.total_sections || 0,
            icon: Users,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-500/10',
            link: '/academics/sections',
        },
    ];

    const quickActions = [
        {
            name: 'Add Academic Year',
            description: 'Create a new academic year period',
            href: '/academics/years/new',
            icon: Calendar,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-500/10',
        },
        {
            name: 'Add Class',
            description: 'Create a new class level',
            href: '/academics/classes/new',
            icon: School,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-500/10',
        },
        {
            name: 'Add Subject',
            description: 'Define a new subject',
            href: '/academics/subjects/new',
            icon: BookMarked,
            color: 'text-violet-600 dark:text-violet-400',
            bgColor: 'bg-violet-500/10',
        },
        {
            name: 'Manage Boards',
            description: 'Configure education boards',
            href: '/academics/boards',
            icon: GraduationCap,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-500/10',
        },
    ];

    if (loading && !stats) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-48 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                    <Skeleton className="h-64 w-full" />
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Academics"
                    description="Manage academic structure and curriculum"
                />

                {/* Current Academic Year */}
                <Card className="border-l-4 border-l-primary shadow-sm bg-gradient-to-r from-background to-primary/5">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <CalendarRange className="w-10 h-10 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Academic Year</h3>
                                {currentYear ? (
                                    <>
                                        <p className="mt-1 text-3xl font-bold text-foreground">{currentYear.name}</p>
                                        <p className="mt-1 text-sm text-muted-foreground font-medium flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {new Date(currentYear.start_date).toLocaleDateString()} -{' '}
                                            {new Date(currentYear.end_date).toLocaleDateString()}
                                        </p>
                                    </>
                                ) : (
                                    <p className="mt-1 text-xl font-semibold text-muted-foreground italic">No Active Year Set</p>
                                )}
                            </div>
                        </div>
                        {currentYear && (
                            <Link to={`/academics/years/${currentYear.id}/edit`}>
                                <Button>
                                    Edit Details
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statsData.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Link key={stat.name} to={stat.link}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                                            <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                                        </div>
                                        <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                            <Icon className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Frequently used academic management tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link
                                        key={action.name}
                                        to={action.href}
                                        className="group relative flex flex-col items-center p-6 text-center rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                                    >
                                        <div className={`p-4 rounded-full mb-4 ${action.bgColor} group-hover:scale-110 transition-transform`}>
                                            <Icon className={`w-6 h-6 ${action.color}`} />
                                        </div>
                                        <h3 className="text-sm font-semibold text-foreground">{action.name}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Academic Years */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Academic Years</CardTitle>
                            <CardDescription>Recent academic periods</CardDescription>
                        </div>
                        <Link to="/academics/years">
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {academicYears.slice(0, 5).map((year) => (
                                <div
                                    key={year.id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <CalendarRange className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-foreground">{year.name}</p>
                                                {year.is_current && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(year.start_date).toLocaleDateString()} -{' '}
                                                {new Date(year.end_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Link to={`/academics/years/${year.id}/edit`}>
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </Link>
                                </div>
                            ))}
                            {academicYears.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CalendarRange className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">No academic years found</p>
                                    <Link to="/academics/years/new" className="mt-4 inline-block">
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Academic Year
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AnimatedPage>
    );
};

export default AcademicsOverview;
