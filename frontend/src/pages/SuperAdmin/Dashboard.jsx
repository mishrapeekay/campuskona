import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  UsersIcon,
  AcademicCapIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  PlusIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Skeleton } from '@/ui/primitives/skeleton';
import { StatsCard } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { getSuperAdminDashboardStats } from '../../api/tenants';
import { useSelector } from 'react-redux';

const SuperAdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getSuperAdminDashboardStats();
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="mb-6">
          <Skeleton className="h-8 w-56 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <StatsCard key={i} loading />
          ))}
        </div>
        <Skeleton className="h-6 w-36 mb-4" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-950/30 rounded-xl hover:bg-red-200 dark:hover:bg-red-950/50 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const statItems = [
    {
      name: 'TOTAL SCHOOLS',
      value: stats?.total_schools || 0,
      icon: BuildingOfficeIcon,
      color: 'blue'
    },
    {
      name: 'ACTIVE SCHOOLS',
      value: stats?.active_schools || 0,
      icon: CheckCircleIcon,
      color: 'green'
    },
    {
      name: 'TOTAL USERS',
      value: stats?.total_users?.toLocaleString() || 0,
      icon: UsersIcon,
      color: 'purple'
    },
    {
      name: 'TOTAL STUDENTS',
      value: stats?.total_students?.toLocaleString() || 0,
      icon: AcademicCapIcon,
      color: 'indigo'
    },
    {
      name: 'MONTHLY REVENUE',
      value: `₹${(stats?.monthly_revenue || 0).toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: 'orange'
    },
    {
      name: 'SYSTEM HEALTH',
      value: stats?.system_health || 'Unknown',
      icon: CheckCircleIcon,
      color: stats?.system_health === 'Healthy' ? 'green' : 'red'
    }
  ];

  const quickActions = [
    {
      name: 'Add New School',
      icon: PlusIcon,
      iconAllowed: true,
      iconBg: 'bg-green-100 dark:bg-green-950/30',
      iconColor: 'text-green-600',
      link: '/super-admin/tenants/create'
    },
    {
      name: 'Manage Tenants',
      icon: BuildingOfficeIcon,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      link: '/super-admin/tenants'
    },
    {
      name: 'View Audit Logs',
      icon: ClipboardDocumentListIcon,
      iconBg: 'bg-purple-100 dark:bg-purple-950/30',
      iconColor: 'text-purple-600',
      link: '/admin/audit-logs'
    }
  ];

  return (
    <AnimatedPage>
      <div className="space-y-6 p-6 bg-background min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Platform Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome, {user?.first_name || 'Super Admin'}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statItems.map((item) => (
            <StatsCard
              key={item.name}
              title={item.name}
              value={item.value}
              icon={<item.icon className="h-6 w-6" />}
            />
          ))}
        </div>

        <h2 className="text-lg font-medium text-foreground mb-4">Quick Actions</h2>
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.link}
                className="flex items-center px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className={`flex-shrink-0 h-10 w-10 rounded-full ${action.iconBg} flex items-center justify-center`}>
                  <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-foreground">{action.name}</h3>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
};

export default SuperAdminDashboard;
