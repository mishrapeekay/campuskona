import client from './client';

const BASE_URL = '/assignments';

// Assignments
export const getAssignments = (params) => client.get(`${BASE_URL}/assignments/`, { params });
export const getAssignmentById = (id) => client.get(`${BASE_URL}/assignments/${id}/`);
export const createAssignment = (data) => {
  if (data instanceof FormData) {
    return client.post(`${BASE_URL}/assignments/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return client.post(`${BASE_URL}/assignments/`, data);
};
export const updateAssignment = (id, data) => client.put(`${BASE_URL}/assignments/${id}/`, data);
export const deleteAssignment = (id) => client.delete(`${BASE_URL}/assignments/${id}/`);

// Submissions
export const getSubmissions = (params) => client.get(`${BASE_URL}/submissions/`, { params });
export const getSubmissionById = (id) => client.get(`${BASE_URL}/submissions/${id}/`);
export const createSubmission = (data) =>
  client.post(`${BASE_URL}/submissions/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const gradeSubmission = (id, data) => client.post(`${BASE_URL}/submissions/${id}/grade/`, data);
