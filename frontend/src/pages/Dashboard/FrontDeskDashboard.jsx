import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    UserPlusIcon,
    ClipboardDocumentListIcon,
    UserIcon,
    MegaphoneIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';
import { StatsCard } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { getDashboardStats } from '../../api/students';
import { fetchNotices } from '../../store/slices/communicationSlice';

const FrontDeskDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { notices, loading: noticesLoading } = useSelector((state) => state.communication);

    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        dispatch(fetchNotices());

        const fetchStats = async () => {
            try {
                const response = await getDashboardStats();
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch front desk stats", error);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, [dispatch]);

    if (statsLoading || noticesLoading) {
        return (
            <div className="p-6 space-y-6">
                <div>
                    <Skeleton className="h-8 w-40 mb-2" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <StatsCard key={i} loading />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-48 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                </div>
            </div>
        );
    }

    const statsData = stats || {
        total_inquiries: 0,
        pending_admissions: 0,
        new_admissions_today: 0
    };

    const cards = [
        {
            name: 'New Inquiries',
            value: statsData.total_inquiries.toString(),
            icon: ClipboardDocumentListIcon,
            color: 'blue',
            changeType: 'neutral'
        },
        {
            name: 'Pending Admissions',
            value: statsData.pending_admissions.toString(),
            icon: UserPlusIcon,
            color: 'orange',
            changeType: statsData.pending_admissions > 5 ? 'increase' : 'neutral'
        },
        {
            name: "Today's Admissions",
            value: statsData.new_admissions_today.toString(),
            icon: UserIcon,
            color: 'green',
            changeType: 'increase'
        },
        {
            name: 'Active Notices',
            value: notices.data.length.toString(),
            icon: MegaphoneIcon,
            color: 'purple',
            changeType: 'neutral'
        }
    ];

    return (
        <AnimatedPage>
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Front Desk
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Admission Inquiries and Visitor Management
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card) => (
                        <StatsCard
                            key={card.name}
                            title={card.name}
                            value={card.value}
                            icon={<card.icon className="h-6 w-6" />}
                            trend={card.changeType === 'increase' ? 'up' : card.changeType === 'decrease' ? 'down' : 'neutral'}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start bg-primary/10 text-primary hover:bg-primary/20"
                                >
                                    + New Admission Inquiry
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50"
                                >
                                    + Log Visitor
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Notices */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Notices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="divide-y divide-border">
                                {notices.data.slice(0, 5).map((notice) => (
                                    <li key={notice.id} className="py-3">
                                        <p className="text-sm font-medium text-foreground">{notice.title}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(notice.created_at).toLocaleDateString()}</p>
                                    </li>
                                ))}
                                {notices.data.length === 0 && <p className="text-muted-foreground text-sm">No recent notices.</p>}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default FrontDeskDashboard;
