import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchFeeCategories,
    createFeeCategory
} from '../../store/slices/financeSlice';
import { Card, CardContent } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/ui/primitives/dialog';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Plus, Edit2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import showToast from '../../utils/toast';

const FeeCategoryManager = () => {
    const dispatch = useDispatch();
    const { feeCategories } = useSelector((state) => state.finance);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        is_mandatory: true,
        is_active: true
    });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        dispatch(fetchFeeCategories());
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
            await dispatch(createFeeCategory(formData)).unwrap();
            setIsModalOpen(false);
            setFormData({
                name: '',
                code: '',
                description: '',
                is_mandatory: true,
                is_active: true
            });
            showToast.success('Fee Category created successfully!');
        } catch (error) {
            showToast.error('Failed to create category: ' + (error.message || 'Unknown error'));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Fee Categories"
                    description="Manage fee types (Tuition, Transport, etc.)"
                    action={
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                        </Button>
                    }
                />

                <Card>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {feeCategories.loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-muted-foreground">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : feeCategories.data && feeCategories.data.length > 0 ? (
                                        feeCategories.data.map((category) => (
                                            <tr key={category.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-foreground">{category.name}</div>
                                                    <div className="text-sm text-muted-foreground">{category.description}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    {category.code}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {category.is_mandatory ? (
                                                        <Badge variant="default">
                                                            Mandatory
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            Optional
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {category.is_active ? (
                                                        <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                                                            <CheckCircle className="w-4 h-4 mr-1" /> Active
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center text-destructive">
                                                            <XCircle className="w-4 h-4 mr-1" /> Inactive
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button className="text-primary hover:text-primary/80 transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-muted-foreground">No categories found</td>
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
                            <DialogTitle>Add Fee Category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Category Name <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Code <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="e.g., TUITION, BUS"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_mandatory"
                                        checked={formData.is_mandatory}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-primary focus:ring-ring border-input rounded accent-primary"
                                    />
                                    <label className="ml-2 block text-sm text-foreground">Mandatory</label>
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
                                        'Create Category'
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

export default FeeCategoryManager;
