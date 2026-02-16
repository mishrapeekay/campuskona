import client from './client';

const BASE_URL = '/communication';

// Notices
export const getNotices = (params) => {
    return client.get(`${BASE_URL}/notices/`, { params });
};

export const createNotice = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (key === 'specific_classes' && Array.isArray(data[key])) {
            data[key].forEach(id => formData.append('specific_classes', id));
        } else if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });
    return client.post(`${BASE_URL}/notices/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const deleteNotice = (id) => {
    return client.delete(`${BASE_URL}/notices/${id}/`);
};

// Events
export const getEvents = (params) => {
    return client.get(`${BASE_URL}/events/`, { params });
};

export const createEvent = (data) => {
    return client.post(`${BASE_URL}/events/`, data);
};

export const deleteEvent = (id) => {
    return client.delete(`${BASE_URL}/events/${id}/`);
};

// Notifications
export const getNotifications = () => {
    return client.get(`${BASE_URL}/notifications/`);
};

export const markNotificationRead = (id) => {
    return client.post(`${BASE_URL}/notifications/${id}/mark_read/`);
};

export const markAllNotificationsRead = () => {
    return client.post(`${BASE_URL}/notifications/mark_all_read/`);
};
