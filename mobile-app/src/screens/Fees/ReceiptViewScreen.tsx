import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, STORAGE_KEYS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { feeService, studentService } from '@/services/api';
import { Payment } from '@/types/models';
import { fileService } from '@/services/file.service';

type ReceiptRouteParams = {
  transactionId?: string;
  paymentId?: string;
};

interface PaymentAllocation {
  fee_description: string;
  allocated_amount: number;
}

type PaymentWithAllocations = Payment & {
  allocations?: PaymentAllocation[];
};

interface ReceiptData {
  payment_id: string;
  receipt_number: string;
  transaction_id: string;
  payment_date: string;
  student: {
    name: string;
    admission_number: string;
    class: string;
    section: string;
  };
  school: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
  fee_details: {
    description: string;
    amount: number;
  }[];
  payment_method: string;
  total_amount: number;
  paid_amount: number;
  status: 'success' | 'pending' | 'failed' | 'refunded' | 'cancelled';
  remarks?: string;
}

const ReceiptViewScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params?: ReceiptRouteParams }, 'params'>>();
  const params = route.params as ReceiptRouteParams | undefined;
  const receiptKey = params?.paymentId || params?.transactionId;

  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (receiptKey) {
      loadReceipt();
    } else {
      setLoading(false);
      setReceipt(null);
    }
  }, [receiptKey]);

  const loadReceipt = async () => {
    setLoading(true);
    try {
      const payment = await resolvePayment();

      if (!payment) {
        throw new Error('Payment not found');
      }

      const schoolInfo = await resolveSchoolInfo();
      const studentInfo = await resolveStudentInfo(payment);
      const allocations = payment.allocations || [];
      const feeDetails =
        allocations.length > 0
          ? allocations.map((item) => ({
            description: item.fee_description,
            amount: item.allocated_amount,
          }))
          : [
            {
              description: 'Payment',
              amount: payment.amount,
            },
          ];

      const receiptData: ReceiptData = {
        payment_id: payment.id,
        receipt_number: payment.receipt_number || payment.id,
        transaction_id: payment.transaction_id || payment.receipt_number || payment.id,
        payment_date: payment.payment_date,
        student: studentInfo,
        school: schoolInfo,
        fee_details: feeDetails,
        payment_method: payment.payment_method_display || payment.payment_method,
        total_amount: payment.amount,
        paid_amount: payment.amount,
        status: mapPaymentStatus(payment.status),
        remarks: payment.remarks || payment.status_display,
      };

      setReceipt(receiptData);
    } catch (error) {
      console.error('Failed to load receipt:', error);
      Alert.alert('Error', 'Failed to load receipt. Please try again.');
      setReceipt(null);
    } finally {
      setLoading(false);
    }
  };

  const resolvePayment = async (): Promise<PaymentWithAllocations | null> => {
    if (params?.paymentId) {
      return (await feeService.getPayment(params.paymentId)) as PaymentWithAllocations;
    }

    if (params?.transactionId) {
      const searchResults = await feeService.searchPayments(params.transactionId);
      const match = searchResults.results?.[0];
      if (!match) {
        return null;
      }
      return (await feeService.getPayment(match.id)) as PaymentWithAllocations;
    }

    return null;
  };

  const resolveSchoolInfo = async (): Promise<ReceiptData['school']> => {
    try {
      const tenantData = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_TENANT);
      if (tenantData) {
        const tenant = JSON.parse(tenantData);
        return {
          name: tenant.school_name || 'School',
          address: tenant.address || 'Address not available',
          phone: tenant.contact_phone || 'Phone not available',
          email: tenant.contact_email || 'Email not available',
          logo: tenant.logo,
        };
      }
    } catch (error) {
      console.warn('Unable to read tenant info:', error);
    }

    return {
      name: 'School',
      address: 'Address not available',
      phone: 'Phone not available',
      email: 'Email not available',
    };
  };

  const resolveStudentInfo = async (
    payment: PaymentWithAllocations
  ): Promise<ReceiptData['student']> => {
    let name = payment.student_name || 'Student';
    let admissionNumber = 'N/A';
    let className = 'N/A';
    let sectionName = '';

    if (payment.student) {
      try {
        const student = await studentService.getStudent(payment.student);
        const fullName = [student.first_name, student.last_name].filter(Boolean).join(' ');
        name = fullName || name;
        admissionNumber = student.admission_number || admissionNumber;
        className = student.current_class || className;

        const enrollments = await studentService.getStudentEnrollment(payment.student);
        const active = enrollments.find((entry) => entry.is_active) || enrollments[0];
        sectionName = active?.section || sectionName;
      } catch (error) {
        console.warn('Unable to resolve student info:', error);
      }
    }

    return {
      name,
      admission_number: admissionNumber,
      class: className,
      section: sectionName,
    };
  };

  const mapPaymentStatus = (status: Payment['status']): ReceiptData['status'] => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'failed';
      case 'REFUNDED':
        return 'refunded';
      case 'CANCELLED':
        return 'cancelled';
      case 'PENDING':
      default:
        return 'pending';
    }
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async () => {
    if (!receipt) return;

    const message = `
PAYMENT RECEIPT

Receipt No: ${receipt.receipt_number}
Transaction ID: ${receipt.transaction_id}
Date: ${formatDate(receipt.payment_date)}

Student Details:
Name: ${receipt.student.name}
Admission No: ${receipt.student.admission_number}
Class: ${receipt.student.class} ${receipt.student.section}

Fee Details:
${receipt.fee_details.map((item) => `- ${item.description}: ${formatCurrency(item.amount)}`).join('\n')}

Total Amount: ${formatCurrency(receipt.total_amount)}
Payment Method: ${receipt.payment_method}
Status: ${receipt.status.toUpperCase()}

${receipt.school.name}
${receipt.school.address}
${receipt.school.phone}
${receipt.school.email}
    `.trim();

    try {
      await Share.share({ message });
    } catch (shareError) {
      console.error('Error sharing:', shareError);
    }
  };

  const handleDownload = async () => {
    if (!receipt?.payment_id) {
      Alert.alert('Download', 'Payment reference is missing for this receipt.');
      return;
    }

    try {
      await feeService.downloadReceipt(receipt.payment_id);
      Alert.alert('Download', 'Receipt download started.');
    } catch (error) {
      console.error('Download receipt failed:', error);
      Alert.alert('Download', 'Unable to download receipt right now.');
    }
  };

  const handlePrint = async () => {
    if (!receipt) return;

    try {
      const htmlContent = `
        <html>
          <body style="padding: 20px; font-family: Helvetica, Arial, sans-serif;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1>${receipt.school.name}</h1>
              <p>${receipt.school.address}</p>
              <p>Phone: ${receipt.school.phone} | Email: ${receipt.school.email}</p>
            </div>
            
            <h2 style="text-align: center; color: #444; border-bottom: 1px solid #ccc; padding-bottom: 10px;">PAYMENT RECEIPT</h2>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
              <div>
                <p><strong>Receipt No:</strong> ${receipt.receipt_number}</p>
                <p><strong>Transaction ID:</strong> ${receipt.transaction_id}</p>
              </div>
              <div style="text-align: right;">
                <p><strong>Date:</strong> ${formatDate(receipt.payment_date)}</p>
                <p><strong>Status:</strong> ${receipt.status.toUpperCase()}</p>
              </div>
            </div>

            <div style="background: #f9f9f9; padding: 15px; margin-bottom: 20px;">
              <h3>Student Details</h3>
              <p><strong>Name:</strong> ${receipt.student.name}</p>
              <p><strong>Admission No:</strong> ${receipt.student.admission_number}</p>
              <p><strong>Class:</strong> ${receipt.student.class} ${receipt.student.section}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #eee;">
                  <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;">Description</th>
                  <th style="text-align: right; padding: 10px; border-bottom: 1px solid #ddd;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${receipt.fee_details.map(item => `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
                    <td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee;">${formatCurrency(item.amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                 <tr>
                    <td style="padding: 10px; font-weight: bold; text-align: right;">Total Amount</td>
                    <td style="padding: 10px; font-weight: bold; text-align: right;">${formatCurrency(receipt.total_amount)}</td>
                 </tr>
              </tfoot>
            </table>

            <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
              <p>This is a computer-generated receipt.</p>
            </div>
          </body>
        </html>
      `;

      await fileService.printPDF(htmlContent, 'Receipt_' + receipt.receipt_number);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate print layout');
    }
  };

  const handleEmail = () => {
    // TODO: Implement email functionality
    Alert.alert('Email', 'Receipt will be sent to registered email');
  };

  if (loading || !receipt) {
    return (
      <ScreenWrapper>
        <Header title="Receipt" showBackButton onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Icon name="file-document-outline" size={64} color={COLORS.gray300} />
          <Text style={styles.loadingText}>
            {receiptKey ? 'Loading receipt...' : 'Receipt not available'}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const getStatusConfig = (status: ReceiptData['status']) => {
    const configs = {
      success: { icon: 'check-circle', color: COLORS.success, label: 'Paid', bgColor: COLORS.success + '15' },
      pending: { icon: 'clock-outline', color: COLORS.warning, label: 'Pending', bgColor: COLORS.warning + '15' },
      failed: { icon: 'close-circle', color: COLORS.error, label: 'Failed', bgColor: COLORS.error + '15' },
      refunded: { icon: 'cash-refund', color: COLORS.info, label: 'Refunded', bgColor: COLORS.info + '15' },
      cancelled: { icon: 'cancel', color: COLORS.gray500, label: 'Cancelled', bgColor: COLORS.gray200 },
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(receipt.status);

  return (
    <ScreenWrapper>
      <Header
        title="Receipt"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Card elevation="lg" padding={0} style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <View style={styles.schoolLogoContainer}>
              <Icon name="school" size={40} color={COLORS.primary} />
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <Icon name={statusConfig.icon} size={16} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.schoolName}>{receipt.school.name}</Text>
            <Text style={styles.schoolAddress}>{receipt.school.address}</Text>
            <View style={styles.contactRow}>
              <Icon name="phone" size={14} color={COLORS.gray500} />
              <Text style={styles.contactText}>{receipt.school.phone}</Text>
            </View>
            <View style={styles.contactRow}>
              <Icon name="email" size={14} color={COLORS.gray500} />
              <Text style={styles.contactText}>{receipt.school.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.receiptTitle}>PAYMENT RECEIPT</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Receipt No:</Text>
              <Text style={styles.infoValue}>{receipt.receipt_number}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Transaction ID:</Text>
              <Text style={styles.infoValue}>{receipt.transaction_id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date & Time:</Text>
              <Text style={styles.infoValue}>{formatDate(receipt.payment_date)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Student Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{receipt.student.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Admission No:</Text>
              <Text style={styles.infoValue}>{receipt.student.admission_number}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Class:</Text>
              <Text style={styles.infoValue}>
                {receipt.student.class} {receipt.student.section}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fee Details</Text>
            {receipt.fee_details.map((item, index) => (
              <View key={index} style={styles.feeRow}>
                <Text style={styles.feeDescription}>{item.description}</Text>
                <Text style={styles.feeAmount}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Method:</Text>
              <Text style={styles.summaryValue}>{receipt.payment_method}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(receipt.total_amount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Amount Paid:</Text>
              <Text style={styles.totalValue}>{formatCurrency(receipt.paid_amount)}</Text>
            </View>
          </View>

          {receipt.remarks && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.remarksLabel}>Remarks:</Text>
                <Text style={styles.remarksText}>{receipt.remarks}</Text>
              </View>
            </>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This is a computer-generated receipt and does not require a signature.
            </Text>
            <Text style={styles.footerText}>
              For any queries, please contact the accounts department.
            </Text>
          </View>
        </Card>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
            <View style={styles.actionIconContainer}>
              <Icon name="download" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
            <View style={styles.actionIconContainer}>
              <Icon name="printer" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.actionButtonText}>Print</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
            <View style={styles.actionIconContainer}>
              <Icon name="email" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.actionButtonText}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <View style={styles.actionIconContainer}>
              <Icon name="share-variant" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Back to Payment History"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={styles.backButton}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.semibold,
    color: COLORS.gray500,
    marginTop: SPACING.md,
  },
  receiptCard: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.lg,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: COLORS.primary + '08',
  },
  schoolLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.bold,
  },
  section: {
    padding: SPACING.lg,
  },
  schoolName: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: 4,
    textAlign: 'center',
  },
  schoolAddress: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  contactText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginHorizontal: SPACING.lg,
  },
  receiptTitle: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  infoValue: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  feeDescription: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray700,
    flex: 1,
  },
  feeAmount: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  summaryValue: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  totalLabel: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
  },
  totalValue: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  remarksLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray700,
    marginBottom: 4,
  },
  remarksText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    fontStyle: 'italic',
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.gray50,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  footerText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  actionButton: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
});

export default ReceiptViewScreen;
