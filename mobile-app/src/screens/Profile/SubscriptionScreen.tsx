import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, API_CONFIG } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import useAuth from '@hooks/useAuth';
import apiClient from '@/services/api/client';

import RazorpayCheckout from 'react-native-razorpay';

const SubscriptionScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { user, subscriptionTier } = useAuth();
    const [loading, setLoading] = useState(true);
    const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchSubscriptionDetails();
    }, []);

    const fetchSubscriptionDetails = async () => {
        try {
            // Assuming there's an endpoint for school subscription details
            const response = await apiClient.get('/tenants/my-subscription/');
            setSubscriptionInfo(response.data);
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRenew = async (plan: string, months: number, amount: number) => {
        setProcessing(true);
        try {
            // 1. Create Order on Backend (Public schema/Tenants app)
            const orderResponse = await apiClient.post('/tenants/schools/create_renewal_order/', {
                plan,
                months,
                amount,
            });

            const order = orderResponse.data;

            // 2. Razorpay Checkout
            const options = {
                description: `Subscription Renewal: ${plan}`,
                image: 'https://i.imgur.com/3g7nmJC.png',
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

            // 3. Verify on Backend
            await apiClient.post('/tenants/schools/verify_renewal_payment/', {
                razorpay_order_id: order.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan,
                months,
            });

            Alert.alert('Success', 'Your subscription has been renewed successfully!', [
                { text: 'OK', onPress: () => fetchSubscriptionDetails() }
            ]);
        } catch (error: any) {
            Alert.alert('Payment Failed', error?.description || error?.message || 'Renewal failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <Header title="Subscription" showBackButton onBackPress={() => navigation.goBack()} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Header title="Subscription" showBackButton onBackPress={() => navigation.goBack()} />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Card style={styles.currentPlanCard} padding={SPACING.lg}>
                    <View style={styles.planHeader}>
                        <View>
                            <Text style={styles.planLabel}>Current Plan</Text>
                            <Text style={styles.planName}>{subscriptionTier}</Text>
                        </View>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>ACTIVE</Text>
                        </View>
                    </View>

                    <View style={styles.planDetails}>
                        <View style={styles.detailRow}>
                            <Icon name="calendar-range" size={20} color={COLORS.gray500} />
                            <Text style={styles.detailText}>
                                Expires on: {subscriptionInfo?.expiry_date || 'N/A'}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Icon name="account-group" size={20} color={COLORS.gray500} />
                            <Text style={styles.detailText}>
                                Student Limit: {subscriptionInfo?.student_limit || 'Unlimited'}
                            </Text>
                        </View>
                    </View>
                </Card>

                <Text style={styles.sectionTitle}>Renew or Upgrade</Text>

                <Card style={styles.planCard} padding={SPACING.lg}>
                    <View style={styles.planInfo}>
                        <Text style={styles.planTitle}>Standard Plan</Text>
                        <Text style={styles.planPrice}>₹999 / month</Text>
                    </View>
                    <Text style={styles.planDescription}>
                        Perfect for small to medium schools. Includes all core modules.
                    </Text>
                    <Button
                        title="Renew for 1 Month"
                        onPress={() => handleRenew('STANDARD', 1, 999)}
                        loading={processing}
                        disabled={processing}
                    />
                    <View style={{ height: SPACING.md }} />
                    <Button
                        title="Renew for 1 Year (Save 20%)"
                        onPress={() => handleRenew('STANDARD', 12, 9999)}
                        variant="outline"
                        loading={processing}
                        disabled={processing}
                    />
                </Card>

                <Card style={styles.planCard} padding={SPACING.lg}>
                    <View style={styles.planInfo}>
                        <Text style={styles.planTitle}>Premium Plan</Text>
                        <Text style={styles.planPrice}>₹1,999 / month</Text>
                    </View>
                    <Text style={styles.planDescription}>
                        Advanced features, priority support, and custom subdomain.
                    </Text>
                    <Button
                        title="Upgrade to Premium"
                        onPress={() => handleRenew('PREMIUM', 1, 1999)}
                        variant="secondary"
                        loading={processing}
                        disabled={processing}
                    />
                </Card>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.gray50 },
    content: { padding: SPACING.lg },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    currentPlanCard: {
        backgroundColor: COLORS.primary,
        marginBottom: SPACING.xl,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.lg,
    },
    planLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: FONTS.sm,
        fontFamily: FONTS.medium,
    },
    planName: {
        color: COLORS.white,
        fontSize: FONTS['2xl'],
        fontFamily: FONTS.bold,
    },
    statusBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 20,
    },
    statusText: {
        color: COLORS.white,
        fontSize: FONTS.xs,
        fontFamily: FONTS.bold,
    },
    planDetails: {
        gap: SPACING.sm,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    detailText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: FONTS.sm,
        fontFamily: FONTS.regular,
    },
    sectionTitle: {
        fontSize: FONTS.lg,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
        marginBottom: SPACING.md,
    },
    planCard: {
        marginBottom: SPACING.lg,
        backgroundColor: COLORS.white,
    },
    planInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    planTitle: {
        fontSize: FONTS.md,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
    },
    planPrice: {
        fontSize: FONTS.md,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
    },
    planDescription: {
        fontSize: FONTS.sm,
        fontFamily: FONTS.regular,
        color: COLORS.gray600,
        marginBottom: SPACING.lg,
        lineHeight: 20,
    },
});

export default SubscriptionScreen;
