import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Badge,
    LoadingSpinner,
} from '../../components/common';
import { getStudents, patchStudent } from '../../api/students';
import { toast } from 'react-toastify';
import {
    CheckBadgeIcon,
    ShieldCheckIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';

/**
 * Parent Onboarding Review Portal
 * Allows parents to review the drafted student profile and provide DPDP-compliant consent.
 */
const OnboardingReview = () => {
    const [studentsToReview, setStudentsToReview] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agreedToTOS, setAgreedToTOS] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            // In a real app, this would be filtered by the logged-in parent's child IDs
            // For now, we fetch students in SENT_TO_PARENT status
            const response = await getStudents({ admission_status: 'SENT_TO_PARENT' });
            setStudentsToReview(response.data.results || response.data);
        } catch (error) {
            toast.error('Failed to fetch onboarding requests');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (studentId) => {
        if (!agreedToTOS) {
            toast.warning('Please agree to the privacy terms and data processing consent.');
            return;
        }

        try {
            setIsSubmitting(true);
            await patchStudent(studentId, {
                admission_status: 'ACTIVE',
                remarks: 'Onboarding completed by parent via digital portal.'
            });
            toast.success('Onboarding complete! Your child is now officially enrolled.');
            fetchStudents();
        } catch (error) {
            toast.error('Failed to finalize onboarding');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;

    if (studentsToReview.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <Card className="max-w-md text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                        <CheckBadgeIcon className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">No Pending Reviews</h2>
                    <p className="text-slate-500 mt-2">All student profiles associated with your account are finalized.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-4 mb-2">
                        <ShieldCheckIcon className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Onboarding Review Portal</h1>
                    </div>
                    <p className="text-slate-500 font-medium max-w-2xl">
                        Please review the digital profile drafted by the school admissions office. Check the data for accuracy and provide your digital signature to finalize enrollment.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
                {studentsToReview.map(student => (
                    <div key={student.id} className="space-y-6">
                        <Card className="border-none shadow-sm overflow-hidden">
                            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
                                <h3 className="font-bold text-lg">Reviewing: {student.full_name}</h3>
                                <Badge variant="primary" className="bg-white/20 text-white border-none">Step 3: Parent Review</Badge>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Profile Summary */}
                                    <div className="space-y-6">
                                        <section>
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Basic Information</h4>
                                            <div className="space-y-3">
                                                <DataRow label="Full Name" value={student.full_name} />
                                                <DataRow label="Date of Birth" value={student.date_of_birth} />
                                                <DataRow label="Gender" value={student.gender} />
                                                <DataRow label="Blood Group" value={student.blood_group || 'Not Specified'} />
                                            </div>
                                        </section>

                                        <section>
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Parent Details</h4>
                                            <div className="space-y-3">
                                                <DataRow label="Father" value={student.father_name} />
                                                <DataRow label="Father Phone" value={student.father_phone} />
                                                <DataRow label="Mother" value={student.mother_name} />
                                            </div>
                                        </section>
                                    </div>

                                    {/* Consent & Signature */}
                                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col">
                                        <div className="flex items-center gap-3 mb-4 text-indigo-600">
                                            <PencilSquareIcon className="w-5 h-5" />
                                            <h4 className="font-bold">DPDP Digital Consent</h4>
                                        </div>

                                        <div className="flex-1 space-y-4 mb-8">
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                By finalizing this onboarding, you agree that the school may process your child's personal data for educational and administrative purposes as per the <strong className="text-slate-800 underline decoration-indigo-300">DPDP Act 2023</strong> and the school's privacy policy.
                                            </p>

                                            <label className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                    checked={agreedToTOS}
                                                    onChange={(e) => setAgreedToTOS(e.target.checked)}
                                                />
                                                <span className="text-sm font-medium text-slate-700">
                                                    I confirm that the above information is accurate and I grant consent for my child's data processing.
                                                </span>
                                            </label>
                                        </div>

                                        <div className="space-y-3">
                                            <Button
                                                variant="primary"
                                                fullWidth
                                                className="h-12 text-lg"
                                                onClick={() => handleConfirm(student.id)}
                                                loading={isSubmitting}
                                            >
                                                Sign & Finalize Enrollment
                                            </Button>
                                            <p className="text-[10px] text-center text-slate-400">
                                                Digital Signature Timestamp: {new Date().toLocaleString()}<br />
                                                IP Logged for Compliance Audit
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DataRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 text-sm">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="text-slate-800 font-bold">{value}</span>
    </div>
);

export default OnboardingReview;
