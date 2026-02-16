import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, API_CONFIG } from '@/constants';
import { feeService } from '@/services/api/fee.service';
import useAuth from '@hooks/useAuth';

import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';

interface FeeItem {
  id: string;
  fee_type: string;
  balance_amount: number;
}

const PaymentGatewayScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const route = useRoute();
  const { feeItem } = route.params as { feeItem: FeeItem };
  const { user } = useAuth();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [amount, setAmount] = useState(feeItem.balance_amount.toString());
  const [processing, setProcessing] = useState(false);

  // Card payment fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // UPI field
  const [upiId, setUpiId] = useState('');

  // Net Banking field
  const [selectedBank, setSelectedBank] = useState('');

  const formatCurrency = (value: number): string => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const formatCardNumber = (text: string): string => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const validatePayment = (): boolean => {
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return false;
    }

    if (amountNum > feeItem.balance_amount) {
      Alert.alert('Invalid Amount', 'Amount cannot exceed balance amount');
      return false;
    }

    if (selectedMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        Alert.alert('Invalid Card', 'Please enter valid 16-digit card number');
        return false;
      }
      if (!cardName.trim()) {
        Alert.alert('Invalid Name', 'Please enter cardholder name');
        return false;
      }
      if (expiryDate.length !== 5) {
        Alert.alert('Invalid Expiry', 'Please enter valid expiry date (MM/YY)');
        return false;
      }
      if (cvv.length !== 3) {
        Alert.alert('Invalid CVV', 'Please enter valid 3-digit CVV');
        return false;
      }
    }

    if (selectedMethod === 'upi') {
      if (!upiId.includes('@')) {
        Alert.alert('Invalid UPI ID', 'Please enter valid UPI ID');
        return false;
      }
    }

    if (selectedMethod === 'netbanking') {
      if (!selectedBank) {
        Alert.alert('Select Bank', 'Please select a bank');
        return false;
      }
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;

    setProcessing(true);

    try {
      const amountNum = parseFloat(amount);

      // 1. Create Order on Backend
      const order = await feeService.createRazorpayOrder({
        student_fee_ids: [parseInt(feeItem.id)],
        amount: amountNum,
      });

      // 2. Open Razorpay Checkout
      const options = {
        description: `Fee Payment: ${feeItem.fee_type}`,
        image: 'https://i.imgur.com/3g7nmJC.png', // Replace with school logo
        currency: 'INR',
        key: API_CONFIG.RAZORPAY_KEY_ID,
        amount: order.amount,
        name: 'School Management System',
        order_id: order.id,
        prefill: {
          email: user?.email || '',
          contact: user?.phone || '',
          name: user?.first_name ? `${user.first_name} ${user.last_name}` : '',
        },
        theme: { color: COLORS.primary },
      };

      const response = await RazorpayCheckout.open(options);

      // 3. Verify Payment on Backend
      const verificationResponse = await feeService.verifyRazorpayPayment({
        razorpay_order_id: order.id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        student_fee_ids: [parseInt(feeItem.id)],
        amount: amountNum,
      });

      Alert.alert(
        'Payment Successful!',
        `Receipt No: ${verificationResponse.receipt_number}\nAmount: ${formatCurrency(amountNum)}`,
        [
          {
            text: 'View Receipt',
            onPress: () => {
              navigation.replace('ReceiptView', { payment_id: verificationResponse.payment_id });
            },

          },
          {
            text: 'OK',
            onPress: () => navigation.navigate('FeeOverview'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Payment Error:', error);
      Alert.alert(
        'Payment Failed',
        error?.description || error?.message || 'Transaction could not be completed.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const PaymentMethodButton: React.FC<{
    method: PaymentMethod;
    icon: string;
    label: string;
  }> = ({ method, icon, label }) => {
    const isActive = selectedMethod === method;

    return (
      <TouchableOpacity
        style={[styles.methodButton, isActive && styles.methodButtonActive]}
        onPress={() => setSelectedMethod(method)}
      >
        <View style={[styles.methodIcon, isActive && { backgroundColor: COLORS.primary + '15' }]}>
          <Icon name={icon} size={28} color={isActive ? COLORS.primary : COLORS.gray500} />
        </View>
        <Text style={[styles.methodLabel, isActive && styles.methodLabelActive]}>
          {label}
        </Text>
        {isActive && (
          <View style={styles.checkmark}>
            <Icon name="check-circle" size={20} color={COLORS.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Card Details</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text.replace(/\D/g, '')))}
                keyboardType="number-pad"
                maxLength={19}
                placeholderTextColor={COLORS.gray400}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="words"
                placeholderTextColor={COLORS.gray400}
              />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  keyboardType="number-pad"
                  maxLength={5}
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.sm }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cvv}
                  onChangeText={(text) => setCvv(text.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                  secureTextEntry
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
            </View>
          </View>
        );

      case 'upi':
        return (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>UPI Payment</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>UPI ID</Text>
              <TextInput
                style={styles.input}
                placeholder="yourname@upi"
                value={upiId}
                onChangeText={setUpiId}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.gray400}
              />
            </View>
            <View style={styles.infoBox}>
              <Icon name="information" size={16} color={COLORS.info} />
              <Text style={styles.infoText}>
                You will receive a payment request on your UPI app
              </Text>
            </View>
          </View>
        );

      case 'netbanking':
        return (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Select Your Bank</Text>
            <View style={styles.bankGrid}>
              {['SBI', 'HDFC', 'ICICI', 'Axis', 'PNB', 'BOB'].map((bank) => (
                <TouchableOpacity
                  key={bank}
                  style={[
                    styles.bankButton,
                    selectedBank === bank && styles.bankButtonActive,
                  ]}
                  onPress={() => setSelectedBank(bank)}
                >
                  <Text
                    style={[
                      styles.bankText,
                      selectedBank === bank && styles.bankTextActive,
                    ]}
                  >
                    {bank}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'wallet':
        return (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Digital Wallet</Text>
            <View style={styles.walletGrid}>
              {[
                { id: 'paytm', icon: 'wallet', label: 'Paytm' },
                { id: 'phonepe', icon: 'cellphone', label: 'PhonePe' },
                { id: 'googlepay', icon: 'google', label: 'Google Pay' },
              ].map((wallet) => (
                <TouchableOpacity key={wallet.id} style={styles.walletButton}>
                  <Icon name={wallet.icon} size={32} color={COLORS.primary} />
                  <Text style={styles.walletLabel}>{wallet.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScreenWrapper>
      <Header
        title="Payment Gateway"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Summary */}
        <Card elevation="lg" padding={SPACING.lg} style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Paying for</Text>
          <Text style={styles.summaryTitle}>{feeItem.fee_type}</Text>
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Amount to Pay</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountValue}
                value={amount}
                onChangeText={setAmount}
                keyboardType="number-pad"
                placeholderTextColor={COLORS.gray400}
              />
            </View>
            <Text style={styles.balanceText}>
              Balance: {formatCurrency(feeItem.balance_amount)}
            </Text>
          </View>
        </Card>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          <View style={styles.methodsGrid}>
            <PaymentMethodButton method="upi" icon="cellphone" label="UPI" />
            <PaymentMethodButton method="card" icon="credit-card" label="Card" />
            <PaymentMethodButton method="netbanking" icon="bank" label="Net Banking" />
            <PaymentMethodButton method="wallet" icon="wallet" label="Wallet" />
          </View>
        </View>

        {/* Payment Form */}
        {renderPaymentForm()}

        {/* Security Info */}
        <Card elevation="none" padding={SPACING.md} style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Icon name="shield-check" size={24} color={COLORS.success} />
            <Text style={styles.securityTitle}>Secure Payment</Text>
          </View>
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure. We never store your card details.
          </Text>
        </Card>

        {/* Pay Button */}
        <Button
          title={processing ? 'Processing...' : `Pay ${formatCurrency(parseFloat(amount || '0'))}`}
          onPress={handlePayment}
          disabled={processing}
          loading={processing}
          size="large"
          style={styles.payButton}
        />
      </ScrollView>

      {/* Processing Overlay */}
      {processing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.processingText}>Processing Payment...</Text>
            <Text style={styles.processingSubtext}>Please do not close or refresh</Text>
          </View>
        </View>
      )}
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
    paddingBottom: SPACING.xl,
  },
  summaryCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  summaryLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray500,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.lg,
  },
  amountSection: {
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    borderRadius: 8,
  },
  amountLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  currencySymbol: {
    fontSize: FONTS['3xl'],
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  amountValue: {
    fontSize: FONTS['3xl'],
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    flex: 1,
    padding: 0,
  },
  balanceText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  methodButton: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray200,
    position: 'relative',
  },
  methodButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  methodLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
  },
  methodLabelActive: {
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
  },
  formSection: {
    marginBottom: SPACING.lg,
  },
  formTitle: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.gray900,
  },
  row: {
    flexDirection: 'row',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '10',
    padding: SPACING.md,
    borderRadius: 8,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray700,
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  bankButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  bankButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  bankText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray700,
  },
  bankTextActive: {
    color: COLORS.primary,
  },
  walletGrid: {

    flexDirection: 'row',
    gap: SPACING.md,
  },
  walletButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  walletLabel: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
    marginTop: SPACING.xs,
  },
  securityCard: {
    backgroundColor: COLORS.success + '10',
    borderWidth: 1,
    borderColor: COLORS.success + '30',
    marginBottom: SPACING.lg,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  securityTitle: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  securityText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  payButton: {
    marginBottom: SPACING.xl,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: 200,
  },
  processingText: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
    marginTop: SPACING.md,
  },
  processingSubtext: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
});

export default PaymentGatewayScreen;
