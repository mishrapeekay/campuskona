import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchFinancialSummary,
    fetchPayments,
    fetchExpenses
} from '../../store/slices/financeSlice';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Skeleton } from '@/ui/primitives/skeleton';
import {
    IndianRupee,
    TrendingUp,
    TrendingDown,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    PieChart,
    BarChart3
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const FinanceDashboard = () => {
    const dispatch = useDispatch();
    const { financialSummary, payments, expenses, loading } = useSelector((state) => state.finance);

    useEffect(() => {
        dispatch(fetchFinancialSummary());
        dispatch(fetchPayments({ page: 1, page_size: 5 }));
        dispatch(fetchExpenses({ page: 1, page_size: 5 }));
    }, [dispatch]);

    const summaryData = financialSummary?.data || {
        total_fees: 0,
        total_collected: 0,
        total_pending: 0,
        total_expenses: 0,
        net_balance: 0
    };

    const collectionVsPendingData = {
        labels: ['Collected', 'Pending'],
        datasets: [
            {
                data: [summaryData.total_collected, summaryData.total_pending],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)', // Emerald-500
                    'rgba(245, 158, 11, 0.8)'  // Amber-500
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const incomeVsExpenseData = {
        labels: ['Income', 'Expense', 'Net'],
        datasets: [
            {
                label: 'Amount (₹)',
                data: [summaryData.total_collected, summaryData.total_expenses, summaryData.net_balance],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)', // Emerald
                    'rgba(239, 68, 68, 0.8)',   // Red
                    'rgba(139, 92, 246, 0.8)'   // Violet
                ],
                borderRadius: 4,
            },
        ],
    };

    if (loading && !financialSummary) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-64" />
                        <Skeleton className="h-64" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-64" />
                        <Skeleton className="h-64" />
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6 pb-12">
                <PageHeader
                    title="Financial Overview"
                    description="Monitor your school's financial health and transactions"
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-emerald-500/10 via-background to-background border-emerald-500/20 shadow-sm relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-24 w-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform hover:scale-110" />
                        <CardContent className="pt-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">Total Revenue</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        ₹{parseFloat(summaryData.total_collected).toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-destructive/10 via-background to-background border-destructive/20 shadow-sm relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-24 w-24 bg-destructive/10 rounded-bl-full -mr-4 -mt-4 transition-transform hover:scale-110" />
                        <CardContent className="pt-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-destructive font-medium mb-1">Total Expenses</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        ₹{parseFloat(summaryData.total_expenses).toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-destructive/10 p-2 rounded-lg">
                                    <TrendingDown className="w-6 h-6 text-destructive" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-500/10 via-background to-background border-amber-500/20 shadow-sm relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-24 w-24 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform hover:scale-110" />
                        <CardContent className="pt-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-1">Pending Fees</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        ₹{parseFloat(summaryData.total_pending).toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                                    <Activity className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-violet-500/10 via-background to-background border-violet-500/20 shadow-sm relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-24 w-24 bg-violet-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform hover:scale-110" />
                        <CardContent className="pt-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-violet-600 dark:text-violet-400 font-medium mb-1">Net Balance</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        ₹{parseFloat(summaryData.net_balance).toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded-lg">
                                    <Wallet className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-muted-foreground" />
                                <CardTitle>Collection Status</CardTitle>
                            </div>
                            <CardDescription>Visual breakdown of fee collection vs pending dues</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex justify-center items-center">
                                <Doughnut
                                    data={collectionVsPendingData}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'right',
                                                labels: {
                                                    color: 'hsl(var(--muted-foreground))'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-muted-foreground" />
                                <CardTitle>Financial Health</CardTitle>
                            </div>
                            <CardDescription>Comparative view of income, expenses, and net balance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <Bar
                                    data={incomeVsExpenseData}
                                    options={{
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                grid: { color: 'hsl(var(--border))' },
                                                ticks: { color: 'hsl(var(--muted-foreground))' }
                                            },
                                            x: {
                                                grid: { display: false },
                                                ticks: { color: 'hsl(var(--muted-foreground))' }
                                            }
                                        },
                                        plugins: {
                                            legend: { display: false }
                                        }
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent Payments */}
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Recent Collections</CardTitle>
                            <CardDescription>Latest fee payments received</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {payments.data?.slice(0, 5).map(payment => (
                                    <div key={payment.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-emerald-500/10 p-2 rounded-full">
                                                <ArrowDownRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-foreground">{payment.student_name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{payment.receipt_number}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">+₹{parseFloat(payment.amount).toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(payment.payment_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )) || (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <IndianRupee className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">No recent payments recorded</p>
                                        </div>
                                    )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Expenses */}
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Recent Expenses</CardTitle>
                            <CardDescription>Latest recorded expenditures</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {expenses.data?.slice(0, 5).map(expense => (
                                    <div key={expense.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-destructive/10 p-2 rounded-full">
                                                <ArrowUpRight className="w-4 h-4 text-destructive" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-foreground">{expense.title}</p>
                                                <p className="text-xs text-muted-foreground">{expense.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-destructive">-₹{parseFloat(expense.amount).toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(expense.expense_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )) || (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Wallet className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">No recent expenses recorded</p>
                                        </div>
                                    )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default FinanceDashboard;
