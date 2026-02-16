import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Plus,
    Pencil,
    Trash2,
    BookOpen,
    Search,
    Filter,
    X,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { PageHeader } from '@/ui/composites';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/ui/primitives/card';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/ui/primitives/select';
import { Input } from '@/ui/primitives/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/ui/primitives/dialog';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    fetchSubjects,
    deleteSubject,
    fetchBoards,
} from '../../store/slices/academicsSlice';
import showToast, { getErrorMessage } from '../../utils/toast';

const CLASS_GROUP_LABELS = {
    PRIMARY: 'Primary',
    MIDDLE: 'Middle',
    SECONDARY: 'Secondary',
    SENIOR_SECONDARY: 'Sr. Secondary',
};

const STREAM_LABELS = {
    GENERAL: 'General',
    SCI: 'Science',
    COM: 'Commerce',
    HUM: 'Humanities',
    VOC: 'Vocational',
    IB_GROUP: 'IB Group',
};

const SubjectsList = () => {
    const dispatch = useDispatch();
    const { subjects, boards, loading, error } = useSelector((state) => state.academics);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, subject: null });
    const [actionLoading, setActionLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        subject_type: '',
        board: '',
        class_group: '',
        stream: '',
    });

    useEffect(() => {
        dispatch(fetchBoards());
    }, [dispatch]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            dispatch(fetchSubjects(filters));
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [dispatch, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === 'ALL' ? '' : value
        }));
    };

    const handleDelete = async () => {
        if (!deleteModal.subject) return;
        setActionLoading(true);
        try {
            await dispatch(deleteSubject(deleteModal.subject.id)).unwrap();
            setDeleteModal({ isOpen: false, subject: null });
            dispatch(fetchSubjects(filters));
            showToast.success('Subject deleted successfully');
        } catch (err) {
            console.error('Failed to delete subject:', err);
            showToast.error('Failed to delete subject: ' + getErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    const getTypeVariant = (type) => {
        const variants = {
            CORE: 'default',
            ELECTIVE: 'secondary',
            LANGUAGE: 'outline',
            EXTRA_CURRICULAR: 'accent',
        };
        return variants[type] || 'outline';
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Subjects"
                    description="Manage academic subjects and curriculum details"
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

                <Card>
                    <CardHeader className="pb-4 border-b border-border">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="w-5 h-5 text-primary" />
                            Filter Subjects
                        </CardTitle>
                        <CardDescription>Refine the list based on specific criteria.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by name or code..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <Select value={filters.board || 'ALL'} onValueChange={(val) => handleFilterChange('board', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Board" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Boards</SelectItem>
                                    {boards.map((b) => (
                                        <SelectItem key={b.id} value={b.id.toString()}>{b.board_name || b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filters.class_group || 'ALL'} onValueChange={(val) => handleFilterChange('class_group', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Class Group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Groups</SelectItem>
                                    {Object.entries(CLASS_GROUP_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filters.subject_type || 'ALL'} onValueChange={(val) => handleFilterChange('subject_type', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Subject Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Types</SelectItem>
                                    <SelectItem value="CORE">Core</SelectItem>
                                    <SelectItem value="ELECTIVE">Elective</SelectItem>
                                    <SelectItem value="LANGUAGE">Language</SelectItem>
                                    <SelectItem value="EXTRA_CURRICULAR">Extra Curricular</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filters.stream || 'ALL'} onValueChange={(val) => handleFilterChange('stream', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Stream" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Streams</SelectItem>
                                    {Object.entries(STREAM_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-medium">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Subject</th>
                                        <th className="px-6 py-3 text-left">Type</th>
                                        <th className="px-6 py-3 text-left">Group & Stream</th>
                                        <th className="px-6 py-3 text-left">Board</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                    <p>Loading subjects...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : subjects.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center">
                                                    <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                                                    <p>No subjects found matching your criteria.</p>
                                                    <Button
                                                        variant="outline"
                                                        className="mt-4"
                                                        onClick={() => setFilters({ search: '', subject_type: '', board: '', class_group: '', stream: '' })}
                                                    >
                                                        Clear Filters
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        subjects.map((subject) => (
                                            <tr key={subject.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                            <BookOpen className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-foreground">{subject.name}</div>
                                                            <div className="text-xs text-muted-foreground font-mono">{subject.code}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={getTypeVariant(subject.subject_type)}>
                                                        {subject.subject_type?.replace(/_/g, ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-medium">
                                                            {CLASS_GROUP_LABELS[subject.class_group] || subject.class_group || '-'}
                                                        </span>
                                                        {subject.stream && (
                                                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded w-fit">
                                                                {STREAM_LABELS[subject.stream] || subject.stream}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="text-muted-foreground font-normal">
                                                        {subject.board_name || 'All Boards'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {subject.is_active ? (
                                                        <div className="flex items-center text-emerald-600 text-xs font-medium">
                                                            <CheckCircle className="w-3 h-3 mr-1" /> Active
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center text-muted-foreground text-xs font-medium">
                                                            <XCircle className="w-3 h-3 mr-1" /> Inactive
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link to={`/academics/subjects/${subject.id}/edit`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => setDeleteModal({ isOpen: true, subject })}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Delete Confirmation Modal */}
                <Dialog open={deleteModal.isOpen} onOpenChange={(open) => !open && setDeleteModal({ isOpen: false, subject: null })}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Subject</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <span className="font-semibold text-foreground">{deleteModal.subject?.name}</span>?
                                <br />
                                This action cannot be undone and may affect associated class schedules.
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
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedPage>
    );
};

export default SubjectsList;
