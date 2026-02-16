import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
    createStaff,
    updateStaff,
    fetchStaffById,
    selectCurrentStaff,
    selectStaffLoading,
} from '../../store/slices/staffSlice';
import {
    PageHeader,
    PhotoUpload,
    FormField
} from '../../components/common';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Separator } from '@/ui/primitives/separator';
import { Checkbox } from '@/ui/primitives/checkbox';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { Loader2, User, MapPin, Briefcase, GraduationCap, Phone, Mail, CheckCircle, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import showToast from '../../utils/toast';
import { STATE_LIST, getDistricts, getCities, getPincode } from '../../data/indiaGeoData';

/**
 * Staff Form Component - Multi-step form for adding/editing staff
 */
const StaffForm = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentStaff = useSelector(selectCurrentStaff);
    const loading = useSelector(selectStaffLoading);

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
        pan_number: '',
        email: '',
        password: '',
        phone: '',
        alternate_phone: '',
        photo: null,

        // Address Information (maps to current_address_* on backend)
        current_address_line1: '',
        current_address_line2: '',
        current_state: '',
        current_district: '',
        current_city: '',
        current_pincode: '',
        country: 'India',

        // Employment Information
        employee_id: '',
        joining_date: '',
        department: '',
        designation: '',
        employment_type: '',
        highest_qualification: '',

        // Salary Information
        basic_salary: '',
        bank_account_number: '',
        bank_name: '',
        ifsc_code: '',

        // Emergency Contact
        emergency_contact_name: '',
        emergency_contact_relation: '',
        emergency_contact_number: '',
    });

    const [errors, setErrors] = useState({});

    // Load staff data if editing
    useEffect(() => {
        if (isEditMode && id) {
            dispatch(fetchStaffById(id));
        }
    }, [dispatch, id, isEditMode]);

    useEffect(() => {
        if (isEditMode && currentStaff) {
            setFormData(prev => ({
                ...prev,
                ...currentStaff,
                // Map backend phone_number → form field name 'phone'
                phone: currentStaff.phone_number || currentStaff.phone || '',
                // district is not stored on backend
                current_district: currentStaff.current_district || '',
                country: 'India',
            }));
        }
    }, [currentStaff, isEditMode]);

    const steps = [
        { number: 1, title: 'Personal Info', icon: User, description: 'Basic details & contact' },
        { number: 2, title: 'Address', icon: MapPin, description: 'Location & emergency contact' },
        { number: 3, title: 'Employment', icon: Briefcase, description: 'Job role & salary' },
        { number: 4, title: 'Review', icon: CheckCircle, description: 'Verify & submit' },
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

    const handleSelectChange = (name, value) => {
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
            if (!formData.email) newErrors.email = 'Email is required';
            if (!formData.phone) newErrors.phone = 'Phone is required';
        }

        if (step === 2) {
            if (!formData.current_address_line1) newErrors.current_address_line1 = 'Address is required';
            if (!formData.current_state) newErrors.current_state = 'State is required';
            if (!formData.current_district) newErrors.current_district = 'District is required';
            if (!formData.current_city) newErrors.current_city = 'City is required';
            if (!formData.current_pincode) newErrors.current_pincode = 'PIN code is required';
        }

        if (step === 3) {
            if (!formData.joining_date) newErrors.joining_date = 'Joining date is required';
            if (!formData.department) newErrors.department = 'Department is required';
            if (!formData.designation) newErrors.designation = 'Designation is required';
            if (!formData.employment_type) newErrors.employment_type = 'Employment type is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        } else {
            showToast.error('Please correct the errors before proceeding.');
        }
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
        window.scrollTo(0, 0);
    };

    // Map designation → user_type for the backend User account creation
    const getUserTypeFromDesignation = (designation) => {
        const map = {
            'PRINCIPAL': 'PRINCIPAL',
            'VICE_PRINCIPAL': 'PRINCIPAL',
            'HEAD_TEACHER': 'TEACHER',
            'SENIOR_TEACHER': 'TEACHER',
            'TEACHER': 'TEACHER',
            'JUNIOR_TEACHER': 'TEACHER',
            'PRIMARY_TEACHER': 'TEACHER',
            'PRT': 'TEACHER',
            'TGT': 'TEACHER',
            'PGT': 'TEACHER',
            'SPORTS_TEACHER': 'TEACHER',
            'SPORTS_COACH': 'TEACHER',
            'COUNSELOR': 'TEACHER',
            'LIBRARIAN': 'LIBRARIAN',
            'LAB_ASSISTANT': 'TEACHER',
            'ACCOUNTANT': 'ACCOUNTANT',
            'CLERK': 'ACCOUNTANT',
            'OFFICE_ASSISTANT': 'ACCOUNTANT',
            'ACADEMIC_COORDINATOR': 'TEACHER',
            'DRIVER': 'TRANSPORT_MANAGER',
            'SECURITY_GUARD': 'ACCOUNTANT',
            'PEON': 'ACCOUNTANT',
            'OTHER': 'TEACHER',
        };
        return map[designation] || 'TEACHER';
    };

    const handleSubmit = async () => {
        // Build submission payload — map form fields to backend field names
        const payload = {
            ...formData,
            // Copy current address to permanent address if permanent not explicitly set
            permanent_address_line1: formData.permanent_address_line1 || formData.current_address_line1,
            permanent_address_line2: formData.permanent_address_line2 || formData.current_address_line2,
            permanent_city: formData.permanent_city || formData.current_city,
            permanent_state: formData.permanent_state || formData.current_state,
            permanent_pincode: formData.permanent_pincode || formData.current_pincode,
            // Map phone → phone_number (backend model field name)
            phone_number: formData.phone_number || formData.phone || '',
            // Map emergency phone field to backend name
            emergency_contact_number: formData.emergency_contact_number || formData.emergency_contact_phone || '',
            // Derive user_type from designation (required by backend to create the User account)
            user_type: getUserTypeFromDesignation(formData.designation),
            // Remove frontend-only fields
            current_district: undefined,
            country: undefined,
        };
        delete payload.current_district;
        delete payload.country;
        delete payload.emergency_contact_phone;
        delete payload.phone; // backend uses phone_number not phone
        // On edit mode, remove fields that belong only to create
        if (isEditMode) {
            delete payload.password;
            delete payload.user_type;
        }
        // Always remove photo from JSON payload — it must only be sent as a File via FormData
        // If photo is a URL string (existing photo), sending it back causes DRF ImageField to reject it
        delete payload.photo;

        // Prepare data - convert to FormData only if a new photo File was selected
        let dataToSubmit = payload;

        if (formData.photo instanceof File) {
            // Create FormData for file upload — include all payload fields + the new photo
            const formDataObj = new FormData();
            Object.keys(payload).forEach(key => {
                if (payload[key] !== null && payload[key] !== undefined) {
                    formDataObj.append(key, payload[key]);
                }
            });
            formDataObj.append('photo', formData.photo);
            dataToSubmit = formDataObj;
        }

        try {
            if (isEditMode) {
                await dispatch(updateStaff({ id, data: dataToSubmit })).unwrap();
                showToast.success('Staff member updated successfully');
            } else {
                await dispatch(createStaff(dataToSubmit)).unwrap();
                showToast.success('Staff member created successfully');
            }
            navigate('/staff');
        } catch (error) {
            console.error('Failed to submit staff form:', error);
            showToast.error(error.message || 'Failed to save staff member');
        }
    };

    const ReviewItem = ({ label, value }) => (
        <div className="flex justify-between py-2 border-b border-border last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-right">{value || '-'}</span>
        </div>
    );

    const ReviewSection = ({ title, children }) => (
        <Card className="mb-4">
            <CardHeader className="py-3 bg-muted/30">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-2">
                {children}
            </CardContent>
        </Card>
    );

    if (loading && isEditMode && !formData.first_name) {
        return (
            <div className="h-[calc(100vh-100px)] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6 max-w-5xl mx-auto pb-12">
                <PageHeader
                    title={isEditMode ? 'Edit Staff Profile' : 'New Staff Registration'}
                    description={isEditMode ? 'Update staff member details & settings' : 'Register a new staff member to the system'}
                    breadcrumbs={[
                        { label: 'Staff', href: '/staff' },
                        { label: isEditMode ? 'Edit' : 'Register', active: true },
                    ]}
                />

                {/* Progress Steps */}
                <div className="relative mb-8 px-4">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 transform -translate-y-1/2 hidden md:block" />
                    <div className="flex justify-between items-center relative z-0">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.number;
                            const isCompleted = currentStep > step.number;

                            return (
                                <div key={step.number} className="flex flex-col items-center bg-background px-2">
                                    <div
                                        className={`
                                            w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                            ${isActive ? 'border-primary bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20 scale-110' : ''}
                                            ${isCompleted ? 'border-primary bg-primary text-primary-foreground' : ''}
                                            ${!isActive && !isCompleted ? 'border-muted-foreground/30 text-muted-foreground bg-background' : ''}
                                        `}
                                    >
                                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span className={`mt-2 text-xs font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{step.title}</span>
                                    <span className="text-[10px] text-muted-foreground hidden md:block text-center max-w-[80px] leading-tight mt-0.5">{step.description}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Steps */}
                <Card className="border-t-4 border-t-primary shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            {steps[currentStep - 1].icon && React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5 text-primary" })}
                            {steps[currentStep - 1].title}
                        </CardTitle>
                        <CardDescription>
                            Step {currentStep} of {steps.length}: {steps[currentStep - 1].description}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="w-full md:w-1/3 flex flex-col items-center space-y-4">
                                        <PhotoUpload
                                            name="photo"
                                            value={formData.photo}
                                            onChange={(file) => setFormData({ ...formData, photo: file })}
                                            error={errors.photo}
                                            className="w-48 h-48 rounded-full"
                                        />
                                        <p className="text-xs text-muted-foreground text-center">
                                            Upload a professional photo. <br /> Max size 2MB.
                                        </p>
                                    </div>

                                    <div className="w-full md:w-2/3 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormField
                                                label="First Name"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                error={errors.first_name}
                                                required
                                                placeholder="e.g. John"
                                            />
                                            <FormField
                                                label="Middle Name"
                                                name="middle_name"
                                                value={formData.middle_name}
                                                onChange={handleChange}
                                                placeholder="e.g. A."
                                            />
                                            <FormField
                                                label="Last Name"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                error={errors.last_name}
                                                required
                                                placeholder="e.g. Doe"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                label="Date of Birth"
                                                name="date_of_birth"
                                                type="date"
                                                value={formData.date_of_birth}
                                                onChange={handleChange}
                                                error={errors.date_of_birth}
                                                required
                                                icon={User}
                                            />
                                            <FormField
                                                label="Gender"
                                                name="gender"
                                                type="select"
                                                value={formData.gender}
                                                onChange={(e) => handleSelectChange('gender', e.target.value)}
                                                error={errors.gender}
                                                options={[
                                                    { value: 'M', label: 'Male' },
                                                    { value: 'F', label: 'Female' },
                                                    { value: 'O', label: 'Other' },
                                                ]}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                label="Blood Group"
                                                name="blood_group"
                                                type="select"
                                                value={formData.blood_group}
                                                onChange={(e) => handleSelectChange('blood_group', e.target.value)}
                                                options={[
                                                    { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
                                                    { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
                                                    { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
                                                    { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
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

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                label="PAN Number"
                                                name="pan_number"
                                                value={formData.pan_number}
                                                onChange={handleChange}
                                                placeholder="ABCDE1234F"
                                            />
                                        </div>

                                        <Separator className="my-4" />
                                        <h4 className="font-medium text-sm text-foreground flex items-center gap-2"><Mail className="w-4 h-4" /> Contact Details</h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                label="Email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                error={errors.email}
                                                required
                                                icon={Mail}
                                                placeholder="john.doe@school.edu"
                                            />
                                            <FormField
                                                label="Phone"
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                error={errors.phone}
                                                required
                                                icon={Phone}
                                                placeholder="+91 9876543210"
                                            />
                                        </div>
                                        {!isEditMode && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    label="Login Password"
                                                    name="password"
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    error={errors.password}
                                                    placeholder="Leave blank to auto-generate"
                                                    helperText="Staff login password. Leave blank to auto-generate."
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Address Information */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-1 gap-4">
                                    <FormField
                                        label="Address Line 1"
                                        name="current_address_line1"
                                        value={formData.current_address_line1}
                                        onChange={handleChange}
                                        error={errors.current_address_line1}
                                        required
                                        placeholder="Block No / House Name / Flat No"
                                        icon={MapPin}
                                    />
                                    <FormField
                                        label="Address Line 2"
                                        name="current_address_line2"
                                        value={formData.current_address_line2}
                                        onChange={handleChange}
                                        placeholder="Street / Area / Landmark"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* State dropdown */}
                                    <FormField
                                        label="State"
                                        name="current_state"
                                        type="select"
                                        value={formData.current_state}
                                        onChange={(e) => {
                                                setFormData(prev => ({ ...prev, current_state: e.target.value, current_district: '', current_city: '', current_pincode: '' }));
                                                if (errors.current_state) setErrors(prev => ({ ...prev, current_state: '' }));
                                            }}
                                        error={errors.current_state}
                                        required
                                        options={[
                                            { value: '', label: 'Select State' },
                                            ...STATE_LIST.map(s => ({ value: s, label: s }))
                                        ]}
                                    />
                                    {/* District dropdown — depends on state */}
                                    <FormField
                                        label="District"
                                        name="current_district"
                                        type="select"
                                        value={formData.current_district}
                                        onChange={(e) => {
                                                setFormData(prev => ({ ...prev, current_district: e.target.value, current_city: '', current_pincode: '' }));
                                            }}
                                        error={errors.current_district}
                                        required
                                        options={[
                                            { value: '', label: formData.current_state ? 'Select District' : 'Select State first' },
                                            ...getDistricts(formData.current_state).map(d => ({ value: d, label: d }))
                                        ]}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* City dropdown — depends on district */}
                                    <FormField
                                        label="City"
                                        name="current_city"
                                        type="select"
                                        value={formData.current_city}
                                        onChange={(e) => {
                                            const city = e.target.value;
                                            const pin = getPincode(formData.current_state, formData.current_district, city);
                                            setFormData(prev => ({ ...prev, current_city: city, current_pincode: pin || prev.current_pincode }));
                                            if (errors.current_city) setErrors(prev => ({ ...prev, current_city: '' }));
                                        }}
                                        error={errors.current_city}
                                        required
                                        options={[
                                            { value: '', label: formData.current_district ? 'Select City' : 'Select District first' },
                                            ...getCities(formData.current_state, formData.current_district).map(c => ({ value: c, label: c }))
                                        ]}
                                    />
                                    {/* PIN Code — auto-filled from city selection */}
                                    <FormField
                                        label="PIN Code"
                                        name="current_pincode"
                                        value={formData.current_pincode}
                                        onChange={handleChange}
                                        error={errors.current_pincode}
                                        required
                                        placeholder="6-digit PIN"
                                    />
                                    {/* Country — fixed to India */}
                                    <FormField
                                        label="Country"
                                        name="country"
                                        value="India"
                                        onChange={() => {}}
                                        disabled
                                    />
                                </div>

                                <Separator className="my-6" />

                                <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/10">
                                    <h4 className="text-md font-medium text-destructive mb-4 flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> Emergency Contact
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            label="Contact Name"
                                            name="emergency_contact_name"
                                            value={formData.emergency_contact_name}
                                            onChange={handleChange}
                                            placeholder="Relative Name"
                                        />
                                        <FormField
                                            label="Relation"
                                            name="emergency_contact_relation"
                                            value={formData.emergency_contact_relation}
                                            onChange={handleChange}
                                            placeholder="e.g. Spouse, Father"
                                        />
                                        <FormField
                                            label="Phone Number"
                                            name="emergency_contact_number"
                                            type="tel"
                                            value={formData.emergency_contact_number}
                                            onChange={handleChange}
                                            placeholder="Emergency Number"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Employment Information */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        label="Employee ID (Auto-generated if empty)"
                                        name="employee_id"
                                        value={formData.employee_id}
                                        onChange={handleChange}
                                        placeholder="Leave blank for auto-gen"
                                    />
                                    <FormField
                                        label="Joining Date"
                                        name="joining_date"
                                        type="date"
                                        value={formData.joining_date}
                                        onChange={handleChange}
                                        error={errors.joining_date}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        label="Department"
                                        name="department"
                                        type="select"
                                        value={formData.department}
                                        onChange={(e) => handleSelectChange('department', e.target.value)}
                                        error={errors.department}
                                        options={[
                                            { value: 'Academic', label: 'Academic' },
                                            { value: 'Administration', label: 'Administration' },
                                            { value: 'Accounts', label: 'Accounts' },
                                            { value: 'Sports', label: 'Sports' },
                                            { value: 'Library', label: 'Library' },
                                            { value: 'Transport', label: 'Transport' },
                                            { value: 'Maintenance', label: 'Maintenance' },
                                            { value: 'Science', label: 'Science' },
                                            { value: 'Mathematics', label: 'Mathematics' },
                                            { value: 'English', label: 'English' },
                                            { value: 'Social Studies', label: 'Social Studies' },
                                            { value: 'Other', label: 'Other' },
                                        ]}
                                        required
                                    />
                                    <FormField
                                        label="Designation"
                                        name="designation"
                                        type="select"
                                        value={formData.designation}
                                        onChange={(e) => handleSelectChange('designation', e.target.value)}
                                        error={errors.designation}
                                        options={[
                                            { value: 'PRINCIPAL', label: 'Principal' },
                                            { value: 'VICE_PRINCIPAL', label: 'Vice Principal' },
                                            { value: 'HEAD_TEACHER', label: 'Head Teacher' },
                                            { value: 'SENIOR_TEACHER', label: 'Senior Teacher' },
                                            { value: 'TEACHER', label: 'Teacher' },
                                            { value: 'JUNIOR_TEACHER', label: 'Junior Teacher' },
                                            { value: 'PRIMARY_TEACHER', label: 'Primary Teacher' },
                                            { value: 'PRT', label: 'Primary Teacher (PRT)' },
                                            { value: 'TGT', label: 'Trained Graduate Teacher (TGT)' },
                                            { value: 'PGT', label: 'Post Graduate Teacher (PGT)' },
                                            { value: 'LIBRARIAN', label: 'Librarian' },
                                            { value: 'LAB_ASSISTANT', label: 'Lab Assistant' },
                                            { value: 'SPORTS_TEACHER', label: 'Sports Teacher' },
                                            { value: 'SPORTS_COACH', label: 'Sports Coach' },
                                            { value: 'COUNSELOR', label: 'Counselor' },
                                            { value: 'ACCOUNTANT', label: 'Accountant' },
                                            { value: 'CLERK', label: 'Clerk' },
                                            { value: 'OFFICE_ASSISTANT', label: 'Office Assistant' },
                                            { value: 'ACADEMIC_COORDINATOR', label: 'Academic Coordinator' },
                                            { value: 'DRIVER', label: 'Driver' },
                                            { value: 'SECURITY_GUARD', label: 'Security Guard' },
                                            { value: 'PEON', label: 'Peon' },
                                            { value: 'OTHER', label: 'Other' },
                                        ]}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        label="Employment Type"
                                        name="employment_type"
                                        type="select"
                                        value={formData.employment_type}
                                        onChange={(e) => handleSelectChange('employment_type', e.target.value)}
                                        error={errors.employment_type}
                                        options={[
                                            { value: 'PERMANENT', label: 'Permanent' },
                                            { value: 'CONTRACT', label: 'Contract' },
                                            { value: 'TEMPORARY', label: 'Temporary' },
                                            { value: 'VISITING', label: 'Visiting' },
                                            { value: 'PART_TIME', label: 'Part Time' },
                                        ]}
                                        required
                                    />
                                    <FormField
                                        label="Highest Qualification"
                                        name="highest_qualification"
                                        type="select"
                                        value={formData.highest_qualification}
                                        onChange={(e) => handleSelectChange('highest_qualification', e.target.value)}
                                        options={[
                                            { value: 'PHD', label: 'Ph.D' },
                                            { value: 'M_ED', label: 'M.Ed' },
                                            { value: 'POST_GRADUATE', label: 'Post Graduate' },
                                            { value: 'B_ED', label: 'B.Ed' },
                                            { value: 'GRADUATE', label: 'Graduate' },
                                            { value: 'DIPLOMA', label: 'Diploma' },
                                            { value: '12TH_PASS', label: '12th Pass' },
                                            { value: '10TH_PASS', label: '10th Pass' },
                                            { value: 'BELOW_10TH', label: 'Below 10th' },
                                            { value: 'OTHER', label: 'Other' },
                                        ]}
                                    />
                                </div>

                                <Separator className="my-6" />

                                <h4 className="text-md font-medium text-foreground flex items-center gap-2">
                                    <span className="w-4 h-4 text-emerald-600 font-bold text-base leading-none">₹</span> Salary & Bank Details
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        label="Basic Salary"
                                        name="basic_salary"
                                        type="number"
                                        value={formData.basic_salary}
                                        onChange={handleChange}
                                        placeholder="Monthly basic salary"
                                        icon={null}
                                    />
                                    <FormField
                                        label="Bank Account Number"
                                        name="bank_account_number"
                                        value={formData.bank_account_number}
                                        onChange={handleChange}
                                        placeholder="Account Number"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        label="Bank Name"
                                        name="bank_name"
                                        value={formData.bank_name}
                                        onChange={handleChange}
                                        placeholder="Bank Name"
                                    />
                                    <FormField
                                        label="IFSC Code"
                                        name="ifsc_code"
                                        value={formData.ifsc_code}
                                        onChange={handleChange}
                                        placeholder="IFSC Code"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ReviewSection title="Personal Information">
                                        <ReviewItem label="Full Name" value={`${formData.first_name} ${formData.middle_name} ${formData.last_name}`} />
                                        <ReviewItem label="Birth Date" value={formData.date_of_birth} />
                                        <ReviewItem label="Gender" value={formData.gender} />
                                        <ReviewItem label="Email" value={formData.email} />
                                        <ReviewItem label="Phone" value={formData.phone} />
                                    </ReviewSection>

                                    <ReviewSection title="Address Details">
                                        <ReviewItem label="Address" value={`${formData.current_address_line1}, ${formData.current_city}`} />
                                        <ReviewItem label="District/State" value={`${formData.current_district}, ${formData.current_state} - ${formData.current_pincode}`} />
                                        <ReviewItem label="Emerg. Contact" value={formData.emergency_contact_name} />
                                        <ReviewItem label="Relation" value={`${formData.emergency_contact_relation} (${formData.emergency_contact_number})`} />
                                    </ReviewSection>

                                    <ReviewSection title="Employment Details">
                                        <ReviewItem label="Department" value={formData.department} />
                                        <ReviewItem label="Designation" value={formData.designation} />
                                        <ReviewItem label="Type" value={formData.employment_type} />
                                        <ReviewItem label="Joining Date" value={formData.joining_date} />
                                    </ReviewSection>

                                    <ReviewSection title="Financial">
                                        <ReviewItem label="Basic Salary" value={formData.basic_salary} />
                                        <ReviewItem label="Bank Account" value={formData.bank_account_number} />
                                        <ReviewItem label="Bank Name" value={formData.bank_name} />
                                    </ReviewSection>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex justify-between border-t border-border pt-6 mt-6">
                        <Button
                            variant="outline"
                            onClick={currentStep === 1 ? () => navigate('/staff') : handlePrevious}
                        >
                            {currentStep === 1 ? 'Cancel' : (
                                <>
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                                </>
                            )}
                        </Button>

                        {currentStep < 4 ? (
                            <Button onClick={handleNext}>
                                Next <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={loading} className="min-w-[140px]">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        {isEditMode ? 'Update Staff' : 'Submit Registration'}
                                    </>
                                )}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </AnimatedPage>
    );
};

export default StaffForm;
