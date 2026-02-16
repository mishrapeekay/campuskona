import api from './client';
import { PaginatedResponse } from '@/types/api';

export interface Assignment {
    id: string;
    title: string;
    description: string;
    subject: string;
    subject_details?: any;
    section: string;
    section_details?: any;
    teacher: string;
    teacher_details?: any;
    due_date: string;
    max_marks: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    attachment?: string;
    submission_count?: number;
    is_late?: boolean;
}

export interface Submission {
    id: string;
    assignment: string;
    assignment_details?: Assignment;
    student: string;
    student_details?: any;
    submission_date: string;
    status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE' | 'RETURNED';
    student_notes?: string;
    submission_file?: string;
    marks_obtained?: string;
    teacher_feedback?: string;
    graded_by?: string;
    graded_at?: string;
}

const assignmentService = {
    // Assignment endpoints
    getAssignments: (params?: any) => api.get<PaginatedResponse<Assignment>>('/assignments/assignments/', { params }),
    getAssignment: (id: string) => api.get<Assignment>(`/assignments/assignments/${id}/`),
    createAssignment: (data: any) => api.post<Assignment>('/assignments/assignments/', data),
    updateAssignment: (id: string, data: any) => api.put<Assignment>(`/assignments/assignments/${id}/`, data),
    deleteAssignment: (id: string) => api.delete(`/assignments/assignments/${id}/`),

    // Submission endpoints
    getSubmissions: (params?: any) => api.get<PaginatedResponse<Submission>>('/assignments/submissions/', { params }),
    getSubmission: (id: string) => api.get<Submission>(`/assignments/submissions/${id}/`),
    submitAssignment: (data: FormData) => api.post<Submission>('/assignments/submissions/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    gradeSubmission: (id: string, data: any) => api.post<Submission>(`/assignments/submissions/${id}/grade/`, data),
};

export default assignmentService;
