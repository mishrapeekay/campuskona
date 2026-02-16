
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { adminService, AdminException } from '@/services/api/admin.service';
import Card from '@/components/common/Card';
import { COLORS, FONTS, SPACING, STATUS_COLORS } from '@/constants';

const ExceptionsWidget: React.FC = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [exceptions, setExceptions] = useState<AdminException[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchExceptions();
    }, []);

    const fetchExceptions = async () => {
        try {
            setLoading(true);
            const response = await adminService.getExceptions();

            // Flatten exceptions for display
            const allExceptions: AdminException[] = [];
            if (response && response.categories) {
                Object.keys(response.categories).forEach(key => {
                    allExceptions.push(...response.categories[key]);
                });
            }

            // Sort by severity (CRITICAL first)
            const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
            allExceptions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

            setExceptions(allExceptions);
            setError(null);
        } catch (err) {
            console.error('Error fetching exceptions:', err);
            setError('Failed to load alerts');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (exception: AdminException) => {
        // Simple navigation handler based on action_url or type
        // In a real app, this would parse the URL or use a map
        console.log('Action for:', exception);
        // Example: Navigate to relevant screen
        // if (exception.entity_type === 'student_fee') navigation.navigate('FeeDetails', { id: exception.entity_id });
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return STATUS_COLORS.URGENT;
            case 'HIGH': return STATUS_COLORS.ABSENT; // Red
            case 'MEDIUM': return STATUS_COLORS.PENDING; // Orange
            default: return STATUS_COLORS.LOW;
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
        );
    }

    if (error) {
        return null; // Hide widget on error
    }

    if (exceptions.length === 0) {
        return (
            <Card style={styles.container} padding={SPACING.md}>
                <View style={styles.header}>
                    <Text style={styles.title}>Action Required</Text>
                </View>
                <View style={styles.emptyState}>
                    <Icon name="check-circle-outline" size={40} color={COLORS.success} />
                    <Text style={styles.emptyText}>All systems operational</Text>
                </View>
            </Card>
        );
    }

    // Show top 5 exceptions
    const displayedExceptions = exceptions.slice(0, 5);

    return (
        <Card style={styles.container} padding={SPACING.md}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Icon name="alert-circle-outline" size={20} color={COLORS.warning} />
                    <Text style={styles.title}>Action Required</Text>
                </View>
                <TouchableOpacity onPress={fetchExceptions}>
                    <Icon name="refresh" size={18} color={COLORS.gray500} />
                </TouchableOpacity>
            </View>

            <View style={styles.list}>
                {displayedExceptions.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.item}
                        onPress={() => handleAction(item)}
                    >
                        <View style={[styles.severityIndicator, { backgroundColor: getSeverityColor(item.severity) }]} />
                        <View style={styles.content}>
                            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={COLORS.gray400} />
                    </TouchableOpacity>
                ))}

                {exceptions.length > 5 && (
                    <TouchableOpacity style={styles.footer} onPress={() => { }}>
                        <Text style={styles.footerText}>View All ({exceptions.length})</Text>
                    </TouchableOpacity>
                )}
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
    },
    loadingContainer: {
        padding: SPACING.lg,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs
    },
    title: {
        fontSize: FONTS.lg,
        fontFamily: FONTS.bold,
        color: COLORS.gray900,
    },
    list: {
        marginTop: SPACING.xs
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    severityIndicator: {
        width: 4,
        height: 36,
        borderRadius: 2,
        marginRight: SPACING.sm,
    },
    content: {
        flex: 1,
        marginRight: SPACING.sm
    },
    itemTitle: {
        fontSize: FONTS.sm,
        fontFamily: FONTS.medium, // mock -> medium (bold)
        color: COLORS.gray800,
        fontWeight: '600',
        marginBottom: 2
    },
    itemDesc: {
        fontSize: FONTS.xs,
        color: COLORS.gray500,
    },
    emptyState: {
        alignItems: 'center',
        padding: SPACING.lg,
        gap: SPACING.sm
    },
    emptyText: {
        color: COLORS.gray500,
        fontSize: FONTS.sm
    },
    footer: {
        paddingTop: SPACING.sm,
        alignItems: 'center'
    },
    footerText: {
        color: COLORS.primary,
        fontSize: FONTS.sm,
        fontWeight: '600'
    }
});

export default ExceptionsWidget;
