import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchDepartments,
    setFilters,
    selectDepartments,
    selectDepartmentPagination,
    selectHRFilters,
    selectHRLoading,
} from '../../store/slices/hrPayrollSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Search, Building, User, RefreshCw, Loader2 } from 'lucide-react';

const DepartmentList = () => {
    const dispatch = useDispatch();
    const departments = useSelector(selectDepartments);
    const pagination = useSelector(selectDepartmentPagination);
    const currentFilters = useSelector(selectHRFilters);
    const loading = useSelector(selectHRLoading);

    // Local state for filters
    const [filters, setLocalFilters] = useState({
        search: '',
        page: 1,
        pageSize: 10
    });

    useEffect(() => {
        if (currentFilters) {
            setLocalFilters(prev => ({ ...prev, ...currentFilters }));
        }
    }, [currentFilters]);

    const loadDepartments = useCallback(() => {
        dispatch(fetchDepartments(filters));
    }, [dispatch, filters]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadDepartments();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [loadDepartments]);

    const handleFilterChange = (key, value) => {
        setLocalFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Departments"
                    description={`Overview of ${pagination?.count || 0} organization departments`}
                />

                <Card>
                    <CardHeader className="pb-3 border-b border-border">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <CardTitle>All Departments</CardTitle>
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search departments..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <Button variant="outline" size="icon" onClick={loadDepartments} title="Refresh">
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Department Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Department Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Department Head</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Designations</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {loading && (!departments || departments.length === 0) ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center">
                                                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                                                    <p>Loading departments...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : departments && departments.length > 0 ? (
                                        departments.map((dept) => (
                                            <tr key={dept.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-primary/10 rounded-lg mr-3">
                                                            <Building className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <span className="font-medium text-foreground">{dept.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-foreground">
                                                    <Badge variant="outline" className="font-mono">
                                                        {dept.code}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <User className="h-3 w-3 mr-1" />
                                                        {dept.head_name || 'Not Assigned'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    {dept.staff_count || 0}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Badge variant={dept.is_active ? 'success' : 'secondary'}>
                                                        {dept.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                                No departments found matching your criteria.
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
                                    disabled={departments && departments.length < filters.pageSize}
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

export default DepartmentList;
