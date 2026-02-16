import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchPayrollRuns,
    setFilters,
    selectPayrollRuns,
    selectPayrollPagination,
    selectHRFilters,
    selectHRLoading,
} from '../../store/slices/hrPayrollSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Search, Filter, RefreshCw, Plus, Calendar, IndianRupee, FileText, Loader2 } from 'lucide-react';

const STATUS_VARIANTS = {
    DRAFT: 'secondary',
    PROCESSING: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'destructive'
};

const MONTHS = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const PayrollList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const payrollRuns = useSelector(selectPayrollRuns);
    const pagination = useSelector(selectPayrollPagination);
    const currentFilters = useSelector(selectHRFilters);
    const loading = useSelector(selectHRLoading);

    // Local state for filters
    const [filters, setLocalFilters] = useState({
        search: '',
        status: '',
        year: '',
        page: 1,
        pageSize: 10
    });

    useEffect(() => {
        if (currentFilters) {
            setLocalFilters(prev => ({ ...prev, ...currentFilters }));
        }
    }, [currentFilters]);

    const loadPayrollRuns = useCallback(() => {
        dispatch(fetchPayrollRuns(filters));
    }, [dispatch, filters]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadPayrollRuns();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [loadPayrollRuns]);

    const handleFilterChange = (key, value) => {
        setLocalFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const formatCurrency = (amt) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amt || 0);
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Payroll Processing"
                    description={`Manage payroll for ${pagination?.count || 0} runs`}
                    action={
                        <Button onClick={() => navigate('/hr/payroll/new')}>
                            <Plus className="w-4 h-4 mr-2" />
                            New Payroll Run
                        </Button>
                    }
                />

                <Card>
                    <CardHeader className="pb-3 border-b border-border">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <CardTitle>Payroll History</CardTitle>
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search runs..."
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
                                    <option value="PROCESSING">Processing</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                                <select
                                    value={filters.year}
                                    onChange={(e) => handleFilterChange('year', e.target.value)}
                                    className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Years</option>
                                    {Array.from({ length: 5 }, (_, i) => {
                                        const y = new Date().getFullYear() - i;
                                        return <option key={y} value={y}>{y}</option>;
                                    })}
                                </select>
                                <Button variant="outline" size="icon" onClick={loadPayrollRuns} title="Refresh">
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Period</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Run Info</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Gross</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Deductions</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Net Pay</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {loading && (!payrollRuns || payrollRuns.length === 0) ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center">
                                                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                                                    <p>Loading payroll runs...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : payrollRuns && payrollRuns.length > 0 ? (
                                        payrollRuns.map((run) => (
                                            <tr key={run.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-primary/10 rounded-lg mr-3">
                                                            <Calendar className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <span className="font-semibold text-foreground">
                                                            {MONTHS[run.month]} {run.year}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-foreground">
                                                    <div className="text-sm font-medium">{run.run_date}</div>
                                                    <div className="text-xs text-muted-foreground">{run.payslip_count} Staff processed</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-foreground font-medium">
                                                    {formatCurrency(run.total_gross)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-destructive font-medium">
                                                    -{formatCurrency(run.total_deductions)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-emerald-600 dark:text-emerald-400 font-bold">
                                                    {formatCurrency(run.total_net)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={STATUS_VARIANTS[run.status] || 'secondary'}>
                                                        {run.status_display || run.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/hr/payroll/${run.id}/payslips`)}
                                                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                                                    >
                                                        <FileText className="w-4 h-4 mr-1" />
                                                        Payslips
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-muted-foreground">
                                                No payroll runs found matching your criteria.
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
                                    disabled={payrollRuns && payrollRuns.length < filters.pageSize}
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

export default PayrollList;
