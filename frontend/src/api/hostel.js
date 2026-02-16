import apiClient, { buildQueryString } from './client';

const HOSTEL_ENDPOINT = '/hostel/hostels';
const ROOM_ENDPOINT = '/hostel/rooms';
const ALLOCATION_ENDPOINT = '/hostel/allocations';
const ATTENDANCE_ENDPOINT = '/hostel/attendance';
const MENU_ENDPOINT = '/hostel/mess-menu';
const COMPLAINT_ENDPOINT = '/hostel/complaints';
const VISITOR_ENDPOINT = '/hostel/visitors';

// ── Hostels ──

export const getHostels = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${HOSTEL_ENDPOINT}/?${queryString}`);
};

export const getHostelById = (id) => apiClient.get(`${HOSTEL_ENDPOINT}/${id}/`);
export const createHostel = (data) => apiClient.post(`${HOSTEL_ENDPOINT}/`, data);
export const updateHostel = (id, data) => apiClient.patch(`${HOSTEL_ENDPOINT}/${id}/`, data);
export const deleteHostel = (id) => apiClient.delete(`${HOSTEL_ENDPOINT}/${id}/`);
export const getDashboardStats = () => apiClient.get(`${HOSTEL_ENDPOINT}/dashboard_stats/`);

// ── Rooms ──

export const getRooms = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${ROOM_ENDPOINT}/?${queryString}`);
};

export const getRoomById = (id) => apiClient.get(`${ROOM_ENDPOINT}/${id}/`);
export const createRoom = (data) => apiClient.post(`${ROOM_ENDPOINT}/`, data);
export const updateRoom = (id, data) => apiClient.patch(`${ROOM_ENDPOINT}/${id}/`, data);
export const deleteRoom = (id) => apiClient.delete(`${ROOM_ENDPOINT}/${id}/`);

// ── Room Allocations ──

export const getAllocations = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${ALLOCATION_ENDPOINT}/?${queryString}`);
};

export const createAllocation = (data) => apiClient.post(`${ALLOCATION_ENDPOINT}/`, data);
export const vacateAllocation = (id) => apiClient.post(`${ALLOCATION_ENDPOINT}/${id}/vacate/`);

// ── Attendance ──

export const getHostelAttendance = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${ATTENDANCE_ENDPOINT}/?${queryString}`);
};

export const bulkMarkAttendance = (data) => apiClient.post(`${ATTENDANCE_ENDPOINT}/bulk_mark/`, data);

export const getAttendanceSummary = (hostelId, date) =>
    apiClient.get(`${ATTENDANCE_ENDPOINT}/summary/?hostel=${hostelId}&date=${date}`);

// ── Mess Menu ──

export const getMessMenus = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${MENU_ENDPOINT}/?${queryString}`);
};

export const createMessMenu = (data) => apiClient.post(`${MENU_ENDPOINT}/`, data);
export const updateMessMenu = (id, data) => apiClient.patch(`${MENU_ENDPOINT}/${id}/`, data);
export const deleteMessMenu = (id) => apiClient.delete(`${MENU_ENDPOINT}/${id}/`);

// ── Complaints ──

export const getComplaints = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${COMPLAINT_ENDPOINT}/?${queryString}`);
};

export const createComplaint = (data) => apiClient.post(`${COMPLAINT_ENDPOINT}/`, data);
export const resolveComplaint = (id, data) => apiClient.post(`${COMPLAINT_ENDPOINT}/${id}/resolve/`, data);

// ── Visitors ──

export const getVisitors = (params = {}) => {
    const queryString = buildQueryString(params);
    return apiClient.get(`${VISITOR_ENDPOINT}/?${queryString}`);
};

export const createVisitor = (data) => apiClient.post(`${VISITOR_ENDPOINT}/`, data);
export const checkoutVisitor = (id) => apiClient.post(`${VISITOR_ENDPOINT}/${id}/checkout/`);
