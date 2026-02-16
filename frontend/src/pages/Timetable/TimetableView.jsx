import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchWeeklyTimetable,
    fetchTimeSlots
} from '../../store/slices/timetableSlice';
import { fetchClasses, fetchClassSections, fetchAcademicYears } from '../../store/slices/academicsSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';
import { Label } from '@/ui/primitives/label';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/ui/primitives/select';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Calendar, Clock, User, MapPin, Loader2, BookOpen, Filter } from 'lucide-react';

const TimetableView = () => {
    const dispatch = useDispatch();
    const { weeklyTimetable, timeSlots } = useSelector((state) => state.timetable);
    const { classes, sections, academicYears } = useSelector((state) => state.academics);

    // Default to first year/class/section if available, or empty
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    useEffect(() => {
        dispatch(fetchAcademicYears());
        dispatch(fetchClasses());
        dispatch(fetchTimeSlots());
    }, [dispatch]);

    useEffect(() => {
        const list = Array.isArray(academicYears) ? academicYears : (academicYears?.data || []);
        const currentYear = list.find(y => y.is_current);
        if (currentYear) {
            setSelectedAcademicYear(currentYear.id);
        } else if (list.length > 0) {
            setSelectedAcademicYear(list[0].id);
        }
    }, [academicYears]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchClassSections(selectedClass));
            setSelectedSection(''); // Reset section when class changes
        }
    }, [selectedClass, dispatch]);

    const loadTimetable = () => {
        if (selectedClass && selectedSection && selectedAcademicYear) {
            dispatch(fetchWeeklyTimetable({
                academic_year_id: selectedAcademicYear,
                class_id: selectedClass,
                section_id: selectedSection
            }));
        }
    };

    // Auto-load if all are selected
    useEffect(() => {
        if (selectedAcademicYear && selectedClass && selectedSection) {
            loadTimetable();
        }
    }, [selectedAcademicYear, selectedClass, selectedSection]);

    const getTimetableEntry = (day, timeSlot) => {
        if (!weeklyTimetable.data?.timetable) return null;
        const dayEntries = weeklyTimetable.data.timetable[day] || [];
        return dayEntries.find(entry => entry.time_slot.id === timeSlot.id);
    };

    const getSubjectColor = (subjectName) => {
        if (!subjectName) return 'border-l-4 border-l-border bg-muted/30';

        const colors = [
            'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10',
            'border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10',
            'border-l-4 border-l-violet-500 bg-violet-50/50 dark:bg-violet-900/10',
            'border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10',
            'border-l-4 border-l-pink-500 bg-pink-50/50 dark:bg-pink-900/10',
            'border-l-4 border-l-cyan-500 bg-cyan-50/50 dark:bg-cyan-900/10',
        ];

        const hash = subjectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Class Timetable"
                    description="View weekly schedule for students and teachers"
                    breadcrumbs={[
                        { label: 'Timetable', active: true }
                    ]}
                />

                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="w-5 h-5 text-primary" />
                            Select Class & Section
                        </CardTitle>
                        <CardDescription>Choose the class to view its timetable.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="class-select">Class</Label>
                                <select
                                    id="class-select"
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Select Class</option>
                                    {(Array.isArray(classes) ? classes : []).map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="section-select">Section</Label>
                                <select
                                    id="section-select"
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    disabled={!selectedClass}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Select Section</option>
                                    {(Array.isArray(sections) ? sections : []).map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                onClick={loadTimetable}
                                disabled={!selectedClass || !selectedSection || weeklyTimetable.loading}
                                className="w-full md:w-auto"
                            >
                                {weeklyTimetable.loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <Calendar className="w-4 h-4 mr-2" />
                                        View Timetable
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Timetable Grid */}
                {selectedClass && selectedSection && (
                    <Card>
                        <CardContent className="p-0 overflow-x-auto">
                            {!weeklyTimetable.loading && weeklyTimetable.data?.timetable ? (
                                <div className="min-w-[800px]">
                                    {/* Header Row */}
                                    <div className="flex border-b border-border bg-muted/40 sticky top-0 z-10">
                                        <div className="w-32 py-3 px-4 font-semibold text-sm border-r border-border shrink-0 text-center bg-muted/40">
                                            Day / Time
                                        </div>
                                        {timeSlots.data?.map((slot) => (
                                            <div key={slot.id} className="flex-1 min-w-[140px] py-3 px-2 font-medium text-sm text-center border-r border-border last:border-r-0">
                                                <div className="text-foreground">{slot.name}</div>
                                                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                                    <Clock className="w-3 h-3" />
                                                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Days Rows */}
                                    {daysOfWeek.map((day) => (
                                        <div key={day} className="flex border-b border-border last:border-b-0 hover:bg-muted/5 transition-colors">
                                            <div className="w-32 py-4 px-4 font-medium text-sm border-r border-border shrink-0 flex items-center justify-center bg-muted/10 capitalize text-muted-foreground">
                                                {day.toLowerCase()}
                                            </div>
                                            {timeSlots.data?.map((slot) => {
                                                const entry = getTimetableEntry(day, slot);
                                                const breakOrLunch = slot.name.toLowerCase().includes('break') || slot.name.toLowerCase().includes('lunch');

                                                if (breakOrLunch) {
                                                    return (
                                                        <div key={`${day}-${slot.id}`} className="flex-1 min-w-[140px] p-2 border-r border-border last:border-r-0 bg-muted/20 flex items-center justify-center">
                                                            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold rotate-0">
                                                                {slot.name}
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div key={`${day}-${slot.id}`} className="flex-1 min-w-[140px] p-2 border-r border-border last:border-r-0">
                                                        {entry ? (
                                                            <div className={`h-full p-2.5 rounded-r-md text-sm shadow-sm transition-all hover:shadow-md ${getSubjectColor(entry.subject?.name)}`}>
                                                                <div className="font-semibold text-foreground mb-1 line-clamp-1" title={entry.subject?.name}>
                                                                    {entry.subject?.name}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center text-xs text-muted-foreground gap-1.5" title="Teacher">
                                                                        <User className="w-3 h-3" />
                                                                        <span className="truncate">{entry.teacher?.full_name || 'No Teacher'}</span>
                                                                    </div>
                                                                    {entry.room_number && (
                                                                        <div className="flex items-center text-xs text-muted-foreground gap-1.5" title="Room">
                                                                            <MapPin className="w-3 h-3" />
                                                                            <span className="truncate">{entry.room_number}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="h-full min-h-[80px] flex items-center justify-center rounded-md border border-dashed border-border bg-background/50">
                                                                <span className="text-xs text-muted-foreground">—</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            ) : !weeklyTimetable.loading && !weeklyTimetable.data ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <BookOpen className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                                    <p className="text-muted-foreground font-medium">Please select a class and section to view the timetable.</p>
                                </div>
                            ) : (
                                <div className="p-8 space-y-4">
                                    <Skeleton className="h-12 w-full" />
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <Skeleton key={i} className="h-20 w-full" />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AnimatedPage>
    );
};

export default TimetableView;
