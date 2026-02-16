import apiClient from './client';

export interface ConsentRecord {
    id: string;
    purpose: string;
    is_granted: boolean;
    granted_at: string | null;
    revoked_at: string | null;
    data_categories: string[];
}

export interface PrivacyRequest {
    id: string;
    request_type: 'EXPORT' | 'DELETION';
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
    created_at: string;
    completed_at: string | null;
}

class PrivacyService {
    /**
     * Get all active consents for the user/child
     */
    async getConsents(studentId?: string): Promise<ConsentRecord[]> {
        const url = studentId ? `/privacy/consents/?student_id=${studentId}` : '/privacy/consents/';
        return apiClient.get<ConsentRecord[]>(url);
    }

    /**
     * Update consent status
     */
    async updateConsent(consentId: string, is_granted: boolean): Promise<ConsentRecord> {
        return apiClient.patch<ConsentRecord>(`/privacy/consents/${consentId}/`, { is_granted });
    }

    /**
     * Request data export (DPDP compliant)
     */
    async requestDataExport(studentId?: string): Promise<PrivacyRequest> {
        return apiClient.post<PrivacyRequest>('/privacy/requests/', {
            request_type: 'EXPORT',
            student_id: studentId
        });
    }

    /**
     * Request data deletion (Right to be Forgotten)
     */
    async requestDataDeletion(studentId?: string, reason?: string): Promise<PrivacyRequest> {
        return apiClient.post<PrivacyRequest>('/privacy/requests/', {
            request_type: 'DELETION',
            student_id: studentId,
            notes: reason
        });
    }

    /**
     * Get status of privacy requests
     */
    async getPrivacyRequests(studentId?: string): Promise<PrivacyRequest[]> {
        const url = studentId ? `/privacy/requests/?student_id=${studentId}` : '/privacy/requests/';
        return apiClient.get<PrivacyRequest[]>(url);
    }
}

export const privacyService = new PrivacyService();
export default privacyService;
