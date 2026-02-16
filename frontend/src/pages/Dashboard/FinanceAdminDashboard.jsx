import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    CurrencyRupeeIcon,
    ArrowTrendingUpIcon,
    CreditCardIcon,
    BanknotesIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { Skeleton } from '@/ui/primitives/skeleton';
import { StatsCard } from '@/ui/composites';
import { Button } from '@/ui/primitives/button';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const FinanceAdminDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // Mock fetching finance stats
        // GET /api/v1/finance/dashboard-summary/
        setTimeout(() => {
            setStats({
                collection_this_month: 1250000,
                outstanding_fees: 450000,
                pending_payouts: 85000,
                revenue_growth: 15.5,
                recent_transactions: [
                    { id: 1, student: 'Rahul Sharma', amount: 15000, date: 'Today', method: 'UPI', type: 'FEE' },
                    { id: 2, student: 'Sanya Gupta', amount: 12000, date: 'Today', method: 'CASH', type: 'FEE' },
                    { id: 3, student: 'Amit Patel', amount: 8000, date: 'Yesterday', method: 'BANK', type: 'FEE' },
                ],
                chartData: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'Collection (₹)',
                            data: [800000, 950000, 1100000, 1050000, 1200000, 1250000],
                            borderColor: 'rgb(59, 130, 246)',
                            tension: 0.3,
                        }
                    ]
                }
            });
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-4 w-80" />
                    </div>
                    <Skeleton className="h-9 w-28" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <StatsCard key={i} loading />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-80 lg:col-span-2 rounded-xl" />
                    <Skeleton className="h-80 rounded-xl" />
                </div>
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    return (
        <AnimatedPage>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Finance Control Center</h1>
                        <p className="text-sm text-muted-foreground">Managing collections, fees, and expenditures.</p>
                    </div>
                    <Button variant="secondary">
                        <ArrowPathIcon className="h-5 w-5 mr-2" />
                        Refresh
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Collection (This Month)"
                        value={`₹${stats.collection_this_month.toLocaleString()}`}
                        icon={<CurrencyRupeeIcon className="h-6 w-6" />}
                        trend="up"
                        trendValue={`${stats.revenue_growth}%`}
                    />
                    <StatsCard
                        title="Outstanding Fees"
                        value={`₹${stats.outstanding_fees.toLocaleString()}`}
                        icon={<ExclamationTriangleIcon className="h-6 w-6" />}
                        trend="down"
                        trendValue="-5%"
                    />
                    <StatsCard
                        title="Pending Vendor Payouts"
                        value={`₹${stats.pending_payouts.toLocaleString()}`}
                        icon={<BanknotesIcon className="h-6 w-6" />}
                    />
                    <StatsCard
                        title="Online Payments Ratio"
                        value="78%"
                        icon={<CreditCardIcon className="h-6 w-6" />}
                        trend="up"
                        trendValue="+12%"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <Line data={stats.chartData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Fee Collection Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">Total Expected</span>
                                        <span className="font-bold">₹17L</span>
                                    </div>
                                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                        <div className="bg-green-500 h-full" style={{ width: '74%' }} />
                                    </div>
                                    <p className="text-right text-xs text-muted-foreground mt-1">74% Collected</p>
                                </div>

                                <div className="pt-4 border-t border flex flex-col gap-3">
                                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                                        <span className="text-sm text-red-700 dark:text-red-400">12 Defaulters</span>
                                        <Button variant="secondary" size="sm" className="text-xs">Remind All</Button>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                        <span className="text-sm text-blue-700 dark:text-blue-400">8 Waivers Pending</span>
                                        <Button variant="secondary" size="sm" className="text-xs">Review</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Ledger Entries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Method</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {stats.recent_transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{t.student}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-bold">₹{t.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Badge variant="secondary">{t.method}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{t.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button className="text-primary hover:text-primary/80 font-medium">Receipt</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AnimatedPage>
    );
};

export default FinanceAdminDashboard;
