import client from './client'

const BASE_URL = '/students/parent-portal'

export const getParentDashboard = (studentId) => {
    const params = studentId ? { student_id: studentId } : {}
    return client.get(`${BASE_URL}/dashboard/`, { params })
}

export const getChildAttendance = (studentId, month, year) => {
    return client.get(`${BASE_URL}/attendance/`, {
        params: { student_id: studentId, month, year }
    })
}

export const getChildResults = (studentId) => {
    return client.get(`${BASE_URL}/results/`, {
        params: { student_id: studentId }
    })
}

export const getChildFees = (studentId) => {
    return client.get(`${BASE_URL}/fees/`, {
        params: { student_id: studentId }
    })
}

export const getChildTimetable = (studentId) => {
    return client.get(`${BASE_URL}/timetable/`, {
        params: { student_id: studentId }
    })
}
