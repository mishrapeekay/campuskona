import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    ActivityIndicator,
    Alert,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { privacyService, ConsentRecord } from '@/services/api/privacy.service';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const ConsentManagementScreen: React.FC = () => {
    const [consents, setConsents] = useState<ConsentRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConsents();
    }, []);

    const fetchConsents = async () => {
        try {
            const data = await privacyService.getConsents();
            setConsents(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch consent records');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleConsent = async (id: string, currentStatus: boolean) => {
        try {
            await privacyService.updateConsent(id, !currentStatus);
            setConsents(prev =>
                prev.map(c => (c.id === id ? { ...c, is_granted: !currentStatus } : c))
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to update consent');
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Icon name="shield-check" size={48} color={COLORS.primary} />
                    <Text style={styles.title}>Consent Management</Text>
                    <Text style={styles.subtitle}>
                        Manage how your data is used. In compliance with DPDP Act 2023, you have the right to withdraw consent at any time.
                    </Text>
                </View>

                {consents.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No consent records found.</Text>
                    </View>
                ) : (
                    consents.map((consent) => (
                        <View key={consent.id} style={styles.consentCard}>
                            <View style={styles.consentInfo}>
                                <Text style={styles.purposeText}>{consent.purpose}</Text>
                                <Text style={styles.categoriesText}>
                                    Categories: {consent.data_categories.join(', ')}
                                </Text>
                                {consent.granted_at && (
                                    <Text style={styles.dateText}>
                                        Last updated: {new Date(consent.granted_at).toLocaleDateString()}
                                    </Text>
                                )}
                            </View>
                            <Switch
                                value={consent.is_granted}
                                onValueChange={() => handleToggleConsent(consent.id, consent.is_granted)}
                                trackColor={{ false: COLORS.gray300, true: COLORS.success + '80' }}
                                thumbColor={consent.is_granted ? COLORS.success : COLORS.white}
                            />
                        </View>
                    ))
                )}

                <View style={styles.footer}>
                    <Icon name="information-outline" size={20} color={COLORS.gray500} />
                    <Text style={styles.footerText}>
                        Withdrawing consent may affect certain app functionalities related to that specific data usage.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { padding: SPACING.lg },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    consentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    consentInfo: { flex: 1, marginRight: SPACING.md },
    purposeText: {
        fontFamily: FONTS.family.semiBold,
        fontSize: FONTS.size.md,
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    categoriesText: {
        fontFamily: FONTS.family.regular,
        fontSize: FONTS.size.xs,
        color: COLORS.textMuted,
        marginBottom: SPACING.xs,
    },
    dateText: {
        fontFamily: FONTS.family.regular,
        fontSize: FONTS.size.xs,
        color: COLORS.gray400,
    },
    emptyContainer: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: FONTS.family.medium,
        color: COLORS.textMuted,
    },
    footer: {
        flexDirection: 'row',
        marginTop: SPACING.xl,
        padding: SPACING.md,
        backgroundColor: COLORS.gray100,
        borderRadius: RADIUS.md,
        gap: SPACING.sm,
    },
    footerText: {
        flex: 1,
        fontFamily: FONTS.family.regular,
        fontSize: 12,
        color: COLORS.textMuted,
        lineHeight: 18,
    },
});

export default ConsentManagementScreen;
