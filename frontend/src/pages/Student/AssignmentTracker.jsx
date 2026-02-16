import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    Filter,
    Search,
    AlertCircle,
    ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/ui/primitives/select';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';

const AssignmentTracker = () => {
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Data - In real implementation, fetch from Redux store via assignmentsSlice
    const assignments = [
        { id: 1, title: 'Algebra Equations', subject: 'Mathematics', dueDate: '2024-02-15', status: 'PENDING', progress: 0 },
        { id: 2, title: 'Project Physics: Motion', subject: 'Physics', dueDate: '2024-02-18', status: 'IN_PROGRESS', progress: 45 },
        { id: 3, title: 'Literature Essay', subject: 'English', dueDate: '2024-02-10', status: 'OVERDUE', progress: 0 },
        { id: 4, title: 'Chemical Reactions Report', subject: 'Chemistry', dueDate: '2024-02-20', status: 'COMPLETED', progress: 100 },
        { id: 5, title: 'History of India: Chapter 4', subject: 'History', dueDate: '2024-02-22', status: 'PENDING', progress: 0 },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'PENDING': return 'warning';
            case 'OVERDUE': return 'destructive';
            case 'IN_PROGRESS': return 'info';
            default: return 'secondary';
        }
    };

    const filteredAssignments = assignments.filter(assignment => {
        const matchesStatus = filterStatus === 'ALL' || assignment.status === filterStatus;
        const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.subject.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <AnimatedPage>
            <div className="space-y-6 max-w-5xl mx-auto p-6">
                <PageHeader
                    title="Assignment Tracker"
                    description="Keep track of your homework, projects, and submissions."
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Assignments', active: true },
                    ]}
                />

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search assignments..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Assignments</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="OVERDUE">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssignments.map((assignment) => (
                        <Card key={assignment.id} className="flex flex-col hover:border-primary/50 transition-colors cursor-pointer group">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="font-normal text-xs bg-muted/50">
                                        {assignment.subject}
                                    </Badge>
                                    <Badge variant={getStatusColor(assignment.status)} className="uppercase text-[10px]">
                                        {assignment.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">
                                    {assignment.title}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 text-xs mt-1">
                                    <Calendar className="h-3 w-3" />
                                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0 mt-auto">
                                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden mb-4">
                                    <div
                                        className={`h-full rounded-full transition-all ${assignment.status === 'COMPLETED' ? 'bg-emerald-500' :
                                                assignment.status === 'OVERDUE' ? 'bg-destructive' : 'bg-primary'
                                            }`}
                                        style={{ width: `${assignment.progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {assignment.progress}% Complete
                                    </span>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2 gap-1 group/btn">
                                        View Details <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredAssignments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/10">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No assignments found</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                            Try adjusting your filters or search query to find what you're looking for.
                        </p>
                        <Button variant="outline" className="mt-6" onClick={() => { setFilterStatus('ALL'); setSearchQuery(''); }}>
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
};

export default AssignmentTracker;
