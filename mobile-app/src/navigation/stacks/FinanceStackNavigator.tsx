/**
 * FinanceStackNavigator - Fees, Payments, Invoices
 *
 * Contains all finance-related screens:
 * - Fee overview and structure
 * - Payment gateway integration
 * - Payment history and receipts
 * - Invoice management
 * - Financial reports
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Types
import { FinanceStackParamList } from '@/types/navigation';

// Fee Screens
import FeeOverviewScreen from '@/screens/Fees/FeeOverviewScreen';
import FeeStructureScreen from '@/screens/Fees/FeeStructureScreen';
import FeeCategoriesScreen from '@/screens/Fees/FeeCategoriesScreen';
import StudentFeeListScreen from '@/screens/Fees/StudentFeeListScreen';
import FeeDetailsScreen from '@/screens/Fees/FeeDetailsScreen';

// Payment Screens
import PaymentGatewayScreen from '@/screens/Fees/PaymentGatewayScreen';
import PaymentHistoryScreen from '@/screens/Fees/PaymentHistoryScreen';

// Receipt Screens
import ReceiptViewScreen from '@/screens/Fees/ReceiptViewScreen';

// Reminder Screens
import FeeRemindersScreen from '@/screens/Fees/FeeRemindersScreen';

// Report Screens
import ReportsDashboardScreen from '@/screens/Reports/ReportsDashboardScreen';

// Constants
import { COLORS } from '@/constants';

const Stack = createNativeStackNavigator<FinanceStackParamList>();

// Finance Home - Entry point for finance tab
const FinanceHomeScreen: React.FC = () => {
  return <FeeOverviewScreen />;
};

const FinanceStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      {/* Finance Home - Entry Point */}
      <Stack.Screen name="FinanceHome" component={FinanceHomeScreen} />

      {/* ===== FEE OVERVIEW ===== */}
      <Stack.Screen name="FeeOverview" component={FeeOverviewScreen} />
      <Stack.Screen
        name="FeeStructure"
        component={FeeStructureScreen}
        options={{
          headerShown: true,
          headerTitle: 'Fee Structure',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="FeeCategories"
        component={FeeCategoriesScreen}
        options={{
          headerShown: true,
          headerTitle: 'Fee Categories',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== STUDENT FEES ===== */}
      <Stack.Screen
        name="StudentFeeList"
        component={StudentFeeListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Student Fees',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="StudentFeeDetail"
        component={FeeDetailsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Fee Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="FeeDetails"
        component={FeeDetailsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Fee Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="FeeBreakdown"
        component={FeeStructureScreen}
        options={{
          headerShown: true,
          headerTitle: 'Fee Breakdown',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== PAYMENTS ===== */}
      <Stack.Screen
        name="PaymentGateway"
        component={PaymentGatewayScreen}
        options={{
          headerShown: true,
          headerTitle: 'Make Payment',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentGatewayScreen}
        options={{
          headerShown: true,
          headerTitle: 'Payment Methods',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="PaymentProcessing"
        component={PaymentGatewayScreen}
        options={{
          headerShown: true,
          headerTitle: 'Processing Payment',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
          gestureEnabled: false, // Prevent swipe back during payment
        }}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={ReceiptViewScreen}
        options={{
          headerShown: true,
          headerTitle: 'Payment Successful',
          headerStyle: { backgroundColor: COLORS.success },
          headerTintColor: COLORS.white,
          headerTitleStyle: { color: COLORS.white },
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="PaymentFailed"
        component={PaymentGatewayScreen}
        options={{
          headerShown: true,
          headerTitle: 'Payment Failed',
          headerStyle: { backgroundColor: COLORS.error },
          headerTintColor: COLORS.white,
          headerTitleStyle: { color: COLORS.white },
        }}
      />
      <Stack.Screen
        name="PaymentHistory"
        component={PaymentHistoryScreen}
        options={{
          headerShown: true,
          headerTitle: 'Payment History',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="PaymentDetail"
        component={ReceiptViewScreen}
        options={{
          headerShown: true,
          headerTitle: 'Payment Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== RECEIPTS & INVOICES ===== */}
      <Stack.Screen
        name="ReceiptView"
        component={ReceiptViewScreen}
        options={{
          headerShown: true,
          headerTitle: 'Payment Receipt',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="ReceiptDownload"
        component={ReceiptViewScreen}
        options={{
          headerShown: true,
          headerTitle: 'Download Receipt',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="InvoiceList"
        component={FeeOverviewScreen}
        options={{
          headerShown: true,
          headerTitle: 'Invoices',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="InvoiceDetail"
        component={ReceiptViewScreen}
        options={{
          headerShown: true,
          headerTitle: 'Invoice Details',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="GenerateInvoice"
        component={FeeOverviewScreen}
        options={{
          headerShown: true,
          headerTitle: 'Generate Invoice',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== FEE REMINDERS ===== */}
      <Stack.Screen
        name="FeeReminders"
        component={FeeRemindersScreen}
        options={{
          headerShown: true,
          headerTitle: 'Fee Reminders',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="SendReminder"
        component={FeeRemindersScreen}
        options={{
          headerShown: true,
          headerTitle: 'Send Reminder',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />

      {/* ===== REPORTS (Admin/Accountant) ===== */}
      <Stack.Screen
        name="FeeCollectionReport"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Fee Collection Report',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="OutstandingReport"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Outstanding Fees',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="ExpenseManagement"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Expense Management',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="AddExpense"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Add Expense',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="FinancialSummary"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Financial Summary',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
      <Stack.Screen
        name="FinancialReports"
        component={ReportsDashboardScreen}
        options={{
          headerShown: true,
          headerTitle: 'Financial Reports',
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.gray900 },
        }}
      />
    </Stack.Navigator>
  );
};

export default FinanceStackNavigator;
