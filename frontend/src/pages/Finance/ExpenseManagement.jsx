import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchExpenses,
    createExpense,
    approveExpense
} from '../../store/slices/financeSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import Select from '../../components/common/Select';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Plus, CheckCircle, IndianRupee, Loader2 } from 'lucide-react';
import showToast from '../../utils/toast';

const ExpenseManagement = () => {
    const dispatch = useDispatch();
    const { expenses } = useSelector((state) => state.finance);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'UTILITIES',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        description: '',
        vendor_name: '',
        invoice_number: '',
        payment_method: 'CASH'
    });

    useEffect(() => {
        dispatch(fetchExpenses());
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await dispatch(createExpense(formData)).unwrap();
            showToast.success('Expense created successfully!');

            // Reset form
            setFormData({
                title: '',
                category: 'UTILITIES',
                amount: '',
                expense_date: new Date().toISOString().split('T')[0],
                description: '',
                vendor_name: '',
                invoice_number: '',
                payment_method: 'CASH'
            });
            setShowForm(false);

            // Reload expenses
            dispatch(fetchExpenses());
        } catch (error) {
            showToast.error('Failed to create expense: ' + (error.message || 'Unknown error'));
        }
    };

    const handleApprove = async (id) => {
        if (window.confirm('Are you sure you want to approve this expense?')) {
            try {
                await dispatch(approveExpense(id)).unwrap();
                showToast.success('Expense approved successfully!');
                dispatch(fetchExpenses());
            } catch (error) {
                showToast.error('Failed to approve expense: ' + (error.message || 'Unknown error'));
            }
        }
    };

    const categories = [
        { value: 'SALARY', label: 'Salary & Wages' },
        { value: 'UTILITIES', label: 'Utilities' },
        { value: 'MAINTENANCE', label: 'Maintenance' },
        { value: 'SUPPLIES', label: 'Supplies & Materials' },
        { value: 'TRANSPORT', label: 'Transport' },
        { value: 'MARKETING', label: 'Marketing' },
        { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
        { value: 'OTHER', label: 'Other' },
    ];

    const paymentMethods = [
        { value: 'CASH', label: 'Cash' },
        { value: 'CHEQUE', label: 'Cheque' },
        { value: 'CARD', label: 'Credit/Debit Card' },
        { value: 'ONLINE', label: 'Online Transfer' },
        { value: 'UPI', label: 'UPI' },
        { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    ];

    const getStatusVariant = (status) => {
        const variants = {
            PENDING: 'warning',
            APPROVED: 'default',
            PAID: 'success',
            REJECTED: 'destructive',
        };
        return variants[status] || 'default';
    };

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Expense Management"
                    description="Manage school expenses and approvals"
                    action={
                        <Button onClick={() => setShowForm(!showForm)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Expense
                        </Button>
                    }
                />

                {/* Expense Form */}
                {showForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle>New Expense</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Title <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            placeholder="Expense title"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Category <span className="text-destructive">*</span>
                                        </label>
                                        <Select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            options={categories}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Amount <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Date <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="expense_date"
                                            value={formData.expense_date}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Vendor Name
                                        </label>
                                        <input
                                            type="text"
                                            name="vendor_name"
                                            value={formData.vendor_name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            placeholder="Vendor name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Invoice Number
                                        </label>
                                        <input
                                            type="text"
                                            name="invoice_number"
                                            value={formData.invoice_number}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            placeholder="Invoice number"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Payment Method
                                        </label>
                                        <Select
                                            name="payment_method"
                                            value={formData.payment_method}
                                            onChange={handleInputChange}
                                            options={paymentMethods}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Description <span className="text-destructive">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows={3}
                                        className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="Expense description"
                                    />
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        variant="outline"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        <IndianRupee className="w-4 h-4 mr-2" />
                                        Create Expense
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Expenses Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Vendor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {expenses.loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-muted-foreground">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : expenses.data && expenses.data.length > 0 ? (
                                        expenses.data.map((row) => (
                                            <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-foreground">{row.title}</div>
                                                    <div className="text-sm text-muted-foreground">{row.category_display}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-semibold text-foreground">
                                                        ₹{parseFloat(row.amount).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                                    {new Date(row.expense_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    {row.vendor_name || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={getStatusVariant(row.status)}>
                                                        {row.status_display}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {row.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleApprove(row.id)}
                                                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-muted-foreground">No expenses found</td>
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

export default ExpenseManagement;
