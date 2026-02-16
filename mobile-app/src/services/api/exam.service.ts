import apiClient from './client';
import offlineManager from '@/utils/offlineManager';
import { Exam, StudentMarks, Result, Grade, GradeScale, ExamType as ExamTypeModel, ExamSchedule } from '@/types/models';
import { PaginatedResponse, ExamQueryParams, QueryParams } from '@/types/api';

class ExamService {
  /**
   * Get list of exams
   */
  async getExams(params?: ExamQueryParams): Promise<PaginatedResponse<Exam>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<Exam>>(`/examinations/exams/${queryString}`);
  }

  /**
   * Get exam by ID
   */
  async getExam(id: string): Promise<Exam> {
    return apiClient.get<Exam>(`/examinations/exams/${id}/`);
  }

  /**
   * Get exam schedules
   */
  async getExamSchedules(params?: QueryParams): Promise<PaginatedResponse<ExamSchedule>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<ExamSchedule>>(`/examinations/schedules/${queryString}`);
  }

  /**
   * Create exam
   */
  async createExam(data: Partial<Exam>): Promise<Exam> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/examinations/exams/',
        method: 'POST',
        data,
      });
      return data as Exam;
    }
    return apiClient.post<Exam>('/examinations/exams/', data);
  }

  /**
   * Update exam
   */
  async updateExam(id: string, data: Partial<Exam>): Promise<Exam> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: `/examinations/exams/${id}/`,
        method: 'PATCH',
        data,
      });
      return { ...data, id } as Exam;
    }
    return apiClient.patch<Exam>(`/examinations/exams/${id}/`, data);
  }

  /**
   * Delete exam
   */
  async deleteExam(id: string): Promise<void> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: `/examinations/exams/${id}/`,
        method: 'DELETE',
      });
      return;
    }
    return apiClient.delete(`/examinations/exams/${id}/`);
  }

  /**
   * Get student marks
   */
  async getStudentMarks(params?: ExamQueryParams): Promise<PaginatedResponse<StudentMarks>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<StudentMarks>>(`/examinations/marks/${queryString}`);
  }

  /**
   * Enter student marks
   */
  async enterMarks(data: Partial<StudentMarks>): Promise<StudentMarks> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/examinations/marks/',
        method: 'POST',
        data,
      });
      return data as StudentMarks;
    }
    return apiClient.post<StudentMarks>('/examinations/marks/', data);
  }

  /**
   * Bulk enter marks
   */
  async bulkEnterMarks(marksData: Partial<StudentMarks>[]): Promise<StudentMarks[]> {
    const data = { marks: marksData };
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/examinations/marks/bulk/',
        method: 'POST',
        data,
      });
      return marksData as StudentMarks[];
    }
    return apiClient.post<StudentMarks[]>('/examinations/marks/bulk/', data);
  }

  /**
   * Update marks
   */
  async updateMarks(id: string, data: Partial<StudentMarks>): Promise<StudentMarks> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: `/examinations/marks/${id}/`,
        method: 'PATCH',
        data,
      });
      return { ...data, id } as StudentMarks;
    }
    return apiClient.patch<StudentMarks>(`/examinations/marks/${id}/`, data);
  }

  /**
   * Get student results
   */
  async getStudentResults(studentId: string, academicYearId?: string): Promise<Result[]> {
    const queryString = academicYearId
      ? `?student=${studentId}&academic_year=${academicYearId}`
      : `?student=${studentId}`;
    const response = await apiClient.get<PaginatedResponse<Result>>(`/examinations/results/${queryString}`);
    return response.results;
  }

  /**
   * Get result by ID
   */
  async getResult(id: string): Promise<Result> {
    return apiClient.get<Result>(`/examinations/results/${id}/`);
  }

  /**
   * Generate result
   */
  async generateResult(studentId: string, academicYearId: string): Promise<Result> {
    const data = {
      student: studentId,
      academic_year: academicYearId,
    };
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/examinations/results/',
        method: 'POST',
        data,
      });
      return data as Result;
    }
    return apiClient.post<Result>('/examinations/results/', data);
  }

  /**
   * Get grade scales
   */
  async getGradeScales(): Promise<GradeScale[]> {
    const response = await apiClient.get<PaginatedResponse<GradeScale>>('/examinations/grade-scales/');
    return response.results;
  }

  /**
   * Get grades for a scale
   */
  async getGrades(gradeScaleId: string): Promise<Grade[]> {
    const response = await apiClient.get<PaginatedResponse<Grade>>(
      `/examinations/grades/?grade_scale=${gradeScaleId}`
    );
    return response.results;
  }

  /**
   * Get exam types
   */
  async getExamTypes(): Promise<ExamTypeModel[]> {
    const response = await apiClient.get<PaginatedResponse<ExamTypeModel>>('/examinations/exam-types/');
    return response.results;
  }

  /**
   * Get student's exam history
   */
  async getStudentExamHistory(studentId: string): Promise<{
    exam: Exam;
    marks: StudentMarks[];
  }[]> {
    const marksResponse = await apiClient.get<PaginatedResponse<StudentMarks>>(
      `/examinations/marks/?student=${studentId}`
    );

    const examIds = [...new Set(marksResponse.results.map(m => m.exam))];
    const examHistory = [];

    for (const examId of examIds) {
      if (examId) {
        const exam = await this.getExam(examId);
        const examMarks = marksResponse.results.filter(m => m.exam === examId);
        examHistory.push({ exam, marks: examMarks });
      }
    }

    return examHistory;
  }

  /**
   * Download report card
   */
  async downloadReportCard(studentId: string, academicYearId: string): Promise<any> {
    return apiClient.downloadFile(
      `/examinations/report-card/?student=${studentId}&academic_year=${academicYearId}`,
      `report-card-${studentId}.pdf`
    );
  }
}

export const examService = new ExamService();
export default examService;
