import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import { investorService } from '@/services/api'; // Ensure this service is exported from '@/services/api'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const InvestorDashboardScreen = () => {
    const navigation = useNavigation();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const response = await investorService.getDashboardStats();
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

    const KpiCard = ({ title, value, trend, trendValue, icon, color }: any) => (
        <Card style={styles.kpiCard}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Icon name={icon} size={24} color={color} />
            </View>
            <View style={styles.kpiContent}>
                <Text style={styles.kpiValue}>{value}</Text>
                <Text style={styles.kpiTitle}>{title}</Text>
                {trend && (
                    <View style={styles.trendContainer}>
                        <Icon
                            name={trend === 'up' ? 'arrow-up' : 'arrow-down'}
                            size={14}
                            color={trend === 'up' ? COLORS.success : COLORS.error}
                        />
                        <Text style={[
                            styles.trendText,
                            { color: trend === 'up' ? COLORS.success : COLORS.error }
                        ]}>
                            {trendValue}
                        </Text>
                    </View>
                )}
            </View>
        </Card>
    );

    return (
        <ScreenWrapper>
            <Header title="Investor Dashboard" />
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : (
                    <>
                        <Text style={styles.sectionHeader}>Financial Overview</Text>
                        <View style={styles.grid}>
                            <KpiCard
                                title="MRR"
                                value={`₹${stats?.mrr || 0}`}
                                trend="up"
                                trendValue="12%"
                                icon="cash-multiple"
                                color={COLORS.primary}
                            />
                            <KpiCard
                                title="ARR"
                                value={`₹${stats?.arr || 0}`}
                                trend="up"
                                trendValue="15%"
                                icon="chart-line"
                                color={COLORS.success}
                            />
                            <KpiCard
                                title="Active Schools"
                                value={stats?.active_schools || 0}
                                trend="up"
                                trendValue="+5"
                                icon="school"
                                color={COLORS.warning}
                            />
                            <KpiCard
                                title="Churn Rate"
                                value={`${stats?.churn_rate || 0}%`}
                                trend="down"
                                trendValue="-0.5%"
                                icon="account-off"
                                color={COLORS.error}
                            />
                        </View>

                        <Card style={styles.chartCard}>
                            <Text style={styles.chartTitle}>Growth Trends</Text>
                            <View style={styles.placeholderChart}>
                                <Text style={styles.placeholderText}>Chart Visualization Placeholder</Text>
                                {/* Integrate a charting library like react-native-chart-kit here */}
                            </View>
                        </Card>

                        <Card style={styles.metricsCard}>
                            <Text style={styles.metricsTitle}>Key Metrics</Text>
                            <View style={styles.metricRow}>
                                <Text style={styles.metricLabel}>LTV</Text>
                                <Text style={styles.metricValue}>₹{stats?.ltv || 0}</Text>
                            </View>
                            <View style={styles.metricRow}>
                                <Text style={styles.metricLabel}>CAC</Text>
                                <Text style={styles.metricValue}>₹{stats?.cac || 0}</Text>
                            </View>
                            <View style={[styles.metricRow, styles.lastMetricRow]}>
                                <Text style={styles.metricLabel}>LTV/CAC</Text>
                                <Text style={styles.metricValue}>
                                    {stats?.cac ? (stats.ltv / stats.cac).toFixed(2) : 0}x
                                </Text>
                            </View>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: SPACING.xl,
    },
    loadingText: {
        color: COLORS.gray600,
    },
    sectionHeader: {
        fontSize: FONTS.lg,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
        marginBottom: SPACING.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    kpiCard: {
        width: '48%',
        marginBottom: SPACING.md,
        padding: SPACING.md,
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    kpiContent: {
        flex: 1,
    },
    kpiValue: {
        fontSize: FONTS.lg,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
    },
    kpiTitle: {
        fontSize: FONTS.xs,
        color: COLORS.gray600,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    trendText: {
        fontSize: FONTS.xs,
        marginLeft: 2,
        fontWeight: 'bold',
    },
    chartCard: {
        padding: SPACING.md,
        marginBottom: SPACING.lg,
    },
    chartTitle: {
        fontSize: FONTS.md,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.md,
        color: COLORS.gray900,
    },
    placeholderChart: {
        height: 200,
        backgroundColor: COLORS.gray100,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: COLORS.gray500,
    },
    metricsCard: {
        padding: SPACING.md,
    },
    metricsTitle: {
        fontSize: FONTS.md,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.md,
        color: COLORS.gray900,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    lastMetricRow: {
        borderBottomWidth: 0,
    },
    metricLabel: {
        fontSize: FONTS.sm,
        color: COLORS.gray600,
    },
    metricValue: {
        fontSize: FONTS.md,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
    },
});

export default InvestorDashboardScreen;
