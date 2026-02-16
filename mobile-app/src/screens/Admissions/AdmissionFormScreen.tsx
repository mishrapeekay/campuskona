/**
 * AdmissionFormScreen - Multi-step admission application form
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const STEPS = ['Student', 'Parents', 'Previous', 'Documents'];

const AdmissionFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Student Info
    firstName: '', lastName: '', dateOfBirth: '', gender: '', classApplied: '', bloodGroup: '', nationality: 'Indian', religion: '', category: '',
    // Parent Info
    fatherName: '', fatherOccupation: '', fatherPhone: '', fatherEmail: '',
    motherName: '', motherOccupation: '', motherPhone: '', motherEmail: '',
    guardianName: '', guardianRelation: '', guardianPhone: '',
    address: '', city: '', state: '', pincode: '',
    // Previous School
    previousSchool: '', previousClass: '', boardName: '', percentage: '', reasonForLeaving: '',
    // Documents
    birthCertificate: false, transferCertificate: false, reportCard: false, aadharCard: false, photos: false, medicalCert: false,
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      'Submit Application',
      'Are you sure you want to submit this admission application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => navigation.goBack() },
      ]
    );
  };

  const renderInput = (label: string, field: string, placeholder: string, options?: { multiline?: boolean; keyboardType?: any }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, options?.multiline && styles.inputMultiline]}
        placeholder={placeholder}
        value={(formData as any)[field]}
        onChangeText={(text) => updateField(field, text)}
        placeholderTextColor={COLORS.textMuted}
        multiline={options?.multiline}
        keyboardType={options?.keyboardType}
      />
    </View>
  );

  const renderSelect = (label: string, field: string, options: string[]) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.selectRow}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.selectChip, (formData as any)[field] === option && styles.selectChipActive]}
            onPress={() => updateField(field, option)}
          >
            <Text style={[styles.selectChipText, (formData as any)[field] === option && styles.selectChipTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDocumentCheck = (label: string, field: string) => (
    <TouchableOpacity
      style={styles.docCheckRow}
      onPress={() => updateField(field, !(formData as any)[field])}
    >
      <Icon
        name={(formData as any)[field] ? 'checkbox-marked' : 'checkbox-blank-outline'}
        size={24}
        color={(formData as any)[field] ? COLORS.success : COLORS.gray400}
      />
      <Text style={styles.docCheckLabel}>{label}</Text>
      <TouchableOpacity style={styles.docUploadBtn}>
        <Icon name="upload" size={16} color={COLORS.primary} />
        <Text style={styles.docUploadText}>Upload</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Student Info
        return (
          <View>
            <Text style={styles.stepTitle}>Student Information</Text>
            <View style={styles.row}>
              <View style={styles.halfInput}>{renderInput('First Name *', 'firstName', 'Enter first name')}</View>
              <View style={styles.halfInput}>{renderInput('Last Name *', 'lastName', 'Enter last name')}</View>
            </View>
            {renderInput('Date of Birth *', 'dateOfBirth', 'DD/MM/YYYY')}
            {renderSelect('Gender *', 'gender', ['Male', 'Female', 'Other'])}
            {renderSelect('Class Applied For *', 'classApplied', ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'])}
            {renderSelect('Blood Group', 'bloodGroup', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])}
            {renderInput('Nationality', 'nationality', 'Enter nationality')}
            {renderInput('Religion', 'religion', 'Enter religion')}
            {renderSelect('Category', 'category', ['General', 'OBC', 'SC', 'ST', 'EWS'])}
          </View>
        );

      case 1: // Parent Info
        return (
          <View>
            <Text style={styles.stepTitle}>Parent / Guardian Details</Text>
            <Text style={styles.stepSubtitle}>Father's Information</Text>
            {renderInput("Father's Name *", 'fatherName', "Enter father's name")}
            {renderInput('Occupation', 'fatherOccupation', 'Enter occupation')}
            {renderInput('Phone *', 'fatherPhone', 'Enter phone number', { keyboardType: 'phone-pad' })}
            {renderInput('Email', 'fatherEmail', 'Enter email', { keyboardType: 'email-address' })}

            <Text style={[styles.stepSubtitle, { marginTop: SPACING.lg }]}>Mother's Information</Text>
            {renderInput("Mother's Name *", 'motherName', "Enter mother's name")}
            {renderInput('Occupation', 'motherOccupation', 'Enter occupation')}
            {renderInput('Phone', 'motherPhone', 'Enter phone number', { keyboardType: 'phone-pad' })}
            {renderInput('Email', 'motherEmail', 'Enter email', { keyboardType: 'email-address' })}

            <Text style={[styles.stepSubtitle, { marginTop: SPACING.lg }]}>Residential Address</Text>
            {renderInput('Address *', 'address', 'Enter full address', { multiline: true })}
            <View style={styles.row}>
              <View style={styles.halfInput}>{renderInput('City *', 'city', 'City')}</View>
              <View style={styles.halfInput}>{renderInput('State *', 'state', 'State')}</View>
            </View>
            {renderInput('Pincode *', 'pincode', 'Enter pincode', { keyboardType: 'number-pad' })}
          </View>
        );

      case 2: // Previous School
        return (
          <View>
            <Text style={styles.stepTitle}>Previous Education</Text>
            {renderInput('Previous School Name', 'previousSchool', 'Enter school name')}
            {renderInput('Class Studied', 'previousClass', 'Last class attended')}
            {renderInput('Board', 'boardName', 'e.g., CBSE, ICSE, State Board')}
            {renderInput('Percentage / CGPA', 'percentage', 'Enter marks percentage')}
            {renderInput('Reason for Leaving', 'reasonForLeaving', 'Why did you leave?', { multiline: true })}
          </View>
        );

      case 3: // Documents
        return (
          <View>
            <Text style={styles.stepTitle}>Required Documents</Text>
            <Text style={styles.stepDescription}>Please upload the following documents. You can also upload them later.</Text>
            {renderDocumentCheck('Birth Certificate *', 'birthCertificate')}
            {renderDocumentCheck('Transfer Certificate', 'transferCertificate')}
            {renderDocumentCheck('Previous Report Card', 'reportCard')}
            {renderDocumentCheck('Aadhar Card (Student)', 'aadharCard')}
            {renderDocumentCheck('Passport Size Photos (2)', 'photos')}
            {renderDocumentCheck('Medical Fitness Certificate', 'medicalCert')}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        {STEPS.map((step, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={[styles.stepDot, index <= currentStep && styles.stepDotActive, index < currentStep && styles.stepDotCompleted]}
              onPress={() => index <= currentStep && setCurrentStep(index)}
            >
              {index < currentStep ? (
                <Icon name="check" size={14} color={COLORS.white} />
              ) : (
                <Text style={[styles.stepDotText, index <= currentStep && styles.stepDotTextActive]}>{index + 1}</Text>
              )}
            </TouchableOpacity>
            {index < STEPS.length - 1 && (
              <View style={[styles.stepLine, index < currentStep && styles.stepLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.stepLabels}>
        {STEPS.map((step, index) => (
          <Text key={index} style={[styles.stepLabel, index <= currentStep && styles.stepLabelActive]}>{step}</Text>
        ))}
      </View>

      {/* Form Content */}
      <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.formContent}>
          {renderStep()}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.prevButton} onPress={handlePrev}>
            <Icon name="arrow-left" size={20} color={COLORS.primary} />
            <Text style={styles.prevButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        {currentStep < STEPS.length - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Icon name="arrow-right" size={20} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Icon name="check-circle" size={20} color={COLORS.white} />
            <Text style={styles.submitButtonText}>Submit Application</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING['2xl'], paddingTop: SPACING.lg },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.gray200, justifyContent: 'center', alignItems: 'center' },
  stepDotActive: { backgroundColor: COLORS.primary },
  stepDotCompleted: { backgroundColor: COLORS.success },
  stepDotText: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.sm, color: COLORS.gray500 },
  stepDotTextActive: { color: COLORS.white },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.gray200, marginHorizontal: SPACING.xs },
  stepLineActive: { backgroundColor: COLORS.success },
  stepLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingTop: SPACING.xs },
  stepLabel: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.xs, color: COLORS.textMuted, textAlign: 'center', width: 60 },
  stepLabelActive: { color: COLORS.primary },
  formScroll: { flex: 1 },
  formContent: { padding: SPACING.base },
  stepTitle: { fontFamily: FONTS.family.bold, fontSize: FONTS.size.lg, color: COLORS.text, marginBottom: SPACING.md },
  stepSubtitle: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.primary, marginBottom: SPACING.md },
  stepDescription: { fontFamily: FONTS.family.regular, fontSize: FONTS.size.sm, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  inputGroup: { marginBottom: SPACING.md },
  inputLabel: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontFamily: FONTS.family.regular, fontSize: FONTS.size.base, color: COLORS.text },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: SPACING.md },
  halfInput: { flex: 1 },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  selectChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  selectChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  selectChipText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.sm, color: COLORS.textSecondary },
  selectChipTextActive: { color: COLORS.white },
  docCheckRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  docCheckLabel: { flex: 1, fontFamily: FONTS.family.medium, fontSize: FONTS.size.base, color: COLORS.text, marginLeft: SPACING.md },
  docUploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryMuted, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.sm, gap: 4 },
  docUploadText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.xs, color: COLORS.primary },
  navButtons: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.divider },
  prevButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.xs },
  prevButtonText: { fontFamily: FONTS.family.medium, fontSize: FONTS.size.base, color: COLORS.primary },
  nextButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, gap: SPACING.xs },
  nextButtonText: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.white },
  submitButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.success, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, gap: SPACING.xs },
  submitButtonText: { fontFamily: FONTS.family.semiBold, fontSize: FONTS.size.base, color: COLORS.white },
});

export default AdmissionFormScreen;
