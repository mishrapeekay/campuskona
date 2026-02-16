/**
 * TenantsStackNavigator - Super Admin Tenant Management
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TenantsStackParamList } from '@/types/navigation';
import { COLORS } from '@/constants';

// Tenant Management Screens
import TenantManagementScreen from '@/screens/SuperAdmin/TenantManagementScreen';
import TenantDetailScreen from '@/screens/SuperAdmin/TenantDetailScreen';
import TenantSetupWizardScreen from '@/screens/SuperAdmin/TenantSetupWizardScreen';
import DeploymentTrackerScreen from '@/screens/SuperAdmin/DeploymentTrackerScreen';
import PlatformDashboardScreen from '@/screens/SuperAdmin/PlatformDashboardScreen';
import AuditLogsScreen from '@/screens/SuperAdmin/AuditLogsScreen';
import PlatformAnalyticsScreen from '@/screens/SuperAdmin/PlatformAnalyticsScreen';
import PlatformSettingsScreen from '@/screens/SuperAdmin/PlatformSettingsScreen';

const Stack = createNativeStackNavigator<TenantsStackParamList>();

const TenantsStackNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: COLORS.background },
            }}
        >
            <Stack.Screen
                name="TenantManagement"
                component={TenantManagementScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="TenantDetail"
                component={TenantDetailScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="TenantSetupWizard"
                component={TenantSetupWizardScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="DeploymentTracker"
                component={DeploymentTrackerScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PlatformDashboard"
                component={PlatformDashboardScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AuditLogs"
                component={AuditLogsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PlatformAnalytics"
                component={PlatformAnalyticsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PlatformSettings"
                component={PlatformSettingsScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default TenantsStackNavigator;
