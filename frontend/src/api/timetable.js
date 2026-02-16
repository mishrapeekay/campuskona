import client from './client';

const BASE_URL = '/timetable';

// Time Slots
export const getTimeSlots = (params) => {
    return client.get(`${BASE_URL}/time-slots/`, { params });
};

export const getTimeSlotById = (id) => {
    return client.get(`${BASE_URL}/time-slots/${id}/`);
};

export const createTimeSlot = (data) => {
    return client.post(`${BASE_URL}/time-slots/`, data);
};

export const updateTimeSlot = (id, data) => {
    return client.put(`${BASE_URL}/time-slots/${id}/`, data);
};

export const deleteTimeSlot = (id) => {
    return client.delete(`${BASE_URL}/time-slots/${id}/`);
};

export const getActiveTimeSlots = () => {
    return client.get(`${BASE_URL}/time-slots/active/`);
};

export const getPeriodsOnly = () => {
    return client.get(`${BASE_URL}/time-slots/periods_only/`);
};

// Class Timetable
export const getClassTimetable = (params) => {
    return client.get(`${BASE_URL}/class-timetable/`, { params });
};

export const getClassTimetableById = (id) => {
    return client.get(`${BASE_URL}/class-timetable/${id}/`);
};

export const createClassTimetable = (data) => {
    return client.post(`${BASE_URL}/class-timetable/`, data);
};

export const updateClassTimetable = (id, data) => {
    return client.put(`${BASE_URL}/class-timetable/${id}/`, data);
};

export const deleteClassTimetable = (id) => {
    return client.delete(`${BASE_URL}/class-timetable/${id}/`);
};

export const getWeeklyTimetable = (params) => {
    return client.get(`${BASE_URL}/class-timetable/weekly_view/`, { params });
};

export const createBulkTimetable = (data) => {
    return client.post(`${BASE_URL}/class-timetable/bulk_create/`, data);
};

export const checkConflicts = (params) => {
    return client.get(`${BASE_URL}/class-timetable/check_conflicts/`, { params });
};

// Teacher Timetable
export const getTeacherTimetable = (params) => {
    return client.get(`${BASE_URL}/teacher-timetable/`, { params });
};

export const getTeacherTimetableById = (id) => {
    return client.get(`${BASE_URL}/teacher-timetable/${id}/`);
};

export const createTeacherTimetable = (data) => {
    return client.post(`${BASE_URL}/teacher-timetable/`, data);
};

export const updateTeacherTimetable = (id, data) => {
    return client.put(`${BASE_URL}/teacher-timetable/${id}/`, data);
};

export const deleteTeacherTimetable = (id) => {
    return client.delete(`${BASE_URL}/teacher-timetable/${id}/`);
};

export const getMyTimetable = () => {
    return client.get(`${BASE_URL}/teacher-timetable/my_timetable/`);
};

// Substitutions
export const getSubstitutions = (params) => {
    return client.get(`${BASE_URL}/substitutions/`, { params });
};

export const getSubstitutionById = (id) => {
    return client.get(`${BASE_URL}/substitutions/${id}/`);
};

export const createSubstitution = (data) => {
    return client.post(`${BASE_URL}/substitutions/`, data);
};

export const updateSubstitution = (id, data) => {
    return client.put(`${BASE_URL}/substitutions/${id}/`, data);
};

export const deleteSubstitution = (id) => {
    return client.delete(`${BASE_URL}/substitutions/${id}/`);
};

export const approveSubstitution = (id, remarks = '') => {
    return client.post(`${BASE_URL}/substitutions/${id}/approve/`, {
        action: 'approve',
        remarks
    });
};

export const rejectSubstitution = (id, remarks = '') => {
    return client.post(`${BASE_URL}/substitutions/${id}/reject/`, {
        action: 'reject',
        remarks
    });
};

export const getPendingSubstitutions = () => {
    return client.get(`${BASE_URL}/substitutions/pending/`);
};

// Rooms
export const getRooms = (params) => {
    return client.get(`${BASE_URL}/rooms/`, { params });
};

export const getRoomById = (id) => {
    return client.get(`${BASE_URL}/rooms/${id}/`);
};

export const createRoom = (data) => {
    return client.post(`${BASE_URL}/rooms/`, data);
};

export const updateRoom = (id, data) => {
    return client.put(`${BASE_URL}/rooms/${id}/`, data);
};

export const deleteRoom = (id) => {
    return client.delete(`${BASE_URL}/rooms/${id}/`);
};

export const getAvailableRooms = () => {
    return client.get(`${BASE_URL}/rooms/available/`);
};

// Templates
export const getTemplates = (params) => {
    return client.get(`${BASE_URL}/templates/`, { params });
};

export const getTemplateById = (id) => {
    return client.get(`${BASE_URL}/templates/${id}/`);
};

export const createTemplate = (data) => {
    return client.post(`${BASE_URL}/templates/`, data);
};

export const updateTemplate = (id, data) => {
    return client.put(`${BASE_URL}/templates/${id}/`, data);
};

export const deleteTemplate = (id) => {
    return client.delete(`${BASE_URL}/templates/${id}/`);
};

export const applyTemplate = (id, data) => {
    return client.post(`${BASE_URL}/templates/${id}/apply_template/`, data);
};
