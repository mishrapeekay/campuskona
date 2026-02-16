import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPartnerDashboard,
} from '../../store/slices/partnersSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Skeleton } from '@/ui/primitives/skeleton';
import { StatsCard } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import {
    UserGroupIcon,
    BanknotesIcon,
    ArrowTrendingUpIcon,
    BriefcaseIcon,
    CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const PartnerDashboard = () => {
    const dispatch = useDispatch();
    const { dashboard, error } = useSelector((state) => state.partners);

    useEffect(() => {
        dispatch(fetchPartnerDashboard());
    }, [dispatch]);

    if (dashboard.loading) {
        return (
            <div className="p-6 space-y-6">
                <div>
                    <Skeleton className="h-8 w-52 mb-2" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <StatsCard key={i} loading />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80 rounded-xl" />
                    <Skeleton className="h-80 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!dashboard.data) return <div className="p-12 text-center text-muted-foreground">No dashboard data available</div>;

    const { summary, performance_metrics } = dashboard.data;

    return (
        <AnimatedPage>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Partner Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Monitor your leads, commissions, and performance.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Leads"
                        value={summary.total_leads}
                        icon={<UserGroupIcon className="h-6 w-6" />}
                    />
                    <StatsCard
                        title="Qualified Leads"
                        value={summary.qualified_leads}
                        icon={<BriefcaseIcon className="h-6 w-6" />}
                    />
                    <StatsCard
                        title="Total Commissions"
                        value={`₹${summary.total_commissions}`}
                        icon={<CurrencyRupeeIcon className="h-6 w-6" />}
                    />
                    <StatsCard
                        title="Pending Payouts"
                        value={`₹${summary.pending_payouts}`}
                        icon={<BanknotesIcon className="h-6 w-6" />}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64">
                                <Bar
                                    data={{
                                        labels: ['Lead to Opp', 'Opp to Win', 'Overall'],
                                        datasets: [{
                                            label: 'Conversion %',
                                            data: [
                                                performance_metrics.lead_to_opportunity_conversion,
                                                performance_metrics.opportunity_to_win_conversion,
                                                performance_metrics.overall_conversion
                                            ],
                                            backgroundColor: ['hsl(var(--primary))', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)']
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                max: 100,
                                                ticks: { color: 'hsl(var(--muted-foreground))' },
                                                grid: { color: 'hsl(var(--border))' },
                                            },
                                            x: {
                                                ticks: { color: 'hsl(var(--muted-foreground))' },
                                                grid: { color: 'hsl(var(--border))' },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Business Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-background rounded-xl">
                                    <span className="text-sm font-medium text-muted-foreground">Active Schools</span>
                                    <span className="text-lg font-bold text-foreground">{summary.onboarded_schools}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-background rounded-xl">
                                    <span className="text-sm font-medium text-muted-foreground">Avg Lead Quality</span>
                                    <span className="text-lg font-bold text-foreground">8.4/10</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-background rounded-xl">
                                    <span className="text-sm font-medium text-muted-foreground">Last Payout</span>
                                    <span className="text-lg font-bold text-foreground">₹0</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default PartnerDashboard;
