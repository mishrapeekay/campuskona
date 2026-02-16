import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import api from '@/services/api/client';

interface GenerationRun {
    id: string;
    config_name: string;
    status: string;
    status_display: string;
    progress_percent: number;
    progress_message: string;
    fitness_score: number | null;
    conflicts_found: number;
    error_message: string;
    created_at: string;
}

interface GenerationConfig {
    id: string;
    name: string;
    algorithm_display: string;
    is_active: boolean;
    run_count: number;
    last_run_status: string | null;
    created_at: string;
}

const TimetableGeneratorScreen: React.FC = () => {
    const navigation = useNavigation();
    const [configs, setConfigs] = useState<GenerationConfig[]>([]);
    const [runs, setRuns] = useState<GenerationRun[]>([]);
    const [activeRun, setActiveRun] = useState<GenerationRun | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadData();
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    const loadData = async () => {
        try {
            setRefreshing(true);
            const [configsRes, runsRes] = await Promise.all([
                api.get('/timetable/generation-configs/'),
                api.get('/timetable/generation-runs/'),
            ]);
            setConfigs(configsRes.data?.results || configsRes.data || []);
            setRuns(runsRes.data?.results || runsRes.data || []);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleTriggerGeneration = (configId: string) => {
        Alert.alert(
            'Generate Timetable',
            'This will start AI timetable generation. This may take a few minutes.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Generate',
                    onPress: () => triggerGeneration(configId),
                },
            ]
        );
    };

    const triggerGeneration = async (configId: string) => {
        try {
            setLoading(true);
            const res = await api.post('/timetable/generation-runs/', {
                config_id: configId,
            });
            const run = res.data;
            setActiveRun(run);

            // Start polling
            pollRef.current = setInterval(async () => {
                try {
                    const progRes = await api.get(
                        `/timetable/generation-runs/${run.id}/progress/`
                    );
                    const p = progRes.data;
                    setActiveRun(prev => (prev ? { ...prev, ...p } : p));

                    if (p.status === 'COMPLETED' || p.status === 'FAILED') {
                        if (pollRef.current) clearInterval(pollRef.current);
                        pollRef.current = null;
                        setLoading(false);
                        loadData();

                        if (p.status === 'COMPLETED') {
                            Alert.alert(
                                'Generation Complete',
                                `Score: ${p.fitness_score}/100. View the result in the web app to preview and apply.`
                            );
                        } else {
                            Alert.alert('Generation Failed', p.error_message || 'Unknown error.');
                        }
                    }
                } catch {
                    if (pollRef.current) clearInterval(pollRef.current);
                    pollRef.current = null;
                    setLoading(false);
                }
            }, 3000);
        } catch (err: any) {
            setLoading(false);
            Alert.alert('Error', err.response?.data?.error || 'Failed to start generation.');
        }
    };

    const handleApply = (runId: string) => {
        Alert.alert(
            'Apply Timetable',
            'This will replace the current timetable with the generated one. You can rollback later.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Apply',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.post(`/timetable/generation-runs/${runId}/apply/`);
                            Alert.alert('Success', 'Timetable applied successfully.');
                            loadData();
                        } catch (err: any) {
                            Alert.alert('Error', err.response?.data?.error || 'Failed to apply.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return '#28a745';
            case 'FAILED': return '#dc3545';
            case 'APPLIED': return '#20c997';
            case 'GENERATING':
            case 'OPTIMIZING': return '#007bff';
            case 'ROLLED_BACK': return '#fd7e14';
            default: return '#6c757d';
        }
    };

    return (
        <ScreenWrapper>
            <Header title="AI Timetable Generator" showBack />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshing={refreshing}
            >
                {/* Active Generation Progress */}
                {activeRun && loading && (
                    <Card style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <Icon name="robot" size={24} color={COLORS.primary} />
                            <Text style={styles.progressTitle}>Generating...</Text>
                        </View>
                        <Text style={styles.progressMessage}>
                            {activeRun.progress_message || 'Processing...'}
                        </Text>
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${activeRun.progress_percent}%` },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressPercent}>
                            {activeRun.progress_percent}%
                        </Text>
                    </Card>
                )}

                {/* Configs Section */}
                <Text style={styles.sectionTitle}>Configurations</Text>
                {configs.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Icon name="cog-outline" size={32} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>
                            No configurations yet. Create one from the web app.
                        </Text>
                    </Card>
                ) : (
                    configs.map(cfg => (
                        <Card key={cfg.id} style={styles.configCard}>
                            <View style={styles.configHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.configName}>{cfg.name}</Text>
                                    <Text style={styles.configMeta}>
                                        {cfg.algorithm_display} | {cfg.run_count} runs
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleTriggerGeneration(cfg.id)}
                                    disabled={loading}
                                    style={[styles.generateBtn, loading && styles.disabledBtn]}
                                >
                                    <Icon name="play" size={16} color="#fff" />
                                    <Text style={styles.generateBtnText}>Generate</Text>
                                </TouchableOpacity>
                            </View>
                        </Card>
                    ))
                )}

                {/* Recent Runs */}
                <Text style={styles.sectionTitle}>Recent Runs</Text>
                {runs.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Icon name="history" size={32} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>No generation runs yet.</Text>
                    </Card>
                ) : (
                    runs.slice(0, 10).map(run => (
                        <Card key={run.id} style={styles.runCard}>
                            <View style={styles.runHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.runConfig}>
                                        {run.config_name}
                                    </Text>
                                    <View style={styles.runMeta}>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                { backgroundColor: getStatusColor(run.status) },
                                            ]}
                                        >
                                            <Text style={styles.statusText}>
                                                {run.status_display}
                                            </Text>
                                        </View>
                                        {run.fitness_score !== null && (
                                            <Text style={styles.scoreText}>
                                                Score: {run.fitness_score}/100
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                {run.status === 'COMPLETED' && (
                                    <TouchableOpacity
                                        onPress={() => handleApply(run.id)}
                                        style={styles.applyBtn}
                                    >
                                        <Text style={styles.applyBtnText}>Apply</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </Card>
                    ))
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: SPACING.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    progressCard: {
        padding: SPACING.md,
        backgroundColor: '#EEF2FF',
        borderColor: '#818CF8',
        borderWidth: 1,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
        marginLeft: SPACING.sm,
    },
    progressMessage: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#C7D2FE',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: 8,
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    progressPercent: {
        fontSize: 12,
        color: COLORS.textSecondary,
        textAlign: 'right',
        marginTop: 4,
    },
    emptyCard: {
        padding: SPACING.lg,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: SPACING.sm,
        textAlign: 'center',
    },
    configCard: {
        padding: SPACING.md,
        marginBottom: SPACING.sm,
    },
    configHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    configName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
    },
    configMeta: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    generateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    generateBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 4,
    },
    disabledBtn: {
        opacity: 0.5,
    },
    runCard: {
        padding: SPACING.md,
        marginBottom: SPACING.sm,
    },
    runHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    runConfig: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    runMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '600',
    },
    scoreText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    applyBtn: {
        backgroundColor: '#28a745',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    applyBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
});

export default TimetableGeneratorScreen;
