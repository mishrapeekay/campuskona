import React, { useState, useEffect } from 'react';
import {
    PageHeader,
    Card,
    Button,
    Badge,
    DataTable,
    LoadingSpinner,
    Modal,
} from '../../components/common';
import { getStudents, patchStudent } from '../../api/students';
import { toast } from 'react-toastify';
import { EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

/**
 * Onboarding Verification - Admin view for teacher-submitted student drafts
 */
const OnboardingVerification = () => {
    const [pendingStudents, setPendingStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchPendingStudents();
    }, []);

    const fetchPendingStudents = async () => {
        try {
            setLoading(true);
            const response = await getStudents({ admission_status: 'SUBMITTED_TO_ADMIN' });
            setPendingStudents(response.data.results || response.data);
        } catch (error) {
            toast.error('Failed to fetch pending onboarding drafts');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (studentId) => {
        try {
            setActionLoading(true);
            await patchStudent(studentId, { admission_status: 'SENT_TO_PARENT' });
            toast.success('Profile verified. Onboarding link sent to parent.');
            fetchPendingStudents();
            setSelectedStudent(null);
        } catch (error) {
            toast.error('Failed to update student status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (studentId) => {
        try {
            setActionLoading(true);
            await patchStudent(studentId, { admission_status: 'DRAFT' }); // Send back to draft
            toast.info('Profile sent back to teacher for corrections.');
            fetchPendingStudents();
            setSelectedStudent(null);
        } catch (error) {
            toast.error('Failed to update student status');
        } finally {
            setActionLoading(false);
        }
    };

    const columns = [
        {
            key: 'full_name',
            label: 'Student Name',
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        {value?.[0]}
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">{value}</p>
                        <p className="text-xs text-slate-500">Submitted by: {row.created_by_name || 'Teacher'}</p>
                    </div>
                </div>
            )
        },
        { key: 'date_of_birth', label: 'DOB' },
        { key: 'gender', label: 'Gender' },
        {
            key: 'admission_status',
            label: 'Status',
            render: () => <Badge variant="warning">Awaiting Admin Review</Badge>
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(row)}>
                        <EyeIcon className="w-4 h-4 mr-1" /> View
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleApprove(row.id)}>
                        Approve
                    </Button>
                </div>
            )
        }
    ];

    if (loading) return <div className="py-20 flex justify-center"><LoadingSpinner /></div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <PageHeader
                title="Onboarding Verification"
                subtitle="Review and approve student profile drafts submitted by teachers"
                breadcrumbs={[
                    { label: 'Admissions', href: '/admissions' },
                    { label: 'Onboarding Verifications' }
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <Card className="shadow-sm border-none">
                    <DataTable
                        columns={columns}
                        data={pendingStudents}
                        emptyMessage="No pending onboarding drafts to verify."
                    />
                </Card>
            </div>

            {/* Student Preview Modal */}
            <Modal
                isOpen={!!selectedStudent}
                onClose={() => setSelectedStudent(null)}
                title="Review Student Profile"
                size="lg"
            >
                {selectedStudent && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Student Info</h4>
                                <p className="font-bold">{selectedStudent.full_name}</p>
                                <p className="text-sm text-slate-600">DOB: {selectedStudent.date_of_birth}</p>
                                <p className="text-sm text-slate-600">Gender: {selectedStudent.gender}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Parents</h4>
                                <p className="text-sm">Father: {selectedStudent.father_name} ({selectedStudent.father_phone})</p>
                                <p className="text-sm">Mother: {selectedStudent.mother_name}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                            <strong>Note:</strong> Approving this profile will trigger a notification to <strong>{selectedStudent.father_phone}</strong> with a link to review the data and provide DPDP-compliant digital consent.
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button variant="outline" onClick={() => handleReject(selectedStudent.id)} loading={actionLoading}>
                                <XCircleIcon className="w-5 h-5 mr-2" /> Reject to Draft
                            </Button>
                            <Button variant="primary" onClick={() => handleApprove(selectedStudent.id)} loading={actionLoading}>
                                <CheckCircleIcon className="w-5 h-5 mr-2" /> Verify & Forward to Parent
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OnboardingVerification;
