import client from './client';

const BASE_URL = '/examinations';

// Grade Scales
export const getGradeScales = (params) => {
    return client.get(`${BASE_URL}/grade-scales/`, { params });
};

export const getActiveGradeScales = () => {
    return client.get(`${BASE_URL}/grade-scales/active/`);
};

export const createGradeScale = (data) => {
    return client.post(`${BASE_URL}/grade-scales/`, data);
};

// Grades
export const getGrades = (params) => {
    return client.get(`${BASE_URL}/grades/`, { params });
};

// Exam Types
export const getExamTypes = (params) => {
    return client.get(`${BASE_URL}/exam-types/`, { params });
};

export const getActiveExamTypes = () => {
    return client.get(`${BASE_URL}/exam-types/active/`);
};

export const createExamType = (data) => {
    return client.post(`${BASE_URL}/exam-types/`, data);
};

// Examinations
export const getExaminations = (params) => {
    return client.get(`${BASE_URL}/examinations/`, { params });
};

export const getExaminationById = (id) => {
    return client.get(`${BASE_URL}/examinations/${id}/`);
};

export const createExamination = (data) => {
    return client.post(`${BASE_URL}/examinations/`, data);
};

export const updateExamination = (id, data) => {
    return client.put(`${BASE_URL}/examinations/${id}/`, data);
};

export const deleteExamination = (id) => {
    return client.delete(`${BASE_URL}/examinations/${id}/`);
};

export const publishResults = (id) => {
    return client.post(`${BASE_URL}/examinations/${id}/publish_results/`);
};

export const unpublishResults = (id) => {
    return client.post(`${BASE_URL}/examinations/${id}/unpublish_results/`);
};

export const getExamStatistics = (id) => {
    return client.get(`${BASE_URL}/examinations/${id}/statistics/`);
};

// Exam Schedules
export const getExamSchedules = (params) => {
    return client.get(`${BASE_URL}/schedules/`, { params });
};

export const getExamScheduleById = (id) => {
    return client.get(`${BASE_URL}/schedules/${id}/`);
};

export const createExamSchedule = (data) => {
    return client.post(`${BASE_URL}/schedules/`, data);
};

export const updateExamSchedule = (id, data) => {
    return client.put(`${BASE_URL}/schedules/${id}/`, data);
};

export const deleteExamSchedule = (id) => {
    return client.delete(`${BASE_URL}/schedules/${id}/`);
};

export const getSchedulesByClass = (params) => {
    return client.get(`${BASE_URL}/schedules/by_class/`, { params });
};

// Student Marks
export const getStudentMarks = (params) => {
    return client.get(`${BASE_URL}/marks/`, { params });
};

export const getStudentMarkById = (id) => {
    return client.get(`${BASE_URL}/marks/${id}/`);
};

export const createStudentMark = (data) => {
    return client.post(`${BASE_URL}/marks/`, data);
};

export const updateStudentMark = (id, data) => {
    return client.put(`${BASE_URL}/marks/${id}/`, data);
};

export const deleteStudentMark = (id) => {
    return client.delete(`${BASE_URL}/marks/${id}/`);
};

export const bulkMarkEntry = (data) => {
    return client.post(`${BASE_URL}/marks/bulk_entry/`, data);
};

export const getMarksByStudent = (params) => {
    return client.get(`${BASE_URL}/marks/by_student/`, { params });
};

// Exam Results
export const getExamResults = (params) => {
    return client.get(`${BASE_URL}/results/`, { params });
};

export const getExamResultById = (id) => {
    return client.get(`${BASE_URL}/results/${id}/`);
};

export const createExamResult = (data) => {
    return client.post(`${BASE_URL}/results/`, data);
};

export const updateExamResult = (id, data) => {
    return client.put(`${BASE_URL}/results/${id}/`, data);
};

export const deleteExamResult = (id) => {
    return client.delete(`${BASE_URL}/results/${id}/`);
};

export const recalculateResult = (id) => {
    return client.post(`${BASE_URL}/results/${id}/recalculate/`);
};

export const calculateRanks = (params) => {
    return client.post(`${BASE_URL}/results/calculate_ranks/`, null, { params });
};

export const getClassResults = (params) => {
    return client.get(`${BASE_URL}/results/class_results/`, { params });
};

export const getMyResults = () => {
    return client.get(`${BASE_URL}/results/my_results/`);
};

// Report Card Templates
export const getReportCardTemplates = (params) => {
    return client.get(`${BASE_URL}/report-card-templates/`, { params });
};

export const getReportCardTemplateById = (id) => {
    return client.get(`${BASE_URL}/report-card-templates/${id}/`);
};

export const createReportCardTemplate = (data) => {
    return client.post(`${BASE_URL}/report-card-templates/`, data);
};

export const updateReportCardTemplate = (id, data) => {
    return client.put(`${BASE_URL}/report-card-templates/${id}/`, data);
};

export const deleteReportCardTemplate = (id) => {
    return client.delete(`${BASE_URL}/report-card-templates/${id}/`);
};

// Report Cards
export const getReportCards = (params) => {
    return client.get(`${BASE_URL}/report-cards/`, { params });
};

export const getReportCardById = (id) => {
    return client.get(`${BASE_URL}/report-cards/${id}/`);
};

export const generateReportCard = (data) => {
    return client.post(`${BASE_URL}/report-cards/generate/`, data);
};

export const generateBulkReportCards = (data) => {
    return client.post(`${BASE_URL}/report-cards/generate_bulk/`, data);
};

export const downloadReportCardPdf = (id) => {
    return client.get(`${BASE_URL}/report-cards/${id}/download_pdf/`, {
        responseType: 'blob'
    });
};

export const getMyReportCards = () => {
    return client.get(`${BASE_URL}/report-cards/my_report_cards/`);
};

// ============================================================================
// AI EXAM SCHEDULER (ENTERPRISE)
// ============================================================================

// Exam Halls
export const getExamHalls = (params) => {
    return client.get(`${BASE_URL}/exam-halls/`, { params });
};

export const getAvailableExamHalls = () => {
    return client.get(`${BASE_URL}/exam-halls/available/`);
};

export const createExamHall = (data) => {
    return client.post(`${BASE_URL}/exam-halls/`, data);
};

export const updateExamHall = (id, data) => {
    return client.put(`${BASE_URL}/exam-halls/${id}/`, data);
};

export const deleteExamHall = (id) => {
    return client.delete(`${BASE_URL}/exam-halls/${id}/`);
};

// Exam Schedule Configs
export const getExamScheduleConfigs = (params) => {
    return client.get(`${BASE_URL}/exam-schedule-configs/`, { params });
};

export const getExamScheduleConfigById = (id) => {
    return client.get(`${BASE_URL}/exam-schedule-configs/${id}/`);
};

export const createExamScheduleConfig = (data) => {
    return client.post(`${BASE_URL}/exam-schedule-configs/`, data);
};

export const updateExamScheduleConfig = (id, data) => {
    return client.put(`${BASE_URL}/exam-schedule-configs/${id}/`, data);
};

export const deleteExamScheduleConfig = (id) => {
    return client.delete(`${BASE_URL}/exam-schedule-configs/${id}/`);
};

export const triggerExamScheduleGeneration = (configId) => {
    return client.post(`${BASE_URL}/exam-schedule-configs/${configId}/generate/`);
};

export const getExamScheduleConfigRuns = (configId) => {
    return client.get(`${BASE_URL}/exam-schedule-configs/${configId}/runs/`);
};

// Exam Schedule Runs
export const getExamScheduleRuns = (params) => {
    return client.get(`${BASE_URL}/exam-schedule-runs/`, { params });
};

export const getExamScheduleRunById = (id) => {
    return client.get(`${BASE_URL}/exam-schedule-runs/${id}/`);
};

export const getExamScheduleRunProgress = (id) => {
    return client.get(`${BASE_URL}/exam-schedule-runs/${id}/progress/`);
};

export const applyExamScheduleRun = (id) => {
    return client.post(`${BASE_URL}/exam-schedule-runs/${id}/apply/`);
};

export const rollbackExamScheduleRun = (id) => {
    return client.post(`${BASE_URL}/exam-schedule-runs/${id}/rollback/`);
};
