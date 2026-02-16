import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchStaff,
    deleteStaff,
    assignSubjects,
    setFilters,
    resetFilters,
    selectStaff,
    selectStaffFilters,
    selectStaffPagination,
    selectStaffLoading,
} from '../../store/slices/staffSlice';
import { getSubjects } from '../../api/academics';
import showToast from '../../utils/toast';

import { PageHeader } from '@/ui/composites';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/ui/primitives/dialog';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Skeleton } from '@/ui/primitives/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/primitives/avatar';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import {
    Search,
    Filter,
    Plus,
    Download,
    Upload,
    MoreHorizontal,
    Trash2,
    Eye,
    Pencil,
    GraduationCap,
    Users,
    Briefcase,
    Building2,
    Mail,
    Phone,
    Check,
    X,
    AlertTriangle,
    Loader2
} from 'lucide-react';

const StaffList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const staff = useSelector(selectStaff);
    const filters = useSelector(selectStaffFilters);
    const pagination = useSelector(selectStaffPagination);
    const loading = useSelector(selectStaffLoading);

    const [selectedStaff, setSelectedStaff] = useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
    const [subjectsLoading, setSubjectsLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        dispatch(fetchStaff(filters));
    }, [dispatch, filters]);

    const handleFilterChange = (key, value) => {
        dispatch(setFilters({ ...filters, [key]: value, page: 1 }));
    };

    const handleClearFilters = () => {
        dispatch(resetFilters());
    };

    const handlePageChange = (newPage) => {
        dispatch(setFilters({ ...filters, page: newPage }));
    };

    const handleSelectRow = (staffId) => {
        if (selectedStaff.includes(staffId)) {
            setSelectedStaff(selectedStaff.filter(id => id !== staffId));
        } else {
            setSelectedStaff([...selectedStaff, staffId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedStaff.length === staff.length) {
            setSelectedStaff([]);
        } else {
            setSelectedStaff(staff.map(s => s.id));
        }
    };

    const handleDeleteClick = (staffMember) => {
        setStaffToDelete(staffMember);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (staffToDelete) {
            await dispatch(deleteStaff(staffToDelete.id));
            setDeleteModalOpen(false);
            setStaffToDelete(null);
            dispatch(fetchStaff(filters));
            showToast.success('Staff member deleted successfully');
        }
    };

    const handleAssignSubjects = async () => {
        setAssignModalOpen(true);
        setSelectedSubjectIds([]);
        setSubjectsLoading(true);
        try {
            const response = await getSubjects({ is_active: true });
            setAvailableSubjects(response.data.results || response.data || []);
        } catch (error) {
            showToast.error('Failed to load subjects');
            setAssignModalOpen(false);
        } finally {
            setSubjectsLoading(false);
        }
    };

    const handleAssignConfirm = async () => {
        if (selectedSubjectIds.length === 0) {
            showToast.warning('Please select at least one subject');
            return;
        }

        setAssigning(true);
        try {
            const promises = selectedStaff.map((staffId) =>
                dispatch(assignSubjects({ staffId: staffId, subjects: selectedSubjectIds })).unwrap()
            );
            await Promise.all(promises);
            showToast.success(`Subjects assigned to ${selectedStaff.length} staff member(s)`);
            setAssignModalOpen(false);
            setSelectedStaff([]);
            dispatch(fetchStaff(filters));
        } catch (error) {
            showToast.error('Failed to assign subjects');
        } finally {
            setAssigning(false);
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'ACTIVE': return 'success';
            case 'ON_LEAVE': return 'warning';
            case 'SUSPENDED': return 'destructive';
            case 'TERMINATED': return 'destructive';
            default: return 'secondary';
        }
    };

    const getEmploymentTypeVariant = (type) => {
        switch (type) {
            case 'PERMANENT': return 'outline';
            case 'CONTRACT': return 'secondary';
            case 'TEMPORARY': return 'warning';
            default: return 'outline';
        }
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Staff Directory"
                    description="Manage school faculty and staff members"
                    breadcrumbs={[
                        { label: 'Home', href: '/' },
                        { label: 'Staff', active: true },
                    ]}
                    action={
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => navigate('/staff/departments')}>
                                <Building2 className="w-4 h-4 mr-2" />
                                Departments
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/staff/bulk-upload')}>
                                <Upload className="w-4 h-4 mr-2" />
                                Bulk Upload
                            </Button>
                            <Button onClick={() => navigate('/staff/new')}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Staff
                            </Button>
                        </div>
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
                                        placeholder="Search by name or ID..."
                                        value={filters.search || ''}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                                    <select
                                        value={filters.department || ''}
                                        onChange={(e) => handleFilterChange('department', e.target.value)}
                                        className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[140px]"
                                    >
                                        <option value="">All Departments</option>
                                        <option value="Academic">Academic</option>
                                        <option value="Administration">Administration</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Library">Library</option>
                                        <option value="Transport">Transport</option>
                                    </select>
                                    <select
                                        value={filters.status || ''}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[120px]"
                                    >
                                        <option value="">All Status</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="ON_LEAVE">On Leave</option>
                                        <option value="SUSPENDED">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            {selectedStaff.length > 0 && (
                                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                                    <span className="text-sm font-medium text-primary whitespace-nowrap">
                                        {selectedStaff.length} selected
                                    </span>
                                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleAssignSubjects}>
                                        Assign Subjects
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => setSelectedStaff([])}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-medium">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-10">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                                checked={staff.length > 0 && selectedStaff.length === staff.length}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left">Staff Member</th>
                                        <th className="px-4 py-3 text-left">Designation</th>
                                        <th className="px-4 py-3 text-left">Department</th>
                                        <th className="px-4 py-3 text-left">Contact</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={7} className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <Skeleton className="h-10 w-10 rounded-full" />
                                                        <div className="space-y-2 flex-1">
                                                            <Skeleton className="h-4 w-[200px]" />
                                                            <Skeleton className="h-3 w-[150px]" />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : staff.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                                                    <p>No staff members found matching your search</p>
                                                    <Button variant="link" onClick={handleClearFilters} className="mt-2">
                                                        Clear filters
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        staff.map((member) => (
                                            <tr key={member.id} className={`hover:bg-muted/30 transition-colors group ${selectedStaff.includes(member.id) ? 'bg-primary/5' : ''}`}>
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                                        checked={selectedStaff.includes(member.id)}
                                                        onChange={() => handleSelectRow(member.id)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={member.photo} alt={member.full_name} />
                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                {member.full_name?.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium text-foreground">{member.full_name}</p>
                                                            <p className="text-xs text-muted-foreground font-mono">{member.employee_id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-muted-foreground">
                                                    <Badge variant={getEmploymentTypeVariant(member.employment_type)} className="capitalize font-normal mr-2">
                                                        {member.employment_type?.toLowerCase().replace('_', ' ')}
                                                    </Badge>
                                                    <span className="text-xs font-medium block mt-1 capitalize">{member.designation?.replace(/_/g, ' ').toLowerCase()}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-3 h-3 text-muted-foreground" />
                                                        <span>{member.department}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {member.email}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {member.phone}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge variant={getStatusVariant(member.status)} className="uppercase text-[10px]">
                                                        {member.status?.replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/staff/${member.id}`)} title="View">
                                                            <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => navigate(`/staff/${member.id}/edit`)} title="Edit">
                                                            <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(member)} title="Delete">
                                                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                            <span className="text-sm text-muted-foreground">
                                Showing {staff.length} of {pagination.count} entries
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pagination.previous}
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

                {/* Delete Warning Dialog */}
                <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="w-5 h-5" />
                                Terminate Staff Member
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <span className="font-bold text-foreground">{staffToDelete?.full_name}</span>?
                                <br />
                                This action is permanent and cannot be undone. All associated records may be affected.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete Record</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Assign Subjects Modal */}
                <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Assign Subjects</DialogTitle>
                            <DialogDescription>
                                Assign subjects to <span className="font-medium text-foreground">{selectedStaff.length} selected staff member{selectedStaff.length !== 1 ? 's' : ''}</span>.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto space-y-2">
                            {subjectsLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            ) : availableSubjects.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No active subjects found.</p>
                            ) : (
                                availableSubjects.map(subject => (
                                    <div key={subject.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`subject-${subject.id}`}
                                            checked={selectedSubjectIds.includes(subject.id)}
                                            onChange={() => {
                                                if (selectedSubjectIds.includes(subject.id)) {
                                                    setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== subject.id));
                                                } else {
                                                    setSelectedSubjectIds([...selectedSubjectIds, subject.id]);
                                                }
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor={`subject-${subject.id}`} className="text-sm cursor-pointer flex-1">
                                            {subject.name} <span className="text-muted-foreground text-xs">({subject.code})</span>
                                        </Label>
                                    </div>
                                ))
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleAssignConfirm} disabled={assigning || selectedSubjectIds.length === 0}>
                                {assigning ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Assigning...
                                    </>
                                ) : (
                                    'Confirm Assignment'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedPage>
    );
};

export default StaffList;
