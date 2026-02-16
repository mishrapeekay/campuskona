import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Spinner } from '../../components/common';
import { privacyAPI } from '../../api/privacy';
import showToast from '../../utils/toast';
import { formatDateTime } from '../../utils/dateUtils';

const ConsentManagement = () => {
    const [purposes, setPurposes] = useState([]);
    const [consents, setConsents] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [selectedPurpose, setSelectedPurpose] = useState(null);
    const [verificationMethod, setVerificationMethod] = useState('EMAIL_OTP');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [consentId, setConsentId] = useState(null);
    const [requesting, setRequesting] = useState(false);
    const [granting, setGranting] = useState(false);
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedStudent]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [purposesRes, consentsRes] = await Promise.all([
                privacyAPI.getConsentPurposes(),
                selectedStudent ? privacyAPI.getConsents({ student_id: selectedStudent.id }) : Promise.resolve({ data: [] })
            ]);
            setPurposes(purposesRes.data);
            setConsents(consentsRes.data);
        } catch (error) {
            showToast.error('Failed to load consent data');
            console.error('Consent data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestConsent = async (purpose) => {
        if (!selectedStudent) {
            showToast.error('Please select a student first');
            return;
        }

        setSelectedPurpose(purpose);
        setShowConsentModal(true);
        setOtpSent(false);
        setOtp('');
        setAgreed(false);
    };

    const handleSendOTP = async () => {
        try {
            setRequesting(true);
            const response = await privacyAPI.requestConsent({
                student_id: selectedStudent.id,
                purpose_code: selectedPurpose.code,
                verification_method: verificationMethod
            });
            setConsentId(response.data.consent_id);
            setOtpSent(true);
            showToast.success(
                verificationMethod.includes('OTP')
                    ? `Verification code sent to your ${verificationMethod === 'EMAIL_OTP' ? 'email' : 'phone'}`
                    : 'Consent request created'
            );
        } catch (error) {
            showToast.error('Failed to send verification code');
            console.error('OTP send error:', error);
        } finally {
            setRequesting(false);
        }
    };

    const handleGrantConsent = async () => {
        if (!agreed) {
            showToast.error('You must agree to grant consent');
            return;
        }

        if (verificationMethod.includes('OTP') && !otp.trim()) {
            showToast.error('Please enter the verification code');
            return;
        }

        try {
            setGranting(true);
            await privacyAPI.grantConsent({
                consent_id: consentId,
                otp: otp || undefined,
                agreed: true
            });
            showToast.success('Consent granted successfully');
            setShowConsentModal(false);
            resetConsentModal();
            loadData();
        } catch (error) {
            showToast.error(error.response?.data?.error || 'Failed to grant consent. Please check OTP.');
            console.error('Grant consent error:', error);
        } finally {
            setGranting(false);
        }
    };

    const handleWithdrawConsent = async (consent) => {
        if (consent.purpose_is_mandatory) {
            showToast.error('Cannot withdraw consent for mandatory processing. Please contact school administration.');
            return;
        }

        const confirmMsg = `Are you sure you want to withdraw consent for "${consent.purpose_name}"?\n\nThis may impact services provided to your child.`;
        if (!window.confirm(confirmMsg)) {
            return;
        }

        const reason = window.prompt('Please provide a reason for withdrawing consent (optional):');

        try {
            await privacyAPI.withdrawConsent(consent.id, {
                reason: reason || 'Parent requested withdrawal'
            });
            showToast.success('Consent withdrawn. Data will be deleted as per retention policy.');
            loadData();
        } catch (error) {
            showToast.error('Failed to withdraw consent');
            console.error('Withdraw consent error:', error);
        }
    };

    const resetConsentModal = () => {
        setSelectedPurpose(null);
        setVerificationMethod('EMAIL_OTP');
        setOtp('');
        setOtpSent(false);
        setConsentId(null);
        setAgreed(false);
    };

    const getConsentStatus = (purposeCode) => {
        const consent = consents.find(c => c.purpose_code === purposeCode);
        if (!consent) return { status: 'not_requested', label: 'Not Granted', variant: 'secondary' };
        if (consent.withdrawn) return { status: 'withdrawn', label: 'Withdrawn', variant: 'danger' };
        if (consent.consent_given) return { status: 'granted', label: 'Granted', variant: 'success' };
        return { status: 'pending', label: 'Pending', variant: 'warning' };
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'EDUCATIONAL': '📚',
            'ADMINISTRATIVE': '📋',
            'COMMUNICATION': '📧',
            'HEALTH': '🏥',
            'FINANCIAL': '💰',
            'ANALYTICS': '📊',
            'THIRD_PARTY': '🔗',
        };
        return icons[category] || '📄';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Privacy & Consent Management</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage consent for processing your child's personal data
                    </p>
                </div>
                <Button variant="primary" onClick={loadData} size="sm">
                    🔄 Refresh
                </Button>
            </div>

            {/* Student Selector (if parent has multiple children) */}
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
                    <div className="text-3xl">ℹ️</div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 mb-2">About Consent Management</h3>
                        <p className="text-sm text-blue-800">
                            As per the Digital Personal Data Protection (DPDP) Act 2023, we require your verifiable consent
                            before processing your child's personal data. You can grant or withdraw consent for different
                            purposes. <strong>Mandatory processing</strong> is required for educational services and cannot be withdrawn.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Consent Purposes */}
            <Card title="Consent Purposes">
                <div className="space-y-4">
                    {purposes.map(purpose => {
                        const consent = consents.find(c => c.purpose_code === purpose.code);
                        const status = getConsentStatus(purpose.code);
                        const isGranted = status.status === 'granted';

                        return (
                            <div key={purpose.code} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">{getCategoryIcon(purpose.category)}</span>
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {purpose.name}
                                            </h3>
                                            {purpose.is_mandatory && (
                                                <Badge variant="danger" size="sm">Mandatory</Badge>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3">
                                            {purpose.description}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                                            <div>
                                                <span className="font-medium">Category:</span> {purpose.category.replace('_', ' ')}
                                            </div>
                                            <div>
                                                <span className="font-medium">Data Retention:</span>{' '}
                                                {Math.floor(purpose.retention_period_days / 365)} years
                                            </div>
                                        </div>

                                        {consent?.consent_date && (
                                            <div className="text-xs text-gray-500 mt-2">
                                                Granted on: {formatDateTime(consent.consent_date)}
                                            </div>
                                        )}

                                        {consent?.withdrawn_at && (
                                            <div className="text-xs text-red-600 mt-2">
                                                Withdrawn on: {formatDateTime(consent.withdrawn_at)}
                                                {consent.withdrawal_reason && ` - ${consent.withdrawal_reason}`}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <Badge variant={status.variant} size="lg">
                                            {status.label}
                                        </Badge>

                                        {!isGranted && !consent?.withdrawn && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleRequestConsent(purpose)}
                                                disabled={!selectedStudent}
                                            >
                                                Grant Consent
                                            </Button>
                                        )}

                                        {isGranted && !purpose.is_mandatory && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleWithdrawConsent(consent)}
                                                className="text-red-600 hover:text-red-700 hover:border-red-600"
                                            >
                                                Withdraw
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {purposes.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-4">📋</div>
                        <p className="text-lg font-medium">No consent purposes available</p>
                    </div>
                )}
            </Card>

            {/* Consent Grant Modal */}
            <Modal
                isOpen={showConsentModal}
                onClose={() => {
                    setShowConsentModal(false);
                    resetConsentModal();
                }}
                title="Grant Parental Consent"
                size="lg"
            >
                {selectedPurpose && (
                    <div className="space-y-6">
                        {/* Purpose Details */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                {getCategoryIcon(selectedPurpose.category)} {selectedPurpose.name}
                            </h3>
                            <p className="text-sm text-gray-700 mb-3">
                                {selectedPurpose.description}
                            </p>
                            <div className="text-xs text-gray-600">
                                <div>Category: {selectedPurpose.category.replace('_', ' ')}</div>
                                <div>Data will be retained for: {Math.floor(selectedPurpose.retention_period_days / 365)} years</div>
                                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                    <strong>Legal Basis:</strong> {selectedPurpose.legal_basis}
                                </div>
                            </div>
                        </div>

                        {!otpSent ? (
                            /* Verification Method Selection */
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Method *
                                </label>
                                <select
                                    value={verificationMethod}
                                    onChange={(e) => setVerificationMethod(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="EMAIL_OTP">Email OTP (One-Time Password)</option>
                                    <option value="SMS_OTP">SMS OTP (Text Message)</option>
                                    <option value="EXISTING_IDENTITY">Use Existing Identity on File</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    {verificationMethod === 'EMAIL_OTP' && 'A 6-digit code will be sent to your registered email'}
                                    {verificationMethod === 'SMS_OTP' && 'A 6-digit code will be sent to your registered phone'}
                                    {verificationMethod === 'EXISTING_IDENTITY' && 'Uses your verified identity from school records'}
                                </p>
                            </div>
                        ) : (
                            /* OTP Entry */
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter Verification Code *
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    A 6-digit code was sent to your {verificationMethod === 'EMAIL_OTP' ? 'email' : 'phone'}.
                                    Code expires in 5 minutes.
                                </p>
                            </div>
                        )}

                        {/* Consent Agreement */}
                        {otpSent && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-800 flex-1">
                                        I hereby grant consent for processing my child's personal data for the purpose described above.
                                        I understand that:
                                        <ul className="list-disc ml-5 mt-2 space-y-1">
                                            <li>This consent is voluntary (except for mandatory processing)</li>
                                            <li>I can withdraw consent at any time (for non-mandatory purposes)</li>
                                            <li>Data will be processed only for the specified purpose</li>
                                            <li>My child's data will be protected with appropriate security measures</li>
                                        </ul>
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowConsentModal(false);
                                    resetConsentModal();
                                }}
                                disabled={requesting || granting}
                            >
                                Cancel
                            </Button>

                            {!otpSent ? (
                                <Button
                                    variant="primary"
                                    onClick={handleSendOTP}
                                    disabled={requesting}
                                >
                                    {requesting ? (
                                        <>
                                            <Spinner size="sm" className="mr-2" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Continue'
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={handleGrantConsent}
                                    disabled={granting || !agreed || (verificationMethod.includes('OTP') && otp.length !== 6)}
                                >
                                    {granting ? (
                                        <>
                                            <Spinner size="sm" className="mr-2" />
                                            Granting...
                                        </>
                                    ) : (
                                        '✓ Grant Consent'
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ConsentManagement;
