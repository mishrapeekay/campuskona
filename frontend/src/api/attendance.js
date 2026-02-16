import client from './client';

const BASE_URL = '/attendance';

// Attendance Periods
export const getAttendancePeriods = (params) => {
    return client.get(`${BASE_URL}/periods/`, { params });
};

export const getActivePeriods = () => {
    return client.get(`${BASE_URL}/periods/active/`);
};

// Student Attendance
export const getStudentAttendance = (params) => {
    return client.get(`${BASE_URL}/student-attendance/`, { params });
};

export const getStudentAttendanceById = (id) => {
    return client.get(`${BASE_URL}/student-attendance/${id}/`);
};

export const createStudentAttendance = (data) => {
    return client.post(`${BASE_URL}/student-attendance/`, data);
};

export const updateStudentAttendance = (id, data) => {
    return client.put(`${BASE_URL}/student-attendance/${id}/`, data);
};

export const deleteStudentAttendance = (id) => {
    return client.delete(`${BASE_URL}/student-attendance/${id}/`);
};

export const markBulkAttendance = (data) => {
    return client.post(`${BASE_URL}/student-attendance/mark_bulk/`, data);
};

export const getClassAttendance = (params) => {
    return client.get(`${BASE_URL}/student-attendance/class_attendance/`, { params });
};

export const getStudentAttendanceSummary = (params) => {
    return client.get(`${BASE_URL}/student-attendance/student_summary/`, { params });
};

export const exportAttendanceReport = (data) => {
    return client.post(`${BASE_URL}/student-attendance/export_report/`, data);
};

// Staff Attendance
export const getStaffAttendance = (params) => {
    return client.get(`${BASE_URL}/staff-attendance/`, { params });
};

export const createStaffAttendance = (data) => {
    return client.post(`${BASE_URL}/staff-attendance/`, data);
};

export const getStaffAttendanceSummary = (params) => {
    return client.get(`${BASE_URL}/staff-attendance/summary/`, { params });
};

// Student Leaves
export const getStudentLeaves = (params) => {
    return client.get(`${BASE_URL}/student-leaves/`, { params });
};

export const getStudentLeaveById = (id) => {
    return client.get(`${BASE_URL}/student-leaves/${id}/`);
};

export const createStudentLeave = (data) => {
    return client.post(`${BASE_URL}/student-leaves/`, data);
};

export const updateStudentLeave = (id, data) => {
    return client.put(`${BASE_URL}/student-leaves/${id}/`, data);
};

export const deleteStudentLeave = (id) => {
    return client.delete(`${BASE_URL}/student-leaves/${id}/`);
};

export const approveStudentLeave = (id, remarks = '') => {
    return client.post(`${BASE_URL}/student-leaves/${id}/approve/`, {
        action: 'approve',
        remarks
    });
};

export const rejectStudentLeave = (id, remarks = '') => {
    return client.post(`${BASE_URL}/student-leaves/${id}/reject/`, {
        action: 'reject',
        remarks
    });
};

export const getPendingStudentLeaves = () => {
    return client.get(`${BASE_URL}/student-leaves/pending/`);
};

// Staff Leaves
export const getStaffLeaves = (params) => {
    return client.get(`${BASE_URL}/staff-leaves/`, { params });
};

export const createStaffLeave = (data) => {
    return client.post(`${BASE_URL}/staff-leaves/`, data);
};

export const approveStaffLeave = (id, remarks = '') => {
    return client.post(`${BASE_URL}/staff-leaves/${id}/approve/`, {
        action: 'approve',
        remarks
    });
};

export const rejectStaffLeave = (id, remarks = '') => {
    return client.post(`${BASE_URL}/staff-leaves/${id}/reject/`, {
        action: 'reject',
        remarks
    });
};

export const getPendingStaffLeaves = () => {
    return client.get(`${BASE_URL}/staff-leaves/pending/`);
};

// Holidays
export const getHolidays = (params) => {
    return client.get(`${BASE_URL}/holidays/`, { params });
};

export const getHolidayById = (id) => {
    return client.get(`${BASE_URL}/holidays/${id}/`);
};

export const createHoliday = (data) => {
    return client.post(`${BASE_URL}/holidays/`, data);
};

export const updateHoliday = (id, data) => {
    return client.put(`${BASE_URL}/holidays/${id}/`, data);
};

export const deleteHoliday = (id) => {
    return client.delete(`${BASE_URL}/holidays/${id}/`);
};

export const getUpcomingHolidays = () => {
    return client.get(`${BASE_URL}/holidays/upcoming/`);
};

// Attendance Summary
export const getAttendanceSummary = (params) => {
    return client.get(`${BASE_URL}/summaries/`, { params });
};

export const recalculateSummary = (id) => {
    return client.post(`${BASE_URL}/summaries/${id}/recalculate/`);
};

export const getDefaulters = (params) => {
    return client.get(`${BASE_URL}/summaries/defaulters/`, { params });
};
