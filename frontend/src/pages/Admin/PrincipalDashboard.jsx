import React, { useState, useEffect } from 'react';
import {
    Card,
    Badge,
    LoadingSpinner,
} from '../../components/common';
import { analyticsAPI } from '../../api/analytics';
import { toast } from 'react-toastify';
import {
    ChartBarIcon,
    BanknotesIcon,
    AcademicCapIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const PrincipalDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await analyticsAPI.getPrincipalHealth();
            setStats(response.data);
        } catch (error) {
            toast.error('Failed to load school health metrics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;
    if (!stats) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <div className="bg-indigo-900 text-white pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight">Executive Dashboard</h1>
                            <p className="text-indigo-200 mt-2 font-medium">Real-time school performance & compliance health score</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Overall Health Score</span>
                            <div className="text-6xl font-black text-emerald-400">{stats.overall_score}%</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
                {/* Primary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <HealthCard
                        title="Financial Health"
                        value={`${stats.finance.collection_percentage}%`}
                        sub={`₹${stats.finance.total_collected.toLocaleString()} Collected`}
                        icon={<BanknotesIcon className="w-6 h-6" />}
                        trend="+4.2%"
                        color="indigo"
                    />
                    <HealthCard
                        title="Academic Progress"
                        value={`${stats.academics.syllabus_coverage}%`}
                        sub="Syllabus Coverage"
                        icon={<AcademicCapIcon className="w-6 h-6" />}
                        trend="+1.5%"
                        color="blue"
                    />
                    <HealthCard
                        title="Today's Attendance"
                        value={`${stats.attendance.today_percentage}%`}
                        sub={`${stats.attendance.staff_attendance}% Staff Present`}
                        icon={<UserGroupIcon className="w-6 h-6" />}
                        trend="-0.5%"
                        trendDown
                        color="emerald"
                    />
                    <HealthCard
                        title="DPDP Compliance"
                        value={`${stats.compliance.dpdp_score}%`}
                        sub={`${stats.compliance.pending_correction_requests} Pending Requests`}
                        icon={<ShieldCheckIcon className="w-6 h-6" />}
                        trend="+12%"
                        color="purple"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Finance Deep Dive */}
                    <Card title="Fee Collection Trend" className="lg:col-span-2">
                        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-400 font-medium">Collection Chart Placeholder</p>
                        </div>
                    </Card>

                    {/* House Standings */}
                    <Card title="House Standings" icon={<ChartBarIcon className="w-5 h-5" />}>
                        <div className="space-y-6">
                            {stats.houses.map((house, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-slate-700">{house.name} House</span>
                                        <span className="text-sm font-black text-slate-900">{house.points} PTS</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-1000"
                                            style={{
                                                backgroundColor: house.color_code,
                                                width: `${(house.points / stats.houses[0].points) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const HealthCard = ({ title, value, sub, icon, trend, trendDown, color }) => (
    <Card className="border-none shadow-xl">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600`}>
                {icon}
            </div>
            <div className={`flex items-center gap-1 text-xs font-black ${trendDown ? 'text-rose-500' : 'text-emerald-500'}`}>
                {trendDown ? <ArrowTrendingDownIcon className="w-3 h-3" /> : <ArrowTrendingUpIcon className="w-3 h-3" />}
                {trend}
            </div>
        </div>
        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
        <p className="text-xs text-slate-400 font-medium mt-2">{sub}</p>
    </Card>
);

export default PrincipalDashboard;
