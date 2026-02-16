import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchHostels,
    fetchHostelDashboardStats,
    selectHostels,
    selectHostelDashboardStats,
    selectHostelLoading,
} from '../../store/slices/hostelSlice';
import { Building, Home, Users, AlertTriangle, Layers, DoorOpen, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Skeleton } from '@/ui/primitives/skeleton';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';

const HostelDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const hostels = useSelector(selectHostels);
    const stats = useSelector(selectHostelDashboardStats);
    const loading = useSelector(selectHostelLoading);

    useEffect(() => {
        dispatch(fetchHostels());
        dispatch(fetchHostelDashboardStats());
    }, [dispatch]);

    if (loading && !stats) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </div>
                    <Skeleton className="h-64" />
                </div>
            </AnimatedPage>
        );
    }

    const statsCards = [
        { title: 'Total Hostels', value: stats?.total_hostels || hostels.length, icon: Building, color: 'blue' },
        { title: 'Total Rooms', value: stats?.total_rooms || 0, icon: Home, color: 'emerald' },
        { title: 'Occupancy', value: `${stats?.occupancy_rate || 0}%`, icon: Users, color: 'violet' },
        { title: 'Open Complaints', value: stats?.open_complaints || 0, icon: AlertTriangle, color: 'rose' },
    ];

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Hostel Management"
                    description="Manage hostels, rooms, and student allocations"
                    action={
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => navigate('/hostel/rooms')}>
                                Manage Rooms
                            </Button>
                            <Button onClick={() => navigate('/hostel/allocations')}>
                                Allocations
                            </Button>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsCards.map((card, idx) => {
                        const Icon = card.icon;
                        const colorClasses = {
                            blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                            emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                            violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
                            rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                        };

                        return (
                            <Card key={idx}>
                                <CardContent className="flex items-center p-6">
                                    <div className={`p-4 rounded-full mr-4 ${colorClasses[card.color]}`}>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground font-medium">{card.title}</p>
                                        <p className="text-3xl font-bold text-foreground">{card.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Hostel List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hostels Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {hostels.map((hostel) => (
                                <div key={hostel.id} className="border border-border rounded-lg p-5 hover:bg-muted/50 transition-colors bg-card shadow-sm hover:shadow-md">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-lg text-foreground">{hostel.name}</h4>
                                            <p className="text-sm text-muted-foreground">{hostel.hostel_type_display || hostel.hostel_type}</p>
                                        </div>
                                        <Badge variant={hostel.is_active ? 'success' : 'secondary'}>
                                            {hostel.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center text-muted-foreground">
                                            <Layers className="w-4 h-4 mr-2 text-primary" />
                                            <span>Floors: <span className="font-medium text-foreground">{hostel.total_floors}</span></span>
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <Home className="w-4 h-4 mr-2 text-primary" />
                                            <span>Capacity: <span className="font-medium text-foreground">{hostel.total_capacity || 'N/A'}</span></span>
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <DoorOpen className="w-4 h-4 mr-2 text-primary" />
                                            <span>Occupied: <span className="font-medium text-foreground">{hostel.total_occupied || 0}</span></span>
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <User className="w-4 h-4 mr-2 text-primary" />
                                            <span>Warden: <span className="font-medium text-foreground">{hostel.warden_name || 'N/A'}</span></span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {hostels.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    <Building className="w-12 h-12 mx-auto opacity-20 mb-3" />
                                    <p>No hostels found.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AnimatedPage>
    );
};

export default HostelDashboard;
