import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FormField, PhotoUpload } from '../../components/common';
import { Card, CardContent } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { PageHeader } from '@/ui/composites';
import AnimatedPage from '@/ui/motion/AnimatedPage';
import { createStudent } from '../../store/slices/studentsSlice';
import { toast } from 'react-toastify';
import {
    User,
    IdCard,
    Users,
    Home,
    FileCheck,
    Check,
    ChevronRight,
    ChevronLeft,
    Save,
    Send,
    Loader2,
    AlertTriangle,
} from 'lucide-react';

/**
 * Student Onboarding Wizard - Specialized workflow for Class Teachers
 * Phase 1: Teacher Drafts Student Profile
 */
const OnboardingWizard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.students);

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Student Core Info
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        email: '',
        phone_number: '',
        photo: null,

        // Step 2: Identification & Category
        aadhar_number: '',
        category: 'GENERAL',
        religion: 'HINDU',

        // Step 3: Parent Information
        father_name: '',
        father_phone: '',
        father_occupation: '',
        mother_name: '',
        mother_phone: '',
        mother_occupation: '',
        emergency_contact_number: '',

        // Step 4: Address
        current_address_line1: '',
        current_city: '',
        current_state: '',
        current_pincode: '',
    });

    const [errors, setErrors] = useState({});

    const steps = [
        { id: 1, title: 'Student Basics', icon: User },
        { id: 2, title: 'Identity & Origins', icon: IdCard },
        { id: 3, title: 'Parent Contacts', icon: Users },
        { id: 4, title: 'Residential Details', icon: Home },
        { id: 5, title: 'Review & Forward', icon: FileCheck },
    ];

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (files ? files[0] : value)
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateStep = (step) => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.first_name) newErrors.first_name = 'Required';
            if (!formData.last_name) newErrors.last_name = 'Required';
            if (!formData.date_of_birth) newErrors.date_of_birth = 'Required';
            if (!formData.gender) newErrors.gender = 'Required';
        }
        if (step === 3) {
            if (!formData.father_name) newErrors.father_name = 'Required';
            if (!formData.father_phone) newErrors.father_phone = 'Required';
            if (!formData.mother_name) newErrors.mother_name = 'Required';
            if (!formData.emergency_contact_number) newErrors.emergency_contact_number = 'Required';
        }
        if (step === 4) {
            if (!formData.current_address_line1) newErrors.current_address_line1 = 'Required';
            if (!formData.current_city) newErrors.current_city = 'Required';
            if (!formData.current_pincode) newErrors.current_pincode = 'Required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => setCurrentStep(prev => prev - 1);

    // Build a clean payload for student create — strips photo from JSON,
    // handles FormData only when a new File is selected
    const buildStudentPayload = (extraFields = {}) => {
        const base = { ...formData, ...extraFields };
        // Remove photo — DRF ImageField rejects URL strings; only send as File via FormData
        delete base.photo;
        if (formData.photo instanceof File) {
            const fd = new FormData();
            Object.keys(base).forEach(key => {
                if (base[key] !== null && base[key] !== undefined) fd.append(key, base[key]);
            });
            fd.append('photo', formData.photo);
            return fd;
        }
        return base;
    };

    const handleSaveDraft = async () => {
        try {
            const payload = buildStudentPayload({
                admission_status: 'DRAFT',
                admission_date: new Date().toISOString().split('T')[0],
            });
            await dispatch(createStudent(payload)).unwrap();
            toast.success('Draft saved successfully!');
            navigate('/students');
        } catch (err) {
            toast.error(err.message || 'Failed to save draft');
        }
    };

    const handleForwardToAdmin = async () => {
        try {
            const payload = buildStudentPayload({
                admission_status: 'SUBMITTED_TO_ADMIN',
                admission_date: new Date().toISOString().split('T')[0],
            });
            await dispatch(createStudent(payload)).unwrap();
            toast.success('Student profile forwarded to Admin for approval');
            navigate('/students');
        } catch (err) {
            toast.error(err.message || 'Failed to forward profile');
        }
    };

    return (
        <AnimatedPage>
            <div className="space-y-6 pb-12">
                <PageHeader
                    title="Student Onboarding Wizard"
                    description="Teacher's Workspace: Create and manage student enrollment drafts"
                />

                <div className="max-w-5xl">
                    {/* Visual Progress Bar */}
                    <div className="mb-10">
                        <div className="flex justify-between items-center relative">
                            {/* Connecting Line */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted z-0" />
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-500 z-0"
                                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                            />

                            {steps.map((step) => {
                                const StepIcon = step.icon;
                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${currentStep >= step.id
                                                    ? 'bg-primary border-primary/20 text-primary-foreground shadow-lg'
                                                    : 'bg-card border-muted text-muted-foreground'
                                                }`}
                                        >
                                            {currentStep > step.id ? (
                                                <Check className="h-5 w-5" />
                                            ) : (
                                                <StepIcon className="h-5 w-5" />
                                            )}
                                        </div>
                                        <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                                            }`}>
                                            {step.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <Card className="rounded-2xl overflow-hidden">
                        <CardContent className="p-8">
                            {/* Step 1: Basics */}
                            {currentStep === 1 && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-foreground">Student Core Information</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                                        <div className="md:col-span-1 border-2 border-dashed border-border rounded-2xl p-6 bg-muted/30 hover:bg-muted/50 transition-colors">
                                            <PhotoUpload
                                                name="photo"
                                                label="Face Biometric/Photo"
                                                value={formData.photo}
                                                onChange={handleChange}
                                                className="h-full"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required error={errors.first_name} />
                                                <FormField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required error={errors.last_name} />
                                            </div>
                                            <FormField label="Middle Name (Optional)" name="middle_name" value={formData.middle_name} onChange={handleChange} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField label="DOB" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} required error={errors.date_of_birth} />
                                                <FormField
                                                    label="Gender"
                                                    name="gender"
                                                    type="select"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    required
                                                    error={errors.gender}
                                                    options={[{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'O', label: 'Other' }]}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Identity */}
                            {currentStep === 2 && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h2 className="text-2xl font-bold text-foreground mb-8">Identity & Category</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField label="Aadhaar ID" name="aadhar_number" value={formData.aadhar_number} onChange={handleChange} placeholder="XXXX XXXX XXXX" />
                                        <FormField
                                            label="Category"
                                            name="category"
                                            type="select"
                                            value={formData.category}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'GENERAL', label: 'General' },
                                                { value: 'OBC', label: 'OBC' },
                                                { value: 'SC', label: 'SC' },
                                                { value: 'ST', label: 'ST' },
                                                { value: 'EWS', label: 'EWS' }
                                            ]}
                                        />
                                        <FormField
                                            label="Religion"
                                            name="religion"
                                            type="select"
                                            value={formData.religion}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'HINDU', label: 'Hindu' },
                                                { value: 'MUSLIM', label: 'Muslim' },
                                                { value: 'SIKH', label: 'Sikh' },
                                                { value: 'CHRISTIAN', label: 'Christian' },
                                                { value: 'BUDDHIST', label: 'Buddhist' },
                                                { value: 'JAIN', label: 'Jain' }
                                            ]}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Parents */}
                            {currentStep === 3 && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h2 className="text-2xl font-bold text-foreground mb-8">Guardian Details</h2>
                                    <div className="space-y-8">
                                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                                <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">M</span>
                                                Mother's Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField label="Name" name="mother_name" value={formData.mother_name} onChange={handleChange} required error={errors.mother_name} />
                                                <FormField label="Occupation" name="mother_occupation" value={formData.mother_occupation} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="bg-success/5 p-6 rounded-2xl border border-success/10">
                                            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                                <span className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center text-success text-sm font-bold">F</span>
                                                Father's Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField label="Name" name="father_name" value={formData.father_name} onChange={handleChange} required error={errors.father_name} />
                                                <FormField label="Phone" name="father_phone" value={formData.father_phone} onChange={handleChange} required error={errors.father_phone} />
                                            </div>
                                        </div>
                                        <FormField label="Emergency Contact (24/7)" name="emergency_contact_number" value={formData.emergency_contact_number} onChange={handleChange} required error={errors.emergency_contact_number} />
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Address */}
                            {currentStep === 4 && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h2 className="text-2xl font-bold text-foreground mb-8">Residential Details</h2>
                                    <div className="space-y-6">
                                        <FormField label="Address Line 1" name="current_address_line1" value={formData.current_address_line1} onChange={handleChange} required error={errors.current_address_line1} />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormField label="City" name="current_city" value={formData.current_city} onChange={handleChange} required error={errors.current_city} />
                                            <FormField label="State" name="current_state" value={formData.current_state} onChange={handleChange} />
                                            <FormField label="PIN Code" name="current_pincode" value={formData.current_pincode} onChange={handleChange} required error={errors.current_pincode} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Review */}
                            {currentStep === 5 && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="text-center mb-10">
                                        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileCheck className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-foreground">Final Review</h2>
                                        <p className="text-muted-foreground mt-2">Please double-check all details before submission</p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                                        <div className="border border-border rounded-2xl p-6 bg-card">
                                            <h4 className="font-bold text-primary uppercase tracking-widest text-xs mb-4">Student Profile</h4>
                                            <div className="flex items-center gap-6">
                                                <div className="w-24 h-24 bg-muted rounded-2xl overflow-hidden">
                                                    {formData.photo ? (
                                                        <img src={formData.photo instanceof File ? URL.createObjectURL(formData.photo) : formData.photo} className="w-full h-full object-cover" alt="Student" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Photo</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xl font-bold text-foreground">{formData.first_name} {formData.last_name}</p>
                                                    <p className="text-muted-foreground">DOB: {formData.date_of_birth} | {formData.gender}</p>
                                                    <p className="text-muted-foreground">Category: {formData.category}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border border-border rounded-2xl p-6 bg-card">
                                            <h4 className="font-bold text-success uppercase tracking-widest text-xs mb-4">Parent / Guardian</h4>
                                            <div className="space-y-2">
                                                <p className="text-foreground font-medium">Father: <span className="text-muted-foreground">{formData.father_name} ({formData.father_phone})</span></p>
                                                <p className="text-foreground font-medium">Mother: <span className="text-muted-foreground">{formData.mother_name}</span></p>
                                                <p className="text-foreground font-medium">Emergency: <span className="text-muted-foreground">{formData.emergency_contact_number}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-warning/10 border border-warning/20 rounded-2xl p-6 text-warning text-sm mb-8 flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                                        <p>
                                            <strong>Note:</strong> Forwarding this profile to the Admin will initiate the parent verification and DPDP consent workflow. You will be notified once the parent has reviewed and signed the digital forms.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-8">
                                <div className="flex gap-4">
                                    {currentStep > 1 && (
                                        <Button variant="outline" onClick={prevStep}>
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Back
                                        </Button>
                                    )}
                                    {currentStep === 1 && (
                                        <Button variant="outline" onClick={() => navigate('/students')}>
                                            Cancel
                                        </Button>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <Button
                                        variant="secondary"
                                        onClick={handleSaveDraft}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                                        Save as Draft
                                    </Button>

                                    {currentStep < 5 ? (
                                        <Button onClick={nextStep}>
                                            Continue
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleForwardToAdmin}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                                            Forward to Admin
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default OnboardingWizard;
