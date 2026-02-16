import client from './client';

const BASE_URL = '/library';

// Books
export const getBooks = (params) => client.get(`${BASE_URL}/books/`, { params });
export const createBook = (data) => client.post(`${BASE_URL}/books/`, data);
export const updateBook = (id, data) => client.put(`${BASE_URL}/books/${id}/`, data);
export const deleteBook = (id) => client.delete(`${BASE_URL}/books/${id}/`);

// Issues
export const getIssues = (params) => client.get(`${BASE_URL}/issues/`, { params });
export const issueBook = (bookId, studentId) => client.post(`${BASE_URL}/books/${bookId}/issue/`, { student: studentId });
export const returnBook = (issueId) => client.post(`${BASE_URL}/issues/${issueId}/return_book/`);

// Metadata
export const getDashboardStats = () => client.get(`${BASE_URL}/issues/dashboard_stats/`);
export const getAuthors = () => client.get(`${BASE_URL}/authors/`);
export const getCategories = () => client.get(`${BASE_URL}/categories/`);
