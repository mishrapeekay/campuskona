import apiClient, { uploadFile, downloadFile, buildQueryString } from './client';

// Base endpoint
const STAFF_ENDPOINT = '/staff/members';
const DEPARTMENTS_ENDPOINT = '/hr/departments';

// Get all staff with filters
export const getStaff = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${STAFF_ENDPOINT}/?${queryString}`);
};

// Get staff by ID
export const getStaffById = (id) => {
    return apiClient.get(`${STAFF_ENDPOINT}/${id}/`);
};

// Create new staff
export const createStaff = (staffData) => {
    return apiClient.post(`${STAFF_ENDPOINT}/`, staffData);
};

// Update staff
export const updateStaff = (id, staffData) => {
    return apiClient.put(`${STAFF_ENDPOINT}/${id}/`, staffData);
};

// Partial update staff
export const patchStaff = (id, staffData) => {
    return apiClient.patch(`${STAFF_ENDPOINT}/${id}/`, staffData);
};

// Delete staff (soft delete)
export const deleteStaff = (id) => {
    return apiClient.delete(`${STAFF_ENDPOINT}/${id}/`);
};

// Bulk upload staff
export const bulkUploadStaff = (file, onUploadProgress) => {
    return uploadFile(`${STAFF_ENDPOINT}/bulk-upload/`, file, onUploadProgress);
};

// Export staff
export const exportStaff = (params = {}) => {
    const queryString = buildQueryString(params);
    return downloadFile(`${STAFF_ENDPOINT}/export/?${queryString}`, 'staff.xlsx');
};

// Get staff statistics
export const getStaffStatistics = () => {
    return apiClient.get(`${STAFF_ENDPOINT}/stats/`);
};

// Get Dashboard Stats (Teacher/Admin)
export const getDashboardStats = () => {
    return apiClient.get(`${STAFF_ENDPOINT}/dashboard_stats/`);
};

// Generate employee ID
export const generateEmployeeId = () => {
    return apiClient.get(`${STAFF_ENDPOINT}/generate-employee-id/`);
};

// Assign subjects to staff
export const assignSubjects = (staffId, subjects) => {
    return apiClient.post(`${STAFF_ENDPOINT}/${staffId}/assign-subjects/`, { subjects });
};

// Get staff subjects
export const getStaffSubjects = (staffId) => {
    return apiClient.get(`${STAFF_ENDPOINT}/${staffId}/subjects/`);
};

// Staff Documents
export const getStaffDocuments = (staffId) => {
    return apiClient.get(`${STAFF_ENDPOINT}/${staffId}/documents/`);
};

export const uploadStaffDocument = (staffId, file, documentType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    return apiClient.post(`${STAFF_ENDPOINT}/${staffId}/documents/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deleteStaffDocument = (staffId, documentId) => {
    return apiClient.delete(`${STAFF_ENDPOINT}/${staffId}/documents/${documentId}/`);
};

// Staff Qualifications
export const getStaffQualifications = (staffId) => {
    return apiClient.get(`${STAFF_ENDPOINT}/${staffId}/qualifications/`);
};

export const addStaffQualification = (staffId, qualificationData) => {
    return apiClient.post(`${STAFF_ENDPOINT}/${staffId}/qualifications/`, qualificationData);
};

export const updateStaffQualification = (staffId, qualificationId, qualificationData) => {
    return apiClient.put(`${STAFF_ENDPOINT}/${staffId}/qualifications/${qualificationId}/`, qualificationData);
};

export const deleteStaffQualification = (staffId, qualificationId) => {
    return apiClient.delete(`${STAFF_ENDPOINT}/${staffId}/qualifications/${qualificationId}/`);
};

// Staff Experience
export const getStaffExperience = (staffId) => {
    return apiClient.get(`${STAFF_ENDPOINT}/${staffId}/experience/`);
};

export const addStaffExperience = (staffId, experienceData) => {
    return apiClient.post(`${STAFF_ENDPOINT}/${staffId}/experience/`, experienceData);
};

export const updateStaffExperience = (staffId, experienceId, experienceData) => {
    return apiClient.put(`${STAFF_ENDPOINT}/${staffId}/experience/${experienceId}/`, experienceData);
};

export const deleteStaffExperience = (staffId, experienceId) => {
    return apiClient.delete(`${STAFF_ENDPOINT}/${staffId}/experience/${experienceId}/`);
};

// Staff Attendance
export const getStaffAttendance = (staffId, params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${STAFF_ENDPOINT}/${staffId}/attendance/?${queryString}`);
};

export const markStaffAttendance = (attendanceData) => {
    return apiClient.post('/staff/attendance/', attendanceData);
};

// Staff Leave
export const getStaffLeaves = (staffId, params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${STAFF_ENDPOINT}/${staffId}/leaves/?${queryString}`);
};

export const applyStaffLeave = (staffId, leaveData) => {
    return apiClient.post(`${STAFF_ENDPOINT}/${staffId}/leaves/`, leaveData);
};

export const updateStaffLeave = (staffId, leaveId, leaveData) => {
    return apiClient.put(`${STAFF_ENDPOINT}/${staffId}/leaves/${leaveId}/`, leaveData);
};

export const approveStaffLeave = (staffId, leaveId) => {
    return apiClient.post(`${STAFF_ENDPOINT}/${staffId}/leaves/${leaveId}/approve/`);
};

export const rejectStaffLeave = (staffId, leaveId, reason) => {
    return apiClient.post(`${STAFF_ENDPOINT}/${staffId}/leaves/${leaveId}/reject/`, { reason });
};

// Departments
export const getDepartments = () => {
    return apiClient.get(`${DEPARTMENTS_ENDPOINT}/`);
};

export const getDepartmentById = (id) => {
    return apiClient.get(`${DEPARTMENTS_ENDPOINT}/${id}/`);
};

export const createDepartment = (departmentData) => {
    return apiClient.post(`${DEPARTMENTS_ENDPOINT}/`, departmentData);
};

export const updateDepartment = (id, departmentData) => {
    return apiClient.put(`${DEPARTMENTS_ENDPOINT}/${id}/`, departmentData);
};

export const deleteDepartment = (id) => {
    return apiClient.delete(`${DEPARTMENTS_ENDPOINT}/${id}/`);
};

// Get department staff
export const getDepartmentStaff = (departmentId) => {
    return apiClient.get(`${DEPARTMENTS_ENDPOINT}/${departmentId}/staff/`);
};
