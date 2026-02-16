import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles, fetchRoutes, fetchDrivers } from '../../store/slices/transportSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Skeleton } from '@/ui/primitives/skeleton';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Truck, Map, ShieldCheck, Users, MapPin } from 'lucide-react';

const TransportDashboard = () => {
    const dispatch = useDispatch();
    const { vehicles, routes, drivers, loading } = useSelector((state) => state.transport);

    useEffect(() => {
        dispatch(fetchVehicles());
        dispatch(fetchRoutes());
        dispatch(fetchDrivers());
    }, [dispatch]);

    if (loading && !routes.length) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </div>
                    <Skeleton className="h-64" />
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Transport Management"
                    description="Overview of fleet, routes, and personnel"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="bg-amber-500/10 p-4 rounded-full mr-4">
                                <Truck className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-muted-foreground font-medium">Total Vehicles</p>
                                <p className="text-3xl font-bold text-foreground">{vehicles.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="bg-blue-500/10 p-4 rounded-full mr-4">
                                <Map className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-muted-foreground font-medium">Active Routes</p>
                                <p className="text-3xl font-bold text-foreground">{routes.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="bg-emerald-500/10 p-4 rounded-full mr-4">
                                <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-muted-foreground font-medium">Drivers</p>
                                <p className="text-3xl font-bold text-foreground">{drivers.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Routes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Route Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Point</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">End Point</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Assigned Vehicle</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {routes.length > 0 ? (
                                        routes.map(route => (
                                            <tr key={route.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{route.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <MapPin className="w-3 h-3 mr-1 text-primary" />
                                                        {route.start_point}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <MapPin className="w-3 h-3 mr-1 text-destructive" />
                                                        {route.end_point}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    {route.vehicle_details ? (
                                                        <div className="flex items-center">
                                                            <Truck className="w-3 h-3 mr-1" />
                                                            {route.vehicle_details.registration_number}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground/50">Unassigned</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                                                <Map className="w-8 h-8 opacity-20 mx-auto mb-2" />
                                                <p>No routes defined.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AnimatedPage>
    );
};

export default TransportDashboard;
