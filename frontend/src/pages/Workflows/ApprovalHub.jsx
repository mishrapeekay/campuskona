import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    fetchWorkflowRequests,
    clearError
} from '../../store/slices/workflowsSlice';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Card, CardContent } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/ui/primitives/select';
import { Skeleton } from '@/ui/primitives/skeleton';
import {
    CheckCircle2,
    XCircle,
    Clock,
    ChevronRight,
    FileText,
    User,
    Calendar,
    AlertCircle,
    Filter
} from 'lucide-react';

const ApprovalHub = () => {
    const dispatch = useDispatch();
    const { requests, error, loading } = useSelector((state) => state.workflows);
    const [filterStatus, setFilterStatus] = useState('IN_PROGRESS');

    useEffect(() => {
        dispatch(fetchWorkflowRequests({ status: filterStatus }));
    }, [dispatch, filterStatus]);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'APPROVED':
                return { color: 'success', icon: CheckCircle2, label: 'Approved' };
            case 'REJECTED':
                return { color: 'destructive', icon: XCircle, label: 'Rejected' };
            case 'IN_PROGRESS':
                return { color: 'warning', icon: Clock, label: 'In Progress' };
            case 'PENDING':
                return { color: 'secondary', icon: Clock, label: 'Pending' };
            default:
                return { color: 'outline', icon: FileText, label: status?.replace('_', ' ') || 'Unknown' };
        }
    };

    return (
        <AnimatedPage>
            <div className="space-y-6 max-w-5xl mx-auto">
                <PageHeader
                    title="Approvals Hub"
                    description="Manage and track all pending workflow and approval requests."
                    breadcrumbs={[
                        { label: 'Workflows', href: '/workflows' },
                        { label: 'Approvals', active: true },
                    ]}
                    action={
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-background border border-input rounded-md px-3 py-1.5 min-w-[200px]">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <select // Using native select for simplicity inside the custom wrapper or could use Select primitive
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="bg-transparent border-none text-sm focus:ring-0 w-full p-0"
                                >
                                    <option value="IN_PROGRESS">Pending Reviews</option>
                                    <option value="APPROVED">Approved History</option>
                                    <option value="REJECTED">Rejected History</option>
                                    <option value="PENDING">Drafts</option>
                                </select>
                            </div>
                        </div>
                    }
                />

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg flex items-center gap-3">
                        <AlertCircle className="h-5 w-5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-1/3" />
                                            <Skeleton className="h-3 w-1/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : !requests.data || !Array.isArray(requests.data) || requests.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                <div className="bg-muted p-4 rounded-full mb-4">
                                    <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">All caught up!</h3>
                                <p className="text-muted-foreground max-w-sm mt-2">
                                    No {filterStatus === 'IN_PROGRESS' ? 'pending' : filterStatus.toLowerCase()} requests found at the moment.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {requests.data.map((request) => {
                                    const statusConfig = getStatusConfig(request.status);
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <Link
                                            key={request.id}
                                            to={`/workflows/${request.id}`}
                                            className="block hover:bg-muted/40 transition-colors group"
                                        >
                                            <div className="p-5 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${request.priority === 'CRITICAL' ? 'bg-destructive/10 text-destructive' :
                                                            request.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                                                                'bg-primary/10 text-primary'
                                                        }`}>
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-medium text-foreground truncate">
                                                            {request.workflow_config_name || `Request #${request.id}`}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1.5">
                                                                <User className="w-3.5 h-3.5" />
                                                                {request.initiator_name || 'Unknown User'}
                                                            </span>
                                                            <span className="text-border">•</span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {new Date(request.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 shrink-0">
                                                    <div className="text-right hidden sm:block">
                                                        <Badge variant={statusConfig.color} className="gap-1 mb-1 justify-end">
                                                            <StatusIcon className="w-3 h-3" />
                                                            {statusConfig.label}
                                                        </Badge>
                                                        <p className="text-xs text-muted-foreground font-medium">
                                                            {request.current_step_name || 'Completed'}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AnimatedPage>
    );
};

export default ApprovalHub;
