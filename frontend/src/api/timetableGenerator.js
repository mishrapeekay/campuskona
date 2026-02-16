import client from './client';

const BASE_URL = '/timetable';

// ============================================================================
// SUBJECT PERIOD REQUIREMENTS
// ============================================================================

export const getSubjectRequirements = (params) => {
    return client.get(`${BASE_URL}/subject-requirements/`, { params });
};

export const getSubjectRequirementById = (id) => {
    return client.get(`${BASE_URL}/subject-requirements/${id}/`);
};

export const createSubjectRequirement = (data) => {
    return client.post(`${BASE_URL}/subject-requirements/`, data);
};

export const updateSubjectRequirement = (id, data) => {
    return client.put(`${BASE_URL}/subject-requirements/${id}/`, data);
};

export const deleteSubjectRequirement = (id) => {
    return client.delete(`${BASE_URL}/subject-requirements/${id}/`);
};

export const bulkCreateSubjectRequirements = (data) => {
    return client.post(`${BASE_URL}/subject-requirements/bulk_create/`, data);
};

// ============================================================================
// TEACHER AVAILABILITY
// ============================================================================

export const getTeacherAvailability = (params) => {
    return client.get(`${BASE_URL}/teacher-availability/`, { params });
};

export const createTeacherAvailability = (data) => {
    return client.post(`${BASE_URL}/teacher-availability/`, data);
};

export const updateTeacherAvailability = (id, data) => {
    return client.put(`${BASE_URL}/teacher-availability/${id}/`, data);
};

export const deleteTeacherAvailability = (id) => {
    return client.delete(`${BASE_URL}/teacher-availability/${id}/`);
};

export const bulkSetTeacherAvailability = (data) => {
    return client.post(`${BASE_URL}/teacher-availability/bulk_set/`, data);
};

// ============================================================================
// GENERATION CONFIGS
// ============================================================================

export const getGenerationConfigs = (params) => {
    return client.get(`${BASE_URL}/generation-configs/`, { params });
};

export const getGenerationConfigById = (id) => {
    return client.get(`${BASE_URL}/generation-configs/${id}/`);
};

export const createGenerationConfig = (data) => {
    return client.post(`${BASE_URL}/generation-configs/`, data);
};

export const updateGenerationConfig = (id, data) => {
    return client.patch(`${BASE_URL}/generation-configs/${id}/`, data);
};

export const deleteGenerationConfig = (id) => {
    return client.delete(`${BASE_URL}/generation-configs/${id}/`);
};

// ============================================================================
// GENERATION RUNS
// ============================================================================

export const getGenerationRuns = (params) => {
    return client.get(`${BASE_URL}/generation-runs/`, { params });
};

export const getGenerationRunById = (id) => {
    return client.get(`${BASE_URL}/generation-runs/${id}/`);
};

export const triggerGeneration = (configId) => {
    return client.post(`${BASE_URL}/generation-runs/`, { config_id: configId });
};

export const getGenerationProgress = (id) => {
    return client.get(`${BASE_URL}/generation-runs/${id}/progress/`);
};

export const getGenerationPreview = (id) => {
    return client.get(`${BASE_URL}/generation-runs/${id}/preview/`);
};

export const applyGeneration = (id) => {
    return client.post(`${BASE_URL}/generation-runs/${id}/apply/`);
};

export const rollbackGeneration = (id) => {
    return client.post(`${BASE_URL}/generation-runs/${id}/rollback/`);
};

export const getGenerationAnalysis = (id) => {
    return client.get(`${BASE_URL}/generation-runs/${id}/analysis/`);
};

export const cancelGeneration = (id) => {
    return client.post(`${BASE_URL}/generation-runs/${id}/cancel/`);
};
