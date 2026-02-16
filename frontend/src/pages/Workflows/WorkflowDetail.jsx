import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchWorkflowRequestById,
    approveWorkflowRequest,
    rejectWorkflowRequest,
    clearCurrentRequest
} from '../../store/slices/workflowsSlice';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Calendar,
    User,
    FileText,
    MessageSquare,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Textarea } from '@/ui/primitives/textarea';
import { Label } from '@/ui/primitives/label';
import { Skeleton } from '@/ui/primitives/skeleton';
import WorkflowTimeline from './WorkflowTimeline';

const WorkflowDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentRequest, error } = useSelector((state) => state.workflows);
    const { user } = useSelector((state) => state.auth);

    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchWorkflowRequestById(id));
        return () => dispatch(clearCurrentRequest());
    }, [dispatch, id]);

    const handleAction = async (action) => {
        if (action === 'REJECT' && !remarks.trim()) {
            return; // Add client side validation visual feedback
        }

        setIsSubmitting(true);
        try {
            if (action === 'APPROVE') {
                await dispatch(approveWorkflowRequest({ id, remarks })).unwrap();
            } else {
                await dispatch(rejectWorkflowRequest({ id, remarks })).unwrap();
            }
            navigate('/workflows');
        } catch (err) {
            console.error('Action failed:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (currentRequest.loading) {
        return (
            <div className="p-8 space-y-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-64 lg:col-span-2 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!currentRequest.data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-bold text-foreground">Request Not Found</h2>
                <p className="text-muted-foreground mt-2 mb-6">The requested workflow could not be found or you do not have permission to view it.</p>
                <Button variant="outline" onClick={() => navigate('/workflows')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Workflows
                </Button>
            </div>
        );
    }

    const request = currentRequest.data;
    const canAction = request.status === 'IN_PROGRESS';

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'destructive';
            case 'IN_PROGRESS': return 'warning';
            default: return 'secondary';
        }
    };

    return (
        <AnimatedPage>
            <div className="space-y-6 max-w-7xl mx-auto">
                <PageHeader
                    title={request.workflow_config_name}
                    description={`Request #${request.id} • Submitted on ${new Date(request.created_at).toLocaleDateString()}`}
                    breadcrumbs={[
                        { label: 'Workflows', href: '/workflows' },
                        { label: `Request #${request.id}`, active: true },
                    ]}
                    action={
                        <Badge variant={getStatusColor(request.status)} className="px-3 py-1 text-sm font-medium uppercase tracking-wide">
                            {request.status.replace('_', ' ')}
                        </Badge>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Request Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-xs uppercase font-semibold">Initiator</p>
                                        <div className="flex items-center gap-2 font-medium">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <User className="h-4 w-4" />
                                            </div>
                                            {request.initiator_name}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-xs uppercase font-semibold">Date</p>
                                        <div className="flex items-center gap-2 font-medium">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            {new Date(request.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-muted-foreground text-xs uppercase font-semibold">Context Data</p>
                                    <div className="rounded-md border bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
                                        <pre>{JSON.stringify(request.context_data, null, 2)}</pre>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {canAction && (
                            <Card className="border-l-4 border-l-primary shadow-md bg-gradient-to-br from-background via-background to-primary/5">
                                <CardHeader>
                                    <CardTitle className="text-lg">Your Action Required</CardTitle>
                                    <CardDescription>
                                        Review the request details above and provide your decision.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-background border rounded-lg p-3 text-sm flex items-center justify-between">
                                        <span className="text-muted-foreground">Current Step:</span>
                                        <span className="font-semibold text-foreground px-2 py-1 bg-secondary rounded-md">
                                            {request.current_step_name}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="remarks">Remarks (Optional for Approval)</Label>
                                            <span className="text-xs text-muted-foreground italic">
                                                Required for rejection
                                            </span>
                                        </div>
                                        <Textarea
                                            id="remarks"
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            className="min-h-[100px] resize-none"
                                            placeholder="Add notes explaining your decision..."
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                                            onClick={() => handleAction('APPROVE')}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                            Approve Request
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="flex-1"
                                            onClick={() => handleAction('REJECT')}
                                            disabled={isSubmitting || !remarks.trim()}
                                        >
                                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                                            Reject Request
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="text-lg">Activity Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 pr-4">
                                <WorkflowTimeline logs={request.action_logs} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default WorkflowDetail;
