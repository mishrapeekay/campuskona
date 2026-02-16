import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle,
  Trash2,
  Eye,
  Pencil,
  Filter,
  RefreshCw,
  MoreHorizontal,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  fetchAssignments,
  deleteAssignment,
  clearError,
} from '../../store/slices/assignmentsSlice';
import { fetchClasses, fetchSections, fetchSubjects } from '../../store/slices/academicsSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Skeleton } from '@/ui/primitives/skeleton';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/ui/primitives/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/ui/primitives/dialog';

const AssignmentsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { assignments, error, loading } = useSelector((state) => state.assignments);
  const { classes, sections, subjects } = useSelector((state) => state.academics);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    class_id: '',
    section_id: '',
    subject_id: '',
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  const canEdit = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER'].includes(user?.user_type);

  useEffect(() => {
    dispatch(fetchAssignments());
    dispatch(fetchClasses());
    dispatch(fetchSubjects());
    return () => dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (filters.class_id) {
      dispatch(fetchSections({ class_id: filters.class_id }));
    }
  }, [filters.class_id, dispatch]);

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    if (key === 'class_id') {
      updated.section_id = '';
    }
    setFilters(updated);
  };

  const handleSearch = () => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.class_id) params.class_id = filters.class_id;
    if (filters.section_id) params.section_id = filters.section_id;
    if (filters.subject_id) params.subject_id = filters.subject_id;
    dispatch(fetchAssignments(params));
  };

  useEffect(() => {
    const timeout = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  const handleDeleteClick = (assignment) => {
    setAssignmentToDelete(assignment);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (assignmentToDelete) {
      dispatch(deleteAssignment(assignmentToDelete.id));
      setDeleteModalOpen(false);
      setAssignmentToDelete(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    // Check if date is in past and time is 23:59:59 (end of day) if no time specified
    const due = new Date(dueDate);
    due.setHours(23, 59, 59); // Assume end of day for due date
    return due < new Date();
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'success';
      case 'DRAFT': return 'secondary';
      case 'ARCHIVED': return 'warning';
      default: return 'outline';
    }
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <PageHeader
          title="Assignments"
          description="Manage homework, assignments, and study materials"
          breadcrumbs={[
            { label: 'Academics', href: '/academics' },
            { label: 'Assignments', active: true }
          ]}
          action={
            canEdit && (
              <Button onClick={() => navigate('/assignments/new')}>
                <Plus className="w-4 h-4 mr-2" />
                New Assignment
              </Button>
            )
          }
        />

        <Card>
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
              <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto flex-1">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search assignments..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[120px]"
                  >
                    <option value="">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <select
                    value={filters.class_id}
                    onChange={(e) => handleFilterChange('class_id', e.target.value)}
                    className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[120px]"
                  >
                    <option value="">All Classes</option>
                    {(classes?.data || classes || []).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <select
                    value={filters.subject_id}
                    onChange={(e) => handleFilterChange('subject_id', e.target.value)}
                    className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[120px]"
                  >
                    <option value="">All Subjects</option>
                    {(subjects?.data || subjects || []).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => dispatch(fetchAssignments(filters))}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-medium">
                  <tr>
                    <th className="px-6 py-3 text-left w-1/4">Title</th>
                    <th className="px-6 py-3 text-left">Class & Subject</th>
                    <th className="px-6 py-3 text-left">Deadline</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Submissions</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading && (!assignments || assignments.length === 0) ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-6 py-4">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : assignments && assignments.length > 0 ? (
                    assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground line-clamp-1">{assignment.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{assignment.description || 'No description'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{assignment.subject_name || assignment.subject?.name || '-'}</span>
                            <span className="text-xs text-muted-foreground">
                              {assignment.class_name || assignment.class_obj?.name || '-'}
                              {assignment.section_name ? ` - ${assignment.section_name}` : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 ${isOverdue(assignment.due_date) ? 'text-destructive' : 'text-muted-foreground'}`}>
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              {formatDate(assignment.due_date)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusVariant(assignment.status)} className="uppercase text-[10px]">
                            {assignment.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4" />
                            <span>{assignment.submission_count || 0}/{assignment.total_students || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/assignments/${assignment.id}`)} title="View Details">
                              <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                            </Button>
                            {canEdit && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => navigate(`/assignments/${assignment.id}/edit`)} title="Edit">
                                  <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(assignment)} title="Delete">
                                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="w-12 h-12 mb-4 opacity-20" />
                          <p>No assignments found matching your criteria</p>
                          {canEdit && (
                            <Button variant="outline" className="mt-4" onClick={() => navigate('/assignments/new')}>
                              Create Assignment
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Delete Assignment
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <span className="font-bold text-foreground">{assignmentToDelete?.title}</span>?
                <br />
                This acts cannot be undone and will remove all student submissions associated with this assignment.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>Delete Assignment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
};

export default AssignmentsList;
