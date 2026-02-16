import React, { useState } from 'react';
import { Card, Button, Badge, Modal, Spinner } from '../../components/common';
import { privacyAPI } from '../../api/privacy';
import showToast from '../../utils/toast';

const DataRights = () => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [students, setStudents] = useState([]);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showDeletionModal, setShowDeletionModal] = useState(false);
    const [showCorrectionModal, setShowCorrectionModal] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState('json');
    const [deletionReason, setDeletionReason] = useState('');
    const [requesting, setRequesting] = useState(false);
    const [correctionData, setCorrectionData] = useState({
        field_name: '',
        current_value: '',
        corrected_value: '',
        reason: ''
    });

    const handleExportData = async () => {
        if (!selectedStudent) {
            showToast.error('Please select a student first');
            return;
        }

        try {
            setExporting(true);
            const response = await privacyAPI.exportMyData(selectedStudent.id, exportFormat);

            // Create download link
            const blob = new Blob([response.data], {
                type: exportFormat === 'json' ? 'application/json' : 'text/csv'
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `student_data_${selectedStudent.admission_number}_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            showToast.success('Data exported successfully');
            setShowExportModal(false);
        } catch (error) {
            showToast.error('Failed to export data');
            console.error('Export error:', error);
        } finally {
            setExporting(false);
        }
    };

    const handleRequestDeletion = async () => {
        if (!selectedStudent) {
            showToast.error('Please select a student first');
            return;
        }

        if (!deletionReason.trim()) {
            showToast.error('Please provide a reason for data deletion');
            return;
        }

        try {
            setRequesting(true);
            await privacyAPI.requestDeletion({
                student_id: selectedStudent.id,
                reason: deletionReason
            });

            showToast.success(
                'Data deletion request submitted successfully. School administration will review and process within 7 business days.'
            );
            setShowDeletionModal(false);
            setDeletionReason('');
        } catch (error) {
            showToast.error('Failed to submit deletion request');
            console.error('Deletion request error:', error);
        } finally {
            setRequesting(false);
        }
    };

    const handleRequestCorrection = async () => {
        if (!selectedStudent) {
            showToast.error('Please select a student first');
            return;
        }

        const { field_name, current_value, corrected_value, reason } = correctionData;

        if (!field_name || !current_value || !corrected_value || !reason) {
            showToast.error('Please fill in all required fields');
            return;
        }

        try {
            setRequesting(true);
            await privacyAPI.requestCorrection({
                student_id: selectedStudent.id,
                field_name,
                current_value,
                corrected_value,
                reason
            });

            showToast.success(
                'Correction request submitted successfully. School administration will review and update within 3 business days.'
            );
            setShowCorrectionModal(false);
            setCorrectionData({
                field_name: '',
                current_value: '',
                corrected_value: '',
                reason: ''
            });
        } catch (error) {
            showToast.error('Failed to submit correction request');
            console.error('Correction request error:', error);
        } finally {
            setRequesting(false);
        }
    };

    const dataFields = [
        { value: 'first_name', label: 'First Name' },
        { value: 'middle_name', label: 'Middle Name' },
        { value: 'last_name', label: 'Last Name' },
        { value: 'date_of_birth', label: 'Date of Birth' },
        { value: 'gender', label: 'Gender' },
        { value: 'blood_group', label: 'Blood Group' },
        { value: 'address_line1', label: 'Address Line 1' },
        { value: 'address_line2', label: 'Address Line 2' },
        { value: 'city', label: 'City' },
        { value: 'state', label: 'State' },
        { value: 'pincode', label: 'Pincode' },
        { value: 'phone', label: 'Phone Number' },
        { value: 'email', label: 'Email' },
        { value: 'father_name', label: 'Father Name' },
        { value: 'mother_name', label: 'Mother Name' },
        { value: 'guardian_name', label: 'Guardian Name' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Your Data Rights</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Exercise your rights under the Digital Personal Data Protection Act 2023
                </p>
            </div>

            {/* Student Selector */}
            {students.length > 1 && (
                <Card title="Select Child">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {students.map(student => (
                            <button
                                key={student.id}
                                onClick={() => setSelectedStudent(student)}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    selectedStudent?.id === student.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                <div className="text-lg font-semibold">{student.full_name}</div>
                                <div className="text-sm text-gray-600">
                                    Class {student.current_class} - {student.admission_number}
                                </div>
                            </button>
                        ))}
                    </div>
                </Card>
            )}

            {/* Information Banner */}
            <Card className="bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                    <div className="text-3xl">🛡️</div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 mb-2">Your Privacy Rights</h3>
                        <p className="text-sm text-blue-800">
                            Under the DPDP Act 2023, you have the right to access, correct, and request deletion of your child's
                            personal data. These rights ensure transparency and give you control over how your child's information is used.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Data Rights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Right to Access */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">📥</div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Right to Access</h3>
                                <Badge variant="info" size="sm" className="mt-1">Section 11, DPDP Act 2023</Badge>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600">
                            Download a complete copy of all personal data we have collected about your child.
                            This includes personal information, academic records, health data, attendance, and more.
                        </p>

                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                            <div className="font-medium text-gray-700 mb-2">What's included:</div>
                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                                <li>Personal & contact information</li>
                                <li>Family details</li>
                                <li>Health records & medical history</li>
                                <li>Academic performance & grades</li>
                                <li>Attendance records</li>
                                <li>Behavioral notes (if any)</li>
                                <li>Documents uploaded</li>
                            </ul>
                        </div>

                        <Button
                            variant="primary"
                            onClick={() => setShowExportModal(true)}
                            disabled={!selectedStudent}
                            className="w-full"
                        >
                            📥 Download My Child's Data
                        </Button>
                    </div>
                </Card>

                {/* Right to Correction */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">✏️</div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Right to Correction</h3>
                                <Badge variant="warning" size="sm" className="mt-1">Section 13, DPDP Act 2023</Badge>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600">
                            Request correction of inaccurate or incomplete personal data. School administration will review
                            and update the information within 3 business days.
                        </p>

                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                            <div className="font-medium text-gray-700 mb-2">Correctable fields:</div>
                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                                <li>Name, date of birth, gender</li>
                                <li>Contact information</li>
                                <li>Address details</li>
                                <li>Parent/guardian information</li>
                                <li>Medical information</li>
                            </ul>
                        </div>

                        <Button
                            variant="primary"
                            onClick={() => setShowCorrectionModal(true)}
                            disabled={!selectedStudent}
                            className="w-full"
                        >
                            ✏️ Request Data Correction
                        </Button>
                    </div>
                </Card>

                {/* Right to Erasure */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">🗑️</div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Right to Erasure</h3>
                                <Badge variant="danger" size="sm" className="mt-1">Section 14, DPDP Act 2023</Badge>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600">
                            Request deletion of your child's personal data. Please note that some data must be retained
                            for legal and regulatory compliance (e.g., financial records for 7 years, academic records for 5 years).
                        </p>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                            <div className="font-medium text-yellow-900 mb-2">⚠️ Important:</div>
                            <ul className="list-disc list-inside space-y-1 text-yellow-800">
                                <li>Deletion is subject to legal retention requirements</li>
                                <li>Educational records: 5 years retention</li>
                                <li>Financial records: 7 years retention</li>
                                <li>Health data will be deleted immediately</li>
                                <li>This action cannot be undone</li>
                            </ul>
                        </div>

                        <Button
                            variant="danger"
                            onClick={() => setShowDeletionModal(true)}
                            disabled={!selectedStudent}
                            className="w-full"
                        >
                            🗑️ Request Data Deletion
                        </Button>
                    </div>
                </Card>

                {/* Right to Data Portability */}
                <Card className="hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">📦</div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Right to Data Portability</h3>
                                <Badge variant="purple" size="sm" className="mt-1">Section 11, DPDP Act 2023</Badge>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600">
                            Receive your child's data in a structured, commonly used, machine-readable format (JSON or CSV).
                            This allows you to transfer the data to another educational institution.
                        </p>

                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                            <div className="font-medium text-gray-700 mb-2">Available formats:</div>
                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                                <li>JSON - Machine-readable format</li>
                                <li>CSV - Spreadsheet format</li>
                                <li>Data can be imported to other systems</li>
                                <li>Complete data export included</li>
                            </ul>
                        </div>

                        <Button
                            variant="primary"
                            onClick={() => setShowExportModal(true)}
                            disabled={!selectedStudent}
                            className="w-full"
                        >
                            📦 Export Portable Data
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Export Data Modal */}
            <Modal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                title="Download Your Child's Data"
                size="md"
            >
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            You are about to download a complete export of all personal data we have collected about{' '}
                            <strong>{selectedStudent?.full_name}</strong>.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Export Format
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    value="json"
                                    checked={exportFormat === 'json'}
                                    onChange={(e) => setExportFormat(e.target.value)}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">JSON Format</div>
                                    <div className="text-xs text-gray-500">
                                        Machine-readable, structured data. Best for transferring to another system.
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    value="csv"
                                    checked={exportFormat === 'csv'}
                                    onChange={(e) => setExportFormat(e.target.value)}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">CSV Format</div>
                                    <div className="text-xs text-gray-500">
                                        Spreadsheet format. Can be opened in Excel, Google Sheets, etc.
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                        <div className="font-medium mb-1">Data Export Includes:</div>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Personal information (name, DOB, gender, contact)</li>
                            <li>Family details (parents/guardians)</li>
                            <li>Health records and medical history</li>
                            <li>Academic performance and grades</li>
                            <li>Attendance records</li>
                            <li>Behavioral notes and observations</li>
                            <li>Uploaded documents metadata</li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="secondary"
                            onClick={() => setShowExportModal(false)}
                            disabled={exporting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleExportData}
                            disabled={exporting}
                        >
                            {exporting ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Exporting...
                                </>
                            ) : (
                                '📥 Download Data'
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Request Deletion Modal */}
            <Modal
                isOpen={showDeletionModal}
                onClose={() => {
                    setShowDeletionModal(false);
                    setDeletionReason('');
                }}
                title="Request Data Deletion"
                size="md"
            >
                <div className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">⚠️</div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-red-900 mb-1">Important Notice</h4>
                                <p className="text-sm text-red-800">
                                    You are requesting deletion of <strong>{selectedStudent?.full_name}'s</strong> personal data.
                                    This action is subject to legal retention requirements and cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Deletion Request *
                        </label>
                        <textarea
                            value={deletionReason}
                            onChange={(e) => setDeletionReason(e.target.value)}
                            rows={4}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Please explain why you are requesting data deletion..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Your request will be reviewed by school administration within 7 business days.
                        </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                        <div className="font-medium text-yellow-900 mb-2">Data Retention Policy:</div>
                        <ul className="list-disc list-inside space-y-1 text-yellow-800">
                            <li>Academic records will be retained for 5 years</li>
                            <li>Financial records will be retained for 7 years (tax law)</li>
                            <li>Health data will be deleted immediately</li>
                            <li>Behavioral notes will be deleted immediately</li>
                            <li>Photos and documents will be deleted immediately</li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowDeletionModal(false);
                                setDeletionReason('');
                            }}
                            disabled={requesting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleRequestDeletion}
                            disabled={requesting || !deletionReason.trim()}
                        >
                            {requesting ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                '🗑️ Submit Deletion Request'
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Request Correction Modal */}
            <Modal
                isOpen={showCorrectionModal}
                onClose={() => {
                    setShowCorrectionModal(false);
                    setCorrectionData({
                        field_name: '',
                        current_value: '',
                        corrected_value: '',
                        reason: ''
                    });
                }}
                title="Request Data Correction"
                size="md"
            >
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            Request correction of inaccurate or incomplete data for{' '}
                            <strong>{selectedStudent?.full_name}</strong>. School administration will review and update within 3 business days.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Field to Correct *
                        </label>
                        <select
                            value={correctionData.field_name}
                            onChange={(e) => setCorrectionData({ ...correctionData, field_name: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Select Field --</option>
                            {dataFields.map(field => (
                                <option key={field.value} value={field.value}>
                                    {field.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current (Incorrect) Value *
                        </label>
                        <input
                            type="text"
                            value={correctionData.current_value}
                            onChange={(e) => setCorrectionData({ ...correctionData, current_value: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter the current incorrect value"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Corrected Value *
                        </label>
                        <input
                            type="text"
                            value={correctionData.corrected_value}
                            onChange={(e) => setCorrectionData({ ...correctionData, corrected_value: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter the correct value"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Correction *
                        </label>
                        <textarea
                            value={correctionData.reason}
                            onChange={(e) => setCorrectionData({ ...correctionData, reason: e.target.value })}
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Explain why this correction is needed..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowCorrectionModal(false);
                                setCorrectionData({
                                    field_name: '',
                                    current_value: '',
                                    corrected_value: '',
                                    reason: ''
                                });
                            }}
                            disabled={requesting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleRequestCorrection}
                            disabled={requesting}
                        >
                            {requesting ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                '✏️ Submit Correction Request'
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DataRights;
