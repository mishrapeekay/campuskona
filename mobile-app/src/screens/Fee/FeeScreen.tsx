import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import { COLORS, FONTS, SPACING, RADIUS } from '@/constants';
import { feeService, authService } from '@/services/api';
import { StudentFee, PaymentStatus } from '@/types/models';

const FeeScreen: React.FC = () => {
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalDue, setTotalDue] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);

  const loadFees = async () => {
    try {
      let user = await authService.getStoredUser();

      // If student_id is missing, try to refresh user data from server
      if (!user?.student_id) {
        try {
          console.log('Student ID missing in stored user, refreshing from server...');
          user = await authService.getCurrentUser();
        } catch (error) {
          console.warn('Failed to refresh user profile:', error);
        }
      }

      if (!user?.student_id) {
        // Check if user is actually a student
        if (user?.user_type !== 'STUDENT') {
          throw new Error(`Fee module is only available for Students. You are logged in as ${user?.user_type || 'Unknown'}.`);
        }
        throw new Error('Student profile not found. Please contact administration.');
      }

      const response = await feeService.getStudentFeeDetails(user.student_id);
      setFees(response);

      // Calculate totals
      const due = response.reduce((sum, fee) => sum + fee.balance_amount, 0);
      const paid = response.reduce((sum, fee) => sum + (fee.amount - fee.balance_amount), 0);
      setTotalDue(due);
      setTotalPaid(paid);
    } catch (error: any) {
      console.error('Error loading fees:', error);
      const errorMessage = error.message || 'Failed to load fee details';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFees();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return COLORS.success;
      case 'PARTIAL':
        return COLORS.warning;
      case 'OVERDUE':
        return COLORS.error;
      default:
        return COLORS.info;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'check-circle';
      case 'PARTIAL':
        return 'clock-alert';
      case 'OVERDUE':
        return 'alert-circle';
      default:
        return 'information';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const SummaryCard = () => (
    <Card style={styles.summaryCard} elevation="md">
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Paid</Text>
          <Text style={[styles.summaryAmount, { color: COLORS.success }]}>
            {formatCurrency(totalPaid)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Due</Text>
          <Text style={[styles.summaryAmount, { color: COLORS.error }]}>
            {formatCurrency(totalDue)}
          </Text>
        </View>
      </View>
    </Card>
  );

  const FeeCard: React.FC<{ fee: StudentFee }> = ({ fee }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => Alert.alert('Fee Details', `View details for ${fee.fee_category}`)}
    >
      <Card style={styles.feeCard} elevation="sm">
        <View style={styles.feeHeader}>
          <View style={styles.feeTitle}>
            <Icon name="receipt" size={24} color={COLORS.primary} />
            <View style={styles.feeTitleText}>
              <Text style={styles.feeType}>{fee.fee_category}</Text>
              <Text style={styles.academicYear}>{fee.academic_year}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(fee.status) + '20' }]}>
            <Icon name={getStatusIcon(fee.status)} size={16} color={getStatusColor(fee.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(fee.status) }]}>
              {fee.status}
            </Text>
          </View>
        </View>

        <View style={styles.feeDetails}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Total Amount</Text>
            <Text style={styles.feeValue}>{formatCurrency(fee.amount)}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Paid Amount</Text>
            <Text style={[styles.feeValue, { color: COLORS.success }]}>
              {formatCurrency(fee.amount - fee.balance_amount)}
            </Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Balance</Text>
            <Text style={[styles.feeValue, { color: COLORS.error, fontFamily: FONTS.bold }]}>
              {formatCurrency(fee.balance_amount)}
            </Text>
          </View>
          <View style={[styles.feeRow, styles.dueDateRow]}>
            <Icon name="calendar" size={16} color={COLORS.textSecondary} />
            <Text style={styles.dueDate}>Due: {formatDate(fee.due_date)}</Text>
          </View>
        </View>

        {fee.balance_amount > 0 && (
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => Alert.alert('Payment', 'Payment gateway integration pending')}
          >
            <Icon name="credit-card" size={18} color={COLORS.white} />
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <Header title="Fee Management" subtitle="Track fee payments" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <SummaryCard />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fee Details</Text>
          {loading ? (
            <Card style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading fees...</Text>
            </Card>
          ) : fees.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Icon name="receipt-text-outline" size={48} color={COLORS.gray400} />
              <Text style={styles.emptyText}>No fee records found</Text>
            </Card>
          ) : (
            fees.map((fee) => <FeeCard key={fee.id} fee={fee} />)
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  summaryCard: {
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  summaryAmount: {
    fontSize: FONTS['2xl'],
    fontFamily: FONTS.bold,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.gray300,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  feeCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  feeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  feeTitleText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  feeType: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  academicYear: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.bold,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  feeDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: SPACING.md,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  feeLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  feeValue: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  dueDateRow: {
    marginTop: SPACING.xs,
    justifyContent: 'flex-start',
  },
  dueDate: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    marginLeft: SPACING.xs,
  },
  loadingCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});

export default FeeScreen;
