import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchApplications,
    setApplicationFilters,
    selectApplications,
    selectApplicationFilters,
    selectApplicationPagination,
    selectAdmissionLoading,
} from '../../store/slices/admissionsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Search, Filter, RefreshCw, FileText, User, Phone, Eye, PenBox, Loader2 } from 'lucide-react';

const STATUS_VARIANTS = {
    DRAFT: 'secondary',
    SUBMITTED: 'primary',
    UNDER_REVIEW: 'warning',
    DOCUMENTS_PENDING: 'destructive',
    APPROVED: 'success',
    REJECTED: 'destructive',
    ENROLLED: 'success',
    WITHDRAWN: 'secondary',
};

const ApplicationList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const applications = useSelector(selectApplications);
    const pagination = useSelector(selectApplicationPagination);
    const currentFilters = useSelector(selectApplicationFilters);
    const loading = useSelector(selectAdmissionLoading);

    // Local state for filters
    const [filters, setLocalFilters] = useState({
        search: '',
        status: '',
        page: 1,
        pageSize: 10
    });

    useEffect(() => {
        if (currentFilters) {
            setLocalFilters(prev => ({ ...prev, ...currentFilters }));
        }
    }, [currentFilters]);

    const loadApplications = useCallback(() => {
        dispatch(fetchApplications(filters));
    }, [dispatch, filters]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadApplications();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [loadApplications]);

    const handleFilterChange = (key, value) => {
        setLocalFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Admission Applications"
                    description={`Manage ${pagination?.count || 0} student applications`}
                    action={
                        <Button onClick={() => navigate('/admissions/applications/new')}>
                            <FileText className="w-4 h-4 mr-2" />
                            New Application
                        </Button>
                    }
                />

                <Card>
                    <CardHeader className="pb-3 border-b border-border">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <CardTitle>Applications List</CardTitle>
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, app #..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Status</option>
                                    <option value="DRAFT">Draft</option>
                                    <option value="SUBMITTED">Submitted</option>
                                    <option value="UNDER_REVIEW">Under Review</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
                                    <option value="ENROLLED">Enrolled</option>
                                </select>
                                <Button variant="outline" size="icon" onClick={loadApplications} title="Refresh">
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">App No.</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Applied On</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {loading && (!applications || applications.length === 0) ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center">
                                                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                                                    <p>Loading applications...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : applications && applications.length > 0 ? (
                                        applications.map((app) => (
                                            <tr key={app.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className="font-mono text-sm font-semibold text-primary cursor-pointer hover:underline"
                                                        onClick={() => navigate(`/admissions/applications/${app.id}`)}
                                                    >
                                                        {app.application_number}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-primary/10 rounded-full mr-3">
                                                            <User className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-foreground">{app.student_name}</div>
                                                            <div className="text-xs text-muted-foreground">Father: {app.father_name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                    <Badge variant="outline">{app.class_name}</Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        {app.phone}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    {new Date(app.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={STATUS_VARIANTS[app.status] || 'secondary'}>
                                                        {app.status_display || app.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => navigate(`/admissions/applications/${app.id}`)}
                                                            title="View Details"
                                                        >
                                                            <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                        </Button>
                                                        {app.status === 'DRAFT' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => navigate(`/admissions/applications/${app.id}/edit`)}
                                                                title="Edit Application"
                                                            >
                                                                <PenBox className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground">
                                                No applications found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-muted/20">
                            <span className="text-sm text-muted-foreground">
                                Page {filters.page}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={filters.page === 1}
                                    onClick={() => handleFilterChange('page', filters.page - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={applications && applications.length < filters.pageSize}
                                    onClick={() => handleFilterChange('page', filters.page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AnimatedPage>
    );
};

export default ApplicationList;
