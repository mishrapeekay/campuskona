import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchExaminations,
    fetchExamResults,
    fetchExamStatistics
} from '../../store/slices/examinationsSlice';
import { fetchClasses, fetchSections } from '../../store/slices/academicsSlice';
import { Card, CardContent } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import Select from '../../components/common/Select';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Award, TrendingUp, Users, Target, Medal, Download } from 'lucide-react';

const ResultsView = () => {
    const dispatch = useDispatch();
    const { examinations, results, statistics } = useSelector((state) => state.examinations);
    const { classes, sections } = useSelector((state) => state.academics);

    const [selectedExam, setSelectedExam] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    useEffect(() => {
        dispatch(fetchExaminations({ status: 'COMPLETED' }));
        dispatch(fetchClasses());
    }, [dispatch]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchSections({ class_id: selectedClass }));
        }
    }, [selectedClass, dispatch]);

    useEffect(() => {
        if (selectedExam && selectedClass && selectedSection) {
            loadResults();
            loadStatistics();
        }
    }, [selectedExam, selectedClass, selectedSection]);

    const loadResults = () => {
        dispatch(fetchExamResults({
            examination: selectedExam,
            class_obj: selectedClass,
            section: selectedSection
        }));
    };

    const loadStatistics = () => {
        dispatch(fetchExamStatistics(selectedExam));
    };

    const getMedalColor = (rank) => {
        if (rank === 1) return 'text-amber-500';
        if (rank === 2) return 'text-slate-400';
        if (rank === 3) return 'text-orange-600';
        return '';
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Examination Results" description="View and analyze examination results" />

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Examination
                                </label>
                                <Select
                                    value={selectedExam}
                                    onChange={(e) => setSelectedExam(e.target.value)}
                                    options={[
                                        { value: '', label: 'Select Examination' },
                                        ...(examinations.data || []).map(e => ({
                                            value: e.id,
                                            label: e.name
                                        }))
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Class
                                </label>
                                <Select
                                    value={selectedClass}
                                    onChange={(e) => {
                                        setSelectedClass(e.target.value);
                                        setSelectedSection('');
                                    }}
                                    options={[
                                        { value: '', label: 'Select Class' },
                                        ...(classes.data || []).map(c => ({
                                            value: c.id,
                                            label: c.name
                                        }))
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Section
                                </label>
                                <Select
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    options={[
                                        { value: '', label: 'Select Section' },
                                        ...(sections.data || []).map(s => ({
                                            value: s.id,
                                            label: s.name
                                        }))
                                    ]}
                                    disabled={!selectedClass}
                                />
                            </div>

                            <div className="flex items-end">
                                <Button
                                    onClick={loadResults}
                                    disabled={!selectedExam || !selectedClass || !selectedSection || results.loading}
                                    className="w-full"
                                >
                                    {results.loading ? 'Loading...' : 'Load Results'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics */}
                {statistics.data && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-primary font-medium">Total Students</p>
                                        <p className="text-2xl font-bold text-foreground">{statistics.data.total_students}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-primary" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-emerald-500/5 border-emerald-500/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Passed</p>
                                        <p className="text-2xl font-bold text-foreground">{statistics.data.students_passed}</p>
                                    </div>
                                    <Award className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-destructive/5 border-destructive/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-destructive font-medium">Failed</p>
                                        <p className="text-2xl font-bold text-foreground">{statistics.data.students_failed}</p>
                                    </div>
                                    <Target className="w-8 h-8 text-destructive" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-violet-500/5 border-violet-500/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">Pass %</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {parseFloat(statistics.data.pass_percentage).toFixed(1)}%
                                        </p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-amber-500/5 border-amber-500/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Average %</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {parseFloat(statistics.data.average_percentage).toFixed(1)}%
                                        </p>
                                    </div>
                                    <Medal className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Results Table */}
                {results.data && results.data.length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-foreground">Class Results</h3>
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Results
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-border">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Rank
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Student
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Total Marks
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Percentage
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                CGPA
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Grade
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Result
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-card divide-y divide-border">
                                        {results.data.map((row) => (
                                            <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        {row.rank <= 3 && (
                                                            <Medal className={`w-5 h-5 ${getMedalColor(row.rank)}`} />
                                                        )}
                                                        <span className="font-semibold text-foreground">{row.rank || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="font-medium text-foreground">{row.student_name}</div>
                                                        <div className="text-sm text-muted-foreground">{row.student_admission_number}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-medium text-foreground">
                                                        {row.total_marks_obtained}/{row.total_max_marks}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-semibold text-primary">
                                                        {parseFloat(row.percentage).toFixed(2)}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-medium text-foreground">
                                                        {row.cgpa ? parseFloat(row.cgpa).toFixed(2) : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant="success">
                                                        {row.overall_grade || '-'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={row.is_passed ? 'success' : 'destructive'}>
                                                        {row.is_passed ? 'PASS' : 'FAIL'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {!results.loading && (!results.data || results.data.length === 0) && selectedExam && selectedClass && selectedSection && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-12">
                                <Award className="mx-auto h-12 w-12 text-muted-foreground/30" />
                                <h3 className="mt-2 text-sm font-medium text-foreground">No results found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Results have not been published for this examination yet
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AnimatedPage>
    );
};

export default ResultsView;
