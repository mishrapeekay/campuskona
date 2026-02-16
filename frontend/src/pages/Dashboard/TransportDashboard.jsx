import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    TruckIcon,
    MapIcon,
    UserGroupIcon,
    MapPinIcon,
    ClockIcon,
    WrenchScrewdriverIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    CheckCircleIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';
import { StatsCard } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { getDashboardStats, getVehicles, getRoutes, getAllocations } from '../../api/transport';

const TransportDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [recentAllocations, setRecentAllocations] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch dashboard stats
                const statsResponse = await getDashboardStats();
                setStats(statsResponse.data);

                // Fetch vehicles
                try {
                    const vehiclesResponse = await getVehicles({ limit: 10 });
                    setVehicles(vehiclesResponse.data?.results || vehiclesResponse.data || []);
                } catch (e) {
                    console.error('Failed to fetch vehicles:', e);
                }

                // Fetch routes
                try {
                    const routesResponse = await getRoutes({ limit: 10 });
                    setRoutes(routesResponse.data?.results || routesResponse.data || []);
                } catch (e) {
                    console.error('Failed to fetch routes:', e);
                }

                // Fetch recent allocations
                try {
                    const allocationsResponse = await getAllocations({ limit: 10, ordering: '-created_at' });
                    setRecentAllocations(allocationsResponse.data?.results || allocationsResponse.data || []);
                } catch (e) {
                    console.error('Failed to fetch allocations:', e);
                }

            } catch (error) {
                console.error("Failed to fetch transport stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Mock alerts data
        setAlerts([
            { id: 1, type: 'maintenance', message: 'Vehicle KA-01-AB-1234 due for service', priority: 'high' },
            { id: 2, type: 'capacity', message: 'Route 3 is at 95% capacity', priority: 'medium' },
        ]);
    }, []);

    // Calculate total capacity
    const totalCapacity = vehicles.reduce((sum, v) => sum + (v.capacity || v.seating_capacity || 0), 0);
    const allocatedStudents = stats?.allocated_students || 0;
    const availableSeats = totalCapacity - allocatedStudents;

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <Skeleton className="h-8 w-56 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-16 rounded-xl" />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <StatsCard key={i} loading />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Skeleton className="h-80 rounded-xl" />
                    <Skeleton className="h-80 rounded-xl" />
                    <Skeleton className="h-80 rounded-xl" />
                </div>
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    const statsData = stats || {
        total_vehicles: vehicles.length,
        active_routes: routes.filter(r => r.is_active).length,
        allocated_students: 0
    };

    const cards = [
        {
            name: 'Total Vehicles',
            value: statsData.total_vehicles?.toString() || vehicles.length.toString(),
            icon: TruckIcon,
            color: 'blue',
            changeType: 'neutral',
            onClick: () => navigate('/transport/routes?tab=vehicles')
        },
        {
            name: 'Active Routes',
            value: statsData.active_routes?.toString() || routes.length.toString(),
            icon: MapIcon,
            color: 'green',
            changeType: 'neutral',
            onClick: () => navigate('/transport/routes')
        },
        {
            name: 'Students Enrolled',
            value: statsData.allocated_students?.toString() || '0',
            icon: UserGroupIcon,
            color: 'purple',
            changeType: 'up',
            onClick: () => navigate('/transport/allocation')
        },
        {
            name: 'Available Seats',
            value: availableSeats > 0 ? availableSeats.toString() : '0',
            icon: MapPinIcon,
            color: availableSeats > 10 ? 'green' : availableSeats > 0 ? 'yellow' : 'red',
            changeType: 'neutral',
            onClick: () => navigate('/transport/allocation')
        }
    ];

    // Get vehicle status counts
    const vehicleStatusCounts = {
        active: vehicles.filter(v => v.status === 'ACTIVE' || v.is_active).length,
        maintenance: vehicles.filter(v => v.status === 'MAINTENANCE').length,
        inactive: vehicles.filter(v => v.status === 'INACTIVE' || !v.is_active).length
    };

    return (
        <AnimatedPage>
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Transport Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Overview of fleet and routes
                        </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                        <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>

                {/* Alerts Banner */}
                {alerts.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-xl p-4">
                        <div className="flex items-start">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div className="ml-3 flex-1">
                                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Attention Required</h3>
                                <div className="mt-2 space-y-1">
                                    {alerts.map((alert) => (
                                        <p key={alert.id} className="text-sm text-yellow-700 dark:text-yellow-500">
                                            {alert.message}
                                        </p>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => setAlerts([])}
                                className="text-yellow-600 hover:text-yellow-800"
                            >
                                <span className="sr-only">Dismiss</span>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card) => (
                        <StatsCard
                            key={card.name}
                            title={card.name}
                            value={card.value}
                            icon={<card.icon className="h-6 w-6" />}
                            trend={card.changeType === 'up' ? 'up' : card.changeType === 'down' ? 'down' : 'neutral'}
                            onClick={card.onClick}
                        />
                    ))}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Vehicle Fleet Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vehicle Fleet</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Status Summary */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded-xl">
                                    <p className="text-lg font-bold text-green-600">{vehicleStatusCounts.active}</p>
                                    <p className="text-xs text-muted-foreground">Active</p>
                                </div>
                                <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl">
                                    <p className="text-lg font-bold text-yellow-600">{vehicleStatusCounts.maintenance}</p>
                                    <p className="text-xs text-muted-foreground">Maintenance</p>
                                </div>
                                <div className="text-center p-2 bg-background rounded-xl">
                                    <p className="text-lg font-bold text-muted-foreground">{vehicleStatusCounts.inactive}</p>
                                    <p className="text-xs text-muted-foreground">Inactive</p>
                                </div>
                            </div>

                            {/* Vehicle List */}
                            {vehicles.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <TruckIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
                                    <p>No vehicles registered.</p>
                                    <button
                                        onClick={() => navigate('/transport/routes?tab=vehicles&action=add')}
                                        className="mt-2 text-sm text-primary hover:underline"
                                    >
                                        Add Vehicle
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {vehicles.slice(0, 6).map((vehicle) => (
                                        <div
                                            key={vehicle.id}
                                            className="flex items-center p-3 bg-background rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/transport/routes?vehicle=${vehicle.id}`)}
                                        >
                                            <div className={`p-2 rounded-xl ${
                                                vehicle.status === 'ACTIVE' || vehicle.is_active
                                                    ? 'bg-green-100 dark:bg-green-950/30'
                                                    : vehicle.status === 'MAINTENANCE'
                                                    ? 'bg-yellow-100 dark:bg-yellow-950/30'
                                                    : 'bg-muted'
                                            }`}>
                                                <TruckIcon className={`h-5 w-5 ${
                                                    vehicle.status === 'ACTIVE' || vehicle.is_active
                                                        ? 'text-green-600'
                                                        : vehicle.status === 'MAINTENANCE'
                                                        ? 'text-yellow-600'
                                                        : 'text-muted-foreground'
                                                }`} />
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <p className="text-sm font-medium text-foreground">
                                                    {vehicle.registration_number || vehicle.number}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {vehicle.vehicle_type || vehicle.type} | Capacity: {vehicle.capacity || vehicle.seating_capacity}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    vehicle.status === 'ACTIVE' || vehicle.is_active ? 'success' :
                                                    vehicle.status === 'MAINTENANCE' ? 'warning' : 'secondary'
                                                }
                                            >
                                                {vehicle.status || (vehicle.is_active ? 'Active' : 'Inactive')}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={() => navigate('/transport/routes?tab=vehicles')}
                                className="mt-4 text-sm text-primary hover:underline"
                            >
                                Manage vehicles
                            </button>
                        </CardContent>
                    </Card>

                    {/* Routes Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Routes Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {routes.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <MapIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
                                    <p>No routes configured.</p>
                                    <button
                                        onClick={() => navigate('/transport/routes/new')}
                                        className="mt-2 text-sm text-primary hover:underline"
                                    >
                                        Create Route
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {routes.slice(0, 6).map((route) => {
                                        const capacity = route.vehicle?.capacity || route.capacity || 40;
                                        const students = route.student_count || route.allocated_students || 0;
                                        const utilization = Math.round((students / capacity) * 100);

                                        return (
                                            <div
                                                key={route.id}
                                                className="p-3 bg-background rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                                                onClick={() => navigate(`/transport/routes/${route.id}`)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {route.name || route.route_name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {route.stops_count || route.stop_count || 0} stops
                                                        </p>
                                                    </div>
                                                    <Badge variant={route.is_active ? 'success' : 'secondary'}>
                                                        {route.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                                {/* Capacity Bar */}
                                                <div className="mt-2">
                                                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                        <span>{students}/{capacity} students</span>
                                                        <span>{utilization}%</span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${
                                                                utilization >= 90 ? 'bg-red-500' :
                                                                utilization >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                                                            }`}
                                                            style={{ width: `${Math.min(utilization, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <button
                                onClick={() => navigate('/transport/routes')}
                                className="mt-4 text-sm text-primary hover:underline"
                            >
                                View all routes
                            </button>
                        </CardContent>
                    </Card>

                    {/* Today's Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Morning Routes */}
                                <div>
                                    <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Morning Pickup</h4>
                                    <div className="space-y-2">
                                        {routes.slice(0, 3).map((route, index) => (
                                            <div key={route.id} className="flex items-center p-2 bg-primary/10 rounded-xl">
                                                <ClockIcon className="h-4 w-4 text-primary mr-2" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-foreground">{route.name || `Route ${index + 1}`}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {route.morning_time || `0${6 + index}:30 AM`}
                                                    </p>
                                                </div>
                                                <Badge variant="info">Scheduled</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Evening Routes */}
                                <div>
                                    <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Evening Drop</h4>
                                    <div className="space-y-2">
                                        {routes.slice(0, 3).map((route, index) => (
                                            <div key={route.id} className="flex items-center p-2 bg-orange-50 dark:bg-orange-950/30 rounded-xl">
                                                <ClockIcon className="h-4 w-4 text-orange-600 mr-2" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-foreground">{route.name || `Route ${index + 1}`}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {route.evening_time || `0${3 + index}:30 PM`}
                                                    </p>
                                                </div>
                                                <Badge variant="warning">Scheduled</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Allocations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Student Allocations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentAllocations.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <UserGroupIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
                                <p>No recent allocations.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                                            <th className="pb-3 pr-4">Student</th>
                                            <th className="pb-3 pr-4">Class</th>
                                            <th className="pb-3 pr-4">Route</th>
                                            <th className="pb-3 pr-4">Pickup Stop</th>
                                            <th className="pb-3">Allocated On</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {recentAllocations.slice(0, 8).map((allocation) => (
                                            <tr key={allocation.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="py-3 pr-4">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {allocation.student?.name || allocation.student_name || 'Student'}
                                                    </p>
                                                </td>
                                                <td className="py-3 pr-4 text-sm text-muted-foreground">
                                                    {allocation.student?.class_name || allocation.class_name || 'N/A'}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <Badge variant="info">
                                                        {allocation.route?.name || allocation.route_name || 'Route'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 pr-4 text-sm text-muted-foreground">
                                                    {allocation.pickup_stop?.name || allocation.stop_name || 'N/A'}
                                                </td>
                                                <td className="py-3 text-sm text-muted-foreground">
                                                    {new Date(allocation.created_at || allocation.allocated_on).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                            <button
                                onClick={() => navigate('/transport/allocation')}
                                className="text-sm text-primary hover:underline"
                            >
                                View all allocations
                            </button>
                            <Button
                                onClick={() => navigate('/transport/allocation?action=new')}
                                variant="default"
                                size="sm"
                            >
                                <PlusIcon className="h-4 w-4 mr-1" />
                                Allocate Student
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                        onClick={() => navigate('/transport/routes?tab=vehicles&action=add')}
                        className="bg-card p-4 rounded-xl border hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col items-center text-center"
                    >
                        <div className="p-3 bg-primary/10 rounded-xl mb-2">
                            <TruckIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm">Add Vehicle</h3>
                        <p className="text-xs text-muted-foreground">Register new vehicle</p>
                    </div>

                    <div
                        onClick={() => navigate('/transport/routes/new')}
                        className="bg-card p-4 rounded-xl border hover:shadow-md hover:border-green-300 transition-all cursor-pointer flex flex-col items-center text-center"
                    >
                        <div className="p-3 bg-green-100 dark:bg-green-950/30 rounded-xl mb-2">
                            <MapIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm">Create Route</h3>
                        <p className="text-xs text-muted-foreground">Define new route</p>
                    </div>

                    <div
                        onClick={() => navigate('/transport/allocation')}
                        className="bg-card p-4 rounded-xl border hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex flex-col items-center text-center"
                    >
                        <div className="p-3 bg-purple-100 dark:bg-purple-950/30 rounded-xl mb-2">
                            <UserGroupIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm">Allocate Students</h3>
                        <p className="text-xs text-muted-foreground">Assign routes</p>
                    </div>

                    <div
                        onClick={() => navigate('/transport/reports')}
                        className="bg-card p-4 rounded-xl border hover:shadow-md hover:border-yellow-300 transition-all cursor-pointer flex flex-col items-center text-center"
                    >
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-950/30 rounded-xl mb-2">
                            <MapPinIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm">Reports</h3>
                        <p className="text-xs text-muted-foreground">Analytics</p>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default TransportDashboard;
