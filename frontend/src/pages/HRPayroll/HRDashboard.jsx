import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchDepartments,
    fetchHRDashboardStats,
    selectDepartments,
    selectHRDashboardStats,
    selectHRLoading,
} from '../../store/slices/hrPayrollSlice';
import {
    Building,
    BadgeCheck,
    BarChart3,
    Calculator,
    Users,
    Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Skeleton } from '@/ui/primitives/skeleton';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';

const HRDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const departments = useSelector(selectDepartments);
    const stats = useSelector(selectHRDashboardStats);
    const loading = useSelector(selectHRLoading);

    useEffect(() => {
        dispatch(fetchDepartments());
        dispatch(fetchHRDashboardStats());
    }, [dispatch]);

    if (loading && !stats) {
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
        { title: 'Departments', value: stats?.total_departments || departments.length, icon: Building, color: 'blue' },
        { title: 'Designations', value: stats?.total_designations || 0, icon: BadgeCheck, color: 'emerald' },
        { title: 'Salary Structures', value: stats?.total_staff_with_structures || 0, icon: BarChart3, color: 'violet' },
        { title: 'Salary Expense', value: `₹${((stats?.total_salary_expense || 0) / 100000).toFixed(1)}L`, icon: Calculator, color: 'amber' },
    ];

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="HR & Payroll"
                    description="Manage departments, salary structures, and payroll processing"
                    action={
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => navigate('/hr/departments')}>
                                <Building className="w-4 h-4 mr-2" />
                                Departments
                            </Button>
                            <Button onClick={() => navigate('/hr/payroll')}>
                                <Calculator className="w-4 h-4 mr-2" />
                                Process Payroll
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
                            <Card key={idx}>
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

                <Card>
                    <CardHeader>
                        <CardTitle>Departments Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {departments.map((dept) => (
                                <div key={dept.id} className="border border-border rounded-lg p-5 hover:bg-muted/50 transition-colors bg-card shadow-sm hover:shadow-md">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-lg text-foreground">{dept.name}</h4>
                                        <Badge variant="outline" className="text-xs">
                                            {dept.code}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                                        {dept.description || 'No description available for this department.'}
                                    </p>
                                    <div className="text-sm flex items-center text-foreground font-medium pt-3 border-t border-border">
                                        <Users className="w-4 h-4 mr-2 text-primary" />
                                        <span>Head: <span className="text-muted-foreground font-normal">{dept.head_name || 'Not assigned'}</span></span>
                                    </div>
                                </div>
                            ))}
                            {departments.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    <Building className="w-12 h-12 mx-auto opacity-20 mb-3" />
                                    <p>No departments found.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AnimatedPage>
    );
};

export default HRDashboard;
