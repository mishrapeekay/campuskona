import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInvestorDashboard, refreshInvestorDashboard } from '../../store/slices/analyticsSlice';
import { Card, LoadingSpinner, StatsCard, Button } from '../../components/common';
import {
  CurrencyDollarIcon,
  UserPlusIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  MapIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const InvestorDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, error } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchInvestorDashboard());
  }, [dispatch]);

  const handleRefresh = async () => {
    await dispatch(refreshInvestorDashboard());
    dispatch(fetchInvestorDashboard());
  };

  if (dashboard.loading) return <div className="p-12"><LoadingSpinner size="lg" /></div>;
  if (!dashboard.data) return <div className="p-12 text-center text-gray-500">No data found</div>;

  const { summary, trends, growth } = dashboard.data;

  const chartData = {
    labels: trends.map(t => t.date),
    datasets: [
      {
        label: 'MRR Growth (₹)',
        data: trends.map(t => t.mrr),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderColor: '#3B82F6',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#3B82F6',
      }
    ]
  };

  const schoolTrendData = {
    labels: trends.map(t => t.date),
    datasets: [
      {
        label: 'Total Schools',
        data: trends.map(t => t.schools),
        borderColor: '#10B981',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#10B981',
      }
    ]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(156, 163, 175, 0.8)', // text-gray-400
          font: { weight: '600' }
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: { color: 'rgba(156, 163, 175, 0.8)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(156, 163, 175, 0.8)' }
      }
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investor Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time platform KPIs and growth metrics.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={handleRefresh}>
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Current MRR"
          value={`₹${summary.mrr.toLocaleString()}`}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          trend="up"
          trendValue="12%"
          color="blue"
        />
        <StatsCard
          title="Active Schools"
          value={summary.active_schools}
          icon={<AcademicCapIcon className="h-6 w-6" />}
          trend="up"
          trendValue="+8"
          color="green"
        />
        <StatsCard
          title="Churn Rate"
          value={`${summary.churn_rate}%`}
          icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
          trend="down"
          trendValue="-0.5%"
          color="red"
        />
        <StatsCard
          title="Total ARR"
          value={`₹${summary.arr.toLocaleString()}`}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          color="purple"
        />
      </div>

      {/* LTV/CAC Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Unit Economics">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground">CAC (Customer Acquisition Cost)</p>
              <p className="text-xl font-bold text-foreground">₹{summary.cac.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground">LTV (Lifetime Value)</p>
              <p className="text-xl font-bold text-foreground">₹{summary.ltv.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg col-span-2 border border-primary/20">
              <p className="text-sm text-primary font-bold uppercase tracking-wider text-[10px]">LTV/CAC Ratio</p>
              <p className="text-2xl font-black text-primary">{(summary.ltv / (summary.cac || 1)).toFixed(1)}x</p>
            </div>
          </div>
        </Card>

        <Card title="Growth Trends (MRR)">
          <div className="h-48">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Card>
      </div>

      {/* Market Adoption */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Regional Adoption" className="lg:col-span-1">
          <div className="space-y-4">
            {Object.entries(growth.regions).map(([region, count]) => (
              <div key={region} className="flex justify-between items-center group">
                <div className="flex items-center gap-2">
                  <MapIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors font-medium">{region}</span>
                </div>
                <Badge variant="secondary" className="font-bold">{count} Schools</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="School Acquisition Trend" className="lg:col-span-2">
          <div className="h-64">
            <Line data={schoolTrendData} options={chartOptions} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InvestorDashboard;
