import apiClient from './client';
import { Student } from '@/types/models';

export interface ParentDashboardData {
    wards: Student[];
    summary: {
        total_attendance_pct: number;
        pending_fees_count: number;
        total_pending_amount: number;
        upcoming_exams_count: number;
        unread_notices_count: number;
    };
    recent_activities: any[];
}

class ParentService {
    /**
     * Get main dashboard data for parent
     */
    async getDashboard(): Promise<ParentDashboardData> {
        return apiClient.get<ParentDashboardData>('/students/parent-portal/dashboard/');
    }

    /**
     * Get attendance for a specific ward
     */
    async getWardAttendance(studentId: string) {
        return apiClient.get(`/students/parent-portal/attendance/?student_id=${studentId}`);
    }

    /**
     * Get results for a specific ward
     */
    async getWardResults(studentId: string) {
        return apiClient.get(`/students/parent-portal/results/?student_id=${studentId}`);
    }

    /**
     * Get fee status for a specific ward
     */
    async getWardFees(studentId: string) {
        return apiClient.get(`/students/parent-portal/fees/?student_id=${studentId}`);
    }

    /**
     * Get timetable for a specific ward
     */
    async getWardTimetable(studentId: string) {
        return apiClient.get(`/students/parent-portal/timetable/?student_id=${studentId}`);
    }

    /**
     * Get notifications for parent (child-scoped)
     */
    async getNotifications(studentId?: string) {
        const url = studentId
            ? `/students/parent-portal/notifications/?student_id=${studentId}`
            : '/students/parent-portal/notifications/';
        return apiClient.get(url);
    }
}

export const parentService = new ParentService();
export default parentService;
