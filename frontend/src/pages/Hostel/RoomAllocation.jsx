import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllocations,
    setFilters,
    selectAllocations,
    selectHostelFilters,
    selectHostelLoading,
} from '../../store/slices/hostelSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Search, Filter, RefreshCw, User, Home, Calendar, Clock, Loader2, BedDouble } from 'lucide-react';

const RoomAllocation = () => {
    const dispatch = useDispatch();
    const allocations = useSelector(selectAllocations);
    const currentFilters = useSelector(selectHostelFilters);
    const loading = useSelector(selectHostelLoading);

    // Local state for filters to avoid excessive dispatches
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

    const loadAllocations = useCallback(() => {
        dispatch(fetchAllocations({ ...filters, is_active: true }));
    }, [dispatch, filters]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadAllocations();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [loadAllocations]);

    const handleFilterChange = (key, value) => {
        setLocalFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Room Allocations"
                    description="View and manage student room assignments"
                    action={
                        <Button variant="outline" size="icon" onClick={loadAllocations} title="Refresh">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    }
                />

                <Card>
                    <CardHeader className="pb-3 border-b border-border">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <CardTitle>Allocation History</CardTitle>
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search by student or room..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Room Info</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Allocation Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Allocated By</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {loading && (!allocations || allocations.length === 0) ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center">
                                                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                                                    <p>Loading allocations...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : allocations && allocations.length > 0 ? (
                                        allocations.map((row) => (
                                            <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-primary/10 rounded-full mr-3">
                                                            <User className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-foreground">{row.student_name}</div>
                                                            <div className="text-xs text-muted-foreground">{row.admission_number}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-sm text-foreground">
                                                        <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        Room {row.room_number}
                                                    </div>
                                                    <div className="flex items-center text-xs text-muted-foreground mt-1 ml-6">
                                                        <BedDouble className="h-3 w-3 mr-1" />
                                                        Bed {row.bed_number}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        {row.allocated_date ? new Date(row.allocated_date).toLocaleDateString() : '—'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={row.is_active ? 'success' : 'secondary'}>
                                                        {row.is_active ? 'Active' : 'Vacated'}
                                                    </Badge>
                                                    {!row.is_active && row.vacated_date && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Vacated: {new Date(row.vacated_date).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                                                    {row.allocated_by_name || 'Admin'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                                No room allocations found.
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
                                    disabled={allocations && allocations.length < filters.pageSize}
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

export default RoomAllocation;
