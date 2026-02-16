import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyResults } from '../../store/slices/examinationsSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    Trophy,
    Calendar,
    FileText,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Download,
    BarChart3
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/ui/primitives/table';

const MyGrades = () => {
    const dispatch = useDispatch();
    const { data: results, loading, error } = useSelector((state) => state.examinations.results);

    useEffect(() => {
        dispatch(fetchMyResults());
    }, [dispatch]);

    // Mock data function if results are empty for visualization purposes during dev
    // In production, this would just use 'results' directly
    const displayResults = results?.length > 0 ? results : [];

    const getGradeColor = (grade) => {
        if (!grade) return 'secondary';
        const g = grade.toUpperCase();
        if (g.startsWith('A')) return 'success';
        if (g.startsWith('B')) return 'info';
        if (g.startsWith('C')) return 'warning';
        return 'destructive';
    };

    if (loading) {
        return (
            <div className="space-y-6 p-6 max-w-7xl mx-auto">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-64 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <AnimatedPage>
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
                    <div className="bg-destructive/10 p-4 rounded-full mb-4">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Unable to Load Grades</h2>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        {typeof error === 'string' ? error : 'We encountered an error while fetching your examination results. Please try again later.'}
                    </p>
                    <Button variant="outline" className="mt-6" onClick={() => dispatch(fetchMyResults())}>
                        Try Again
                    </Button>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-8 p-6 max-w-7xl mx-auto pb-20">
                <PageHeader
                    title="My Grades"
                    description="View your academic performance, examination results, and report cards."
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'My Grades', active: true },
                    ]}
                    action={
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Download Transcript
                        </Button>
                    }
                />

                {displayResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/10">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <FileText className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No Exam Results Yet</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                            Examination results will appear here once they are published by your school.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Latest GPA</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-bold text-primary">
                                            {displayResults[0]?.percentage ? (parseFloat(displayResults[0].percentage) / 10).toFixed(1) : '0.0'}
                                        </span>
                                        <span className="text-sm text-muted-foreground mb-1">/ 10</span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-1 text-xs text-primary font-medium">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>Top 10% of class</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Exams Taken</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <FileText className="h-8 w-8 text-muted-foreground/50" />
                                        <span className="text-3xl font-bold">{displayResults.length}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Start Student</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <Trophy className="h-8 w-8 text-amber-500" />
                                        <div>
                                            <span className="text-xl font-bold block">Mathematics</span>
                                            <span className="text-xs text-muted-foreground">Highest Score</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Results */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                Examination History
                            </h2>

                            <div className="grid grid-cols-1 gap-6">
                                {displayResults.map((result) => (
                                    <Card key={result.id} className="overflow-hidden hover:border-primary/50 transition-all">
                                        <div className="border-b bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-lg ${result.is_passed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-100 text-red-600 dark:bg-red-900/20'}`}>
                                                    {result.is_passed ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground">
                                                        {result.examination_details?.name || 'Examination Result'}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {result.examination_details?.start_date ? new Date(result.examination_details.start_date).toLocaleDateString() : 'Date N/A'}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{result.examination_details?.type || 'Term Exam'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 self-end sm:self-auto">
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-muted-foreground">Percentage</p>
                                                    <p className="text-2xl font-bold text-foreground">{parseFloat(result.percentage).toFixed(1)}%</p>
                                                </div>
                                                <div className="w-px h-10 bg-border hidden sm:block" />
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-muted-foreground">Grade</p>
                                                    <Badge variant={getGradeColor(result.overall_grade)} className="text-sm px-2">
                                                        {result.overall_grade || 'N/A'}
                                                    </Badge>
                                                </div>
                                                <Button size="sm" variant="secondary" className="ml-2">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Report Card
                                                </Button>
                                            </div>
                                        </div>

                                        <CardContent className="p-0">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border border-b">
                                                <div className="p-4 text-center">
                                                    <p className="text-xs font-medium text-muted-foreground uppercase">Total Marks</p>
                                                    <p className="text-lg font-semibold mt-1">{result.total_marks_obtained} <span className="text-sm text-muted-foreground font-normal">/ {result.total_max_marks}</span></p>
                                                </div>
                                                <div className="p-4 text-center">
                                                    <p className="text-xs font-medium text-muted-foreground uppercase">Rank</p>
                                                    <p className="text-lg font-semibold mt-1">#{result.rank || '-'}</p>
                                                </div>
                                                <div className="p-4 text-center">
                                                    <p className="text-xs font-medium text-muted-foreground uppercase">Result</p>
                                                    <p className={`text-lg font-semibold mt-1 ${result.is_passed ? 'text-emerald-600' : 'text-destructive'}`}>
                                                        {result.is_passed ? 'PASSED' : 'FAILED'}
                                                    </p>
                                                </div>
                                                <div className="p-4 text-center">
                                                    <p className="text-xs font-medium text-muted-foreground uppercase">Attendance</p>
                                                    <p className="text-lg font-semibold mt-1">95%</p> {/* Mock attendance for exam period */}
                                                </div>
                                            </div>

                                            {/* Expandable details could go here if available in serializer later */}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
};

export default MyGrades;
