import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoutes, createRoute, deleteRoute, addStop, fetchVehicles, fetchDrivers } from '../../store/slices/transportSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/ui/primitives/dialog';
import { Input } from '@/ui/primitives/input';
import { Badge } from '@/ui/primitives/badge';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    Plus,
    Trash2,
    MapPin,
    Truck,
    User,
    Clock,
    Loader2,
    IndianRupee,
    MoreHorizontal,
    Search,
    RefreshCw
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/ui/primitives/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/ui/primitives/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/ui/primitives/select';
import showToast, { getErrorMessage } from '../../utils/toast';

const RouteManager = () => {
    const dispatch = useDispatch();
    const { routes, vehicles, drivers, loading } = useSelector((state) => state.transport);

    // UI State
    const [routeDialogOpen, setRouteDialogOpen] = useState(false);
    const [stopDialogOpen, setStopDialogOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [routeForm, setRouteForm] = useState({
        name: '',
        start_point: '',
        end_point: '',
        vehicle: '',
        driver: ''
    });

    const [stopForm, setStopForm] = useState({
        name: '',
        sequence_order: '',
        arrival_time: '',
        pickup_fare: ''
    });

    useEffect(() => {
        dispatch(fetchRoutes());
        dispatch(fetchVehicles());
        dispatch(fetchDrivers());
    }, [dispatch]);

    const handleCreateRoute = async () => {
        if (!routeForm.name || !routeForm.start_point || !routeForm.end_point) {
            showToast('Please fill all required routing details', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            await dispatch(createRoute(routeForm)).unwrap();
            showToast('Route created successfully', 'success');
            setRouteDialogOpen(false);
            setRouteForm({ name: '', start_point: '', end_point: '', vehicle: '', driver: '' });
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddStop = async () => {
        if (!stopForm.name || !stopForm.arrival_time || !selectedRoute) return;

        setIsSubmitting(true);
        try {
            await dispatch(addStop({ routeId: selectedRoute.id, data: stopForm })).unwrap();
            showToast('Stop added successfully', 'success');
            setStopDialogOpen(false);
            setStopForm({ name: '', sequence_order: '', arrival_time: '', pickup_fare: '' });
            // Refresh to show new stop
            dispatch(fetchRoutes());
        } catch (error) {
            showToast(getErrorMessage(error), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRoute = async (id) => {
        if (confirm('Are you sure you want to delete this route? This action cannot be undone.')) {
            try {
                await dispatch(deleteRoute(id)).unwrap();
                showToast('Route deleted successfully', 'success');
            } catch (error) {
                showToast(getErrorMessage(error), 'error');
            }
        }
    };

    const filteredRoutes = routes.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatedPage>
            <div className="space-y-6 max-w-[1600px] mx-auto pb-20">
                <PageHeader
                    title="Route Management"
                    description="Configure bus routes, assign vehicles, and manage stops."
                    action={
                        <Button onClick={() => setRouteDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Route
                        </Button>
                    }
                />

                <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search routes by name or vehicle number..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" onClick={() => dispatch(fetchRoutes())} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {filteredRoutes.map((route) => (
                        <Card key={route.id} className="overflow-hidden">
                            <div className="border-b bg-muted/30 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 text-primary rounded-lg">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold">{route.name}</h3>
                                            <Badge variant="outline" className="font-normal text-xs">
                                                ID: {route.route_id || route.id}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Truck className="h-3.5 w-3.5" />
                                                {route.vehicle_details?.registration_number || 'No Vehicle Assigned'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="h-3.5 w-3.5" />
                                                {route.driver_details?.name || 'No Driver Assigned'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end md:self-auto">
                                    <Button variant="outline" size="sm" onClick={() => { setSelectedRoute(route); setStopDialogOpen(true); }}>
                                        <Plus className="h-3.5 w-3.5 mr-2" />
                                        Add Stop
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => { /* Edit logic */ }}>
                                                Edit Route
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => handleDeleteRoute(route.id)}>
                                                Delete Route
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <CardContent className="p-0">
                                <div className="p-4 bg-muted/10 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm border-b">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Start Point</p>
                                        <p className="font-semibold">{route.start_point}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">End Point</p>
                                        <p className="font-semibold">{route.end_point}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Total Stops</p>
                                        <p className="font-semibold">{route.stops?.length || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Assigned Students</p>
                                        <p className="font-semibold">{route.student_count || 0}</p>
                                    </div>
                                </div>

                                {/* Stops Timeline / Table */}
                                {route.stops && route.stops.length > 0 ? (
                                    <div className="relative overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="w-[100px]">Sequence</TableHead>
                                                    <TableHead>Stop Name</TableHead>
                                                    <TableHead>Arrival Time</TableHead>
                                                    <TableHead className="text-right">Fare</TableHead>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {route.stops.map((stop, idx) => (
                                                    <TableRow key={stop.id}>
                                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                                            Stop #{stop.sequence_order || idx + 1}
                                                        </TableCell>
                                                        <TableCell className="font-medium">{stop.name}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-900 w-fit px-2 py-1 rounded text-xs font-mono">
                                                                <Clock className="h-3 w-3 text-stone-500" />
                                                                {stop.arrival_time}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-mono">
                                                            ₹{parseFloat(stop.pickup_fare || 0).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground text-sm italic">
                                        No stops added to this route yet.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Create Route Dialog */}
                <Dialog open={routeDialogOpen} onOpenChange={setRouteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Route</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Route Name</label>
                                <Input
                                    placeholder="e.g. Route A - North City"
                                    value={routeForm.name}
                                    onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Point</label>
                                    <Input
                                        placeholder="Starting location"
                                        value={routeForm.start_point}
                                        onChange={(e) => setRouteForm({ ...routeForm, start_point: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">End Point</label>
                                    <Input
                                        placeholder="Destination"
                                        value={routeForm.end_point}
                                        onChange={(e) => setRouteForm({ ...routeForm, end_point: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Assign Vehicle</label>
                                    <Select value={routeForm.vehicle} onValueChange={(val) => setRouteForm({ ...routeForm, vehicle: val })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Vehicle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicles.map(v => (
                                                <SelectItem key={v.id} value={v.id.toString()}>
                                                    {v.registration_number} ({v.capacity} seats)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Assign Driver</label>
                                    <Select value={routeForm.driver} onValueChange={(val) => setRouteForm({ ...routeForm, driver: val })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Driver" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {drivers.map(d => (
                                                <SelectItem key={d.id} value={d.id.toString()}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setRouteDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateRoute} disabled={isSubmitting}>Create Route</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Add Stop Dialog */}
                <Dialog open={stopDialogOpen} onOpenChange={setStopDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Stop to {selectedRoute?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stop Name</label>
                                <Input
                                    placeholder="e.g. Central Market"
                                    value={stopForm.name}
                                    onChange={(e) => setStopForm({ ...stopForm, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Arrival Time</label>
                                    <Input
                                        type="time"
                                        value={stopForm.arrival_time}
                                        onChange={(e) => setStopForm({ ...stopForm, arrival_time: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Standard Fare (₹)</label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={stopForm.pickup_fare}
                                        onChange={(e) => setStopForm({ ...stopForm, pickup_fare: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Sequence Order</label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 1, 2, 3..."
                                    value={stopForm.sequence_order}
                                    onChange={(e) => setStopForm({ ...stopForm, sequence_order: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setStopDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddStop} disabled={isSubmitting}>Add Stop</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedPage>
    );
};

export default RouteManager;
