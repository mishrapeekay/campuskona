import apiClient from './client';

const HOUSES_ENDPOINT = '/houses';

export const housesAPI = {
    // Houses
    getHouses: (params = {}) => apiClient.get(`${HOUSES_ENDPOINT}/houses/`, { params }),
    getHouseDetails: (id) => apiClient.get(`${HOUSES_ENDPOINT}/houses/${id}/`),
    getHouseLeaderboard: (id) => apiClient.get(`${HOUSES_ENDPOINT}/houses/${id}/leaderboard/`),

    // Memberships
    getMemberships: (params = {}) => apiClient.get(`${HOUSES_ENDPOINT}/memberships/`, { params }),
    updateMembership: (id, data) => apiClient.patch(`${HOUSES_ENDPOINT}/memberships/${id}/`, data),

    // Points
    getPointLogs: (params = {}) => apiClient.get(`${HOUSES_ENDPOINT}/points/`, { params }),
    awardPoints: (data) => apiClient.post(`${HOUSES_ENDPOINT}/points/`, data),
    getStudentPointHistory: (studentId) => apiClient.get(`${HOUSES_ENDPOINT}/points/student_history/`, { params: { student_id: studentId } }),
};

export default housesAPI;
