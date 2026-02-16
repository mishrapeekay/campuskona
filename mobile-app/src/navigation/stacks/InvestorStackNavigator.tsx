import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InvestorStackParamList } from '@/types/navigation';
import { COLORS } from '@/constants';

// Screens
import InvestorDashboardScreen from '@/screens/Investor/InvestorDashboardScreen';
// Placeholders for other screens

const Stack = createNativeStackNavigator<InvestorStackParamList>();

const InvestorStackNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background },
                animation: 'slide_from_right',
            }}
            initialRouteName="InvestorDashboard"
        >
            <Stack.Screen name="InvestorDashboard" component={InvestorDashboardScreen} />
            {/* 
        Add other screens here when implemented:
        FinancialReports, GrowthMetrics, SchoolPerformance
      */}
        </Stack.Navigator>
    );
};

export default InvestorStackNavigator;
