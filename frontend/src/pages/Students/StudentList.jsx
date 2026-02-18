import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchStudents,
    deleteStudent,
    setFilters,
    resetFilters,
    selectStudents,
    selectStudentFilters,
    selectStudentPagination,
    selectStudentLoading,
} from '../../store/slices/studentsSlice';
import { PageHeader } from '@/ui/composites';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/ui/primitives/dialog';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/ui/primitives/dropdown-menu';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Skeleton } from '@/ui/primitives/skeleton';
import {
    Plus,
    Download,
    Upload,
    Zap,
    FileSpreadsheet,
    FileText,
    Eye,
    Pencil,
    Trash2,
    ArrowUpDown,
    AlertTriangle,
    Search,
    Filter,
    RefreshCw,
    MoreHorizontal,
    Loader2
} from 'lucide-react';
import { exportStudents } from '../../utils/export';
import showToast from '../../utils/toast';
import { getMediaUrl } from '@/utils/mediaUrl';

/**
 * Student List Page - Main student management interface
 */
const StudentList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const students = useSelector(selectStudents);
    const filters = useSelector(selectStudentFilters);
    const pagination = useSelector(selectStudentPagination);
    const loading = useSelector(selectStudentLoading);

    const [selectedStudents, setSelectedStudents] = useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [localFilters, setLocalFilters] = useState(filters);

    // Sync local filters with store
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    // Fetch students on mount and when filters change
    useEffect(() => {
        dispatch(fetchStudents(filters));
    }, [dispatch, filters]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value, page: 1 };
        setLocalFilters(newFilters);
        // Debounce search
        if (key === 'search') {
            const timeoutId = setTimeout(() => {
                dispatch(setFilters(newFilters));
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            dispatch(setFilters(newFilters));
        }
    };

    const handleRefresh = () => {
        dispatch(fetchStudents(filters));
    };

    const handleClearFilters = () => {
        dispatch(resetFilters());
    };

    const handlePageChange = (newPage) => {
        dispatch(setFilters({ ...filters, page: newPage }));
    };

    const handleDeleteClick = (student) => {
        setStudentToDelete(student);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (studentToDelete) {
            await dispatch(deleteStudent(studentToDelete.id));
            setDeleteModalOpen(false);
            setStudentToDelete(null);
            dispatch(fetchStudents(filters));
            showToast.success('Student deleted successfully');
        }
    };

    const handleExport = (format) => {
        if (!students || students.length === 0) {
            showToast.warning('No students to export');
            return;
        }
        exportStudents(students, format);
        showToast.success(`Exporting to ${format.toUpperCase()}...`);
    };

    const getStatusVariant = (status) => {
        const variants = {
            ACTIVE: 'success',
            INACTIVE: 'destructive',
            PASSED_OUT: 'primary',
            TRANSFERRED: 'warning',
            DRAFT: 'secondary',
            SUBMITTED_TO_ADMIN: 'info',
            APPROVED: 'success',
            PENDING: 'warning'
        };
        return variants[status] || 'secondary';
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Students"
                    description={`Manage ${pagination?.count || 0} student records`}
                    action={
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Download className="w-4 h-4 mr-2" />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleExport('excel')}>
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        PDF
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" onClick={() => navigate('/students/bulk-upload')}>
                                <Upload className="w-4 h-4 mr-2" />
                                Bulk Upload
                            </Button>
                            <Button onClick={() => navigate('/students/new')}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Student
                            </Button>
                        </div>
                    }
                />

                <Card>
                    <CardHeader className="pb-3 border-b border-border">
                        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                            <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search name, admission no..."
                                        value={localFilters.search || ''}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                                    <select
                                        value={localFilters.class_name || ''}
                                        onChange={(e) => handleFilterChange('class_name', e.target.value)}
                                        className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="">All Classes</option>
                                        {/* Ideally classes should be fetched from API and mapped here */}
                                        <option value="1">Class 1</option>
                                        <option value="2">Class 2</option>
                                        <option value="3">Class 3</option>
                                    </select>
                                    <select
                                        value={localFilters.admission_status || ''}
                                        onChange={(e) => handleFilterChange('admission_status', e.target.value)}
                                        className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="">All Status</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="DRAFT">Draft</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh">
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Admission No.</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class/Sec</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Gender</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {loading && (!students || students.length === 0) ? (
                                        Array.from({ length: 8 }).map((_, i) => (
                                            <tr key={i} className="border-b border-border">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                                        <div className="space-y-1.5">
                                                            <Skeleton className="h-3.5 w-32" />
                                                            <Skeleton className="h-3 w-24" />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4"><Skeleton className="h-3.5 w-20" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-3.5 w-16" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-3.5 w-12" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                                                <td className="px-6 py-4 text-right"><Skeleton className="h-7 w-7 rounded ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : students && students.length > 0 ? (
                                        students.map((student) => (
                                            <tr key={student.id} className="hover:bg-muted/50 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {student.photo ? (
                                                            <img src={getMediaUrl(student.photo)} alt="" className="h-8 w-8 rounded-full mr-3 object-cover border border-border" />
                                                        ) : (
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 border border-primary/20">
                                                                <span className="text-primary font-medium text-xs">
                                                                    {student.first_name ? student.first_name.charAt(0) : 'S'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-medium text-sm text-foreground">{student.full_name}</div>
                                                            <div className="text-xs text-muted-foreground">{student.email || 'No email'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-muted-foreground">
                                                    {student.admission_number || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                    {student.class_name} {student.section_name ? `- ${student.section_name}` : ''}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'Other'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={getStatusVariant(student.admission_status)}>
                                                        {student.admission_status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/students/${student.id}`)} title="View Profile">
                                                            <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/students/${student.id}/edit`)} title="Edit Student">
                                                            <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(student)} title="Delete Student">
                                                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                                No students found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-muted/20">
                            <span className="text-sm text-muted-foreground">
                                Page {filters.page} of {Math.ceil((pagination.count || 0) / filters.pageSize)}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={filters.page === 1}
                                    onClick={() => handlePageChange(filters.page - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pagination.next}
                                    onClick={() => handlePageChange(filters.page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                Confirm Deletion
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <span className="font-bold text-foreground">{studentToDelete?.full_name}</span>?
                                <br />
                                This action cannot be undone and will remove all associated records.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete Student</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedPage>
    );
};

export default StudentList;
