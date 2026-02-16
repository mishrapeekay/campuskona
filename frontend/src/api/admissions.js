import apiClient, { uploadFile, buildQueryString } from './client';

const ENQUIRY_ENDPOINT = '/admissions/enquiries';
const APPLICATION_ENDPOINT = '/admissions/applications';
const DOCUMENT_ENDPOINT = '/admissions/documents';
const SETTING_ENDPOINT = '/admissions/settings';

// ── Enquiries ──

export const getEnquiries = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${ENQUIRY_ENDPOINT}/?${queryString}`);
};

export const getEnquiryById = (id) => {
    return apiClient.get(`${ENQUIRY_ENDPOINT}/${id}/`);
};

export const createEnquiry = (data) => {
    return apiClient.post(`${ENQUIRY_ENDPOINT}/`, data);
};

export const updateEnquiry = (id, data) => {
    return apiClient.patch(`${ENQUIRY_ENDPOINT}/${id}/`, data);
};

export const deleteEnquiry = (id) => {
    return apiClient.delete(`${ENQUIRY_ENDPOINT}/${id}/`);
};

export const convertEnquiryToApplication = (id) => {
    return apiClient.post(`${ENQUIRY_ENDPOINT}/${id}/convert_to_application/`);
};

export const getEnquiryStats = () => {
    return apiClient.get(`${ENQUIRY_ENDPOINT}/stats/`);
};

// ── Applications ──

export const getApplications = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${APPLICATION_ENDPOINT}/?${queryString}`);
};

export const getApplicationById = (id) => {
    return apiClient.get(`${APPLICATION_ENDPOINT}/${id}/`);
};

export const createApplication = (data) => {
    return apiClient.post(`${APPLICATION_ENDPOINT}/`, data);
};

export const updateApplication = (id, data) => {
    return apiClient.patch(`${APPLICATION_ENDPOINT}/${id}/`, data);
};

export const deleteApplication = (id) => {
    return apiClient.delete(`${APPLICATION_ENDPOINT}/${id}/`);
};

export const submitApplication = (id) => {
    return apiClient.post(`${APPLICATION_ENDPOINT}/${id}/submit/`);
};

export const approveApplication = (id, data = {}) => {
    return apiClient.post(`${APPLICATION_ENDPOINT}/${id}/approve/`, data);
};

export const rejectApplication = (id, data = {}) => {
    return apiClient.post(`${APPLICATION_ENDPOINT}/${id}/reject/`, data);
};

export const enrollApplication = (id) => {
    return apiClient.post(`${APPLICATION_ENDPOINT}/${id}/enroll/`);
};

export const getApplicationStats = () => {
    return apiClient.get(`${APPLICATION_ENDPOINT}/stats/`);
};

// ── Documents ──

export const getDocuments = (applicationId) => {
    return apiClient.get(`${DOCUMENT_ENDPOINT}/?application=${applicationId}`);
};

export const uploadDocument = (file, applicationId, documentType, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('application', applicationId);
    formData.append('document_type', documentType);
    return apiClient.post(`${DOCUMENT_ENDPOINT}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
    });
};

export const verifyDocument = (id) => {
    return apiClient.post(`${DOCUMENT_ENDPOINT}/${id}/verify/`);
};

export const rejectDocument = (id) => {
    return apiClient.post(`${DOCUMENT_ENDPOINT}/${id}/reject/`);
};

// ── Admission Settings ──

export const getAdmissionSettings = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${SETTING_ENDPOINT}/?${queryString}`);
};

export const getAdmissionSettingById = (id) => {
    return apiClient.get(`${SETTING_ENDPOINT}/${id}/`);
};

export const createAdmissionSetting = (data) => {
    return apiClient.post(`${SETTING_ENDPOINT}/`, data);
};

export const updateAdmissionSetting = (id, data) => {
    return apiClient.patch(`${SETTING_ENDPOINT}/${id}/`, data);
};
