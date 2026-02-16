import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PartnerStackParamList } from '@/types/navigation';
import { COLORS } from '@/constants';

// Screens
import PartnerDashboardScreen from '@/screens/Partner/PartnerDashboardScreen';
// Placeholders for other screens if they don't exist yet, or reuse existing ones if applicable
// For now, we'll route to Dashboard for unimplemented screens or create simple placeholders

const Stack = createNativeStackNavigator<PartnerStackParamList>();

const PartnerStackNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background },
                animation: 'slide_from_right',
            }}
            initialRouteName="PartnerDashboard"
        >
            <Stack.Screen name="PartnerDashboard" component={PartnerDashboardScreen} />
            {/* 
        Add other screens here when implemented:
        LeadList, LeadDetail, CommissionLedger, PayoutHistory, RegisterLead 
      */}
        </Stack.Navigator>
    );
};

export default PartnerStackNavigator;
