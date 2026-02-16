import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { privacyService, PrivacyRequest } from '@/services/api/privacy.service';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const DataExportRequestScreen: React.FC = () => {
    const [requests, setRequests] = useState<PrivacyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await privacyService.getPrivacyRequests();
            setRequests(data.filter(r => r.request_type === 'EXPORT'));
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch request history');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestExport = async () => {
        Alert.alert(
            'Request Data Export',
            'This will generate a portable file containing your personal data. You will be notified once it is ready for download.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Proceed',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            await privacyService.requestDataExport();
                            Alert.alert('Success', 'Your request has been submitted successfully.');
                            fetchRequests();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to submit request');
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return COLORS.success;
            case 'PROCESSING': return COLORS.info;
            case 'REJECTED': return COLORS.error;
            default: return COLORS.warning;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Icon name="database-export" size={48} color={COLORS.secondary} />
                    <Text style={styles.title}>Data Portability</Text>
                    <Text style={styles.subtitle}>
                        Under DPDP Act 2023, you can request a copy of your personal data in a machine-readable format.
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.requestButton}
                    onPress={handleRequestExport}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <>
                            <Icon name="plus" size={24} color={COLORS.white} />
                            <Text style={styles.requestButtonText}>Request New Export</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>Request History</Text>
                    {loading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
                    ) : requests.length === 0 ? (
                        <Text style={styles.emptyText}>No previous requests.</Text>
                    ) : (
                        requests.map((request) => (
                            <View key={request.id} style={styles.historyCard}>
                                <View style={styles.historyInfo}>
                                    <Text style={styles.dateText}>
                                        Requested on: {new Date(request.created_at).toLocaleDateString()}
                                    </Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                                            {request.status}
                                        </Text>
                                    </View>
                                </View>
                                {request.status === 'COMPLETED' && (
                                    <TouchableOpacity style={styles.downloadIcon}>
                                        <Icon name="download" size={24} color={COLORS.primary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { padding: SPACING.lg },
    header: { alignItems: 'center', marginBottom: SPACING.xl },
    title: {
        fontFamily: FONTS.family.bold,
        fontSize: FONTS.size.xl,
        color: COLORS.text,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontFamily: FONTS.family.regular,
        fontSize: FONTS.size.sm,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
    requestButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.sm,
        ...SHADOWS.md,
    },
    requestButtonText: {
        fontFamily: FONTS.family.semiBold,
        fontSize: FONTS.size.md,
        color: COLORS.white,
    },
    historySection: { marginTop: SPACING.xl },
    sectionTitle: {
        fontFamily: FONTS.family.semiBold,
        fontSize: FONTS.size.md,
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    historyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.sm,
        ...SHADOWS.sm,
    },
    historyInfo: { flex: 1 },
    dateText: {
        fontFamily: FONTS.family.regular,
        fontSize: FONTS.size.sm,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
    },
    statusText: {
        fontFamily: FONTS.family.medium,
        fontSize: 10,
        textTransform: 'uppercase',
    },
    downloadIcon: { padding: SPACING.sm },
    emptyText: {
        fontFamily: FONTS.family.regular,
        fontSize: FONTS.size.sm,
        color: COLORS.gray500,
        textAlign: 'center',
        marginTop: SPACING.md,
    },
    loader: { marginTop: SPACING.md },
});

export default DataExportRequestScreen;
