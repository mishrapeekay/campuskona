import apiClient, { buildQueryString } from './client';

const TEMPLATE_ENDPOINT = '/reports/templates';
const GENERATED_ENDPOINT = '/reports/generated';
const SCHEDULE_ENDPOINT = '/reports/schedules';
const SAVED_ENDPOINT = '/reports/saved';

// ── Templates ──

export const getTemplates = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${TEMPLATE_ENDPOINT}/?${queryString}`);
};

export const getTemplateById = (id) => apiClient.get(`${TEMPLATE_ENDPOINT}/${id}/`);
export const createTemplate = (data) => apiClient.post(`${TEMPLATE_ENDPOINT}/`, data);
export const updateTemplate = (id, data) => apiClient.patch(`${TEMPLATE_ENDPOINT}/${id}/`, data);
export const deleteTemplate = (id) => apiClient.delete(`${TEMPLATE_ENDPOINT}/${id}/`);
export const getTemplatesByModule = () => apiClient.get(`${TEMPLATE_ENDPOINT}/by_module/`);
export const duplicateTemplate = (id) => apiClient.post(`${TEMPLATE_ENDPOINT}/${id}/duplicate/`);

// ── Generated Reports ──

export const getGeneratedReports = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${GENERATED_ENDPOINT}/?${queryString}`);
};

export const getGeneratedReportById = (id) => apiClient.get(`${GENERATED_ENDPOINT}/${id}/`);
export const generateReport = (data) => apiClient.post(`${GENERATED_ENDPOINT}/generate/`, data);
export const regenerateReport = (id) => apiClient.post(`${GENERATED_ENDPOINT}/${id}/regenerate/`);
export const getReportStats = () => apiClient.get(`${GENERATED_ENDPOINT}/stats/`);

// ── Schedules ──

export const getSchedules = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${SCHEDULE_ENDPOINT}/?${queryString}`);
};

export const getScheduleById = (id) => apiClient.get(`${SCHEDULE_ENDPOINT}/${id}/`);
export const createSchedule = (data) => apiClient.post(`${SCHEDULE_ENDPOINT}/`, data);
export const updateSchedule = (id, data) => apiClient.patch(`${SCHEDULE_ENDPOINT}/${id}/`, data);
export const deleteSchedule = (id) => apiClient.delete(`${SCHEDULE_ENDPOINT}/${id}/`);
export const toggleScheduleActive = (id) => apiClient.post(`${SCHEDULE_ENDPOINT}/${id}/toggle_active/`);
export const runScheduleNow = (id) => apiClient.post(`${SCHEDULE_ENDPOINT}/${id}/run_now/`);

// ── Saved Reports ──

export const getSavedReports = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${SAVED_ENDPOINT}/?${queryString}`);
};

export const saveReport = (data) => apiClient.post(`${SAVED_ENDPOINT}/`, data);
export const updateSavedReport = (id, data) => apiClient.patch(`${SAVED_ENDPOINT}/${id}/`, data);
export const deleteSavedReport = (id) => apiClient.delete(`${SAVED_ENDPOINT}/${id}/`);
export const togglePin = (id) => apiClient.post(`${SAVED_ENDPOINT}/${id}/toggle_pin/`);
export const getPinnedReports = () => apiClient.get(`${SAVED_ENDPOINT}/pinned/`);
