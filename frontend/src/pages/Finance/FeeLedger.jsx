import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    IndianRupee,
    Calendar,
    ArrowDownCircle,
    ArrowUpCircle,
    FileText,
    Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { Skeleton } from '@/ui/primitives/skeleton';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { fetchMyFees, fetchMyPayments } from '../../store/slices/financeSlice';

const FeeLedger = () => {
    const dispatch = useDispatch();
    const { studentFees, payments } = useSelector((state) => state.finance);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchMyFees());
        dispatch(fetchMyPayments());
    }, [dispatch]);

    // Combine and sort fees (debits) and payments (credits)
    const ledgerItems = [
        ...(studentFees.data || []).map(fee => ({
            id: `fee-${fee.id}`,
            date: fee.created_at || fee.due_date,
            type: 'DEBIT',
            description: `${fee.fee_structure?.fee_category?.name || 'Fee'} - Due for ${fee.academic_year?.name}`,
            amount: fee.final_amount,
            status: fee.status,
            raw: fee
        })),
        ...(payments.data || []).map(payment => ({
            id: `pay-${payment.id}`,
            date: payment.payment_date,
            type: 'CREDIT',
            description: `Payment Received - Receipt #${payment.receipt_number}`,
            amount: payment.amount,
            status: payment.status,
            raw: payment
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate totals
    const totalInvoiced = (studentFees.data || []).reduce((sum, f) => sum + parseFloat(f.final_amount || 0), 0);
    const totalPaid = (payments.data || []).filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const totalOutstanding = totalInvoiced - totalPaid;

    const loading = studentFees.loading || payments.loading;

    if (loading && ledgerItems.length === 0) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Fee Transparency Ledger"
                    description="Chronological history of all charges and payments"
                    action={
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <Printer className="h-4 w-4 mr-2" />
                                Statement
                            </Button>
                            <Button>
                                <IndianRupee className="h-4 w-4 mr-2" />
                                Pay Balance
                            </Button>
                        </div>
                    }
                />

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-lg">
                        <CardContent className="pt-6">
                            <p className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider">Total Outstanding</p>
                            <h2 className="text-3xl font-bold mt-1">₹{totalOutstanding.toLocaleString()}</h2>
                            <div className="mt-4 flex items-center text-xs text-primary-foreground/70">
                                <Calendar className="h-4 w-4 mr-1" />
                                As of {new Date().toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Total Fees Invoiced</p>
                            <h2 className="text-3xl font-bold mt-1 text-foreground">₹{totalInvoiced.toLocaleString()}</h2>
                            <div className="mt-4 flex items-center text-xs">
                                <Badge variant="default">All Academic Years</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Successfully Paid</p>
                            <h2 className="text-3xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">₹{totalPaid.toLocaleString()}</h2>
                            <div className="mt-4 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                                {totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0}% Coverage
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Timeline / Ledger */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Statement of Account
                        </h3>

                        <div className="relative">
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>

                            <div className="space-y-6 relative">
                                {ledgerItems.map((item) => (
                                    <div key={item.id} className="flex gap-6 items-start">
                                        <div className={`p-2 rounded-full z-10 shadow-[0_0_0_4px_hsl(var(--background))] ${item.type === 'DEBIT'
                                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                            }`}>
                                            {item.type === 'DEBIT' ? (
                                                <ArrowUpCircle className="h-8 w-8" />
                                            ) : (
                                                <ArrowDownCircle className="h-8 w-8" />
                                            )}
                                        </div>

                                        <div className="flex-1 bg-card p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-xs text-muted-foreground font-bold uppercase">{new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                    <h4 className="font-bold text-foreground mt-0.5">{item.description}</h4>
                                                </div>
                                                <p className={`text-lg font-bold ${item.type === 'DEBIT' ? 'text-foreground' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                    {item.type === 'DEBIT' ? '-' : '+'}₹{parseFloat(item.amount).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={
                                                    item.status === 'PAID' || item.status === 'COMPLETED' ? 'success' :
                                                        item.status === 'PARTIAL' ? 'warning' : 'destructive'
                                                }>
                                                    {item.status}
                                                </Badge>
                                                {item.type === 'CREDIT' && (
                                                    <button className="text-xs text-primary font-bold hover:underline">Download Receipt</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {ledgerItems.length === 0 && (
                                    <div className="text-center py-20 text-muted-foreground bg-muted/50 rounded-xl border-2 border-dashed border-border ml-16">
                                        <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
                                        <p>No transactions found in this period.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Future Projections */}
                    <div className="space-y-6">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-primary">Future Projections</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-primary/80 mb-4">Estimate for upcoming recurring fees based on current enrollment.</p>
                                <div className="space-y-4">
                                    {[
                                        { name: 'July Tuition Fee', amount: 4500, date: 'July 10, 2024' },
                                        { name: 'Bus Fee (Q3)', amount: 2500, date: 'Aug 05, 2024' },
                                        { name: 'August Tuition Fee', amount: 4500, date: 'Aug 10, 2024' }
                                    ].map((proj, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <div>
                                                <p className="font-bold text-foreground">{proj.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{proj.date}</p>
                                            </div>
                                            <span className="font-bold text-foreground">₹{proj.amount}</span>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-primary/20 flex justify-between font-bold text-foreground">
                                        <span>Projected (Next 90 days)</span>
                                        <span>₹11,500</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Fee Components Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Tuition Fee', percent: 65, color: 'bg-primary' },
                                        { name: 'Transport', percent: 20, color: 'bg-chart-2' },
                                        { name: 'Library & Labs', percent: 10, color: 'bg-chart-3' },
                                        { name: 'Misc/Exam', percent: 5, color: 'bg-chart-4' }
                                    ].map((comp, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-muted-foreground">{comp.name}</span>
                                                <span className="font-bold text-foreground">{comp.percent}%</span>
                                            </div>
                                            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                                <div className={`${comp.color} h-full`} style={{ width: `${comp.percent}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
                            <div className="flex gap-3">
                                <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-foreground">Transparency Note</h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Payments are reflected within 24 hours of bank clearance. UPI & Card payments are credited instantly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default FeeLedger;
