import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoutes, fetchAllocations, createAllocation, deleteAllocation } from '../../store/slices/transportSlice';
import { fetchStudents } from '../../store/slices/studentsSlice';
import { Card, CardContent } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/ui/primitives/dialog';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { UserPlus, Trash2, MapPin, Truck, Loader2, Calendar } from 'lucide-react';
import showToast from '../../utils/toast';

const TransportAllocation = () => {
    const dispatch = useDispatch();
    const { routes, allocations, loading } = useSelector((state) => state.transport);
    const { list: studentsList } = useSelector((state) => state.students);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [allocationForm, setAllocationForm] = useState({
        student: '',
        route: '',
        stop: '',
        start_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        dispatch(fetchRoutes());
        dispatch(fetchAllocations());
        dispatch(fetchStudents());
    }, [dispatch]);

    const handleAllocate = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const resultAction = await dispatch(createAllocation(allocationForm));
            if (createAllocation.fulfilled.match(resultAction)) {
                showToast.success('Student allocated to transport successfully');
                setIsModalOpen(false);
                setAllocationForm({ student: '', route: '', stop: '', start_date: new Date().toISOString().split('T')[0] });
            } else {
                const errorData = resultAction.payload;
                let errorMessage = 'Allocation failed';
                if (errorData) {
                    if (typeof errorData === 'string') errorMessage = errorData;
                    else if (errorData.non_field_errors) errorMessage = errorData.non_field_errors[0];
                    else if (errorData.detail) errorMessage = errorData.detail;
                    else if (errorData.error) errorMessage = errorData.error;
                    else {
                        const firstField = Object.keys(errorData)[0];
                        if (firstField) errorMessage = `${firstField}: ${errorData[firstField][0]}`;
                    }
                }
                showToast.error(errorMessage);
            }
        } catch (err) {
            console.error("Allocation error", err);
            showToast.error('An unexpected error occurred');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this allocation?')) {
            try {
                await dispatch(deleteAllocation(id)).unwrap();
                showToast.success('Allocation removed successfully');
            } catch (error) {
                showToast.error('Failed to remove allocation');
            }
        }
    };

    const selectedRoute = routes.find(r => r.id === parseInt(allocationForm.route));

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Transport Allocation"
                    description="Assign students to transport routes and stops"
                    action={
                        <Button onClick={() => setIsModalOpen(true)}>
                            <UserPlus className="h-4 w-4 mr-2" /> Allocate Student
                        </Button>
                    }
                />

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Route</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stop</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {allocations && allocations.length > 0 ? (
                                        allocations.map((allocation) => (
                                            <tr key={allocation.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-foreground">
                                                        {allocation.student_details?.first_name} {allocation.student_details?.last_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{allocation.student_details?.admission_number}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-foreground">
                                                        <Truck className="h-4 w-4 mr-2 text-primary" />
                                                        {allocation.route_details?.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-foreground">
                                                        <MapPin className="h-4 w-4 mr-2 text-destructive" />
                                                        {allocation.stop_details?.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        {allocation.start_date}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(allocation.id)}
                                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center">
                                                    <Truck className="w-8 h-8 opacity-20 mb-2" />
                                                    <p>No transport allocations found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Allocate Student Dialog */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Allocate Student to Transport</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAllocate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Student <span className="text-destructive">*</span>
                                </label>
                                <select
                                    value={allocationForm.student}
                                    onChange={(e) => setAllocationForm({ ...allocationForm, student: e.target.value })}
                                    required
                                    className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Select Student</option>
                                    {(studentsList || []).map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.first_name} {s.last_name} ({s.admission_number})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Route <span className="text-destructive">*</span>
                                </label>
                                <select
                                    value={allocationForm.route}
                                    onChange={(e) => setAllocationForm({ ...allocationForm, route: e.target.value })}
                                    required
                                    className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Select Route</option>
                                    {routes.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            {allocationForm.route && selectedRoute && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Stop <span className="text-destructive">*</span>
                                    </label>
                                    <select
                                        value={allocationForm.stop}
                                        onChange={(e) => setAllocationForm({ ...allocationForm, stop: e.target.value })}
                                        required
                                        className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="">Select Stop</option>
                                        {(selectedRoute.stops || []).map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} ({s.arrival_time})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Start Date <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={allocationForm.start_date}
                                    onChange={(e) => setAllocationForm({ ...allocationForm, start_date: e.target.value })}
                                    required
                                    className="w-full border border-input rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Allocating...</>
                                    ) : (
                                        'Allocate Transport'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedPage>
    );
};

export default TransportAllocation;
