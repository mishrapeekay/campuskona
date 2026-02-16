import apiClient from './client';
import offlineManager from '@/utils/offlineManager';
import {
  StudentAttendance,
  StaffAttendance,
  StudentLeave,
  StaffLeave,
  Holiday,
  AttendanceSummary,
  AttendancePeriod,
} from '@/types/models';
import { PaginatedResponse, AttendanceQueryParams } from '@/types/api';

class AttendanceService {
  /**
   * Get student attendance records
   */
  async getStudentAttendance(params?: AttendanceQueryParams): Promise<PaginatedResponse<StudentAttendance>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<StudentAttendance>>(`/attendance/student-attendance/${queryString}`);
  }

  /**
   * Mark student attendance
   */
  async markAttendance(data: Partial<StudentAttendance>): Promise<StudentAttendance> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/attendance/student-attendance/',
        method: 'POST',
        data,
      });
      return data as StudentAttendance;
    }
    return apiClient.post<StudentAttendance>('/attendance/student-attendance/', data);
  }

  /**
   * Bulk mark attendance for class
   */
  async bulkMarkAttendance(attendanceRecords: Partial<StudentAttendance>[]): Promise<StudentAttendance[]> {
    const data = { records: attendanceRecords };
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/attendance/student-attendance/bulk/',
        method: 'POST',
        data,
      });
      return attendanceRecords as StudentAttendance[];
    }
    return apiClient.post<StudentAttendance[]>('/attendance/student-attendance/bulk/', data);
  }

  /**
   * Update attendance record
   */
  async updateAttendance(id: string, data: Partial<StudentAttendance>): Promise<StudentAttendance> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: `/attendance/student-attendance/${id}/`,
        method: 'PATCH',
        data,
      });
      return { ...data, id } as StudentAttendance;
    }
    return apiClient.patch<StudentAttendance>(`/attendance/student-attendance/${id}/`, data);
  }

  /**
   * Get attendance summary for student
   */
  async getAttendanceSummary(studentId: string, academicYearId?: string): Promise<AttendanceSummary> {
    const queryString = academicYearId
      ? `?student=${studentId}&academic_year=${academicYearId}`
      : `?student=${studentId}`;
    const response = await apiClient.get<PaginatedResponse<AttendanceSummary>>(
      `/attendance/summaries/${queryString}`
    );
    return response.results[0];
  }

  /**
   * Get attendance periods
   */
  async getAttendancePeriods(): Promise<AttendancePeriod[]> {
    const response = await apiClient.get<PaginatedResponse<AttendancePeriod>>('/attendance/periods/');
    return response.results;
  }

  /**
   * Get student leave requests
   */
  async getStudentLeaves(params?: AttendanceQueryParams): Promise<PaginatedResponse<StudentLeave>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<StudentLeave>>(`/attendance/student-leaves/${queryString}`);
  }

  /**
   * Submit leave request
   */
  async submitLeaveRequest(data: Partial<StudentLeave>): Promise<StudentLeave> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/attendance/student-leaves/',
        method: 'POST',
        data,
      });
      return data as StudentLeave;
    }
    return apiClient.post<StudentLeave>('/attendance/student-leaves/', data);
  }

  /**
   * Approve/Reject leave request
   */
  async updateLeaveStatus(
    leaveId: string,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string
  ): Promise<StudentLeave> {
    const data = {
      status,
      rejection_reason: rejectionReason,
    };
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: `/attendance/student-leaves/${leaveId}/`,
        method: 'PATCH',
        data,
      });
      return { id: leaveId, ...data } as StudentLeave;
    }
    return apiClient.patch<StudentLeave>(`/attendance/student-leaves/${leaveId}/`, data);
  }

  /**
   * Get staff attendance
   */
  async getStaffAttendance(params?: AttendanceQueryParams): Promise<PaginatedResponse<StaffAttendance>> {
    const queryString = params ? apiClient.buildQueryString(params) : '';
    return apiClient.get<PaginatedResponse<StaffAttendance>>(`/attendance/staff-attendance/${queryString}`);
  }

  /**
   * Mark staff attendance
   */
  async markStaffAttendance(data: Partial<StaffAttendance>): Promise<StaffAttendance> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/attendance/staff-attendance/',
        method: 'POST',
        data,
      });
      return data as StaffAttendance;
    }
    return apiClient.post<StaffAttendance>('/attendance/staff-attendance/', data);
  }

  /**
   * Get staff leave requests
   */
  async getStaffLeaves(staffId?: string): Promise<PaginatedResponse<StaffLeave>> {
    const queryString = staffId ? `?staff=${staffId}` : '';
    return apiClient.get<PaginatedResponse<StaffLeave>>(`/attendance/staff-leaves/${queryString}`);
  }

  /**
   * Submit staff leave request
   */
  async submitStaffLeaveRequest(data: Partial<StaffLeave>): Promise<StaffLeave> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/attendance/staff-leaves/',
        method: 'POST',
        data,
      });
      return data as StaffLeave;
    }
    return apiClient.post<StaffLeave>('/attendance/staff-leaves/', data);
  }

  /**
   * Get holidays
   */
  async getHolidays(year?: number): Promise<Holiday[]> {
    const queryString = year ? `?year=${year}` : '';
    const response = await apiClient.get<PaginatedResponse<Holiday>>(`/attendance/holidays/${queryString}`);
    return response.results;
  }

  /**
   * Add holiday
   */
  async addHoliday(data: Partial<Holiday>): Promise<Holiday> {
    if (!offlineManager.getConnectionStatus()) {
      await offlineManager.addToQueue({
        endpoint: '/attendance/holidays/',
        method: 'POST',
        data,
      });
      return data as Holiday;
    }
    return apiClient.post<Holiday>('/attendance/holidays/', data);
  }

  /**
   * Get attendance for date range
   */
  async getAttendanceByDateRange(
    studentId: string,
    startDate: string,
    endDate: string
  ): Promise<StudentAttendance[]> {
    const response = await apiClient.get<PaginatedResponse<StudentAttendance>>(
      `/attendance/student-attendance/?student=${studentId}&date_from=${startDate}&date_to=${endDate}`
    );
    return response.results;
  }

  /**
   * Get class attendance for a specific date
   */
  async getClassAttendance(classId: string, date: string): Promise<StudentAttendance[]> {
    const response = await apiClient.get<PaginatedResponse<StudentAttendance>>(
      `/attendance/student-attendance/?class=${classId}&date=${date}`
    );
    return response.results;
  }

  /**
   * Get detailed attendance statistics for a student
   */
  async getStudentStatistics(
    studentId: string,
    academicYearId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    student_id: string;
    statistics: {
      total_days: number;
      present_days: number;
      absent_days: number;
      late_days: number;
      leave_days: number;
      attendance_percentage: number;
    };
    monthly_breakdown: Array<{
      month: string;
      present: number;
      absent: number;
      late: number;
    }>;
  }> {
    let query = `?student_id=${studentId}`;
    if (academicYearId) query += `&academic_year=${academicYearId}`;
    if (startDate) query += `&start_date=${startDate}`;
    if (endDate) query += `&end_date=${endDate}`;
    return apiClient.get(`/attendance/student-attendance/student_summary/${query}`);
  }

  /**
   * Sync offline attendance in bulk
   */
  async bulkSyncAttendance(payload: {
    pushes: Array<{
      sync_id: string;
      section_id: number;
      date: string;
      period_id: number | null;
      client_timestamp: string;
      records: Array<{
        student_id: number;
        status: string;
        remarks?: string;
      }>;
    }>;
  }): Promise<any> {
    return apiClient.post('/mobile/attendance/sync/', payload);
  }

  /**
   * Get attendance defaulters (students below threshold)
   */
  async getDefaulters(params?: {
    threshold?: number;
    section_id?: string;
    academic_year_id?: string;
  }): Promise<any[]> {
    const queryParts: string[] = [];
    if (params?.threshold) queryParts.push(`threshold=${params.threshold}`);
    if (params?.section_id) queryParts.push(`section_id=${params.section_id}`);
    if (params?.academic_year_id) queryParts.push(`academic_year=${params.academic_year_id}`);
    const query = queryParts.length ? `?${queryParts.join('&')}` : '';
    return apiClient.get(`/attendance/student-attendance/defaulters/${query}`);
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
