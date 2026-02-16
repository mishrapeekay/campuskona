import apiClient from './client';
import {
  Student,
  StudentDocument,
  StudentParent,
  StudentHealthRecord,
  StudentEnrollment,
} from '@/types/models';
import { PaginatedResponse, QueryParams } from '@/types/api';

class StudentService {
  /**
   * Get list of students with pagination and filters
   */
  async getStudents(params?: QueryParams): Promise<PaginatedResponse<Student>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<Student>>(`/students/students/${queryString}`);
  }

  /**
   * Get student by ID
   */
  async getStudent(id: string): Promise<Student> {
    return apiClient.get<Student>(`/students/students/${id}/`);
  }

  /**
   * Create new student
   */
  async createStudent(data: Partial<Student>): Promise<Student> {
    return apiClient.post<Student>('/students/students/', data);
  }

  /**
   * Update student
   */
  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    return apiClient.patch<Student>(`/students/students/${id}/`, data);
  }

  /**
   * Delete student (soft delete)
   */
  async deleteStudent(id: string): Promise<void> {
    return apiClient.delete(`/students/students/${id}/`);
  }

  /**
   * Get student documents
   */
  async getStudentDocuments(studentId: string): Promise<StudentDocument[]> {
    return apiClient.get<StudentDocument[]>(`/students/documents/?student=${studentId}`);
  }

  /**
   * Upload student document
   */
  async uploadDocument(studentId: string, file: any, documentType: string): Promise<StudentDocument> {
    return apiClient.uploadFile<StudentDocument>('/students/documents/', file, {
      student: studentId,
      document_type: documentType,
    });
  }

  /**
   * Delete student document
   */
  async deleteDocument(documentId: string): Promise<void> {
    return apiClient.delete(`/students/documents/${documentId}/`);
  }

  /**
   * Get student parents
   */
  async getStudentParents(studentId: string): Promise<StudentParent[]> {
    return apiClient.get<StudentParent[]>(`/students/parents/?student=${studentId}`);
  }

  /**
   * Link parent to student
   */
  async linkParent(data: Partial<StudentParent>): Promise<StudentParent> {
    return apiClient.post<StudentParent>('/students/parents/', data);
  }

  /**
   * Get student health records
   */
  async getHealthRecords(studentId: string): Promise<StudentHealthRecord[]> {
    return apiClient.get<StudentHealthRecord[]>(`/students/health-records/?student=${studentId}`);
  }

  /**
   * Create health record
   */
  async createHealthRecord(data: Partial<StudentHealthRecord>): Promise<StudentHealthRecord> {
    return apiClient.post<StudentHealthRecord>('/students/health-records/', data);
  }

  /**
   * Update health record
   */
  async updateHealthRecord(id: string, data: Partial<StudentHealthRecord>): Promise<StudentHealthRecord> {
    return apiClient.patch<StudentHealthRecord>(`/students/health-records/${id}/`, data);
  }

  /**
   * Get student enrollment
   */
  async getStudentEnrollment(studentId: string): Promise<StudentEnrollment[]> {
    return apiClient.get<StudentEnrollment[]>(`/academics/enrollments/?student=${studentId}`);
  }

  /**
   * Search students
   */
  async searchStudents(query: string): Promise<Student[]> {
    const response = await apiClient.get<PaginatedResponse<Student>>(`/students/students/?search=${query}`);
    return response.results;
  }

  /**
   * Get students by class
   */
  async getStudentsByClass(classId: string): Promise<Student[]> {
    const enrollments = await apiClient.get<PaginatedResponse<StudentEnrollment>>(
      `/academics/enrollments/?class_id=${classId}&is_active=true`
    );

    const studentIds = enrollments.results.map(e => e.student);
    const students: Student[] = [];

    for (const studentId of studentIds) {
      const student = await this.getStudent(studentId);
      students.push(student);
    }

    return students;
  }
  /**
   * Get student notes
   */
  async getStudentNotes(studentId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/students/notes/?student=${studentId}`);
  }

  /**
   * Create student note (for teachers/admins)
   */
  async createStudentNote(data: {
    student: string;
    note_type: 'ACADEMIC' | 'BEHAVIORAL' | 'DISCIPLINARY' | 'ACHIEVEMENT' | 'CONCERN' | 'GENERAL';
    title: string;
    content: string;
    is_confidential?: boolean;
  }): Promise<any> {
    return apiClient.post<any>('/students/notes/', data);
  }

  /**
   * Update student note
   */
  async updateStudentNote(noteId: string, data: Partial<{
    note_type: string;
    title: string;
    content: string;
    is_confidential: boolean;
  }>): Promise<any> {
    return apiClient.patch<any>(`/students/notes/${noteId}/`, data);
  }

  /**
   * Delete student note
   */
  async deleteStudentNote(noteId: string): Promise<void> {
    return apiClient.delete(`/students/notes/${noteId}/`);
  }

  /**
   * Get children/wards for a parent
   */
  async getWards(parentId?: string): Promise<Student[]> {
    // If parentId is not provided, backend should infer from current user 'me' context if endpoint supports it.
    // Or we can filter students by parent_id if we have it.
    const queryString = parentId ? `?parent=${parentId}` : '';
    // Assuming a dedicated endpoint or filter exists. 
    // If the backend is standard Django Rest Framework with filters:
    return (await apiClient.get<PaginatedResponse<Student>>(`/students/students/${queryString}`)).results;
  }
}

export const studentService = new StudentService();
export default studentService;
