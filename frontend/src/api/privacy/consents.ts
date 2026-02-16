/**
 * DPDP Act 2023 Compliance - Consent Management API Client
 */
import apiClient from '../apiClient';

export interface ConsentPurpose {
  id: number;
  code: string;
  name: string;
  description: string;
  is_mandatory: boolean;
  category: string;
  legal_basis: string;
  retention_period_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsentAuditLog {
  id: number;
  action: string;
  performed_by: number;
  performed_by_name: string;
  timestamp: string;
  details: Record<string, any>;
  ip_address: string;
}

export interface ParentalConsent {
  id: number;
  consent_id: string;
  student: number;
  student_name: string;
  parent_user: number;
  parent_name: string;
  purpose: number;
  purpose_details: ConsentPurpose;
  consent_given: boolean;
  consent_text: string;
  consent_date: string | null;
  verification_method: string;
  verified_at: string | null;
  verification_data: Record<string, any>;
  withdrawn: boolean;
  withdrawn_at: string | null;
  withdrawal_reason: string;
  ip_address: string;
  user_agent: string;
  is_valid: boolean;
  audit_logs: ConsentAuditLog[];
  created_at: string;
  updated_at: string;
}

export interface ConsentRequest {
  student_id: number;
  purpose_code: string;
  verification_method: 'EMAIL_OTP' | 'SMS_OTP' | 'AADHAAR_VIRTUAL_TOKEN' | 'EXISTING_IDENTITY' | 'MANUAL_VERIFICATION';
}

export interface ConsentGrant {
  consent_id: string;
  otp?: string;
  agreed: boolean;
}

export interface ConsentWithdrawal {
  reason?: string;
}

export interface ConsentRequestResponse {
  message: string;
  consent_id: string;
  verification_method: string;
}

export interface ConsentGrantResponse {
  message: string;
  consent: ParentalConsent;
}

/**
 * Get all available consent purposes
 */
export const getConsentPurposes = async (): Promise<ConsentPurpose[]> => {
  const response = await apiClient.get('/privacy/consent-purposes/');
  return response.data;
};

/**
 * Get all consents for the current parent
 */
export const getMyConsents = async (studentId?: number): Promise<ParentalConsent[]> => {
  const params = studentId ? { student_id: studentId } : {};
  const response = await apiClient.get('/privacy/consents/my_consents/', { params });
  return response.data;
};

/**
 * Request consent for specific purpose
 * Sends OTP for verification
 */
export const requestConsent = async (data: ConsentRequest): Promise<ConsentRequestResponse> => {
  const response = await apiClient.post('/privacy/consents/request_consent/', data);
  return response.data;
};

/**
 * Grant consent after OTP verification
 */
export const grantConsent = async (data: ConsentGrant): Promise<ConsentGrantResponse> => {
  const response = await apiClient.post('/privacy/consents/grant_consent/', data);
  return response.data;
};

/**
 * Withdraw previously granted consent
 */
export const withdrawConsent = async (
  consentId: number,
  data: ConsentWithdrawal
): Promise<ConsentGrantResponse> => {
  const response = await apiClient.post(`/privacy/consents/${consentId}/withdraw_consent/`, data);
  return response.data;
};

/**
 * Get specific consent by ID
 */
export const getConsent = async (consentId: number): Promise<ParentalConsent> => {
  const response = await apiClient.get(`/privacy/consents/${consentId}/`);
  return response.data;
};
