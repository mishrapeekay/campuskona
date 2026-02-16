import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import { partnerService } from '@/services/api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PartnerDashboardScreen = () => {
    const navigation = useNavigation();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const response = await partnerService.getDashboardStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const StatCard = ({ title, value, icon, color }: any) => (
        <Card style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Icon name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
        </Card>
    );

    return (
        <ScreenWrapper>
            <Header title="Partner Dashboard" />
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <Text style={styles.loadingText}>Loading...</Text>
                ) : (
                    <>
                        <View style={styles.grid}>
                            <StatCard
                                title="Total Leads"
                                value={stats?.total_leads || 0}
                                icon="account-group"
                                color={COLORS.primary}
                            />
                            <StatCard
                                title="Conversions"
                                value={stats?.conversions || 0}
                                icon="check-circle"
                                color={COLORS.success}
                            />
                            <StatCard
                                title="Commissions"
                                value={`₹${stats?.total_commissions || 0}`}
                                icon="cash"
                                color={COLORS.warning}
                            />
                            <StatCard
                                title="Pending"
                                value={`₹${stats?.pending_payouts || 0}`}
                                icon="clock-outline"
                                color={COLORS.error}
                            />
                        </View>

                        <Card style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>Recent Activity</Text>
                            {stats?.recent_activity?.length > 0 ? (
                                stats.recent_activity.map((activity: any, index: number) => (
                                    <View key={index} style={styles.activityItem}>
                                        <Icon name="circle-small" size={24} color={COLORS.gray500} />
                                        <Text style={styles.activityText}>{activity.description}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>No recent activity</Text>
                            )}
                        </Card>
                    </>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.md,
    },
    loadingText: {
        textAlign: 'center',
        marginTop: SPACING.xl,
        color: COLORS.gray600,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    statCard: {
        width: '48%',
        marginBottom: SPACING.md,
        padding: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    iconContainer: {
        padding: SPACING.xs,
        borderRadius: 8,
    },
    statValue: {
        fontSize: FONTS.lg,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
    },
    statTitle: {
        fontSize: FONTS.xs,
        color: COLORS.gray600,
    },
    sectionCard: {
        padding: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONTS.md,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.md,
        color: COLORS.gray900,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    activityText: {
        fontSize: FONTS.sm,
        color: COLORS.gray700,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.gray500,
        fontStyle: 'italic',
    },
});

export default PartnerDashboardScreen;
