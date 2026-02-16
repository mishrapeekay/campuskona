import client from './client'

export const fetchLessonPlans = (params = {}) => {
    return client.get('/academics/lesson-plans/', { params })
}

export const fetchLessonPlanById = (id) => {
    return client.get(`/academics/lesson-plans/${id}/`)
}

export const createLessonPlan = (data) => {
    return client.post('/academics/lesson-plans/', data)
}

export const updateLessonPlan = (id, data) => {
    return client.put(`/academics/lesson-plans/${id}/`, data)
}

export const deleteLessonPlan = (id) => {
    return client.delete(`/academics/lesson-plans/${id}/`)
}

export const fetchSyllabusUnits = (params = {}) => {
    return client.get('/academics/syllabus-units/', { params })
}

export const fetchSyllabusCoverage = (params = {}) => {
    return client.get('/academics/syllabus-units/coverage/', { params })
}
