import apiClient, { uploadFile, downloadFile, buildQueryString } from './client';

// Base endpoint - matches Django router URL
const STUDENTS_ENDPOINT = '/students/students';

// Get all students with filters
export const getStudents = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${STUDENTS_ENDPOINT}/?${queryString}`);
};

// Get student by ID
export const getStudentById = (id) => {
    return apiClient.get(`${STUDENTS_ENDPOINT}/${id}/`);
};

// Create new student
export const createStudent = (studentData) => {
    return apiClient.post(`${STUDENTS_ENDPOINT}/`, studentData);
};

// Update student
export const updateStudent = (id, studentData) => {
    return apiClient.put(`${STUDENTS_ENDPOINT}/${id}/`, studentData);
};

// Partial update student
export const patchStudent = (id, studentData) => {
    return apiClient.patch(`${STUDENTS_ENDPOINT}/${id}/`, studentData);
};

// Delete student (soft delete)
export const deleteStudent = (id) => {
    return apiClient.delete(`${STUDENTS_ENDPOINT}/${id}/`);
};

// Bulk upload students
export const bulkUploadStudents = (file, onUploadProgress) => {
    return uploadFile(`${STUDENTS_ENDPOINT}/bulk_upload/`, file, onUploadProgress);
};

// Export students
export const exportStudents = (params = {}) => {
    const queryString = buildQueryString(params);
    return downloadFile(`${STUDENTS_ENDPOINT}/export/?${queryString}`, 'students.xlsx');
};

// Promote students
export const promoteStudents = (data) => {
    return apiClient.post(`${STUDENTS_ENDPOINT}/promote/`, data);
};

// Get student statistics
export const getStudentStatistics = () => {
    return apiClient.get(`${STUDENTS_ENDPOINT}/stats/`);
};

export const getDashboardStats = () => {
    return apiClient.get(`${STUDENTS_ENDPOINT}/dashboard_stats/`);
};

// Generate admission number
export const generateAdmissionNumber = () => {
    return apiClient.get(`${STUDENTS_ENDPOINT}/generate-admission-number/`);
};

// Student Documents
export const getStudentDocuments = (studentId) => {
    return apiClient.get(`${STUDENTS_ENDPOINT}/${studentId}/documents/`);
};

export const uploadStudentDocument = (studentId, file, documentType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    return apiClient.post(`${STUDENTS_ENDPOINT}/${studentId}/documents/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deleteStudentDocument = (studentId, documentId) => {
    return apiClient.delete(`${STUDENTS_ENDPOINT}/${studentId}/documents/${documentId}/`);
};

// Student Guardians
export const getStudentGuardians = (studentId) => {
    return apiClient.get(`${STUDENTS_ENDPOINT}/${studentId}/guardians/`);
};

export const addStudentGuardian = (studentId, guardianData) => {
    return apiClient.post(`${STUDENTS_ENDPOINT}/${studentId}/guardians/`, guardianData);
};

export const updateStudentGuardian = (studentId, guardianId, guardianData) => {
    return apiClient.put(`${STUDENTS_ENDPOINT}/${studentId}/guardians/${guardianId}/`, guardianData);
};

export const removeStudentGuardian = (studentId, guardianId) => {
    return apiClient.delete(`${STUDENTS_ENDPOINT}/${studentId}/guardians/${guardianId}/`);
};

// Student Attendance
export const getStudentAttendance = (studentId, params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${STUDENTS_ENDPOINT}/${studentId}/attendance/?${queryString}`);
};

// Student Results
export const getStudentResults = (studentId, params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${STUDENTS_ENDPOINT}/${studentId}/results/?${queryString}`);
};

// Student Health Records
export const getStudentHealthRecords = (studentId) => {
    return apiClient.get(`${STUDENTS_ENDPOINT}/${studentId}/health-records/`);
};

export const addStudentHealthRecord = (studentId, healthData) => {
    return apiClient.post(`${STUDENTS_ENDPOINT}/${studentId}/health-records/`, healthData);
};

export const updateStudentHealthRecord = (studentId, recordId, healthData) => {
    return apiClient.put(`${STUDENTS_ENDPOINT}/${studentId}/health-records/${recordId}/`, healthData);
};

export const deleteStudentHealthRecord = (studentId, recordId) => {
    return apiClient.delete(`${STUDENTS_ENDPOINT}/${studentId}/health-records/${recordId}/`);
};

// Student Notes
export const getStudentNotes = (studentId) => {
    return apiClient.get(`${STUDENTS_ENDPOINT}/${studentId}/notes/`);
};

export const addStudentNote = (studentId, noteData) => {
    return apiClient.post(`${STUDENTS_ENDPOINT}/${studentId}/notes/`, noteData);
};

export const updateStudentNote = (studentId, noteId, noteData) => {
    return apiClient.put(`${STUDENTS_ENDPOINT}/${studentId}/notes/${noteId}/`, noteData);
};

export const deleteStudentNote = (studentId, noteId) => {
    return apiClient.delete(`${STUDENTS_ENDPOINT}/${studentId}/notes/${noteId}/`);
};
