import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchWeeklyTimetable,
    fetchTimeSlots,
    fetchRooms,
    createClassTimetable
} from '../../store/slices/timetableSlice';
import { fetchClasses, fetchClassSections, fetchSubjects, fetchAcademicYears } from '../../store/slices/academicsSlice';
import { fetchStaff } from '../../store/slices/staffSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/ui/primitives/dialog';
import { Label } from '@/ui/primitives/label';
import { Input } from '@/ui/primitives/input';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Calendar, Clock, User, MapPin, Plus, Edit2, AlertCircle, Save, Filter, Loader2, ChevronDown } from 'lucide-react';
import showToast from '../../utils/toast';
import apiClient from '../../api/client';

const selectClass = 'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const TimetableManagement = () => {
    const dispatch = useDispatch();

    // Redux State
    const { weeklyTimetable, timeSlots, rooms } = useSelector((state) => state.timetable);
    const { classes, sections, subjects, academicYears } = useSelector((state) => state.academics);
    const { list: staffList } = useSelector((state) => state.staff);

    // Page-level selection state
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [formData, setFormData] = useState({ subject: '', teacher: '', room: '' });

    // Cascade filter state — filtered lists for the modal dropdowns
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [subjectScope, setSubjectScope] = useState('class');   // 'class' | 'all'
    const [teacherScope, setTeacherScope] = useState('subject'); // 'subject' | 'all'
    const [modalLoading, setModalLoading] = useState(false);

    // Flat lists for the "show all" override
    const allSubjects = Array.isArray(subjects) ? subjects : (subjects?.results || subjects?.data || []);
    const allTeachers = Array.isArray(staffList) ? staffList : [];

    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    // ─── Initial Data Fetch ───────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchAcademicYears());
        dispatch(fetchClasses());
        dispatch(fetchTimeSlots());
        dispatch(fetchRooms());
        // Load full lists for "show all" override fallback
        dispatch(fetchSubjects({ is_active: true }));
        dispatch(fetchStaff({ role: 'TEACHER', is_active: true }));
    }, [dispatch]);

    // Set current academic year
    useEffect(() => {
        const list = Array.isArray(academicYears) ? academicYears : (academicYears?.data || []);
        const currentYear = list.find(y => y.is_current);
        if (currentYear) setSelectedAcademicYear(currentYear.id);
        else if (list.length > 0) setSelectedAcademicYear(list[0].id);
    }, [academicYears]);

    // Fetch sections when class changes
    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchClassSections(selectedClass));
            setSelectedSection('');
        }
    }, [selectedClass, dispatch]);

    // ─── Timetable Load ───────────────────────────────────────────────────────
    const loadTimetable = useCallback(() => {
        if (selectedClass && selectedSection && selectedAcademicYear) {
            dispatch(fetchWeeklyTimetable({
                academic_year_id: selectedAcademicYear,
                class_id: selectedClass,
                section_id: selectedSection
            }));
        }
    }, [selectedClass, selectedSection, selectedAcademicYear, dispatch]);

    useEffect(() => {
        if (selectedAcademicYear && selectedClass && selectedSection) {
            loadTimetable();
        }
    }, [selectedAcademicYear, selectedClass, selectedSection, loadTimetable]);

    const getTimetableEntry = (day, timeSlot) => {
        if (!weeklyTimetable.data?.timetable) return null;
        const dayEntries = weeklyTimetable.data.timetable[day] || [];
        return dayEntries.find(entry => entry.time_slot.id === timeSlot.id);
    };

    // ─── Cascade: fetch subjects for selected class ───────────────────────────
    const fetchSubjectsForClass = useCallback(async (classId) => {
        try {
            // Primary: fetch via ClassSubject (subjects explicitly assigned to this class)
            const csResp = await apiClient.get('/academics/class-subjects/', {
                params: { class_instance: classId, academic_year: selectedAcademicYear, is_deleted: false }
            });
            const csResults = csResp.data?.results || csResp.data || [];
            if (csResults.length > 0) {
                // ClassSubject returns subject nested object or subject_detail
                return csResults.map(cs => cs.subject_detail || cs.subject).filter(Boolean);
            }
            // Fallback: filter by class_group (backend filters by class_id→class_group)
            const subjResp = await apiClient.get('/academics/subjects/', {
                params: { class_id: classId, is_active: true }
            });
            return subjResp.data?.results || subjResp.data || [];
        } catch {
            return [];
        }
    }, [selectedAcademicYear]);

    // ─── Cascade: fetch teachers for selected subject ─────────────────────────
    const fetchTeachersForSubject = useCallback(async (subjectId) => {
        try {
            const resp = await apiClient.get('/staff/members/', {
                params: { subject_id: subjectId, role: 'TEACHER', is_active: true }
            });
            return resp.data?.results || resp.data || [];
        } catch {
            return [];
        }
    }, []);

    // ─── Modal Open ───────────────────────────────────────────────────────────
    const handleCellClick = async (day, timeSlot, existingEntry) => {
        setSelectedCell({ day, timeSlot, existingEntry });
        setFormData({
            subject: existingEntry?.subject?.id || '',
            teacher: existingEntry?.teacher?.id || '',
            room: existingEntry?.room_number || ''
        });
        setSubjectScope('class');
        setTeacherScope('subject');
        setFilteredTeachers([]);
        setIsModalOpen(true);

        // Load filtered subjects for this class
        setModalLoading(true);
        const subjs = await fetchSubjectsForClass(selectedClass);
        setFilteredSubjects(subjs);

        // If editing an existing entry, also pre-load teachers for that subject
        if (existingEntry?.subject?.id) {
            const teachers = await fetchTeachersForSubject(existingEntry.subject.id);
            setFilteredTeachers(teachers);
        }
        setModalLoading(false);
    };

    // ─── Subject selection → cascade-load teachers ───────────────────────────
    const handleSubjectChange = async (subjectId) => {
        setFormData(prev => ({ ...prev, subject: subjectId, teacher: '' }));
        setFilteredTeachers([]);
        if (subjectId && teacherScope === 'subject') {
            const teachers = await fetchTeachersForSubject(subjectId);
            setFilteredTeachers(teachers);
        }
    };

    // ─── Toggle "show all" for subjects ──────────────────────────────────────
    const toggleSubjectScope = async () => {
        const next = subjectScope === 'class' ? 'all' : 'class';
        setSubjectScope(next);
        if (next === 'class') {
            setModalLoading(true);
            const subjs = await fetchSubjectsForClass(selectedClass);
            setFilteredSubjects(subjs);
            setModalLoading(false);
        }
    };

    // ─── Toggle "show all" for teachers ──────────────────────────────────────
    const toggleTeacherScope = async () => {
        const next = teacherScope === 'subject' ? 'all' : 'subject';
        setTeacherScope(next);
        if (next === 'subject' && formData.subject) {
            const teachers = await fetchTeachersForSubject(formData.subject);
            setFilteredTeachers(teachers);
        }
    };

    // ─── Save ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!formData.subject || !formData.teacher) {
            showToast.error('Please select both Subject and Teacher');
            return;
        }

        setSubmitting(true);
        const payload = {
            academic_year: selectedAcademicYear,
            class_id: selectedClass,
            section: selectedSection,
            day_of_week: selectedCell.day,
            time_slot: selectedCell.timeSlot.id,
            subject: formData.subject,
            teacher: formData.teacher,
            room: formData.room
        };

        try {
            const result = await dispatch(createClassTimetable(payload)).unwrap();
            if (result?.warnings?.length) {
                showToast.warning(result.warnings[0]);
            } else {
                showToast.success('Timetable entry updated successfully');
            }
            setIsModalOpen(false);
            loadTimetable();
        } catch (error) {
            console.error(error);
            showToast.error(error.detail || 'Failed to update timetable');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Determine which lists to show ───────────────────────────────────────
    const subjectsToShow = subjectScope === 'class' ? filteredSubjects : allSubjects;
    const teachersToShow = teacherScope === 'subject' ? filteredTeachers : allTeachers;

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Timetable Management"
                    description="Create and modify class schedules"
                    breadcrumbs={[
                        { label: 'Timetable', href: '/timetable/view' },
                        { label: 'Manage', active: true }
                    ]}
                />

                {/* Selection Controls */}
                <Card>
                    <CardHeader className="pb-4 border-b border-border">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="w-5 h-5 text-primary" />
                            Configuration
                        </CardTitle>
                        <CardDescription>Select class and section to manage schedule.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="manage-class">Class</Label>
                                <select
                                    id="manage-class"
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="">Select Class</option>
                                    {(Array.isArray(classes) ? classes : []).map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.display_name || c.name}
                                            {c.class_group ? ` · ${c.class_group.replace('_', ' ')}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="manage-section">Section</Label>
                                <select
                                    id="manage-section"
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    disabled={!selectedClass}
                                    className={selectClass}
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
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit Schedule
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Interactive Timetable Grid */}
                {selectedClass && selectedSection && (
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Schedule Editor</CardTitle>
                                    <CardDescription>Click on a cell to assign subject and teacher.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                                        <div className="w-3 h-3 bg-secondary rounded-sm"></div>
                                        <span>Editable</span>
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                                        <div className="w-3 h-3 bg-primary/10 rounded-sm border border-primary/20"></div>
                                        <span>Assigned</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            <div className="min-w-[800px]">
                                {/* Header */}
                                <div className="flex border-b border-border bg-muted/40 sticky top-0 z-10">
                                    <div className="w-32 py-3 px-4 font-semibold text-sm border-r border-border shrink-0 text-center text-muted-foreground">
                                        Day / Time
                                    </div>
                                    {(timeSlots.data || []).map((slot) => (
                                        <div key={slot.id} className="flex-1 min-w-[140px] py-3 px-2 text-center border-r border-border last:border-r-0">
                                            <div className="font-medium text-foreground text-sm">{slot.name}</div>
                                            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Grid Body */}
                                {daysOfWeek.map((day) => (
                                    <div key={day} className="flex border-b border-border last:border-b-0">
                                        <div className="w-32 py-4 px-4 font-medium text-sm border-r border-border shrink-0 flex items-center justify-center bg-muted/10 capitalize text-muted-foreground">
                                            {day.toLowerCase()}
                                        </div>
                                        {(timeSlots.data || []).map((slot) => {
                                            const entry = getTimetableEntry(day, slot);
                                            const isBreak = slot.name.toLowerCase().includes('break') || slot.name.toLowerCase().includes('lunch');

                                            if (isBreak) {
                                                return (
                                                    <div key={slot.id} className="flex-1 min-w-[140px] bg-muted/20 border-r border-border last:border-0 p-2 flex items-center justify-center">
                                                        <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground/50">
                                                            {slot.name}
                                                        </span>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div
                                                    key={`${day}-${slot.id}`}
                                                    onClick={() => handleCellClick(day, slot, entry)}
                                                    className={`flex-1 min-w-[140px] border-r border-border last:border-r-0 p-2 cursor-pointer transition-all hover:bg-secondary/20 ${entry ? 'bg-primary/5 hover:bg-primary/10' : ''}`}
                                                >
                                                    {entry ? (
                                                        <div className="h-full flex flex-col justify-center space-y-1 p-2 rounded border border-primary/20 bg-background/50">
                                                            <div className="font-semibold text-primary text-sm line-clamp-1">{entry.subject?.name}</div>
                                                            <div className="flex items-center text-xs text-muted-foreground gap-1">
                                                                <User className="w-3 h-3" />
                                                                <span className="truncate max-w-[100px]">{entry.teacher?.full_name || entry.teacher?.name}</span>
                                                            </div>
                                                            {entry.room_number && (
                                                                <div className="flex items-center text-xs text-muted-foreground gap-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    <span>{entry.room_number}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center rounded border border-dashed border-border/50 text-muted-foreground/30 hover:text-primary hover:border-primary/30 transition-colors">
                                                            <Plus className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Edit Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Schedule Entry</DialogTitle>
                            <DialogDescription>
                                {selectedCell && (
                                    <>
                                        <span className="capitalize">{selectedCell.day.toLowerCase()}</span> • {selectedCell.timeSlot.name} ({selectedCell.timeSlot.start_time.slice(0, 5)} - {selectedCell.timeSlot.end_time.slice(0, 5)})
                                    </>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            {/* Subject — filtered by class group */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="subject">Subject</Label>
                                    <button
                                        type="button"
                                        onClick={toggleSubjectScope}
                                        className="text-xs text-primary/70 hover:text-primary underline leading-none"
                                    >
                                        {subjectScope === 'class'
                                            ? `Showing ${filteredSubjects.length} class subjects · Show all`
                                            : `Showing all ${allSubjects.length} subjects · Show class only`}
                                    </button>
                                </div>
                                {modalLoading ? (
                                    <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input text-sm text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading subjects...
                                    </div>
                                ) : (
                                    <select
                                        id="subject"
                                        value={formData.subject}
                                        onChange={(e) => handleSubjectChange(e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="">Select Subject</option>
                                        {subjectsToShow.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Teacher — filtered by subjects_taught */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="teacher">Teacher</Label>
                                    <button
                                        type="button"
                                        onClick={toggleTeacherScope}
                                        className="text-xs text-primary/70 hover:text-primary underline leading-none"
                                    >
                                        {teacherScope === 'subject'
                                            ? `Showing ${filteredTeachers.length} subject teachers · Show all`
                                            : `Showing all ${allTeachers.length} teachers · Show subject only`}
                                    </button>
                                </div>
                                <select
                                    id="teacher"
                                    value={formData.teacher}
                                    onChange={(e) => setFormData(prev => ({ ...prev, teacher: e.target.value }))}
                                    disabled={!formData.subject && teacherScope === 'subject'}
                                    className={selectClass}
                                >
                                    <option value="">
                                        {!formData.subject && teacherScope === 'subject'
                                            ? '— Select a subject first —'
                                            : 'Select Teacher'}
                                    </option>
                                    {teachersToShow.map(s => (
                                        <option key={s.id} value={s.id}>{s.full_name} ({s.employee_id})</option>
                                    ))}
                                </select>
                                {teacherScope === 'subject' && formData.subject && filteredTeachers.length === 0 && (
                                    <p className="text-xs text-amber-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        No teachers assigned this subject yet. Click "Show all" to pick any teacher.
                                    </p>
                                )}
                            </div>

                            {/* Room */}
                            <div className="space-y-2">
                                <Label htmlFor="room">Room (Optional)</Label>
                                <Input
                                    id="room"
                                    value={formData.room}
                                    onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                                    placeholder="e.g. Room 101"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={submitting || !formData.subject || !formData.teacher}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedPage>
    );
};

export default TimetableManagement;
