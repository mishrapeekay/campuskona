import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchClassAttendance,
    markBulkAttendance,
} from '../../store/slices/attendanceSlice';
import { fetchClasses, fetchSections } from '../../store/slices/academicsSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/primitives/avatar';
import { Input } from '@/ui/primitives/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/ui/primitives/select';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    Calendar,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Save,
    Filter,
    Loader2,
    Check,
    Search,
    UserCheck,
    UserX,
    MoreHorizontal
} from 'lucide-react';
import showToast, { getErrorMessage } from '../../utils/toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/ui/primitives/dropdown-menu';

const MarkAttendance = () => {
    const dispatch = useDispatch();
    const { classAttendance } = useSelector((state) => state.attendance);
    const { classes, sections } = useSelector((state) => state.academics);

    // Default today's date
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    const [attendanceData, setAttendanceData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        dispatch(fetchClasses());
    }, [dispatch]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchSections({ class_instance: selectedClass }));
            setSelectedSection('');
        }
    }, [selectedClass, dispatch]);

    useEffect(() => {
        if (selectedClass && selectedSection && selectedDate) {
            loadClassAttendance();
        } else {
            setAttendanceData([]);
        }
    }, [selectedClass, selectedSection, selectedDate]);

    const loadClassAttendance = () => {
        setLoading(true);
        dispatch(fetchClassAttendance({
            class_id: selectedClass,
            section_id: selectedSection,
            date: selectedDate
        })).then((result) => {
            if (result.payload) {
                const studentsList = result.payload.students || result.payload;
                if (Array.isArray(studentsList)) {
                    const initialData = studentsList.map(student => ({
                        student_id: student.student_id || student.id,
                        student_name: student.student_name || student.name,
                        admission_number: student.admission_number,
                        roll_number: student.roll_number,
                        status: student.status || 'PRESENT', // Default to Present
                        remarks: student.remarks || ''
                    }));
                    setAttendanceData(initialData);
                }
            }
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev =>
            prev.map(item =>
                item.student_id === studentId ? { ...item, status } : item
            )
        );
    };

    const handleBulkStatusChange = (status) => {
        setAttendanceData(prev => prev.map(item => ({ ...item, status })));
    };

    const handleSave = async () => {
        if (!selectedClass || !selectedSection) {
            showToast('Please select class and section', 'error');
            return;
        }

        setSaving(true);
        const payload = {
            class_id: selectedClass,
            section_id: selectedSection,
            date: selectedDate,
            attendance_data: attendanceData.map(item => ({
                student_id: item.student_id,
                status: item.status,
                remarks: item.remarks
            }))
        };

        try {
            await dispatch(markBulkAttendance(payload)).unwrap();
            showToast('Attendance saved successfully', 'success');
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    // Filtered Data
    const filteredData = attendanceData.filter(student =>
        student.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admission_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats
    const stats = {
        total: attendanceData.length,
        present: attendanceData.filter(s => s.status === 'PRESENT').length,
        absent: attendanceData.filter(s => s.status === 'ABSENT').length,
        late: attendanceData.filter(s => s.status === 'LATE').length,
    };

    return (
        <AnimatedPage>
            <div className="space-y-6 p-6 max-w-[1600px] mx-auto pb-20">
                <PageHeader
                    title="Mark Attendance"
                    description="Daily attendance tracking for your class."
                    breadcrumbs={[
                        { label: 'Attendance', href: '/attendance/dashboard' },
                        { label: 'Mark Attendance', active: true },
                    ]}
                    action={
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => handleBulkStatusChange('PRESENT')} disabled={attendanceData.length === 0}>
                                Mark All Present
                            </Button>
                            <Button onClick={handleSave} disabled={saving || attendanceData.length === 0} className="min-w-[120px]">
                                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {saving ? 'Saving...' : 'Save Attendance'}
                            </Button>
                        </div>
                    }
                />

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-card rounded-lg border shadow-sm">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                className="pl-9"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Class</label>
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
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
                        <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedClass}>
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
                        <label className="text-xs font-semibold text-muted-foreground">Search Student</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Name or Admission No..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={attendanceData.length === 0}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Summary */}
                {attendanceData.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase">Total Students</p>
                                    <p className="text-2xl font-bold mt-1">{stats.total}</p>
                                </div>
                                <Users className="h-8 w-8 text-primary/50" />
                            </CardContent>
                        </Card>
                        <Card className="bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase">Present</p>
                                    <p className="text-2xl font-bold mt-1 text-emerald-700 dark:text-emerald-300">{stats.present}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-emerald-500/50" />
                            </CardContent>
                        </Card>
                        <Card className="bg-destructive/5 border-destructive/10">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-destructive uppercase">Absent</p>
                                    <p className="text-2xl font-bold mt-1 text-destructive">{stats.absent}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-destructive/50" />
                            </CardContent>
                        </Card>
                        <Card className="bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase">Late</p>
                                    <p className="text-2xl font-bold mt-1 text-amber-700 dark:text-amber-300">{stats.late}</p>
                                </div>
                                <Clock className="h-8 w-8 text-amber-500/50" />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Student Grid */}
                {attendanceData.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredData.map((student) => (
                            <Card
                                key={student.student_id}
                                className={`
                                    cursor-pointer transition-all hover:shadow-md border-l-4
                                    ${student.status === 'PRESENT' ? 'border-l-emerald-500' :
                                        student.status === 'ABSENT' ? 'border-l-destructive' :
                                            student.status === 'LATE' ? 'border-l-amber-500' : 'border-l-muted'}
                                `}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border">
                                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                    {student.student_name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-sm line-clamp-1" title={student.student_name}>{student.student_name}</p>
                                                <p className="text-xs text-muted-foreground">{student.admission_number}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="font-mono text-[10px]">
                                            #{student.roll_number || '-'}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <Button
                                            variant={student.status === 'PRESENT' ? 'default' : 'outline'}
                                            size="sm"
                                            className={`h-8 text-xs ${student.status === 'PRESENT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20'}`}
                                            onClick={() => handleStatusChange(student.student_id, 'PRESENT')}
                                        >
                                            Present
                                        </Button>
                                        <Button
                                            variant={student.status === 'ABSENT' ? 'destructive' : 'outline'}
                                            size="sm"
                                            className={`h-8 text-xs ${student.status !== 'ABSENT' && 'hover:bg-destructive/10 hover:text-destructive'}`}
                                            onClick={() => handleStatusChange(student.student_id, 'ABSENT')}
                                        >
                                            Absent
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="h-8 px-2">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleStatusChange(student.student_id, 'LATE')}>
                                                    Mark Late
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(student.student_id, 'HALF_DAY')}>
                                                    Half Day
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(student.student_id, 'ON_LEAVE')}>
                                                    On Leave
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {(student.status === 'ABSENT' || student.status === 'LATE' || student.status === 'ON_LEAVE') && (
                                        <Input
                                            className="mt-3 h-7 text-xs"
                                            placeholder="Reason (Optional)"
                                            value={student.remarks}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setAttendanceData(prev => prev.map(s => s.student_id === student.student_id ? { ...s, remarks: val } : s));
                                            }}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    !loading && selectedClass && selectedSection && (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl bg-muted/5">
                            <Users className="h-12 w-12 text-muted-foreground/30 mb-2" />
                            <p className="text-muted-foreground">No students found matching current filters.</p>
                        </div>
                    )
                )}

                {!selectedClass && (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl bg-muted/5 animate-in fade-in zoom-in-95 duration-500">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                            <Calendar className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">Start Attendance</h3>
                        <p className="text-muted-foreground text-sm max-w-sm text-center mt-2">
                            Select a class and section to load the student list and begin marking attendance.
                        </p>
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
};

export default MarkAttendance;
