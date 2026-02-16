import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    createStudent,
    updateStudent,
    fetchStudentById,
    selectCurrentStudent,
    selectStudentLoading,
} from '../../store/slices/studentsSlice';
import { FormField, PhotoUpload } from '../../components/common';
import { Card, CardContent } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { STATE_LIST, getDistricts, getCities, getPincode } from '../../data/indiaGeoData';

/**
 * Student Form Component - Multi-step form for adding/editing students
 */
const StudentForm = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentStudent = useSelector(selectCurrentStudent);
    const loading = useSelector(selectStudentLoading);

    const isEditMode = !!id;
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Personal Information
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        aadhar_number: '',
        email: '',
        phone: '',
        photo: null,

        // Address Information
        current_address_line1: '',
        current_address_line2: '',
        current_state: '',
        current_district: '',
        current_city: '',
        current_pincode: '',
        country: 'India',

        // Academic Information
        admission_number: '',
        admission_date: '',
        class: '',
        section: '',
        roll_number: '',
        board: '',
        house: '',

        // Medical Information
        medical_conditions: '',
        allergies: '',
        emergency_contact_name: '',
        emergency_contact_number: '',

        // Previous School
        previous_school_name: '',
        previous_school_board: '',
        transfer_certificate_number: '',
    });

    const [errors, setErrors] = useState({});

    // Load student data if editing
    useEffect(() => {
        if (isEditMode && id) {
            dispatch(fetchStudentById(id));
        }
    }, [dispatch, id, isEditMode]);

    useEffect(() => {
        if (isEditMode && currentStudent) {
            setFormData(prev => ({
                ...prev,
                ...currentStudent,
                // Ensure address fields use correct names
                current_address_line1: currentStudent.current_address_line1 || currentStudent.address_line1 || '',
                current_address_line2: currentStudent.current_address_line2 || currentStudent.address_line2 || '',
                current_state: currentStudent.current_state || currentStudent.state || '',
                current_district: currentStudent.current_district || '',
                current_city: currentStudent.current_city || currentStudent.city || '',
                current_pincode: currentStudent.current_pincode || currentStudent.pincode || '',
                // Fix emergency contact field name
                emergency_contact_number: currentStudent.emergency_contact_number || currentStudent.emergency_contact_phone || '',
            }));
        }
    }, [currentStudent, isEditMode]);

    const steps = [
        { number: 1, title: 'Personal Information', description: 'Basic student details' },
        { number: 2, title: 'Address Information', description: 'Contact and address' },
        { number: 3, title: 'Academic Information', description: 'Class and admission details' },
        { number: 4, title: 'Medical Information', description: 'Health and emergency contacts' },
        { number: 5, title: 'Review', description: 'Review and submit' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.first_name) newErrors.first_name = 'First name is required';
            if (!formData.last_name) newErrors.last_name = 'Last name is required';
            if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
            if (!formData.gender) newErrors.gender = 'Gender is required';
        }

        if (step === 2) {
            if (!formData.current_address_line1) newErrors.current_address_line1 = 'Address is required';
            if (!formData.current_state) newErrors.current_state = 'State is required';
            if (!formData.current_city) newErrors.current_city = 'City is required';
            if (!formData.current_pincode) newErrors.current_pincode = 'PIN code is required';
        }

        if (step === 3) {
            if (!formData.admission_date) newErrors.admission_date = 'Admission date is required';
            if (!formData.class) newErrors.class = 'Class is required';
            if (!formData.section) newErrors.section = 'Section is required';
            if (!formData.board) newErrors.board = 'Board is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        // Build the payload with correct backend field names
        // Copy current address to permanent address (same by default)
        const payload = {
            ...formData,
            // Permanent address mirrors current unless explicitly set
            permanent_address_line1: formData.permanent_address_line1 || formData.current_address_line1,
            permanent_address_line2: formData.permanent_address_line2 || formData.current_address_line2,
            permanent_city: formData.permanent_city || formData.current_city,
            permanent_state: formData.permanent_state || formData.current_state,
            permanent_pincode: formData.permanent_pincode || formData.current_pincode,
        };

        // Remove old-style flat address fields if they sneaked in
        delete payload.address_line1;
        delete payload.address_line2;
        delete payload.city;
        delete payload.state;
        delete payload.pincode;
        delete payload.emergency_contact_phone;
        delete payload.current_district; // not a model field, just UI helper
        // Always remove photo from JSON payload — DRF ImageField rejects URL strings
        // A new photo File is added separately via FormData below
        delete payload.photo;

        let dataToSubmit = payload;

        if (formData.photo instanceof File) {
            const formDataObj = new FormData();
            Object.keys(payload).forEach(key => {
                const val = payload[key];
                if (val !== null && val !== undefined) {
                    // JSON-stringify arrays/objects so DRF JSONField can parse them correctly
                    if (Array.isArray(val) || (typeof val === 'object' && !(val instanceof File))) {
                        formDataObj.append(key, JSON.stringify(val));
                    } else {
                        formDataObj.append(key, val);
                    }
                }
            });
            formDataObj.append('photo', formData.photo);
            dataToSubmit = formDataObj;
        }

        if (isEditMode) {
            await dispatch(updateStudent({ id, data: dataToSubmit }));
        } else {
            await dispatch(createStudent(dataToSubmit));
        }
        navigate('/students');
    };

    if (loading && isEditMode) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title={isEditMode ? 'Edit Student' : 'Add New Student'}
                    description={isEditMode ? 'Update student information' : 'Fill in the student details'}
                />

                <div className="max-w-4xl">
                    {/* Progress Steps */}
                    <nav aria-label="Progress" className="mb-8">
                        <ol className="flex items-center justify-between">
                            {steps.map((step) => (
                                <li key={step.number} className="relative flex-1">
                                    <div className="flex items-center">
                                        <div
                                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${currentStep >= step.number
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-muted-foreground/30 bg-background text-muted-foreground'
                                                }`}
                                        >
                                            {currentStep > step.number ? (
                                                <Check className="w-5 h-5" />
                                            ) : (
                                                <span className="text-sm font-medium">{step.number}</span>
                                            )}
                                        </div>
                                        {step.number < steps.length && (
                                            <div
                                                className={`hidden sm:block flex-1 h-0.5 mx-2 transition-colors ${currentStep > step.number ? 'bg-primary' : 'bg-muted'
                                                    }`}
                                            />
                                        )}
                                    </div>
                                    <div className="mt-2 hidden sm:block">
                                        <p className="text-xs font-medium text-foreground">{step.title}</p>
                                        <p className="text-xs text-muted-foreground">{step.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </nav>

                    {/* Form Steps */}
                    <Card>
                        <CardContent className="pt-6">
                            {/* Step 1: Personal Information */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-foreground">Personal Information</h3>

                                    <PhotoUpload
                                        name="photo"
                                        label="Student Photo"
                                        value={formData.photo}
                                        onChange={handleChange}
                                        error={errors.photo}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormField
                                            label="First Name"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            error={errors.first_name}
                                            required
                                        />
                                        <FormField
                                            label="Middle Name"
                                            name="middle_name"
                                            value={formData.middle_name}
                                            onChange={handleChange}
                                        />
                                        <FormField
                                            label="Last Name"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            error={errors.last_name}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            label="Date of Birth"
                                            name="date_of_birth"
                                            type="date"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                            error={errors.date_of_birth}
                                            required
                                        />
                                        <FormField
                                            label="Gender"
                                            name="gender"
                                            type="select"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            error={errors.gender}
                                            options={[
                                                { value: 'M', label: 'Male' },
                                                { value: 'F', label: 'Female' },
                                                { value: 'O', label: 'Other' },
                                            ]}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            label="Blood Group"
                                            name="blood_group"
                                            type="select"
                                            value={formData.blood_group}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'A+', label: 'A+' },
                                                { value: 'A-', label: 'A-' },
                                                { value: 'B+', label: 'B+' },
                                                { value: 'B-', label: 'B-' },
                                                { value: 'AB+', label: 'AB+' },
                                                { value: 'AB-', label: 'AB-' },
                                                { value: 'O+', label: 'O+' },
                                                { value: 'O-', label: 'O-' },
                                            ]}
                                        />
                                        <FormField
                                            label="Aadhar Number"
                                            name="aadhar_number"
                                            value={formData.aadhar_number}
                                            onChange={handleChange}
                                            placeholder="XXXX-XXXX-XXXX"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            label="Email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                        <FormField
                                            label="Phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Address Information */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-foreground">Address Information</h3>

                                    <FormField
                                        label="Address Line 1"
                                        name="current_address_line1"
                                        value={formData.current_address_line1}
                                        onChange={handleChange}
                                        error={errors.current_address_line1}
                                        placeholder="House/Flat No., Street, Area"
                                        required
                                    />

                                    <FormField
                                        label="Address Line 2"
                                        name="current_address_line2"
                                        value={formData.current_address_line2}
                                        onChange={handleChange}
                                        placeholder="Landmark, Locality (optional)"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* State dropdown */}
                                        <FormField
                                            label="State"
                                            name="current_state"
                                            type="select"
                                            value={formData.current_state}
                                            onChange={(e) => {
                                                const newState = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    current_state: newState,
                                                    current_district: '',
                                                    current_city: '',
                                                    current_pincode: '',
                                                }));
                                                if (errors.current_state) setErrors(prev => ({ ...prev, current_state: '' }));
                                            }}
                                            error={errors.current_state}
                                            options={STATE_LIST.map(s => ({ value: s, label: s }))}
                                            required
                                        />

                                        {/* District dropdown */}
                                        <FormField
                                            label="District"
                                            name="current_district"
                                            type="select"
                                            value={formData.current_district}
                                            onChange={(e) => {
                                                const newDistrict = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    current_district: newDistrict,
                                                    current_city: '',
                                                    current_pincode: '',
                                                }));
                                            }}
                                            options={getDistricts(formData.current_state).map(d => ({ value: d, label: d }))}
                                            disabled={!formData.current_state}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* City dropdown */}
                                        <FormField
                                            label="City"
                                            name="current_city"
                                            type="select"
                                            value={formData.current_city}
                                            onChange={(e) => {
                                                const newCity = e.target.value;
                                                const pin = getPincode(formData.current_state, formData.current_district, newCity);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    current_city: newCity,
                                                    current_pincode: pin,
                                                }));
                                                if (errors.current_city) setErrors(prev => ({ ...prev, current_city: '' }));
                                            }}
                                            error={errors.current_city}
                                            options={getCities(formData.current_state, formData.current_district).map(c => ({ value: c, label: c }))}
                                            disabled={!formData.current_district}
                                            required
                                        />

                                        {/* PIN Code — auto-filled, editable */}
                                        <FormField
                                            label="PIN Code"
                                            name="current_pincode"
                                            value={formData.current_pincode}
                                            onChange={handleChange}
                                            error={errors.current_pincode}
                                            placeholder="Auto-filled on city select"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            label="Country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Academic Information */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-foreground">Academic Information</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            label="Admission Number"
                                            name="admission_number"
                                            value={formData.admission_number}
                                            onChange={handleChange}
                                            helperText="Leave empty to auto-generate"
                                        />
                                        <FormField
                                            label="Admission Date"
                                            name="admission_date"
                                            type="date"
                                            value={formData.admission_date}
                                            onChange={handleChange}
                                            error={errors.admission_date}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormField
                                            label="Class"
                                            name="class"
                                            type="select"
                                            value={formData.class}
                                            onChange={handleChange}
                                            error={errors.class}
                                            options={Array.from({ length: 12 }, (_, i) => ({
                                                value: String(i + 1),
                                                label: `Class ${i + 1}`,
                                            }))}
                                            required
                                        />
                                        <FormField
                                            label="Section"
                                            name="section"
                                            type="select"
                                            value={formData.section}
                                            onChange={handleChange}
                                            error={errors.section}
                                            options={[
                                                { value: 'A', label: 'Section A' },
                                                { value: 'B', label: 'Section B' },
                                                { value: 'C', label: 'Section C' },
                                                { value: 'D', label: 'Section D' },
                                            ]}
                                            required
                                        />
                                        <FormField
                                            label="Roll Number"
                                            name="roll_number"
                                            value={formData.roll_number}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            label="Board"
                                            name="board"
                                            type="select"
                                            value={formData.board}
                                            onChange={handleChange}
                                            error={errors.board}
                                            options={[
                                                { value: 'CBSE', label: 'CBSE' },
                                                { value: 'ICSE', label: 'ICSE' },
                                                { value: 'MPBSE', label: 'MPBSE' },
                                            ]}
                                            required
                                        />
                                        <FormField
                                            label="House"
                                            name="house"
                                            type="select"
                                            value={formData.house}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'Red', label: 'Red House' },
                                                { value: 'Blue', label: 'Blue House' },
                                                { value: 'Green', label: 'Green House' },
                                                { value: 'Yellow', label: 'Yellow House' },
                                            ]}
                                        />
                                    </div>

                                    <h4 className="text-md font-medium text-foreground mt-6">Previous School (Optional)</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            label="Previous School Name"
                                            name="previous_school_name"
                                            value={formData.previous_school_name}
                                            onChange={handleChange}
                                        />
                                        <FormField
                                            label="Previous School Board"
                                            name="previous_school_board"
                                            value={formData.previous_school_board}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <FormField
                                        label="Transfer Certificate Number"
                                        name="transfer_certificate_number"
                                        value={formData.transfer_certificate_number}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}

                            {/* Step 4: Medical Information */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-foreground">Medical Information</h3>

                                    <FormField
                                        label="Medical Conditions"
                                        name="medical_conditions"
                                        type="textarea"
                                        value={formData.medical_conditions}
                                        onChange={handleChange}
                                        placeholder="Any existing medical conditions..."
                                    />

                                    <FormField
                                        label="Allergies"
                                        name="allergies"
                                        type="textarea"
                                        value={formData.allergies}
                                        onChange={handleChange}
                                        placeholder="Any known allergies..."
                                    />

                                    <h4 className="text-md font-medium text-foreground mt-6">Emergency Contact</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            label="Emergency Contact Name"
                                            name="emergency_contact_name"
                                            value={formData.emergency_contact_name}
                                            onChange={handleChange}
                                        />
                                        <FormField
                                            label="Emergency Contact Phone"
                                            name="emergency_contact_number"
                                            type="tel"
                                            value={formData.emergency_contact_number}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Review */}
                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-medium text-foreground">Review Information</h3>

                                    <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                                        <ReviewSection title="Personal Information">
                                            <ReviewItem label="Name" value={`${formData.first_name} ${formData.middle_name} ${formData.last_name}`} />
                                            <ReviewItem label="Date of Birth" value={formData.date_of_birth} />
                                            <ReviewItem label="Gender" value={formData.gender} />
                                            <ReviewItem label="Blood Group" value={formData.blood_group} />
                                        </ReviewSection>

                                        <ReviewSection title="Contact Information">
                                            <ReviewItem label="Email" value={formData.email} />
                                            <ReviewItem label="Phone" value={formData.phone} />
                                            <ReviewItem label="Address" value={[formData.current_address_line1, formData.current_city, formData.current_district, formData.current_state, formData.current_pincode].filter(Boolean).join(', ')} />
                                        </ReviewSection>

                                        <ReviewSection title="Academic Information">
                                            <ReviewItem label="Admission Date" value={formData.admission_date} />
                                            <ReviewItem label="Class" value={formData.class} />
                                            <ReviewItem label="Section" value={formData.section} />
                                            <ReviewItem label="Board" value={formData.board} />
                                        </ReviewSection>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="mt-8 flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={currentStep === 1 ? () => navigate('/students') : handlePrevious}
                                >
                                    {currentStep === 1 ? (
                                        'Cancel'
                                    ) : (
                                        <>
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </>
                                    )}
                                </Button>

                                {currentStep < 5 ? (
                                    <Button onClick={handleNext}>
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleSubmit} disabled={loading}>
                                        {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                                        {isEditMode ? 'Update Student' : 'Add Student'}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AnimatedPage>
    );
};

// Helper components
const ReviewSection = ({ title, children }) => (
    <div>
        <h4 className="text-sm font-medium text-foreground mb-2">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
        </div>
    </div>
);

const ReviewItem = ({ label, value }) => (
    <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm text-foreground">{value || '-'}</dd>
    </div>
);

export default StudentForm;
