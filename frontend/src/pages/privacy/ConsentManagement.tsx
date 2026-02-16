/**
 * DPDP Act 2023 - Parental Consent Management
 * Parent portal for managing data processing consents
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getConsentPurposes,
  getMyConsents,
  requestConsent,
  grantConsent,
  withdrawConsent,
  ConsentPurpose,
  ParentalConsent,
  ConsentRequest,
} from '../../api/privacy';

interface ConsentDialogProps {
  purpose: ConsentPurpose;
  studentId: number;
  studentName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ConsentDialog: React.FC<ConsentDialogProps> = ({
  purpose,
  studentId,
  studentName,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [verificationMethod, setVerificationMethod] = useState<'EMAIL_OTP' | 'SMS_OTP'>('EMAIL_OTP');
  const [consentId, setConsentId] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [agreed, setAgreed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRequestConsent = async () => {
    setLoading(true);
    try {
      const data: ConsentRequest = {
        student_id: studentId,
        purpose_code: purpose.code,
        verification_method: verificationMethod,
      };

      const response = await requestConsent(data);
      setConsentId(response.consent_id);
      setStep('verify');
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to request consent');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantConsent = async () => {
    if (!agreed) {
      toast.error('You must agree to the consent terms');
      return;
    }

    setLoading(true);
    try {
      const response = await grantConsent({
        consent_id: consentId,
        otp,
        agreed,
      });

      toast.success(response.message);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to grant consent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Parental Consent Required</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {step === 'request' ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{purpose.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Student: <strong>{studentName}</strong>
                </p>
                {purpose.is_mandatory && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Mandatory:</strong> This consent is required for providing educational services.
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Purpose Description:</h4>
                <p className="text-sm text-gray-700 mb-4">{purpose.description}</p>

                <h4 className="font-semibold text-gray-900 mb-2">Legal Basis:</h4>
                <p className="text-sm text-gray-700 mb-4">{purpose.legal_basis}</p>

                <h4 className="font-semibold text-gray-900 mb-2">Data Retention Period:</h4>
                <p className="text-sm text-gray-700">
                  {Math.floor(purpose.retention_period_days / 365)} years ({purpose.retention_period_days} days)
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Method
                </label>
                <select
                  value={verificationMethod}
                  onChange={(e) => setVerificationMethod(e.target.value as 'EMAIL_OTP' | 'SMS_OTP')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EMAIL_OTP">Email OTP</option>
                  <option value="SMS_OTP">SMS OTP</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  As per DPDP Act 2023, we need to verify your identity before granting consent.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestConsent}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Your Identity</h3>
                <p className="text-sm text-gray-600 mb-4">
                  A verification code has been sent to your {verificationMethod === 'EMAIL_OTP' ? 'email' : 'phone'}.
                  Please enter it below.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Code expires in 5 minutes</p>
              </div>

              <div className="mb-6 bg-gray-50 border border-gray-200 rounded p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Consent Agreement:</h4>
                <p className="text-sm text-gray-700 mb-3">{purpose.description}</p>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    I hereby provide verifiable consent for processing {studentName}'s personal data
                    for the purpose of <strong>{purpose.name}</strong> as described above.
                    I understand that this consent is being collected in compliance with the
                    Digital Personal Data Protection Act, 2023 (DPDP Act).
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setStep('request')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleGrantConsent}
                  disabled={loading || !otp || !agreed}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Verifying...' : 'Grant Consent'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface WithdrawDialogProps {
  consent: ParentalConsent;
  onClose: () => void;
  onSuccess: () => void;
}

const WithdrawDialog: React.FC<WithdrawDialogProps> = ({ consent, onClose, onSuccess }) => {
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      const response = await withdrawConsent(consent.id, { reason });
      toast.success(response.message);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to withdraw consent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Withdraw Consent</h2>

          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-2">
              You are about to withdraw consent for: <strong>{consent.purpose_details.name}</strong>
            </p>
            <p className="text-sm text-gray-700 mb-4">
              Student: <strong>{consent.student_name}</strong>
            </p>

            {consent.purpose_details.is_mandatory && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This is mandatory consent. Withdrawing it may affect
                  the provision of educational services.
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Withdrawal (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please provide a reason..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? 'Withdrawing...' : 'Withdraw Consent'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConsentManagement: React.FC = () => {
  const [purposes, setPurposes] = useState<ConsentPurpose[]>([]);
  const [consents, setConsents] = useState<ParentalConsent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPurpose, setSelectedPurpose] = useState<ConsentPurpose | null>(null);
  const [selectedConsent, setSelectedConsent] = useState<ParentalConsent | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState<boolean>(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState<boolean>(false);
  const [studentId] = useState<number>(1); // TODO: Get from context/props
  const [studentName] = useState<string>('John Doe'); // TODO: Get from context/props

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [purposesData, consentsData] = await Promise.all([
        getConsentPurposes(),
        getMyConsents(studentId),
      ]);
      setPurposes(purposesData);
      setConsents(consentsData);
    } catch (error) {
      toast.error('Failed to load consent data');
    } finally {
      setLoading(false);
    }
  };

  const getConsentForPurpose = (purposeCode: string): ParentalConsent | undefined => {
    return consents.find(
      (c) => c.purpose_details.code === purposeCode && c.student === studentId
    );
  };

  const handleRequestConsent = (purpose: ConsentPurpose) => {
    setSelectedPurpose(purpose);
    setShowConsentDialog(true);
  };

  const handleWithdrawConsent = (consent: ParentalConsent) => {
    setSelectedConsent(consent);
    setShowWithdrawDialog(true);
  };

  const getStatusBadge = (purpose: ConsentPurpose) => {
    const consent = getConsentForPurpose(purpose.code);

    if (!consent) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
          Not Requested
        </span>
      );
    }

    if (consent.withdrawn) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Withdrawn
        </span>
      );
    }

    if (consent.consent_given) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Granted
        </span>
      );
    }

    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Processing Consents</h1>
        <p className="text-gray-600">
          Manage consents for processing {studentName}'s personal data in compliance with DPDP Act 2023
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-blue-900 mb-2">About Data Protection</h2>
        <p className="text-sm text-blue-800">
          Under the Digital Personal Data Protection Act, 2023, we require verifiable parental consent
          to process personal data of students under 18 years. You can grant, view, and withdraw
          consents at any time. Mandatory consents are essential for providing educational services.
        </p>
      </div>

      <div className="space-y-4">
        {purposes.map((purpose) => {
          const consent = getConsentForPurpose(purpose.code);
          const canWithdraw = consent && consent.is_valid && !purpose.is_mandatory;

          return (
            <div
              key={purpose.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{purpose.name}</h3>
                    {purpose.is_mandatory && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                        MANDATORY
                      </span>
                    )}
                    {getStatusBadge(purpose)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{purpose.description}</p>
                  <p className="text-xs text-gray-500">
                    Category: {purpose.category} | Retention: {Math.floor(purpose.retention_period_days / 365)} years
                  </p>
                </div>
              </div>

              {consent && consent.is_valid && (
                <div className="bg-gray-50 rounded p-3 mb-4 text-sm">
                  <p className="text-gray-700">
                    <strong>Granted on:</strong> {new Date(consent.consent_date!).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">
                    <strong>Verification:</strong> {consent.verification_method.replace('_', ' ')}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                {!consent || consent.withdrawn ? (
                  <button
                    onClick={() => handleRequestConsent(purpose)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Grant Consent
                  </button>
                ) : !consent.is_valid ? (
                  <button
                    onClick={() => handleRequestConsent(purpose)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    Re-verify Consent
                  </button>
                ) : null}

                {canWithdraw && (
                  <button
                    onClick={() => handleWithdrawConsent(consent)}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50"
                  >
                    Withdraw Consent
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showConsentDialog && selectedPurpose && (
        <ConsentDialog
          purpose={selectedPurpose}
          studentId={studentId}
          studentName={studentName}
          onClose={() => {
            setShowConsentDialog(false);
            setSelectedPurpose(null);
          }}
          onSuccess={fetchData}
        />
      )}

      {showWithdrawDialog && selectedConsent && (
        <WithdrawDialog
          consent={selectedConsent}
          onClose={() => {
            setShowWithdrawDialog(false);
            setSelectedConsent(null);
          }}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default ConsentManagement;
