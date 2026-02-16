import apiClient from './client';

export const getQuestions = (params = {}) => {
    return apiClient.get('/ai-questions/bank/', { params });
};

export const generateQuestions = (data) => {
    return apiClient.post('/ai-questions/bank/generate/', data);
};

export const bulkSaveQuestions = (questions) => {
    return apiClient.post('/ai-questions/bank/bulk-save/', { questions });
};
