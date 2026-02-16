import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchStudentLeaves,
    approveLeave,
    rejectLeave,
} from '../../store/slices/attendanceSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/primitives/avatar';
import { getMediaUrl } from '@/utils/mediaUrl';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/ui/primitives/dialog';
import { Textarea } from '@/ui/primitives/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/primitives/select';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    AlertTriangle,
    Check,
    X,
    Filter,
    Loader2
} from 'lucide-react';
import showToast from '../../utils/toast';

const STATUS_BADGES = {
    PENDING: { variant: 'warning', icon: Clock, label: 'Pending Approval' },
    APPROVED: { variant: 'success', icon: CheckCircle, label: 'Approved' },
    REJECTED: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
    CANCELLED: { variant: 'secondary', icon: XCircle, label: 'Cancelled' },
};

const LeaveManagement = () => {
    const dispatch = useDispatch();
    const { leaves, loading } = useSelector((state) => state.attendance);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [approvalAction, setApprovalAction] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadLeaves();
    }, [statusFilter]);

    const loadLeaves = () => {
        const params = statusFilter ? { status: statusFilter } : {};
        dispatch(fetchStudentLeaves(params));
    };

    const handleApprove = (leave) => {
        setSelectedLeave(leave);
        setApprovalAction('approve');
        setShowApprovalModal(true);
    };

    const handleReject = (leave) => {
        setSelectedLeave(leave);
        setApprovalAction('reject');
        setShowApprovalModal(true);
    };

    const handleSubmitApproval = async () => {
        if (!selectedLeave) return;
        setSubmitting(true);
        try {
            if (approvalAction === 'approve') {
                await dispatch(approveLeave({
                    id: selectedLeave.id,
                    type: 'student',
                    remarks
                })).unwrap();
                showToast.success('Leave approved successfully');
            } else {
                await dispatch(rejectLeave({
                    id: selectedLeave.id,
                    type: 'student',
                    remarks
                })).unwrap();
                showToast.success('Leave rejected successfully');
            }

            setShowApprovalModal(false);
            setRemarks('');
            setSelectedLeave(null);
            loadLeaves();
        } catch (error) {
            showToast.error('Failed to process leave: ' + (error.message || 'Unknown error'));
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = STATUS_BADGES[status] || STATUS_BADGES.PENDING;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="gap-1.5 pl-1.5 pr-2.5 py-0.5 uppercase text-[10px] font-semibold tracking-wider">
                <Icon className="w-3 h-3" />
                {status}
            </Badge>
        );
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Leave Management"
                    description="Review and approve student leave applications"
                    breadcrumbs={[
                        { label: 'Attendance', href: '/attendance' },
                        { label: 'Leaves', active: true }
                    ]}
                />

                <Card>
                    <CardHeader className="pb-4 border-b border-border">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Applications
                                </CardTitle>
                                <CardDescription>Manage leave requests from students.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Filter className="w-4 h-4 text-muted-foreground mr-1" />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pending Approval</SelectItem>
                                        <SelectItem value="APPROVED">Approved</SelectItem>
                                        <SelectItem value="REJECTED">Rejected</SelectItem>
                                        <SelectItem value="ALL">All Applications</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-medium">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Student</th>
                                        <th className="px-6 py-3 text-left">Leave Type</th>
                                        <th className="px-6 py-3 text-left">Duration</th>
                                        <th className="px-6 py-3 text-left">Reason</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                        {statusFilter === 'PENDING' && (
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        [...Array(3)].map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={statusFilter === 'PENDING' ? 6 : 5} className="px-6 py-4 text-center">
                                                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Loading...
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : leaves?.length === 0 ? (
                                        <tr>
                                            <td colSpan={statusFilter === 'PENDING' ? 6 : 5} className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center">
                                                    <CheckCircle className="w-12 h-12 mb-4 opacity-20 text-emerald-500" />
                                                    <p>No {statusFilter === 'ALL' ? '' : statusFilter.toLowerCase()} leave applications found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        leaves?.map((leave) => (
                                            <tr key={leave.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border border-border">
                                                            <AvatarImage src={getMediaUrl(leave.student?.photo)} />
                                                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                                                                {leave.student_name?.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium text-foreground">{leave.student_name}</div>
                                                            <div className="text-xs text-muted-foreground">{leave.student?.admission_number}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="capitalize font-normal">
                                                        {leave.leave_type?.toLowerCase().replace('_', ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium">
                                                        {new Date(leave.start_date).toLocaleDateString()}
                                                        <span className="text-muted-foreground text-xs mx-1">to</span>
                                                        {new Date(leave.end_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {leave.number_of_days} day{leave.number_of_days !== 1 ? 's' : ''}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-muted-foreground max-w-xs truncate" title={leave.reason}>
                                                        {leave.reason}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(leave.status)}
                                                </td>
                                                {statusFilter === 'PENDING' && (
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200" onClick={() => handleApprove(leave)} title="Approve">
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => handleReject(leave)} title="Reject">
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Approval Modal */}
                <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className={`flex items-center gap-2 ${approvalAction === 'approve' ? 'text-emerald-600' : 'text-destructive'}`}>
                                {approvalAction === 'approve' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                {approvalAction === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
                            </DialogTitle>
                            <DialogDescription>
                                {approvalAction === 'approve'
                                    ? `Are you sure you want to approve leave for ${selectedLeave?.student_name}?`
                                    : `Are you sure you want to reject leave for ${selectedLeave?.student_name}?`
                                }
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="bg-muted/30 p-3 rounded-md text-sm space-y-2 border border-border/50">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Reason:</span>
                                    <span className="font-medium text-foreground">{selectedLeave?.reason}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Duration:</span>
                                    <span className="font-medium text-foreground">{selectedLeave?.number_of_days} Days</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Remarks <span className="text-muted-foreground font-normal">(Optional)</span>
                                </label>
                                <Textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder={approvalAction === 'approve' ? "Add approval notes..." : "Reason for rejection..."}
                                    className="resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowApprovalModal(false)}>Cancel</Button>
                            <Button
                                variant={approvalAction === 'approve' ? 'default' : 'destructive'}
                                onClick={handleSubmitApproval}
                                disabled={submitting}
                                className={approvalAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    approvalAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedPage>
    );
};

export default LeaveManagement;
