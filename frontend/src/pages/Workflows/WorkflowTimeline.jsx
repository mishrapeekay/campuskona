import React from 'react';
import { CheckCircle2, XCircle, Clock, CircleDot, User, MessageSquare } from 'lucide-react';
import { cn } from '@/ui/lib/utils';
import { formatDate } from '../../utils/dateUtils';


const WorkflowTimeline = ({ logs }) => {
    if (!logs || logs.length === 0) return (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/20">
            <Clock className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No activity logs recorded yet.</p>
        </div>
    );

    return (
        <div className="relative pl-6 border-l-2 border-border space-y-8 ml-3 my-4">
            {logs.map((log, idx) => {
                const isLast = idx === logs.length - 1;

                let Icon = Clock;
                let iconColor = "text-muted-foreground bg-muted";
                let borderColor = "border-muted";

                if (log.action === 'APPROVE') {
                    Icon = CheckCircle2;
                    iconColor = "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
                    borderColor = "border-green-500/50";
                } else if (log.action === 'REJECT') {
                    Icon = XCircle;
                    iconColor = "text-destructive bg-destructive/10";
                    borderColor = "border-destructive/50";
                } else if (log.action === 'INITIATE') {
                    Icon = CircleDot;
                    iconColor = "text-primary bg-primary/10";
                    borderColor = "border-primary/50";
                }

                return (
                    <div key={log.id || idx} className="relative group">
                        <span
                            className={cn(
                                "absolute -left-[33px] top-1 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-background transition-colors",
                                iconColor
                            )}
                        >
                            <Icon className="h-4 w-4" />
                        </span>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 pb-1">
                            <div>
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    {log.action === 'INITIATE' ? 'Request Initiated' :
                                        log.action === 'APPROVE' ? 'Approved' :
                                            log.action === 'REJECT' ? 'Rejected' : log.action}

                                    {log.step_name && (
                                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                                            {log.step_name}
                                        </span>
                                    )}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    <span>{log.actor_name || 'System'}</span>
                                </div>
                            </div>
                            <time className="text-xs text-muted-foreground font-medium shrink-0 tabular-nums bg-muted/50 px-2 py-1 rounded">
                                {new Date(log.timestamp).toLocaleString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </time>
                        </div>

                        {log.remarks && (
                            <div className="mt-3 relative bg-muted/30 p-3 rounded-lg border border-border text-sm text-foreground/80 italic">
                                <MessageSquare className="absolute top-3 left-3 h-3 w-3 text-muted-foreground opacity-50" />
                                <p className="pl-5 text-xs text-muted-foreground leading-relaxed">"{log.remarks}"</p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default WorkflowTimeline;
