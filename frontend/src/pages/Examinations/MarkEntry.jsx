import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHotkeys } from 'react-hotkeys-hook';
import {
    fetchExaminations,
    fetchExamSchedules,
    bulkMarkEntry
} from '../../store/slices/examinationsSlice';
import { fetchClasses, fetchSections } from '../../store/slices/academicsSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Badge } from '@/ui/primitives/badge';
import { Skeleton } from '@/ui/primitives/skeleton';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/ui/primitives/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/ui/primitives/table';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    BookOpen,
    Users,
    Award,
    CheckCircle,
    Save,
    Loader2,
    Eye,
    RotateCcw,
    FileSpreadsheet,
    AlertCircle,
    Search,
    Info,
    ChevronDown,
    ChevronUp,
    Filter
} from 'lucide-react';
import showToast, { getErrorMessage } from '../../utils/toast';

const MarkEntry = () => {
    const dispatch = useDispatch();
    const { examinations, schedules } = useSelector((state) => state.examinations);
    const { classes, sections } = useSelector((state) => state.academics);

    // Filter Stats
    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');

    // Grid State
    const [marksData, setMarksData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCell, setActiveCell] = useState(null); // { studentId, field }

    // Constants
    const PASS_PERCENTAGE = 40; // Configurable ideally

    // --- Data Fetching ---

    useEffect(() => {
        dispatch(fetchExaminations({ status: 'ONGOING' }));
        dispatch(fetchClasses());
    }, [dispatch]);

    useEffect(() => {
        if (selectedClassId) {
            dispatch(fetchSections({ class_instance: selectedClassId }));
        }
    }, [selectedClassId, dispatch]);

    // Fetch Schedules/Subjects when Class/Section/Exam selected
    useEffect(() => {
        if (selectedExamId && selectedClassId && selectedSectionId) {
            dispatch(fetchExamSchedules({
                examination: selectedExamId,
                class_id: selectedClassId, // Confirm API param name
                section: selectedSectionId
            }));
        }
    }, [selectedExamId, selectedClassId, selectedSectionId, dispatch]);

    // Load Marks Data when Subject Selected
    useEffect(() => {
        if (selectedExamId && selectedClassId && selectedSectionId && selectedSubjectId) {
            loadStudentMarks();
        }
    }, [selectedSubjectId]);

    const loadStudentMarks = async () => {
        setLoading(true);
        // Simulate API call to fetch existing marks or students list
        // In real app: dispatch(fetchMarks({ exam, class, section, subject }))
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Mock delay

            // Mock Data Generation
            const mockStudents = Array.from({ length: 25 }, (_, i) => ({
                student_id: i + 1,
                roll_number: 101 + i,
                student_name: `Student ${i + 1}`,
                admission_number: `ADM${2023000 + i}`,
                marks_obtained: '', // Empty initially
                max_marks: 100,
                remarks: '',
                is_absent: false
            }));

            setMarksData(mockStudents);
            setOriginalData(JSON.parse(JSON.stringify(mockStudents)));
        } catch (error) {
            showToast('Failed to load marks data', 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- Grid Interactions ---

    const handleCellChange = (studentId, field, value) => {
        setMarksData(prev => prev.map(row => {
            if (row.student_id === studentId) {
                // Validation for numeric marks
                if (field === 'marks_obtained') {
                    if (value === '' || (Number(value) >= 0 && Number(value) <= row.max_marks)) {
                        return { ...row, [field]: value };
                    }
                    return row; // Ignore invalid
                }
                return { ...row, [field]: value };
            }
            return row;
        }));
    };

    const toggleAbsent = (studentId) => {
        setMarksData(prev => prev.map(row => {
            if (row.student_id === studentId) {
                const isAbsent = !row.is_absent;
                return {
                    ...row,
                    is_absent: isAbsent,
                    marks_obtained: isAbsent ? 0 : row.marks_obtained // Reset marks if absent?
                };
            }
            return row;
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Prepare payload
            const payload = {
                examination: selectedExamId,
                subject: selectedSubjectId,
                entries: marksData.map(row => ({
                    student: row.student_id,
                    marks_obtained: row.marks_obtained,
                    is_absent: row.is_absent,
                    remarks: row.remarks
                }))
            };

            console.log('Saving Payload:', payload);
            // await dispatch(bulkMarkEntry(payload)).unwrap();
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock save

            showToast('Marks saved successfully!', 'success');
            setOriginalData(JSON.parse(JSON.stringify(marksData)));
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to discard unsaved changes?')) {
            setMarksData(JSON.parse(JSON.stringify(originalData)));
        }
    };

    // --- Derived State & Calculations ---

    const stats = useMemo(() => {
        const total = marksData.length;
        if (total === 0) return { filled: 0, passed: 0, failed: 0, absent: 0, avg: 0 };

        let filledCount = 0;
        let totalMarks = 0;
        let passCount = 0;
        let absentCount = 0;

        marksData.forEach(row => {
            if (row.is_absent) {
                absentCount++;
            } else if (row.marks_obtained !== '') {
                filledCount++;
                const marks = Number(row.marks_obtained);
                totalMarks += marks;
                if (marks >= (row.max_marks * PASS_PERCENTAGE / 100)) {
                    passCount++;
                }
            }
        });

        return {
            filled: filledCount,
            passed: passCount,
            failed: filledCount - passCount,
            absent: absentCount,
            avg: filledCount ? (totalMarks / filledCount).toFixed(1) : 0
        };

    }, [marksData]);

    const hasUnsavedChanges = JSON.stringify(marksData) !== JSON.stringify(originalData);

    const filteredRows = marksData.filter(row =>
        row.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.admission_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Keyboard Navigation (Basic)
    useHotkeys('ctrl+s', (e) => { e.preventDefault(); handleSave(); }, { enableOnFormTags: true }, [marksData]);

    return (
        <AnimatedPage>
            <div className="space-y-6 p-6 max-w-[1600px] mx-auto pb-20">
                <PageHeader
                    title="Marks Entry"
                    description="Enter and manage marks for student assessments efficiently."
                    breadcrumbs={[
                        { label: 'Examinations', href: '/examinations/dashboard' },
                        { label: 'Marks Entry', active: true },
                    ]}
                    action={
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleReset} disabled={!hasUnsavedChanges || saving}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                            <Button onClick={handleSave} disabled={!hasUnsavedChanges || saving} className="min-w-[120px]">
                                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {saving ? 'Saving...' : 'Save Marks'}
                            </Button>
                        </div>
                    }
                />

                {/* Filters Section */}
                <Card>
                    <CardHeader className="pb-3 border-b bg-muted/20">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Selection Criteria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Examination</label>
                            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Exam" />
                                </SelectTrigger>
                                <SelectContent>
                                    {examinations.data?.map(exam => (
                                        <SelectItem key={exam.id} value={exam.id.toString()}>{exam.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Class</label>
                            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.data?.map(cls => (
                                        <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Section</label>
                            <Select value={selectedSectionId} onValueChange={setSelectedSectionId} disabled={!selectedClassId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.data?.map(sec => (
                                        <SelectItem key={sec.id} value={sec.id.toString()}>{sec.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={!schedules.data?.length}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Mock Subject Data for now if schedules fetch doesn't return easy unique subjects */}
                                    <SelectItem value="math">Mathematics</SelectItem>
                                    <SelectItem value="eng">English</SelectItem>
                                    <SelectItem value="sci">Science</SelectItem>
                                    {/* Real implementation: Map from selected Schedules */}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Workspace */}
                {marksData.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Summary Sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card className="bg-primary/5 border-primary/20 sticky top-4">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-foreground">Entry Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-3 bg-background rounded-lg border text-center">
                                            <p className="text-2xl font-bold">{marksData.length}</p>
                                            <p className="text-xs text-muted-foreground uppercase">Total Students</p>
                                        </div>
                                        <div className="p-3 bg-background rounded-lg border text-center">
                                            <p className="text-2xl font-bold">{stats.filled}</p>
                                            <p className="text-xs text-muted-foreground uppercase">Entries</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2 border-t border-dashed border-primary/20">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Class Average</span>
                                            <Badge variant="outline" className="font-mono">{stats.avg}%</Badge>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-emerald-600">Passed</span>
                                            <span className="font-bold">{stats.passed}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-destructive">Failed</span>
                                            <span className="font-bold">{stats.failed}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-amber-600">Absent</span>
                                            <span className="font-bold">{stats.absent}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-xs flex gap-2">
                                            <Info className="h-4 w-4 shrink-0" />
                                            <p>Use <kbd className="bg-background/50 px-1 rounded">Tab</kbd> to move next. <kbd className="bg-background/50 px-1 rounded">Enter</kbd> to accept.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Grid */}
                        <Card className="lg:col-span-3 border overflow-hidden flex flex-col h-[70vh]">
                            {/* Toolbar */}
                            <div className="p-3 border-b flex items-center justify-between bg-muted/20">
                                <div className="relative w-64">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search student..."
                                        className="pl-8 h-8 text-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 gap-2">
                                        <FileSpreadsheet className="h-4 w-4" /> Import Excel
                                    </Button>
                                    <div className="h-4 w-px bg-border mx-1" />
                                    <Badge variant="outline" className="font-normal text-xs">
                                        Max Marks: 100
                                    </Badge>
                                </div>
                            </div>

                            {/* Spreadsheet Table */}
                            <div className="flex-1 overflow-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                                        <TableRow>
                                            <TableHead className="w-[80px]">Roll No</TableHead>
                                            <TableHead className="min-w-[200px]">Student Name</TableHead>
                                            <TableHead className="w-[120px] text-center">Status</TableHead>
                                            <TableHead className="w-[120px] text-center">Marks</TableHead>
                                            <TableHead className="min-w-[200px]">Remarks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRows.map((row, idx) => (
                                            <TableRow key={row.student_id} className={row.is_absent ? 'bg-muted/50' : ''}>
                                                <TableCell className="font-mono text-xs">{row.roll_number}</TableCell>
                                                <TableCell className="font-medium">
                                                    <div>{row.student_name}</div>
                                                    <div className="text-[10px] text-muted-foreground">{row.admission_number}</div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant={row.is_absent ? "destructive" : "outline"}
                                                        size="sm"
                                                        className={`h-7 px-2 text-xs font-normal w-24 ${row.is_absent ? '' : 'text-muted-foreground hover:text-foreground'}`}
                                                        onClick={() => toggleAbsent(row.student_id)}
                                                    >
                                                        {row.is_absent ? 'Absent' : 'Present'}
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="text-center p-2">
                                                    <Input
                                                        type="number"
                                                        value={row.marks_obtained}
                                                        onChange={(e) => handleCellChange(row.student_id, 'marks_obtained', e.target.value)}
                                                        disabled={row.is_absent}
                                                        className={`h-9 w-full text-center font-mono ${!row.is_absent && row.marks_obtained !== '' && Number(row.marks_obtained) < 40
                                                            ? 'text-destructive border-destructive/50 focus-visible:ring-destructive/30'
                                                            : ''
                                                            }`}
                                                        placeholder={row.is_absent ? '-' : '0'}
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <Input
                                                        value={row.remarks}
                                                        onChange={(e) => handleCellChange(row.student_id, 'remarks', e.target.value)}
                                                        className="h-9 w-full text-xs"
                                                        placeholder="Optional remarks..."
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                        </Card>
                    </div>
                )}

                {!selectedSubjectId && (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl bg-muted/5 animate-in fade-in zoom-in-95 duration-500">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                            <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">Ready to Enter Marks?</h3>
                        <p className="text-muted-foreground text-sm max-w-sm text-center mt-2">
                            Select an examination, class, section, and subject from the filters above to load the mark entry sheet.
                        </p>
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
};

export default MarkEntry;
