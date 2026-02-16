import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { tenantService } from '@/services/api';

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface SchoolInfo {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  subdomain: string;
  customDomain?: string;
  logo?: string;
}

interface SubscriptionPlan {
  plan: 'basic' | 'standard' | 'premium';
  maxStudents: number;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  trialDays: number;
  features: string[];
}

interface AdminAccount {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface ModuleConfig {
  library: boolean;
  transport: boolean;
  onlinePayments: boolean;
  biometricAttendance: boolean;
  academicBoard: string;
  gradingSystem: string;
  feeStructure: string;
}

const PLANS = {
  basic: {
    name: 'Basic',
    maxStudents: 500,
    price: 5000,
    features: ['Attendance', 'Exams', 'Fee Management', 'Basic Reports'],
  },
  standard: {
    name: 'Standard',
    maxStudents: 1500,
    price: 12000,
    features: ['All Basic Features', 'Library', 'Transport', 'Advanced Reports', 'SMS Notifications'],
  },
  premium: {
    name: 'Premium',
    maxStudents: 5000,
    price: 25000,
    features: ['All Standard Features', 'Online Payments', 'Biometric Attendance', 'Custom Branding', 'API Access'],
  },
};

const TenantSetupWizardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isDeploying, setIsDeploying] = useState(false);

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    subdomain: '',
  });

  const [subscription, setSubscription] = useState<SubscriptionPlan>({
    plan: 'standard',
    maxStudents: 1500,
    billingCycle: 'annual',
    trialDays: 14,
    features: PLANS.standard.features,
  });

  const [adminAccount, setAdminAccount] = useState<AdminAccount>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const [moduleConfig, setModuleConfig] = useState<ModuleConfig>({
    library: true,
    transport: true,
    onlinePayments: false,
    biometricAttendance: false,
    academicBoard: 'CBSE',
    gradingSystem: 'percentage',
    feeStructure: 'term',
  });

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!schoolInfo.name || !schoolInfo.code || !schoolInfo.subdomain) {
          Alert.alert('Validation Error', 'Please fill in all required fields');
          return false;
        }
        if (!/^[a-z0-9-]+$/.test(schoolInfo.subdomain)) {
          Alert.alert('Invalid Subdomain', 'Subdomain can only contain lowercase letters, numbers, and hyphens');
          return false;
        }
        return true;

      case 2:
        return true;

      case 3:
        if (!adminAccount.firstName || !adminAccount.email || !adminAccount.password) {
          Alert.alert('Validation Error', 'Please fill in all required fields');
          return false;
        }
        if (adminAccount.password.length < 8) {
          Alert.alert('Weak Password', 'Password must be at least 8 characters long');
          return false;
        }
        return true;

      case 4:
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    } else {
      navigation.goBack();
    }
  };

  const handleDeploy = async () => {
    if (!validateStep()) return;

    setIsDeploying(true);

    try {
      const result = await tenantService.createTenant({
        schoolInfo,
        subscription,
        adminAccount,
        moduleConfig,
      });

      // Simulate deployment process
      await new Promise((resolve) => setTimeout(resolve, 3000));

      Alert.alert(
        'Deployment Started',
        'School setup is in progress. You will be redirected to the deployment tracker.',
        [
          {
            text: 'OK',
            onPress: () => {
              // @ts-ignore
              navigation.replace('DeploymentTracker', {
                tenantId: 'tenant-' + Date.now(),
                tenantName: schoolInfo.name,
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Deployment Failed', 'Failed to start tenant deployment. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  };

  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map((step) => (
          <View key={step} style={styles.progressStepContainer}>
            <View
              style={[
                styles.progressStep,
                step < currentStep && styles.progressStepCompleted,
                step === currentStep && styles.progressStepActive,
              ]}
            >
              {step < currentStep ? (
                <Icon name="check" size={16} color={COLORS.white} />
              ) : (
                <Text
                  style={[
                    styles.progressStepText,
                    step === currentStep && styles.progressStepTextActive,
                  ]}
                >
                  {step}
                </Text>
              )}
            </View>
            {step < 5 && (
              <View
                style={[
                  styles.progressLine,
                  step < currentStep && styles.progressLineCompleted,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderStep1 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>School Basic Information</Text>
      <Text style={styles.stepDescription}>Enter the school's basic details and contact information</Text>

      <Card elevation="sm" padding={SPACING.lg} style={styles.formCard}>
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>School Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Delhi Public School"
            value={schoolInfo.name}
            onChangeText={(text) => setSchoolInfo({ ...schoolInfo, name: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>School Code *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., DPS2026"
            value={schoolInfo.code}
            onChangeText={(text) => setSchoolInfo({ ...schoolInfo, code: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Complete address"
            multiline
            numberOfLines={3}
            value={schoolInfo.address}
            onChangeText={(text) => setSchoolInfo({ ...schoolInfo, address: text })}
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={styles.inputLabel}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="City"
              value={schoolInfo.city}
              onChangeText={(text) => setSchoolInfo({ ...schoolInfo, city: text })}
            />
          </View>

          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={styles.inputLabel}>State</Text>
            <TextInput
              style={styles.input}
              placeholder="State"
              value={schoolInfo.state}
              onChangeText={(text) => setSchoolInfo({ ...schoolInfo, state: text })}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Pincode</Text>
          <TextInput
            style={styles.input}
            placeholder="110001"
            keyboardType="number-pad"
            maxLength={6}
            value={schoolInfo.pincode}
            onChangeText={(text) => setSchoolInfo({ ...schoolInfo, pincode: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 XXXXXXXXXX"
            keyboardType="phone-pad"
            value={schoolInfo.phone}
            onChangeText={(text) => setSchoolInfo({ ...schoolInfo, phone: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="info@school.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            value={schoolInfo.email}
            onChangeText={(text) => setSchoolInfo({ ...schoolInfo, email: text })}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Subdomain *</Text>
          <View style={styles.subdomainContainer}>
            <TextInput
              style={[styles.input, styles.subdomainInput]}
              placeholder="schoolname"
              autoCapitalize="none"
              value={schoolInfo.subdomain}
              onChangeText={(text) => setSchoolInfo({ ...schoolInfo, subdomain: text.toLowerCase() })}
            />
            <Text style={styles.subdomainSuffix}>.schoolmgmt.com</Text>
          </View>
          <Text style={styles.inputHint}>Only lowercase letters, numbers, and hyphens allowed</Text>
        </View>
      </Card>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Select Subscription Plan</Text>
      <Text style={styles.stepDescription}>Choose a plan that fits your school's needs</Text>

      <View style={styles.plansContainer}>
        {Object.entries(PLANS).map(([key, plan]) => (
          <TouchableOpacity
            key={key}
            onPress={() =>
              setSubscription({
                ...subscription,
                plan: key as 'basic' | 'standard' | 'premium',
                maxStudents: plan.maxStudents,
                features: plan.features,
              })
            }
          >
            <Card
              elevation="md"
              padding={SPACING.lg}
              style={[
                styles.planCard,
                subscription.plan === key && styles.planCardSelected,
              ]}
            >
              {subscription.plan === key && (
                <View style={styles.selectedBadge}>
                  <Icon name="check-circle" size={20} color={COLORS.success} />
                </View>
              )}

              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>₹{plan.price.toLocaleString()}/month</Text>
              <Text style={styles.planStudents}>Up to {plan.maxStudents} students</Text>

              <View style={styles.planFeatures}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Icon name="check" size={16} color={COLORS.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <Card elevation="sm" padding={SPACING.lg} style={styles.formCard}>
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Billing Cycle</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly (5% off)' },
              { value: 'annual', label: 'Annual (10% off)' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() =>
                  setSubscription({ ...subscription, billingCycle: option.value as any })
                }
              >
                <View
                  style={[
                    styles.radioCircle,
                    subscription.billingCycle === option.value && styles.radioCircleSelected,
                  ]}
                >
                  {subscription.billingCycle === option.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Trial Period (Days)</Text>
          <TextInput
            style={styles.input}
            placeholder="14"
            keyboardType="number-pad"
            value={subscription.trialDays.toString()}
            onChangeText={(text) =>
              setSubscription({ ...subscription, trialDays: parseInt(text) || 0 })
            }
          />
        </View>
      </Card>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Create Admin Account</Text>
      <Text style={styles.stepDescription}>Set up the principal/admin account for the school</Text>

      <Card elevation="sm" padding={SPACING.lg} style={styles.formCard}>
        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={styles.inputLabel}>First Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="First name"
              value={adminAccount.firstName}
              onChangeText={(text) => setAdminAccount({ ...adminAccount, firstName: text })}
            />
          </View>

          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={styles.inputLabel}>Last Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Last name"
              value={adminAccount.lastName}
              onChangeText={(text) => setAdminAccount({ ...adminAccount, lastName: text })}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@school.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            value={adminAccount.email}
            onChangeText={(text) => setAdminAccount({ ...adminAccount, email: text })}
          />
          <Text style={styles.inputHint}>Login credentials will be sent to this email</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 XXXXXXXXXX"
            keyboardType="phone-pad"
            value={adminAccount.phone}
            onChangeText={(text) => setAdminAccount({ ...adminAccount, phone: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 8 characters"
            secureTextEntry
            value={adminAccount.password}
            onChangeText={(text) => setAdminAccount({ ...adminAccount, password: text })}
          />
          <Text style={styles.inputHint}>Password must be at least 8 characters long</Text>
        </View>
      </Card>
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Module Configuration</Text>
      <Text style={styles.stepDescription}>Enable modules and set preferences</Text>

      <Card elevation="sm" padding={SPACING.lg} style={styles.formCard}>
        <Text style={styles.sectionTitle}>Enable Modules</Text>

        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Icon name="bookshelf" size={20} color={COLORS.primary} />
            <Text style={styles.toggleLabel}>Library Management</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, moduleConfig.library && styles.toggleActive]}
            onPress={() => setModuleConfig({ ...moduleConfig, library: !moduleConfig.library })}
          >
            <View style={[styles.toggleThumb, moduleConfig.library && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Icon name="bus-school" size={20} color={COLORS.primary} />
            <Text style={styles.toggleLabel}>Transport Management</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, moduleConfig.transport && styles.toggleActive]}
            onPress={() => setModuleConfig({ ...moduleConfig, transport: !moduleConfig.transport })}
          >
            <View style={[styles.toggleThumb, moduleConfig.transport && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Icon name="credit-card" size={20} color={COLORS.primary} />
            <Text style={styles.toggleLabel}>Online Payments</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, moduleConfig.onlinePayments && styles.toggleActive]}
            onPress={() => setModuleConfig({ ...moduleConfig, onlinePayments: !moduleConfig.onlinePayments })}
          >
            <View style={[styles.toggleThumb, moduleConfig.onlinePayments && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Icon name="fingerprint" size={20} color={COLORS.primary} />
            <Text style={styles.toggleLabel}>Biometric Attendance</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, moduleConfig.biometricAttendance && styles.toggleActive]}
            onPress={() =>
              setModuleConfig({ ...moduleConfig, biometricAttendance: !moduleConfig.biometricAttendance })
            }
          >
            <View
              style={[styles.toggleThumb, moduleConfig.biometricAttendance && styles.toggleThumbActive]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Academic Board</Text>
          <View style={styles.radioGroup}>
            {['CBSE', 'ICSE', 'State Board', 'IB'].map((board) => (
              <TouchableOpacity
                key={board}
                style={styles.radioOption}
                onPress={() => setModuleConfig({ ...moduleConfig, academicBoard: board })}
              >
                <View
                  style={[
                    styles.radioCircle,
                    moduleConfig.academicBoard === board && styles.radioCircleSelected,
                  ]}
                >
                  {moduleConfig.academicBoard === board && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{board}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Grading System</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'percentage', label: 'Percentage (0-100%)' },
              { value: 'grade', label: 'Letter Grade (A-F)' },
              { value: 'gpa', label: 'GPA (0-10)' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() => setModuleConfig({ ...moduleConfig, gradingSystem: option.value })}
              >
                <View
                  style={[
                    styles.radioCircle,
                    moduleConfig.gradingSystem === option.value && styles.radioCircleSelected,
                  ]}
                >
                  {moduleConfig.gradingSystem === option.value && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Card>
    </ScrollView>
  );

  const renderStep5 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Review & Deploy</Text>
      <Text style={styles.stepDescription}>Review all details before deployment</Text>

      <Card elevation="sm" padding={SPACING.lg} style={styles.reviewCard}>
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>School Information</Text>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>School Name:</Text>
            <Text style={styles.reviewValue}>{schoolInfo.name}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Subdomain:</Text>
            <Text style={styles.reviewValue}>{schoolInfo.subdomain}.schoolmgmt.com</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Email:</Text>
            <Text style={styles.reviewValue}>{schoolInfo.email}</Text>
          </View>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Subscription</Text>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Plan:</Text>
            <Text style={styles.reviewValue}>{PLANS[subscription.plan].name}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Billing:</Text>
            <Text style={styles.reviewValue}>{subscription.billingCycle}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Trial:</Text>
            <Text style={styles.reviewValue}>{subscription.trialDays} days</Text>
          </View>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Admin Account</Text>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Name:</Text>
            <Text style={styles.reviewValue}>
              {adminAccount.firstName} {adminAccount.lastName}
            </Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Email:</Text>
            <Text style={styles.reviewValue}>{adminAccount.email}</Text>
          </View>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Enabled Modules</Text>
          <View style={styles.modulesList}>
            {moduleConfig.library && (
              <View style={styles.moduleChip}>
                <Icon name="bookshelf" size={14} color={COLORS.primary} />
                <Text style={styles.moduleChipText}>Library</Text>
              </View>
            )}
            {moduleConfig.transport && (
              <View style={styles.moduleChip}>
                <Icon name="bus-school" size={14} color={COLORS.primary} />
                <Text style={styles.moduleChipText}>Transport</Text>
              </View>
            )}
            {moduleConfig.onlinePayments && (
              <View style={styles.moduleChip}>
                <Icon name="credit-card" size={14} color={COLORS.primary} />
                <Text style={styles.moduleChipText}>Online Payments</Text>
              </View>
            )}
            {moduleConfig.biometricAttendance && (
              <View style={styles.moduleChip}>
                <Icon name="fingerprint" size={14} color={COLORS.primary} />
                <Text style={styles.moduleChipText}>Biometric</Text>
              </View>
            )}
          </View>
        </View>
      </Card>

      <Card elevation="sm" padding={SPACING.md} style={styles.warningCard}>
        <Icon name="information" size={20} color={COLORS.warning} />
        <Text style={styles.warningText}>
          Deployment will create a new tenant instance. This process may take a few minutes.
        </Text>
      </Card>
    </ScrollView>
  );

  return (
    <ScreenWrapper>
      <Header
        title="New School Setup"
        showBackButton
        onBackPress={handleBack}
      />
      <View style={styles.container}>
        {renderProgressBar()}

        <View style={styles.content}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </View>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            {currentStep > 1 && (
              <Button
                title="Back"
                onPress={handleBack}
                variant="secondary"
                style={styles.footerButton}
              />
            )}
            {currentStep < 5 ? (
              <Button
                title="Next"
                onPress={handleNext}
                icon="arrow-right"
                iconPosition="right"
                style={styles.footerButton}
              />
            ) : (
              <Button
                title="Deploy School"
                onPress={handleDeploy}
                icon="rocket-launch"
                loading={isDeploying}
                style={styles.footerButton}
              />
            )}
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  progressStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepCompleted: {
    backgroundColor: COLORS.success,
  },
  progressStepActive: {
    backgroundColor: COLORS.primary,
  },
  progressStepText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray600,
  },
  progressStepTextActive: {
    color: COLORS.white,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.gray200,
    marginHorizontal: 4,
  },
  progressLineCompleted: {
    backgroundColor: COLORS.success,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  stepDescription: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    marginBottom: SPACING.lg,
  },
  formCard: {
    marginBottom: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  formGroupHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  inputLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.md,
    fontFamily: FONTS.regular,
    color: COLORS.gray900,
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: FONTS.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  subdomainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subdomainInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  subdomainSuffix: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: COLORS.gray300,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.lg,
  },
  plansContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  planCard: {
    position: 'relative',
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  selectedBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  planName: {
    fontSize: FONTS.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  planPrice: {
    fontSize: FONTS.lg,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  planStudents: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray600,
    marginBottom: SPACING.md,
  },
  planFeatures: {
    gap: SPACING.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray700,
  },
  radioGroup: {
    gap: SPACING.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  toggleLabel: {
    fontSize: FONTS.md,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray300,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.success,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  reviewCard: {
    marginBottom: SPACING.md,
  },
  reviewSection: {
    marginBottom: SPACING.lg,
  },
  reviewSectionTitle: {
    fontSize: FONTS.md,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  reviewLabel: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  reviewValue: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.semibold,
    color: COLORS.gray900,
  },
  modulesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  moduleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 16,
  },
  moduleChipText: {
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.warning + '08',
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
    marginBottom: SPACING.lg,
  },
  warningText: {
    flex: 1,
    fontSize: FONTS.sm,
    fontFamily: FONTS.medium,
    color: COLORS.warning,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  footerButton: {
    flex: 1,
  },
});

export default TenantSetupWizardScreen;
