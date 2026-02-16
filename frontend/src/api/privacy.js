import apiClient from './client';

const PRIVACY_ENDPOINT = '/privacy';

export const privacyAPI = {
    // Consent Management
    getConsentPurposes: () => apiClient.get(`${PRIVACY_ENDPOINT}/consent-purposes/`),

    getConsents: (params = {}) => apiClient.get(`${PRIVACY_ENDPOINT}/consents/`, { params }),

    requestConsent: (data) => apiClient.post(`${PRIVACY_ENDPOINT}/consents/request_consent/`, data),

    grantConsent: (data) => apiClient.post(`${PRIVACY_ENDPOINT}/consents/grant_consent/`, data),

    withdrawConsent: (id, data) => apiClient.post(`${PRIVACY_ENDPOINT}/consents/${id}/withdraw_consent/`, data),

    // Grievances
    getGrievances: (params = {}) => apiClient.get(`${PRIVACY_ENDPOINT}/grievances/`, { params }),

    createGrievance: (data) => apiClient.post(`${PRIVACY_ENDPOINT}/grievances/`, data),

    getGrievanceDetails: (id) => apiClient.get(`${PRIVACY_ENDPOINT}/grievances/${id}/`),

    addGrievanceComment: (id, data) => apiClient.post(`${PRIVACY_ENDPOINT}/grievances/${id}/add_comment/`, data),

    resolveGrievance: (id, data) => apiClient.post(`${PRIVACY_ENDPOINT}/grievances/${id}/resolve/`, data),

    // Data Breach Notifications
    getDataBreaches: (params = {}) => apiClient.get(`${PRIVACY_ENDPOINT}/breaches/`, { params }),

    reportDataBreach: (data) => apiClient.post(`${PRIVACY_ENDPOINT}/breaches/`, data),

    notifyAffectedParents: (id) => apiClient.post(`${PRIVACY_ENDPOINT}/breaches/${id}/notify_parents/`, {}),

    notifyDataProtectionBoard: (id) => apiClient.post(`${PRIVACY_ENDPOINT}/breaches/${id}/notify_dpb/`, {}),

    // Data Subject Rights
    requestDeletion: (data) => apiClient.post(`${PRIVACY_ENDPOINT}/deletion-requests/`, data),

    getDeletionRequests: (params = {}) => apiClient.get(`${PRIVACY_ENDPOINT}/deletion-requests/`, { params }),

    approveDeletion: (id, data) => apiClient.post(`${PRIVACY_ENDPOINT}/deletion-requests/${id}/approve/`, data),

    rejectDeletion: (id, data) => apiClient.post(`${PRIVACY_ENDPOINT}/deletion-requests/${id}/reject/`, data),

    requestCorrection: (data) => apiClient.post(`${PRIVACY_ENDPOINT}/correction-requests/`, data),

    getCorrectionRequests: (params = {}) => apiClient.get(`${PRIVACY_ENDPOINT}/correction-requests/`, { params }),

    approveCorrection: (id, data) => apiClient.post(`${PRIVACY_ENDPOINT}/correction-requests/${id}/approve/`, data),

    rejectCorrection: (id, data) => apiClient.post(`${PRIVACY_ENDPOINT}/correction-requests/${id}/reject/`, data),

    exportMyData: (studentId, format = 'json') =>
        apiClient.get(`${PRIVACY_ENDPOINT}/data-subject-rights/export_my_data/`, {
            params: { student_id: studentId, format },
            responseType: 'blob', // For file download
        }),

    // Audit Logs (Phase 4)
    getAuditLogs: (params = {}) => apiClient.get(`${PRIVACY_ENDPOINT}/audit-logs/`, { params }),

    getAuditLogsSummary: (params = {}) =>
        apiClient.get(`${PRIVACY_ENDPOINT}/audit-logs/summary/`, { params }),

    getStudentAccessHistory: (studentId, params = {}) =>
        apiClient.get(`${PRIVACY_ENDPOINT}/audit-logs/student_history/`, {
            params: { student_id: studentId, ...params },
        }),

    getUserAccessSummary: (userId, params = {}) =>
        apiClient.get(`${PRIVACY_ENDPOINT}/audit-logs/user_summary/`, {
            params: { user_id: userId, ...params },
        }),

    // Access Pattern Alerts (Phase 4)
    getAlerts: (params = {}) => apiClient.get(`${PRIVACY_ENDPOINT}/alerts/`, { params }),

    getPendingAlerts: () => apiClient.get(`${PRIVACY_ENDPOINT}/alerts/pending/`),

    getAlertDetails: (id) => apiClient.get(`${PRIVACY_ENDPOINT}/alerts/${id}/`),

    resolveAlert: (id, data) => apiClient.post(`${PRIVACY_ENDPOINT}/alerts/${id}/resolve/`, data),

    markAlertFalsePositive: (id) => apiClient.post(`${PRIVACY_ENDPOINT}/alerts/${id}/mark_false_positive/`, {}),

    assignAlert: (id, data) => apiClient.post(`${PRIVACY_ENDPOINT}/alerts/${id}/assign/`, data),

    // Compliance Reports
    generateComplianceReport: (reportType, params = {}) =>
        apiClient.post(`${PRIVACY_ENDPOINT}/reports/generate/`, {
            report_type: reportType,
            ...params,
        }),

    getReportHistory: (params = {}) => apiClient.get(`${PRIVACY_ENDPOINT}/reports/`, { params }),

    downloadReport: (id) =>
        apiClient.get(`${PRIVACY_ENDPOINT}/reports/${id}/download/`, {
            responseType: 'blob',
        }),

    // Compliance Dashboard (DPDP Coordinator)
    getComplianceSummary: () => apiClient.get(`${PRIVACY_ENDPOINT}/dashboard/summary/`),

    getSectionComplianceDetails: (sectionId) => apiClient.get(`${PRIVACY_ENDPOINT}/dashboard/${sectionId}/section_details/`),
};

export default privacyAPI;
