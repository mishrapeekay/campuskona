import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { privacyService, PrivacyRequest } from '@/services/api/privacy.service';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const DataDeletionRequestScreen: React.FC = () => {
    const [reason, setReason] = useState('');
    const [requests, setRequests] = useState<PrivacyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await privacyService.getPrivacyRequests();
            setRequests(data.filter(r => r.request_type === 'DELETION'));
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch request history');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestDeletion = async () => {
        if (!reason.trim()) {
            Alert.alert('Required', 'Please provide a reason for data deletion.');
            return;
        }

        Alert.alert(
            'Warning: Persistent Deletion',
            'This request will be sent to the administrator. Deletion occurs according to institutional retention policies and legal requirements under DPDP Act 2023.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Request Deletion',
                    style: 'destructive',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            await privacyService.requestDataDeletion(undefined, reason);
                            Alert.alert('Success', 'Your deletion request has been submitted.');
                            setReason('');
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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Icon name="delete-forever" size={48} color={COLORS.error} />
                    <Text style={styles.title}>Data Deletion</Text>
                    <Text style={styles.subtitle}>
                        Request deletion of your personal data. Note that certain data must be retained by law for educational records.
                    </Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.label}>Reason for Deletion</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Please specify why you want your data to be deleted..."
                        multiline
                        numberOfLines={4}
                        value={reason}
                        onChangeText={setReason}
                        textAlignVertical="top"
                    />
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleRequestDeletion}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Icon name="trash-can-outline" size={20} color={COLORS.white} />
                                <Text style={styles.deleteButtonText}>Submit Deletion Request</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

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
                                    <Text style={[styles.statusText, { color: request.status === 'COMPLETED' ? COLORS.success : COLORS.warning }]}>
                                        Status: {request.status}
                                    </Text>
                                </View>
                                <Icon
                                    name={request.status === 'COMPLETED' ? 'check-circle' : 'clock-outline'}
                                    size={24}
                                    color={request.status === 'COMPLETED' ? COLORS.success : COLORS.warning}
                                />
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
    formCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        ...SHADOWS.sm,
    },
    label: {
        fontFamily: FONTS.family.medium,
        fontSize: FONTS.size.sm,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    textArea: {
        borderWidth: 1,
        borderColor: COLORS.divider,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        fontFamily: FONTS.family.regular,
        fontSize: FONTS.size.base,
        backgroundColor: COLORS.gray50,
        marginBottom: SPACING.lg,
        minHeight: 120,
    },
    deleteButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.error,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    deleteButtonText: {
        fontFamily: FONTS.family.semiBold,
        fontSize: FONTS.size.base,
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
        marginBottom: 4,
    },
    statusText: {
        fontFamily: FONTS.family.medium,
        fontSize: 12,
    },
    emptyText: {
        fontFamily: FONTS.family.regular,
        fontSize: FONTS.size.sm,
        color: COLORS.gray500,
        textAlign: 'center',
        marginTop: SPACING.md,
    },
    loader: { marginTop: SPACING.md },
});

export default DataDeletionRequestScreen;
