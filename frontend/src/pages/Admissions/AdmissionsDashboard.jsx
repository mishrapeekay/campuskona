import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchEnquiryStats,
    fetchApplicationStats,
    fetchAdmissionSettings,
    selectEnquiryStats,
    selectApplicationStats,
    selectAdmissionSettings,
    selectAdmissionLoading,
} from '../../store/slices/admissionsSlice';
import { HelpCircle, FileText, CheckCircle, Clock, Calendar, Users, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Skeleton } from '@/ui/primitives/skeleton';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';

const AdmissionsDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const enquiryStats = useSelector(selectEnquiryStats);
    const applicationStats = useSelector(selectApplicationStats);
    const settings = useSelector(selectAdmissionSettings);
    const loading = useSelector(selectAdmissionLoading);

    useEffect(() => {
        dispatch(fetchEnquiryStats());
        dispatch(fetchApplicationStats());
        dispatch(fetchAdmissionSettings());
    }, [dispatch]);

    if (loading && !settings.length) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </div>
                    <Skeleton className="h-64" />
                </div>
            </AnimatedPage>
        );
    }

    const statsCards = [
        {
            title: 'Total Enquiries',
            value: enquiryStats?.total || 0,
            icon: HelpCircle,
            color: 'blue',
            onClick: () => navigate('/admissions/enquiries'),
        },
        {
            title: 'Applications',
            value: applicationStats?.total || 0,
            icon: FileText,
            color: 'emerald',
            onClick: () => navigate('/admissions/applications'),
        },
        {
            title: 'Approved',
            value: applicationStats?.approved ?? 0,
            icon: CheckCircle,
            color: 'violet',
        },
        {
            title: 'Pending Review',
            value: applicationStats?.under_review ?? 0,
            icon: Clock,
            color: 'amber',
        },
    ];

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Admissions Dashboard"
                    description="Manage student enquiries and applications"
                    action={
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => navigate('/admissions/enquiries/new')}>
                                <HelpCircle className="w-4 h-4 mr-2" />
                                New Enquiry
                            </Button>
                            <Button onClick={() => navigate('/admissions/applications/new')}>
                                <FileText className="w-4 h-4 mr-2" />
                                New Application
                            </Button>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsCards.map((card, idx) => {
                        const Icon = card.icon;
                        const colorClasses = {
                            blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                            emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                            violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
                            amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                        };

                        return (
                            <Card
                                key={idx}
                                className={card.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
                                onClick={card.onClick}
                            >
                                <CardContent className="flex items-center p-6">
                                    <div className={`p-4 rounded-full mr-4 ${colorClasses[card.color]}`}>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground font-medium">{card.title}</p>
                                        <p className="text-3xl font-bold text-foreground">{card.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Admission Settings Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Open Admissions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Seats</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Filled</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Available</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Deadline</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {settings.length > 0 ? (
                                        settings.map((setting) => (
                                            <tr key={setting.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                                    {setting.class_applied_name || setting.class_applied}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Users className="w-3 h-3 mr-1" />
                                                        {setting.total_seats}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    {setting.filled_seats}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {setting.available_seats}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        {setting.application_end_date}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={setting.is_open ? 'success' : 'destructive'}>
                                                        {setting.is_open ? 'Open' : 'Closed'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                                                <FolderOpen className="w-12 h-12 mx-auto opacity-20 mb-3" />
                                                <p>No admission settings configured.</p>
                                            </td>
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

export default AdmissionsDashboard;
