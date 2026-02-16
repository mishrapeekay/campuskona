import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchGeneratedReports,
    selectGeneratedReports,
    selectGeneratedPagination,
    selectReportFilters,
    selectReportLoading,
} from '../../store/slices/reportsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { FileText, Download, Filter, RefreshCw, Loader2, Search } from 'lucide-react';
import showToast from '../../utils/toast';

const STATUS_VARIANTS = {
    PENDING: 'warning',
    GENERATING: 'default',
    COMPLETED: 'success',
    FAILED: 'destructive'
};

const GeneratedReportList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const reports = useSelector(selectGeneratedReports);
    const pagination = useSelector(selectGeneratedPagination);
    const currentFilters = useSelector(selectReportFilters);
    const loading = useSelector(selectReportLoading);

    // Local state for filters to avoid excessive dispatches
    const [filters, setFilters] = useState({
        search: '',
        module: '',
        status: '',
        page: 1,
        pageSize: 10
    });

    // Update local state when redux state changes
    useEffect(() => {
        if (currentFilters) {
            setFilters(prev => ({ ...prev, ...currentFilters }));
        }
    }, [currentFilters]);

    const loadReports = useCallback(() => {
        dispatch(fetchGeneratedReports(filters));
    }, [dispatch, filters]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadReports();
        }, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [loadReports]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handleDownload = (report) => {
        if (report.file) {
            window.open(report.file, '_blank');
        } else {
            showToast.error('File not available for download');
        }
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Generated Reports"
                    description={`View and download your generated reports. Total: ${pagination?.count || 0}`}
                    action={
                        <Button onClick={() => navigate('/reports/builder')}>
                            <FileText className="w-4 h-4 mr-2" />
                            Build New Report
                        </Button>
                    }
                />

                <Card>
                    <CardHeader className="pb-3 border-b border-border">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <CardTitle>Reports History</CardTitle>
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search reports..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <select
                                    value={filters.module}
                                    onChange={(e) => handleFilterChange('module', e.target.value)}
                                    className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Modules</option>
                                    <option value="STUDENTS">Students</option>
                                    <option value="ACADEMICS">Academics</option>
                                    <option value="ATTENDANCE">Attendance</option>
                                    <option value="FEE">Fee</option>
                                    <option value="EXAM">Exam</option>
                                    <option value="LIBRARY">Library</option>
                                    <option value="TRANSPORT">Transport</option>
                                    <option value="HOSTEL">Hostel</option>
                                    <option value="HR_PAYROLL">HR & Payroll</option>
                                    <option value="ADMISSIONS">Admissions</option>
                                </select>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Status</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="GENERATING">Generating</option>
                                    <option value="FAILED">Failed</option>
                                </select>
                                <Button variant="outline" size="icon" onClick={loadReports} title="Refresh">
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Report Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Module</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Format</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Generated</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {loading && (!reports || reports.length === 0) ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center">
                                                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                                                    <p>Loading reports...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : reports && reports.length > 0 ? (
                                        reports.map((report) => (
                                            <tr key={report.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-foreground">{report.name}</div>
                                                    <div className="text-xs text-muted-foreground">By: {report.generated_by_name}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-foreground">{report.module_display || report.module}</td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="text-xs font-normal">
                                                        {report.format_display || report.output_format}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    {report.file_size ? (
                                                        report.file_size > 1024 * 1024
                                                            ? `${(report.file_size / (1024 * 1024)).toFixed(1)} MB`
                                                            : `${(report.file_size / 1024).toFixed(0)} KB`
                                                    ) : '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={STATUS_VARIANTS[report.status] || 'secondary'}>
                                                        {report.status_display || report.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    {report.generated_at ? new Date(report.generated_at).toLocaleString() : '—'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {report.status === 'COMPLETED' && report.file && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-primary hover:text-primary/80 hover:bg-primary/10"
                                                            onClick={() => handleDownload(report)}
                                                        >
                                                            <Download className="w-4 h-4 mr-1" />
                                                            Download
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground">
                                                No generated reports found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination controls could be added here if needed, relying on infinite scroll or simple Next/Prev buttons */}
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
                                    disabled={reports && reports.length < filters.pageSize}
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

export default GeneratedReportList;
