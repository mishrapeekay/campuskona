import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchRooms,
    fetchHostels,
    setFilters,
    selectRooms,
    selectHostels,
    selectRoomPagination,
    selectHostelFilters,
    selectHostelLoading,
} from '../../store/slices/hostelSlice';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { Search, Filter, RefreshCw, Home, Layers, Users, IndianRupee, Loader2 } from 'lucide-react';

const STATUS_VARIANTS = {
    AVAILABLE: 'success',
    FULL: 'destructive',
    MAINTENANCE: 'warning',
    CLOSED: 'secondary'
};

const RoomList = () => {
    const dispatch = useDispatch();
    const rooms = useSelector(selectRooms);
    const hostels = useSelector(selectHostels);
    const pagination = useSelector(selectRoomPagination);
    const currentFilters = useSelector(selectHostelFilters);
    const loading = useSelector(selectHostelLoading);

    // Local state for filters to avoid excessive dispatches
    const [filters, setLocalFilters] = useState({
        search: '',
        hostel: '',
        status: '',
        page: 1,
        pageSize: 10
    });

    useEffect(() => {
        dispatch(fetchHostels());
    }, [dispatch]);

    useEffect(() => {
        if (currentFilters) {
            setLocalFilters(prev => ({ ...prev, ...currentFilters }));
        }
    }, [currentFilters]);

    const loadRooms = useCallback(() => {
        dispatch(fetchRooms(filters));
    }, [dispatch, filters]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadRooms();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [loadRooms]);

    const handleFilterChange = (key, value) => {
        setLocalFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Room Management"
                    description={`Manage availability and pricing for ${pagination?.count || 0} rooms`}
                />

                <Card>
                    <CardHeader className="pb-3 border-b border-border">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <CardTitle>All Rooms</CardTitle>
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search room number..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <select
                                    value={filters.hostel}
                                    onChange={(e) => handleFilterChange('hostel', e.target.value)}
                                    className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Hostels</option>
                                    {hostels.map((h) => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">All Status</option>
                                    <option value="AVAILABLE">Available</option>
                                    <option value="FULL">Full</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                                <Button variant="outline" size="icon" onClick={loadRooms} title="Refresh">
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Room Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Capacity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Available</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Fee</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {loading && (!rooms || rooms.length === 0) ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center">
                                                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                                                    <p>Loading rooms...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : rooms && rooms.length > 0 ? (
                                        rooms.map((room) => (
                                            <tr key={room.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-primary/10 rounded-lg mr-3">
                                                            <Home className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-foreground">Room {room.room_number}</div>
                                                            <div className="text-xs text-muted-foreground flex items-center mt-0.5">
                                                                <Layers className="h-3 w-3 mr-1" />
                                                                {room.hostel_name} • Floor {room.floor}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-foreground">
                                                    <Badge variant="outline" className="font-normal">
                                                        {room.room_type_display || room.room_type}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Users className="h-3 w-3 mr-1" />
                                                        {room.capacity} Beds
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`font-semibold ${(room.available_beds ?? (room.capacity - room.occupied_beds)) > 0
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-destructive'
                                                        }`}>
                                                        {room.available_beds ?? (room.capacity - room.occupied_beds)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-foreground">
                                                    <div className="flex items-center">
                                                        <IndianRupee className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        {Number(room.monthly_fee).toLocaleString('en-IN')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Badge variant={STATUS_VARIANTS[room.status] || 'secondary'}>
                                                        {room.status_display || room.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                                No rooms found matching your criteria.
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
                                    disabled={rooms && rooms.length < filters.pageSize}
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

export default RoomList;
