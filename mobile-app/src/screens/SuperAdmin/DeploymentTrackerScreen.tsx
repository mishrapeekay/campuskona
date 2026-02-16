import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { tenantService } from '@/services/api';

type DeploymentRouteParams = {
  tenantId: string;
  tenantName: string;
};

interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  startTime?: string;
  endTime?: string;
  error?: string;
}

interface SystemCheck {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

const DeploymentTrackerScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: DeploymentRouteParams }, 'params'>>();
  const { tenantId, tenantName } = route.params;

  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([]);
  const [systemChecks, setSystemChecks] = useState<SystemCheck[]>([]);
  const [overallStatus, setOverallStatus] = useState<'deploying' | 'completed' | 'failed'>('deploying');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    initializeDeployment();
    simulateDeployment();
  }, []);

  const initializeDeployment = () => {
    const steps: DeploymentStep[] = [
      {
        id: 'schema',
        title: 'Creating Database Schema',
        description: 'Setting up database tables and relationships',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'admin',
        title: 'Creating Admin Account',
        description: 'Setting up admin user and permissions',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'seed',
        title: 'Seeding Initial Data',
        description: 'Creating sample classes, subjects, and settings',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'modules',
        title: 'Configuring Modules',
        description: 'Enabling selected modules and features',
        status: 'pending',
        progress: 0,
      },
      {
        id: 'activation',
        title: 'Activating Tenant',
        description: 'Final activation and health checks',
        status: 'pending',
        progress: 0,
      },
    ];

    setDeploymentSteps(steps);
  };

  const simulateDeployment = async () => {
    // Simulate step-by-step deployment
    const steps = [
      { index: 0, duration: 3000 },
      { index: 1, duration: 2000 },
      { index: 2, duration: 4000 },
      { index: 3, duration: 2500 },
      { index: 4, duration: 2000 },
    ];

    for (const step of steps) {
      await simulateStep(step.index, step.duration);
    }

    // Run system checks after deployment
    await runSystemChecks();
  };

  const simulateStep = (stepIndex: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      setCurrentStepIndex(stepIndex);

      // Mark as in progress
      setDeploymentSteps((prev) =>
        prev.map((step, idx) =>
          idx === stepIndex
            ? { ...step, status: 'in_progress', startTime: new Date().toISOString() }
            : step
        )
      );

      // Simulate progress
      const interval = setInterval(() => {
        setDeploymentSteps((prev) =>
          prev.map((step, idx) =>
            idx === stepIndex ? { ...step, progress: Math.min(step.progress + 10, 100) } : step
          )
        );
      }, duration / 10);

      // Complete after duration
      setTimeout(() => {
        clearInterval(interval);

        // Randomly fail one step (10% chance)
        const shouldFail = Math.random() < 0.1 && stepIndex !== 0;

        setDeploymentSteps((prev) =>
          prev.map((step, idx) =>
            idx === stepIndex
              ? {
                  ...step,
                  status: shouldFail ? 'failed' : 'completed',
                  progress: 100,
                  endTime: new Date().toISOString(),
                  error: shouldFail ? 'Connection timeout' : undefined,
                }
              : step
          )
        );

        if (shouldFail) {
          setOverallStatus('failed');
        }

        resolve();
      }, duration);
    });
  };

  const runSystemChecks = async () => {
    const checks: SystemCheck[] = [
      {
        id: 'db',
        name: 'Database Connectivity',
        status: 'healthy',
        message: 'Database connection successful',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'api',
        name: 'API Response Time',
        status: 'healthy',
        message: 'Response time: 145ms',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'admin',
        name: 'Admin Account',
        status: 'healthy',
        message: 'Admin user created and activated',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'modules',
        name: 'Module Configuration',
        status: 'healthy',
        message: 'All modules configured successfully',
        timestamp: new Date().toISOString(),
      },
    ];

    setSystemChecks(checks);
    setOverallStatus('completed');
  };

  const handleRetry = async () => {
    Alert.alert('Retry Deployment', 'This will restart the failed deployment steps. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Retry',
        onPress: () => {
          setOverallStatus('deploying');
          initializeDeployment();
          simulateDeployment();
        },
      },
    ]);
  };

  const handleViewTenant = () => {
    // @ts-ignore
    navigation.replace('TenantDetail', { tenantId });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
      case 'healthy':
        return COLORS.success;
      case 'in_progress':
        return COLORS.info;
      case 'failed':
      case 'error':
        return COLORS.error;
      case 'warning':
        return COLORS.warning;
      default:
        return COLORS.gray400;
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'completed':
      case 'healthy':
        return 'check-circle';
      case 'in_progress':
        return 'loading';
      case 'failed':
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'alert-circle';
      default:
        return 'circle-outline';
    }
  };

  const formatTime = (timestamp?: string): string => {
    if (!timestamp) return '--';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const calculateDuration = (startTime?: string, endTime?: string): string => {
    if (!startTime || !endTime) return '--';
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const duration = Math.round((end - start) / 1000);
    return `${duration}s`;
  };

  return (
    <ScreenWrapper>
      <Header
        title="Deployment Progress"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Status Banner */}
        <Card
          elevation="md"
          padding={SPACING.lg}
          style={[
            styles.statusBanner,
            overallStatus === 'completed' && styles.statusBannerSuccess,
            overallStatus === 'failed' && styles.statusBannerError,
          ]}
        >
          <View style={styles.statusHeader}>
            <Icon
              name={
                overallStatus === 'deploying'
                  ? 'loading'
                  : overallStatus === 'completed'
                  ? 'check-circle'
                  : 'alert-circle'
              }
              size={32}
              color={
                overallStatus === 'deploying'
                  ? COLORS.info
                  : overallStatus === 'completed'
                  ? COLORS.success
                  : COLORS.error
              }
            />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>
                {overallStatus === 'deploying' && 'Deployment In Progress'}
                {overallStatus === 'completed' && 'Deployment Successful'}
                {overallStatus === 'failed' && 'Deployment Failed'}
              </Text>
              <Text style={styles.statusSubtitle}>{tenantName}</Text>
            </View>
          </View>

          {overallStatus === 'deploying' && (
            <Text style={styles.statusDescription}>
              Please wait while we set up the school. This may take a few minutes.
            </Text>
          )}
          {overallStatus === 'completed' && (
            <Text style={styles.statusDescription}>
              The school has been successfully deployed and is ready to use!
            </Text>
          )}
          {overallStatus === 'failed' && (
            <Text style={styles.statusDescription}>
              Deployment encountered errors. Please review the details and retry.
            </Text>
          )}
        </Card>

        {/* Deployment Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deployment Steps</Text>

          {deploymentSteps.map((step, index) => (
            <Card key={step.id} elevation="sm" padding={SPACING.md} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <Icon
                  name={getStatusIcon(step.status)}
                  size={24}
                  color={getStatusColor(step.status)}
                />
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
                {step.status === 'completed' && (
                  <View style={styles.stepTime}>
                    <Text style={styles.stepTimeText}>
                      {calculateDuration(step.startTime, step.endTime)}
                    </Text>
                  </View>
                )}
              </View>

              {step.status === 'in_progress' && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[styles.progressFill, { width: `${step.progress}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>{step.progress}%</Text>
                </View>
              )}

              {step.error && (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{step.error}</Text>
                </View>
              )}

              {step.status === 'completed' && (
                <View style={styles.completedInfo}>
                  <Text style={styles.completedText}>
                    Completed at {formatTime(step.endTime)}
                  </Text>
                </View>
              )}
            </Card>
          ))}
        </View>

        {/* System Health Checks */}
        {systemChecks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Health Checks</Text>

            <Card elevation="md" padding={SPACING.md}>
              {systemChecks.map((check, index) => (
                <View
                  key={check.id}
                  style={[
                    styles.checkItem,
                    index < systemChecks.length - 1 && styles.checkItemBorder,
                  ]}
                >
                  <Icon
                    name={getStatusIcon(check.status)}
                    size={20}
                    color={getStatusColor(check.status)}
                  />
                  <View style={styles.checkInfo}>
                    <Text style={styles.checkName}>{check.name}</Text>
                    <Text style={styles.checkMessage}>{check.message}</Text>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Setup Checklist */}
        {overallStatus === 'completed' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Setup Checklist</Text>

            <Card elevation="md" padding={SPACING.md}>
              <View style={styles.checklistItem}>
                <Icon name="check-circle" size={20} color={COLORS.success} />
                <Text style={styles.checklistText}>Schema created</Text>
              </View>
              <View style={styles.checklistItem}>
                <Icon name="check-circle" size={20} color={COLORS.success} />
                <Text style={styles.checklistText}>Admin account activated</Text>
              </View>
              <View style={styles.checklistItem}>
                <Icon name="check-circle" size={20} color={COLORS.success} />
                <Text style={styles.checklistText}>Initial data seeded</Text>
              </View>
              <View style={styles.checklistItem}>
                <Icon name="circle-outline" size={20} color={COLORS.gray400} />
                <Text style={[styles.checklistText, { color: COLORS.gray600 }]}>
                  First student enrollment (Pending)
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {overallStatus === 'failed' && (
            <Button
              title="Retry Deployment"
              onPress={handleRetry}
              icon="refresh"
              variant="secondary"
              style={styles.actionButton}
            />
          )}
          {overallStatus === 'completed' && (
            <>
              <Button
                title="View School Details"
                onPress={handleViewTenant}
                icon="domain"
                style={styles.actionButton}
              />
              <Button
                title="Send Welcome Email"
                onPress={() => Alert.alert('Success', 'Welcome email sent to admin')}
                icon="email-send"
                variant="secondary"
                style={styles.actionButton}
              />
            </>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  statusBanner: {
    marginBottom: SPACING.lg,
  },
  statusBannerSuccess: {
    backgroundColor: COLORS.success + '08',
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  statusBannerError: {
    backgroundColor: COLORS.error + '08',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
  },
  statusDescription: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray700,
    lineHeight: 20,
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
  stepCard: {
    marginBottom: SPACING.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
  },
  stepTime: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.success + '15',
    borderRadius: 8,
  },
  stepTimeText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.semibold,
    color: COLORS.success,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.info,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.info,
    minWidth: 40,
    textAlign: 'right',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.error + '08',
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.error,
  },
  completedInfo: {
    marginTop: SPACING.sm,
  },
  completedText: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  checkItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  checkInfo: {
    flex: 1,
  },
  checkName: {
    fontSize: FONTS.md,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
    marginBottom: 4,
  },
  checkMessage: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  checklistText: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.gray900,
  },
  actions: {
    gap: SPACING.md,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
});

export default DeploymentTrackerScreen;
