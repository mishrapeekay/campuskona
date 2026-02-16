import apiClient from './client';

const ACTIVITIES_ENDPOINT = '/activities';

export const activitiesAPI = {
    // Clubs
    getClubs: (params = {}) => apiClient.get(`${ACTIVITIES_ENDPOINT}/clubs/`, { params }),
    getClubDetails: (id) => apiClient.get(`${ACTIVITIES_ENDPOINT}/clubs/${id}/`),
    getClubMembers: (id) => apiClient.get(`${ACTIVITIES_ENDPOINT}/clubs/${id}/members/`),

    // Memberships
    getMemberships: (params = {}) => apiClient.get(`${ACTIVITIES_ENDPOINT}/memberships/`, { params }),
    joinClub: (data) => apiClient.post(`${ACTIVITIES_ENDPOINT}/memberships/`, data),

    // Activities
    getClubActivities: (params = {}) => apiClient.get(`${ACTIVITIES_ENDPOINT}/activities/`, { params }),
    createActivity: (data) => apiClient.post(`${ACTIVITIES_ENDPOINT}/activities/`, data),
    markAttendance: (id, attendanceData) => apiClient.post(`${ACTIVITIES_ENDPOINT}/activities/${id}/mark_attendance/`, { attendance: attendanceData }),
};

export default activitiesAPI;
