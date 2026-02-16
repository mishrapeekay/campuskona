import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchStudentFees,
    collectFee,
    fetchFinancialSummary
} from '../../store/slices/financeSlice';
import { fetchStudents } from '../../store/slices/studentsSlice';
import { downloadReceipt, getPayments } from '../../api/finance';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import Select from '../../components/common/Select';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { IndianRupee, CreditCard, CheckCircle, AlertCircle, TrendingUp, FileText, Loader2 } from 'lucide-react';
import showToast from '../../utils/toast';

const FeeCollection = () => {
    const dispatch = useDispatch();
    const { studentFees, financialSummary } = useSelector((state) => state.finance);
    const { list: studentsList, loading: studentsLoading } = useSelector((state) => state.students);

    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [transactionId, setTransactionId] = useState('');
    const [remarks, setRemarks] = useState('');
    const [feeAllocations, setFeeAllocations] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        dispatch(fetchFinancialSummary());
        dispatch(fetchStudents({ page_size: 100 }));
    }, [dispatch]);

    useEffect(() => {
        if (selectedStudentId) {
            const student = studentsList.find(s => s.id === parseInt(selectedStudentId));
            setSelectedStudent(student);
            loadStudentFees(selectedStudentId);
        } else {
            setSelectedStudent(null);
            setFeeAllocations([]);
        }
    }, [selectedStudentId, studentsList]);

    const loadStudentFees = (studentId) => {
        dispatch(fetchStudentFees({ student: studentId, status: 'PENDING' }));
    };

    const handleFeeSelection = (feeId, amount, isSelected) => {
        if (isSelected) {
            setFeeAllocations(prev => [...prev, { student_fee_id: feeId, amount: parseFloat(amount) }]);
            setTotalAmount(prev => prev + parseFloat(amount));
        } else {
            setFeeAllocations(prev => prev.filter(f => f.student_fee_id !== feeId));
            setTotalAmount(prev => prev - parseFloat(amount));
        }
    };

    const handleSubmit = async () => {
        if (!selectedStudentId || feeAllocations.length === 0) {
            showToast.warning('Please select student and fees');
            return;
        }

        setProcessing(true);
        try {
            await dispatch(collectFee({
                student_id: parseInt(selectedStudentId),
                amount: totalAmount,
                payment_method: paymentMethod,
                transaction_id: transactionId,
                remarks: remarks,
                fee_allocations: feeAllocations
            })).unwrap();

            showToast.success('Payment collected successfully!');

            // Reset form
            setSelectedStudentId('');
            setPaymentMethod('CASH');
            setTransactionId('');
            setRemarks('');
            setFeeAllocations([]);
            setTotalAmount(0);

            // Reload summary
            dispatch(fetchFinancialSummary());
        } catch (error) {
            showToast.error('Failed to collect payment: ' + (error.message || 'Unknown error'));
        } finally {
            setProcessing(false);
        }
    };

    const paymentMethods = [
        { value: 'CASH', label: 'Cash' },
        { value: 'CHEQUE', label: 'Cheque' },
        { value: 'CARD', label: 'Credit/Debit Card' },
        { value: 'ONLINE', label: 'Online Transfer' },
        { value: 'UPI', label: 'UPI' },
        { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    ];

    const studentOptions = studentsList ? studentsList.map(student => ({
        value: student.id,
        label: `${student.first_name} ${student.last_name} (${student.admission_number})`
    })) : [];

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Fee Collection" description="Collect student fee payments" />

                {/* Financial Summary */}
                {financialSummary.data && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-primary font-medium">Total Fees</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            ₹{parseFloat(financialSummary.data.total_fees || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <IndianRupee className="w-8 h-8 text-primary" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-emerald-500/5 border-emerald-500/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Collected</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            ₹{parseFloat(financialSummary.data.total_collected || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-amber-500/5 border-amber-500/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Pending</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            ₹{parseFloat(financialSummary.data.total_pending || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-violet-500/5 border-violet-500/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">Net Balance</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            ₹{parseFloat(financialSummary.data.net_balance || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Payment Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Student <span className="text-destructive">*</span>
                                </label>
                                <Select
                                    name="student"
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    options={[
                                        { value: '', label: 'Select Student' },
                                        ...studentOptions
                                    ]}
                                    disabled={studentsLoading}
                                />
                                {selectedStudent && (
                                    <div className="mt-2 p-2 bg-muted rounded-lg text-sm text-muted-foreground">
                                        <p><strong className="text-foreground">Class:</strong> {selectedStudent.current_class_name} {selectedStudent.section_name}</p>
                                        <p><strong className="text-foreground">Roll No:</strong> {selectedStudent.roll_number}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Payment Method <span className="text-destructive">*</span>
                                </label>
                                <Select
                                    name="paymentMethod"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    options={paymentMethods}
                                />
                            </div>

                            {paymentMethod !== 'CASH' && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Transaction ID
                                    </label>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="Enter transaction ID"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Remarks
                                </label>
                                <input
                                    type="text"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="Optional remarks"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Fees */}
                {selectedStudentId && studentFees.data && studentFees.data.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Fees</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {studentFees.data.map((fee) => (
                                    <div
                                        key={fee.id}
                                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => handleFeeSelection(fee.id, fee.balance_amount, e.target.checked)}
                                                className="w-4 h-4 text-primary border-input rounded focus:ring-ring accent-primary"
                                            />
                                            <div>
                                                <p className="font-medium text-foreground">{fee.fee_category_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Due: {new Date(fee.due_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-foreground">
                                                ₹{parseFloat(fee.balance_amount).toLocaleString()}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                of ₹{parseFloat(fee.total_amount || fee.amount).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total Amount */}
                            <div className="mt-6 pt-6 border-t border-border">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-foreground">Total Amount:</span>
                                    <span className="text-2xl font-bold text-primary">
                                        ₹{totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex justify-end gap-4">
                                <Button
                                    onClick={() => {
                                        setSelectedStudentId('');
                                        setFeeAllocations([]);
                                        setTotalAmount(0);
                                    }}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={processing || feeAllocations.length === 0}
                                >
                                    {processing ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                                    ) : (
                                        <><CreditCard className="w-4 h-4 mr-2" /> Collect Payment</>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {selectedStudentId && studentFees.data && studentFees.data.length === 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-12">
                                <CheckCircle className="mx-auto h-12 w-12 text-emerald-500/30" />
                                <h3 className="mt-2 text-sm font-medium text-foreground">No pending fees</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    This student has no pending fees
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Payment History */}
                {selectedStudentId && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <HistorySection studentId={selectedStudentId} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </AnimatedPage>
    );
};

const HistorySection = ({ studentId }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (studentId) {
            fetchHistory();
        }
    }, [studentId]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await getPayments({ student: studentId });
            setHistory(response.data.results || response.data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (paymentId, receiptNo) => {
        try {
            const response = await downloadReceipt(paymentId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt_${receiptNo}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            showToast.error("Failed to download receipt");
        }
    };

    if (loading) return <div className="p-4 text-center text-muted-foreground">Loading history...</div>;

    if (history.length === 0) return <div className="p-4 text-center text-muted-foreground">No payment history found.</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Receipt No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                    {history.map((payment) => (
                        <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                {new Date(payment.payment_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                {payment.receipt_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                                ₹{parseFloat(payment.amount).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                {payment.payment_method}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Button size="sm" variant="outline" onClick={() => handleDownload(payment.id, payment.receipt_number)}>
                                    <FileText className="w-4 h-4 mr-1" /> Receipt
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FeeCollection;
