import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchFeeStructures,
    createFeeStructure,
    fetchFeeCategories
} from '../../store/slices/financeSlice';
import {
    fetchAcademicYears,
    fetchClasses
} from '../../store/slices/academicsSlice';
import { Card, CardContent } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/ui/primitives/dialog';
import Select from '../../components/common/Select';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Plus, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import showToast from '../../utils/toast';

const FeeStructureManager = () => {
    const dispatch = useDispatch();
    const { feeStructures, feeCategories } = useSelector((state) => state.finance);
    const { academicYears, classes } = useSelector((state) => state.academics);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        academic_year: '',
        class_obj: '',
        fee_category: '',
        amount: '',
        frequency: 'ANNUAL',
        due_day: '',
        is_active: true
    });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        dispatch(fetchFeeStructures());
        dispatch(fetchFeeCategories());
        dispatch(fetchAcademicYears());
        dispatch(fetchClasses());
    }, [dispatch]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await dispatch(createFeeStructure(formData)).unwrap();
            setIsModalOpen(false);
            setFormData({
                academic_year: '',
                class_obj: '',
                fee_category: '',
                amount: '',
                frequency: 'ANNUAL',
                due_day: '',
                is_active: true
            });
            showToast.success('Fee Structure created successfully!');
            dispatch(fetchFeeStructures()); // Refresh list
        } catch (error) {
            showToast.error('Failed to create fee structure: ' + (error.message || 'Unknown error'));
        } finally {
            setProcessing(false);
        }
    };

    const getFrequencyLabel = (value) => {
        const frequencies = {
            'MONTHLY': 'Monthly',
            'QUARTERLY': 'Quarterly',
            'HALF_YEARLY': 'Half Yearly',
            'ANNUAL': 'Annual',
            'ONE_TIME': 'One Time'
        };
        return frequencies[value] || value;
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Fee Structures"
                    description="Assign fees to classes for academic years"
                    action={
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Fee Structure
                        </Button>
                    }
                />

                <Card>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Fee Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Academic Year</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Frequency</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {feeStructures.loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-muted-foreground">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : feeStructures.data && feeStructures.data.length > 0 ? (
                                        feeStructures.data.map((structure) => (
                                            <tr key={structure.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                                    {structure.fee_category_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    {structure.class_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    {structure.academic_year_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-bold">
                                                    ₹{parseFloat(structure.amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    {getFrequencyLabel(structure.frequency)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {structure.is_active ? (
                                                        <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                                                            <CheckCircle className="w-4 h-4 mr-1" /> Active
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center text-destructive">
                                                            <XCircle className="w-4 h-4 mr-1" /> Inactive
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-muted-foreground">No fee structures found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Fee Structure</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Academic Year <span className="text-destructive">*</span>
                                </label>
                                <select
                                    name="academic_year"
                                    value={formData.academic_year}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Select Academic Year</option>
                                    {(academicYears.data || academicYears || []).map(year => (
                                        <option key={year.id} value={year.id}>{year.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Class <span className="text-destructive">*</span>
                                </label>
                                <select
                                    name="class_obj"
                                    value={formData.class_obj}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Select Class</option>
                                    {(classes.data || classes || []).map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Fee Category <span className="text-destructive">*</span>
                                </label>
                                <select
                                    name="fee_category"
                                    value={formData.fee_category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Select Category</option>
                                    {feeCategories.data && feeCategories.data.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Amount <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Frequency <span className="text-destructive">*</span>
                                </label>
                                <select
                                    name="frequency"
                                    value={formData.frequency}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="ANNUAL">Annual</option>
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="QUARTERLY">Quarterly</option>
                                    <option value="HALF_YEARLY">Half Yearly</option>
                                    <option value="ONE_TIME">One Time</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-primary focus:ring-ring border-input rounded accent-primary"
                                />
                                <label className="ml-2 block text-sm text-foreground">Active</label>
                            </div>

                            <div className="mt-5 sm:mt-6 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                                    ) : (
                                        'Create Structure'
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

export default FeeStructureManager;
