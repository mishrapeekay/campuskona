import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, SPACING, FONTS, RADIUS } from '@/constants';
import ScreenWrapper from '@/components/layout/ScreenWrapper';
import Header from '@/components/layout/Header';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { studentService } from '@/services/api';
import { Gender, StudentCategory, AdmissionStatus, Student } from '@/types/models';
import { HomeStackParamList } from '@/types/navigation';

type StudentEditScreenRouteProp = RouteProp<HomeStackParamList, 'EditStudent'>;

const StudentEditScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<StudentEditScreenRouteProp>();
    const { studentId } = route.params;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        admission_number: '',
        date_of_birth: '',
        gender: 'MALE',
        email: '',
        phone_number: '',
        emergency_contact_number: '',
        current_class: '',
        current_address: '',
        current_city: '',
        current_state: '',
        current_pincode: '',
        father_name: '',
        father_phone: '',
        mother_name: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadStudentDetails();
    }, [studentId]);

    const loadStudentDetails = async () => {
        try {
            setInitialLoading(true);
            const student = await studentService.getStudent(studentId);
            populateForm(student);
        } catch (error: any) {
            console.error('Error loading student:', error);
            Alert.alert('Error', error.message || 'Failed to load student details');
            navigation.goBack();
        } finally {
            setInitialLoading(false);
        }
    };

    const populateForm = (student: Student) => {
        setFormData({
            first_name: student.first_name || '',
            last_name: student.last_name || '',
            admission_number: student.admission_number || '',
            date_of_birth: student.date_of_birth || '',
            gender: student.gender || 'MALE',
            email: student.email || '',
            phone_number: student.phone_number || '',
            emergency_contact_number: student.emergency_contact_number || '',
            current_class: student.current_class || '',
            current_address: student.current_address || '',
            current_city: student.current_city || '',
            current_state: student.current_state || '',
            current_pincode: student.current_pincode || '',
            father_name: student.father_name || '',
            father_phone: student.father_phone || '',
            mother_name: student.mother_name || '',
        });
    };

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
        if (!formData.admission_number.trim()) newErrors.admission_number = 'Admission number is required';
        if (!formData.date_of_birth.trim()) newErrors.date_of_birth = 'Date of birth is required';
        if (!formData.emergency_contact_number.trim()) newErrors.emergency_contact_number = 'Emergency contact is required';
        if (!formData.current_address.trim()) newErrors.current_address = 'Address is required';

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
            const payload: Partial<Student> = {
                ...formData,
                // Ensure enums are typed correctly
                gender: formData.gender as Gender,
            };

            await studentService.updateStudent(studentId, payload);

            Alert.alert(
                'Success',
                'Student updated successfully',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Update error:', error);
            Alert.alert('Update Failed', error.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <ScreenWrapper>
                <Header title="Edit Student" showBackButton />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <Header title="Edit Student" showBackButton />
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
                        <Text style={styles.sectionTitle}>Personal Information</Text>

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
                            label="Date of Birth"
                            placeholder="YYYY-MM-DD"
                            value={formData.date_of_birth}
                            onChangeText={(val) => handleChange('date_of_birth', val)}
                            error={errors.date_of_birth}
                            leftIcon="calendar"
                            required
                        />

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Input
                                    label="Gender (M/F)"
                                    placeholder="MALE"
                                    value={formData.gender}
                                    onChangeText={(val) => handleChange('gender', val)}
                                />
                            </View>
                            <View style={styles.col}>
                                <Input
                                    label="Class"
                                    placeholder="e.g. 10-A"
                                    value={formData.current_class}
                                    onChangeText={(val) => handleChange('current_class', val)}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Academic Details</Text>
                        <Input
                            label="Admission Number"
                            placeholder="e.g. ADM-2024-001"
                            value={formData.admission_number}
                            onChangeText={(val) => handleChange('admission_number', val)}
                            error={errors.admission_number}
                            required
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Information</Text>

                        <Input
                            label="Phone Number"
                            placeholder="Student Phone"
                            value={formData.phone_number}
                            onChangeText={(val) => handleChange('phone_number', val)}
                            keyboardType="phone-pad"
                            leftIcon="phone"
                        />

                        <Input
                            label="Email"
                            placeholder="student@example.com"
                            value={formData.email}
                            onChangeText={(val) => handleChange('email', val)}
                            keyboardType="email-address"
                            leftIcon="email"
                        />

                        <Input
                            label="Current Address"
                            placeholder="Full Address"
                            value={formData.current_address}
                            onChangeText={(val) => handleChange('current_address', val)}
                            multiline
                            numberOfLines={3}
                            error={errors.current_address}
                            style={{ height: 80, textAlignVertical: 'top' }}
                            required
                        />

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Input
                                    label="City"
                                    value={formData.current_city}
                                    onChangeText={(val) => handleChange('current_city', val)}
                                />
                            </View>
                            <View style={styles.col}>
                                <Input
                                    label="State"
                                    value={formData.current_state}
                                    onChangeText={(val) => handleChange('current_state', val)}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Input
                                    label="Pincode"
                                    value={formData.current_pincode}
                                    onChangeText={(val) => handleChange('current_pincode', val)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Parent / Guardian</Text>
                        <Input
                            label="Father Name"
                            value={formData.father_name}
                            onChangeText={(val) => handleChange('father_name', val)}
                        />
                        <Input
                            label="Father Phone"
                            value={formData.father_phone}
                            onChangeText={(val) => handleChange('father_phone', val)}
                            keyboardType="phone-pad"
                        />
                        <Input
                            label="Mother Name"
                            value={formData.mother_name}
                            onChangeText={(val) => handleChange('mother_name', val)}
                        />
                        <Input
                            label="Emergency Contact"
                            placeholder="Primary Emergency Number"
                            value={formData.emergency_contact_number}
                            onChangeText={(val) => handleChange('emergency_contact_number', val)}
                            keyboardType="phone-pad"
                            error={errors.emergency_contact_number}
                            required
                        />
                    </View>

                    <View style={styles.footer}>
                        <Button
                            title="Update Student"
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        color: COLORS.primary,
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

export default StudentEditScreen;
