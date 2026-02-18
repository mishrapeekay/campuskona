import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Plus,
    Pencil,
    Trash2,
    BookOpen,
    Search,
    ChevronDown,
    ChevronRight,
    GraduationCap,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { PageHeader } from '@/ui/composites';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Card, CardContent } from '@/ui/primitives/card';
import { Input } from '@/ui/primitives/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/primitives/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/ui/primitives/dialog';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { fetchSubjects, deleteSubject, fetchBoards } from '../../store/slices/academicsSlice';
import showToast, { getErrorMessage } from '../../utils/toast';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CLASS_GROUPS = [
    { key: 'PRE_PRIMARY',       label: 'Pre-Primary',      subtitle: 'LKG / UKG / Nursery' },
    { key: 'PRIMARY',           label: 'Primary',           subtitle: 'Class 1 – 5' },
    { key: 'MIDDLE',            label: 'Middle',            subtitle: 'Class 6 – 8' },
    { key: 'SECONDARY',         label: 'Secondary',         subtitle: 'Class 9 – 10' },
    { key: 'SENIOR_SECONDARY',  label: 'Senior Secondary',  subtitle: 'Class 11 – 12' },
];

const STREAM_LABELS = {
    GENERAL:   'General',
    SCI:       'Science',
    COM:       'Commerce',
    HUM:       'Humanities',
    VOC:       'Vocational',
    IB_GROUP:  'IB Programme',
};

const TYPE_COLORS = {
    CORE:             'default',
    ELECTIVE:         'secondary',
    LANGUAGE:         'outline',
    EXTRA_CURRICULAR: 'accent',
};

const TYPE_LABELS = {
    CORE:             'Core',
    ELECTIVE:         'Elective',
    LANGUAGE:         'Language',
    EXTRA_CURRICULAR: 'Co-Curricular',
};

// ---------------------------------------------------------------------------
// SubjectCard
// ---------------------------------------------------------------------------
const SubjectCard = ({ subject, onDelete }) => (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 shrink-0 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    <BookOpen className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground leading-tight truncate">{subject.name}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{subject.code}</p>
                </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <Link to={`/academics/subjects/${subject.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(subject)}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-1">
            <Badge variant={TYPE_COLORS[subject.subject_type] || 'outline'} className="text-xs">
                {TYPE_LABELS[subject.subject_type] || subject.subject_type}
            </Badge>
            {subject.board_name && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                    {subject.board_name}
                </Badge>
            )}
            {subject.has_practical && (
                <Badge variant="outline" className="text-xs text-sky-600 border-sky-200">
                    Practical
                </Badge>
            )}
            {subject.is_optional && (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                    Optional
                </Badge>
            )}
        </div>

        {(subject.theory_max_marks > 0 || subject.practical_max_marks > 0) && (
            <p className="text-xs text-muted-foreground">
                {subject.theory_max_marks > 0 && `Theory: ${subject.theory_max_marks}`}
                {subject.theory_max_marks > 0 && subject.practical_max_marks > 0 && ' · '}
                {subject.practical_max_marks > 0 && `Practical: ${subject.practical_max_marks}`}
            </p>
        )}
    </div>
);

// ---------------------------------------------------------------------------
// ClassGroupSection — collapsible accordion per group
// ---------------------------------------------------------------------------
const ClassGroupSection = ({ group, subjects, onDelete }) => {
    const [open, setOpen] = useState(true);

    // Group subjects by stream
    const byStream = useMemo(() => {
        const map = {};
        subjects.forEach(s => {
            const key = s.stream || 'GENERAL';
            if (!map[key]) map[key] = [];
            map[key].push(s);
        });
        return map;
    }, [subjects]);

    const streams = Object.keys(byStream);
    const multipleStreams = streams.length > 1;

    return (
        <div className="rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <button
                className="w-full flex items-center justify-between px-5 py-3.5 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
                onClick={() => setOpen(o => !o)}
            >
                <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <div>
                        <span className="font-semibold text-sm text-foreground">{group.label}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{group.subtitle}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
                    </Badge>
                </div>
                {open ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
            </button>

            {/* Body */}
            {open && (
                <div className="p-4 space-y-5 bg-background">
                    {streams.map(stream => (
                        <div key={stream}>
                            {multipleStreams && (
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-px flex-1 bg-border" />
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {STREAM_LABELS[stream] || stream}
                                    </span>
                                    <div className="h-px flex-1 bg-border" />
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {byStream[stream].map(subject => (
                                    <SubjectCard key={subject.id} subject={subject} onDelete={onDelete} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const SubjectsList = () => {
    const dispatch = useDispatch();
    const { subjects, boards, loading, error } = useSelector(state => state.academics);

    const [search, setSearch] = useState('');
    const [activeBoard, setActiveBoard] = useState('ALL');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, subject: null });
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch all subjects once (large page) + boards
    useEffect(() => {
        dispatch(fetchBoards());
        dispatch(fetchSubjects({ page_size: 300, is_active: true }));
    }, [dispatch]);

    // Build board tab options from loaded boards + an "ALL" tab
    const boardTabs = useMemo(() => {
        const tabs = [{ key: 'ALL', label: 'All Boards' }];
        boards.forEach(b => tabs.push({ key: b.id, label: b.board_type || b.board_name }));
        // Also add "Common" for subjects with no board
        const hasCommon = subjects.some(s => !s.board && !s.board_name);
        if (hasCommon) tabs.push({ key: 'COMMON', label: 'Common' });
        return tabs;
    }, [boards, subjects]);

    // Filter subjects: board tab + search
    const filtered = useMemo(() => {
        let list = subjects;

        if (activeBoard === 'COMMON') {
            list = list.filter(s => !s.board && !s.board_name);
        } else if (activeBoard !== 'ALL') {
            list = list.filter(s => s.board === activeBoard || s.board?.toString() === activeBoard.toString());
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(s =>
                s.name?.toLowerCase().includes(q) ||
                s.code?.toLowerCase().includes(q)
            );
        }

        return list;
    }, [subjects, activeBoard, search]);

    // Group filtered subjects by class_group (preserving CLASS_GROUPS order)
    const grouped = useMemo(() => {
        const map = {};
        filtered.forEach(s => {
            const g = s.class_group || 'PRIMARY';
            if (!map[g]) map[g] = [];
            map[g].push(s);
        });
        return map;
    }, [filtered]);

    const handleDelete = useCallback(async () => {
        if (!deleteModal.subject) return;
        setActionLoading(true);
        try {
            await dispatch(deleteSubject(deleteModal.subject.id)).unwrap();
            setDeleteModal({ isOpen: false, subject: null });
            dispatch(fetchSubjects({ page_size: 300, is_active: true }));
            showToast.success('Subject deleted successfully');
        } catch (err) {
            showToast.error('Failed to delete: ' + getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    }, [deleteModal.subject, dispatch]);

    const openDeleteModal = useCallback(subject => {
        setDeleteModal({ isOpen: true, subject });
    }, []);

    const visibleGroups = CLASS_GROUPS.filter(g => grouped[g.key]?.length > 0);

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Subjects"
                    description="Manage academic subjects organised by board and class group"
                    breadcrumbs={[
                        { label: 'Academics', href: '/academics' },
                        { label: 'Subjects', active: true },
                    ]}
                    action={
                        <Link to="/academics/subjects/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Subject
                            </Button>
                        </Link>
                    }
                />

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Board tabs + search row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Tabs
                        value={activeBoard}
                        onValueChange={setActiveBoard}
                        className="flex-1"
                    >
                        <TabsList className="flex-wrap h-auto gap-1">
                            {boardTabs.map(tab => (
                                <TabsTrigger key={tab.key} value={tab.key}>
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search by name or code…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="text-sm">Loading subjects…</p>
                        </CardContent>
                    </Card>
                ) : visibleGroups.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                            <BookOpen className="h-12 w-12 opacity-20" />
                            <p className="text-sm">No subjects found matching your criteria.</p>
                            <Button
                                variant="outline"
                                onClick={() => { setSearch(''); setActiveBoard('ALL'); }}
                            >
                                Clear Filters
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {visibleGroups.map(group => (
                            <ClassGroupSection
                                key={group.key}
                                group={group}
                                subjects={grouped[group.key]}
                                onDelete={openDeleteModal}
                            />
                        ))}
                        <p className="text-xs text-muted-foreground text-right pr-1">
                            {filtered.length} subject{filtered.length !== 1 ? 's' : ''} shown
                        </p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation */}
            <Dialog
                open={deleteModal.isOpen}
                onOpenChange={open => !open && setDeleteModal({ isOpen: false, subject: null })}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Subject</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-foreground">{deleteModal.subject?.name}</span>?{' '}
                            This cannot be undone and may affect associated class schedules.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteModal({ isOpen: false, subject: null })}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
                            {actionLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AnimatedPage>
    );
};

export default SubjectsList;
