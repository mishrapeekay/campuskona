import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, RADIUS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { staffService } from '@/services/api';
import {
    Gender,
    Designation,
    EmploymentType,
    EmploymentStatus
} from '@/types/models';

const StaffRegistrationScreen: React.FC = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        employee_id: '',
        designation: Designation.TEACHER,
        department: '',
        employment_type: EmploymentType.PERMANENT,
        employment_status: EmploymentStatus.ACTIVE,
        date_of_birth: '',
        gender: Gender.MALE,
        phone: '',
        email: '',
        date_of_joining: new Date().toISOString().split('T')[0],
        qualification: '',
        specialization: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
        if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
        if (!formData.employee_id.trim()) newErrors.employee_id = 'Employee ID is required';
        if (!formData.date_of_birth.trim()) newErrors.date_of_birth = 'Date of birth is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            Alert.alert('Validation Error', 'Please check the form for errors');
            return;
        }

        setLoading(true);
        try {
            // Prepared payload
            const payload: any = {
                ...formData,
                user: {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone: formData.phone,
                }
            };

            await staffService.createStaffMember(payload);

            Alert.alert(
                'Success',
                'Staff member registered successfully',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Registration error:', error);
            Alert.alert('Registration Failed', error.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <Header title="Staff Registration" showBackButton />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Input
                                    label="First Name"
                                    placeholder="John"
                                    value={formData.first_name}
                                    onChangeText={(val) => handleChange('first_name', val)}
                                    error={errors.first_name}
                                    required
                                />
                            </View>
                            <View style={styles.col}>
                                <Input
                                    label="Last Name"
                                    placeholder="Doe"
                                    value={formData.last_name}
                                    onChangeText={(val) => handleChange('last_name', val)}
                                    error={errors.last_name}
                                    required
                                />
                            </View>
                        </View>

                        <Input
                            label="Employee ID"
                            placeholder="EMP-123"
                            value={formData.employee_id}
                            onChangeText={(val) => handleChange('employee_id', val)}
                            error={errors.employee_id}
                            required
                        />

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Input
                                    label="Designation"
                                    value={formData.designation}
                                    placeholder="e.g. TEACHER"
                                    onChangeText={(val) => handleChange('designation', val as Designation)}
                                />
                            </View>
                            <View style={styles.col}>
                                <Input
                                    label="Department"
                                    placeholder="e.g. Science"
                                    value={formData.department}
                                    onChangeText={(val) => handleChange('department', val)}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Employment Details</Text>

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Input
                                    label="Type"
                                    value={formData.employment_type}
                                    onChangeText={(val) => handleChange('employment_type', val as EmploymentType)}
                                />
                            </View>
                            <View style={styles.col}>
                                <Input
                                    label="Status"
                                    value={formData.employment_status}
                                    onChangeText={(val) => handleChange('employment_status', val as EmploymentStatus)}
                                />
                            </View>
                        </View>

                        <Input
                            label="Date of Joining"
                            placeholder="YYYY-MM-DD"
                            value={formData.date_of_joining}
                            onChangeText={(val) => handleChange('date_of_joining', val)}
                            leftIcon="calendar"
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Details</Text>

                        <Input
                            label="Date of Birth"
                            placeholder="YYYY-MM-DD"
                            value={formData.date_of_birth}
                            onChangeText={(val) => handleChange('date_of_birth', val)}
                            error={errors.date_of_birth}
                            leftIcon="calendar"
                            required
                        />

                        <Input
                            label="Gender"
                            placeholder="MALE or FEMALE"
                            value={formData.gender}
                            onChangeText={(val) => handleChange('gender', val as Gender)}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact & Address</Text>

                        <Input
                            label="Phone"
                            placeholder="+91 1234567890"
                            value={formData.phone}
                            onChangeText={(val) => handleChange('phone', val)}
                            keyboardType="phone-pad"
                            leftIcon="phone"
                            error={errors.phone}
                            required
                        />

                        <Input
                            label="Email"
                            placeholder="staff@example.com"
                            value={formData.email}
                            onChangeText={(val) => handleChange('email', val)}
                            keyboardType="email-address"
                            leftIcon="email"
                            error={errors.email}
                            required
                        />

                        <Input
                            label="Address"
                            placeholder="Full Address"
                            value={formData.address}
                            onChangeText={(val) => handleChange('address', val)}
                            multiline
                            numberOfLines={3}
                            error={errors.address}
                            style={{ height: 80, textAlignVertical: 'top' }}
                            required
                        />

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Input
                                    label="City"
                                    value={formData.city}
                                    onChangeText={(val) => handleChange('city', val)}
                                />
                            </View>
                            <View style={styles.col}>
                                <Input
                                    label="State"
                                    value={formData.state}
                                    onChangeText={(val) => handleChange('state', val)}
                                />
                            </View>
                        </View>

                        <Input
                            label="Pincode"
                            value={formData.pincode}
                            onChangeText={(val) => handleChange('pincode', val)}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Qualifications</Text>
                        <Input
                            label="Highest Qualification"
                            placeholder="e.g. M.Sc, B.Ed"
                            value={formData.qualification}
                            onChangeText={(val) => handleChange('qualification', val)}
                        />
                        <Input
                            label="Specialization"
                            placeholder="e.g. Physics"
                            value={formData.specialization}
                            onChangeText={(val) => handleChange('specialization', val)}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Button
                            title="Register Staff Member"
                            onPress={handleSubmit}
                            loading={loading}
                            fullWidth
                        />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray50,
    },
    contentContainer: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xl * 2,
    },
    section: {
        marginBottom: SPACING.xl,
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        ...Platform.select({
            ios: {
                shadowColor: COLORS.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    sectionTitle: {
        fontSize: FONTS.lg,
        fontFamily: FONTS.bold,
        color: COLORS.secondary,
        marginBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
        paddingBottom: SPACING.xs,
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    col: {
        flex: 1,
    },
    footer: {
        marginTop: SPACING.md,
    },
});

export default StaffRegistrationScreen;
