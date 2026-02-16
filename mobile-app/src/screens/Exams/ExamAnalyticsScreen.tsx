import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';

const ExamAnalyticsScreen: React.FC = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { examId } = route.params as { examId: string };

    return (
        <ScreenWrapper>
            <Header
                title="Exam Analytics"
                showBackButton
                onBackPress={() => navigation.goBack()}
            />
            <ScrollView style={styles.container}>
                <Card style={styles.card}>
                    <Text style={styles.title}>Detailed Analytics</Text>
                    <Text style={styles.subtitle}>Exam ID: {examId}</Text>
                    <Text style={styles.message}>
                        This screen will show detailed analytics including:
                    </Text>
                    <View style={styles.list}>
                        <Text style={styles.listItem}>• Class performance distribution</Text>
                        <Text style={styles.listItem}>• Subject-wise analysis</Text>
                        <Text style={styles.listItem}>• Top performers</Text>
                        <Text style={styles.listItem}>• Areas of improvement</Text>
                        <Text style={styles.listItem}>• Comparative analysis</Text>
                    </View>
                </Card>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.md,
    },
    card: {
        padding: SPACING.lg,
    },
    title: {
        fontSize: FONTS['2xl'],
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: FONTS.md,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        marginBottom: SPACING.lg,
    },
    message: {
        fontSize: FONTS.base,
        fontFamily: FONTS.regular,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    list: {
        marginTop: SPACING.sm,
    },
    listItem: {
        fontSize: FONTS.base,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
});

export default ExamAnalyticsScreen;
