import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchSyllabusCoverage
} from '../../store/slices/lessonPlansSlice';
import { fetchSections, fetchSubjects } from '../../store/slices/academicsSlice';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/ui/primitives/select';
import { Label } from '@/ui/primitives/label';
import { Skeleton } from '@/ui/primitives/skeleton';
import {
    BarChart3,
    BookOpen,
    Clock,
    CheckCircle2,
    GraduationCap,
    School,
    PieChart,
    AlertCircle,
    Loader2
} from 'lucide-react';

const SyllabusCoverage = () => {
    const dispatch = useDispatch();
    const { coverage, loading } = useSelector((state) => state.lessonPlans);
    const { sections, subjects } = useSelector((state) => state.academics);

    const [selection, setSelection] = useState({
        section_id: '',
        subject_id: ''
    });

    useEffect(() => {
        dispatch(fetchSections());
        dispatch(fetchSubjects());
    }, [dispatch]);

    useEffect(() => {
        if (selection.section_id && selection.subject_id) {
            dispatch(fetchSyllabusCoverage(selection));
        }
    }, [dispatch, selection]);

    const handleSelectChange = (name, value) => {
        setSelection(prev => ({ ...prev, [name]: value }));
    };

    const StatCard = ({ title, value, subtext, icon: Icon, colorClass, bgClass }) => (
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-0">
                <div className="flex items-stretch h-full">
                    <div className={`w-24 flex items-center justify-center ${bgClass}`}>
                        <Icon className={`h-10 w-10 ${colorClass}`} />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-center">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                        <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
                        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <AnimatedPage>
            <div className="space-y-6 max-w-7xl mx-auto">
                <PageHeader
                    title="Syllabus Coverage"
                    description="Track curriculum progress and completion status metrics."
                    breadcrumbs={[
                        { label: 'Academics', href: '/academics' },
                        { label: 'Syllabus Tracker', active: true },
                    ]}
                />

                {/* Filters */}
                <Card className="border-l-4 border-l-primary shadow-sm bg-gradient-to-r from-background to-accent/5">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-primary" />
                            Configuration
                        </CardTitle>
                        <CardDescription>Select a class and subject to view detailed progress reports.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                            <div className="space-y-2">
                                <Label htmlFor="section_id" className="text-xs uppercase text-muted-foreground font-semibold">Class / Section</Label>
                                <Select
                                    value={selection.section_id}
                                    onValueChange={(val) => handleSelectChange('section_id', val)}
                                >
                                    <SelectTrigger id="section_id" className="h-11">
                                        <div className="flex items-center gap-2">
                                            <School className="w-4 h-4 text-muted-foreground" />
                                            <SelectValue placeholder="Select Section" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(sections.data || []).map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.name || s.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject_id" className="text-xs uppercase text-muted-foreground font-semibold">Subject</Label>
                                <Select
                                    value={selection.subject_id}
                                    onValueChange={(val) => handleSelectChange('subject_id', val)}
                                >
                                    <SelectTrigger id="subject_id" className="h-11">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                                            <SelectValue placeholder="Select Subject" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(subjects.data || []).map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {loading && selection.section_id && selection.subject_id ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                            <Skeleton className="h-32 w-full rounded-xl" />
                            <Skeleton className="h-32 w-full rounded-xl" />
                            <Skeleton className="h-32 w-full rounded-xl" />
                            <Skeleton className="h-64 w-full md:col-span-3 rounded-xl mt-6" />
                        </div>
                    ) : coverage.data && selection.section_id && selection.subject_id ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    title="Overall Progress"
                                    value={`${coverage.data.coverage_percentage}%`}
                                    subtext="Syllabus covered"
                                    icon={BarChart3}
                                    colorClass="text-blue-600 dark:text-blue-400"
                                    bgClass="bg-blue-50 dark:bg-blue-900/20"
                                />
                                <StatCard
                                    title="Completed Units"
                                    value={`${coverage.data.completed_units} / ${coverage.data.total_units}`}
                                    subtext="Units delivered"
                                    icon={CheckCircle2}
                                    colorClass="text-emerald-600 dark:text-emerald-400"
                                    bgClass="bg-emerald-50 dark:bg-emerald-900/20"
                                />
                                <StatCard
                                    title="Instructional Hours"
                                    value={`${coverage.data.completed_hours} hrs`}
                                    subtext={`Out of ${coverage.data.total_hours} total hours`}
                                    icon={Clock}
                                    colorClass="text-violet-600 dark:text-violet-400"
                                    bgClass="bg-violet-50 dark:bg-violet-900/20"
                                />
                            </div>

                            {/* Detailed Progress Bar */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Completion Status</CardTitle>
                                    <CardDescription>
                                        Visual representation of syllabus completion based on approved lesson plans.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="relative pt-4 pb-2">
                                        <div className="flex mb-3 items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold inline-block py-1 px-2 uppercase rounded-md text-primary bg-primary/10">
                                                    Progress
                                                </span>
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    {coverage.data.completed_topics || 0} topics completed
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold inline-block text-primary">
                                                    {coverage.data.coverage_percentage}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Custom Progress Bar */}
                                        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-secondary">
                                            <div
                                                style={{ width: `${coverage.data.coverage_percentage}%` }}
                                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-700 ease-in-out relative"
                                            >
                                                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse-slow"></div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                            <span>0%</span>
                                            <span>25%</span>
                                            <span>50%</span>
                                            <span>75%</span>
                                            <span>100%</span>
                                        </div>
                                    </div>

                                    <div className="bg-muted p-4 rounded-lg flex gap-3 items-start border border-border">
                                        <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                                        <p className="text-sm text-muted-foreground">
                                            <strong>Note:</strong> Progress is calculated automatically based on lesson plans marked as "Completed".
                                            Ensure all delivered lessons are updated in the system to reflect accurate coverage.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
                            <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                                <GraduationCap className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">No Data Displayed</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                {!selection.section_id || !selection.subject_id
                                    ? "Please select a class and subject above to view the syllabus coverage report."
                                    : "No syllabus data found for the selected criteria."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default SyllabusCoverage;
