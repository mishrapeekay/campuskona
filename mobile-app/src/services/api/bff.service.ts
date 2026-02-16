import apiClient from './client';

/**
 * Mobile BFF (Backend-For-Frontend) Service
 *
 * Provides optimized, aggregated endpoints for mobile dashboards,
 * offline sync, and lightweight data fetching.
 *
 * Backend routes: /api/mobile/v1/
 * Since apiClient baseURL is /api/v1, we use ../mobile/v1/ prefix.
 */

const BFF_PREFIX = '../mobile/v1';

// --- Dashboard Types ---

export interface AdminDashboardData {
    stats: {
        students: number;
        staff: number;
        revenue: number;
    };
    attendance_today: {
        total_marked: number;
        present: number;
    };
    recent_activities: Array<{
        action: string;
        model_name: string;
        object_repr: string;
        created_at: string;
        user__first_name: string;
    }>;
    quick_actions: Array<{
        label: string;
        action: string;
        target: string;
    }>;
}

export interface TeacherDashboardData {
    greeting: string;
    today_classes: Array<{
        id: string;
        subject__name: string;
        section__name: string;
        section__class_instance__name: string;
        time_slot__name: string;
        time_slot__start_time: string;
        time_slot__end_time: string;
        room_number: string;
    }>;
    pending_attendance: number;
    upcoming_assignments: Array<{
        id: string;
        title: string;
        subject__name: string;
        section__name: string;
        due_date: string;
    }>;
}

export interface TeacherHomeData {
    greeting: string;
    date: string;
    timetable: Array<{
        id: number;
        period: string;
        class_name: string;
        subject: string;
        start_time: string;
        end_time: string;
        room_number: string;
        status: string;
    }>;
    pending_actions: Array<{
        type: 'ATTENDANCE' | 'ASSIGNMENT' | 'NOTIFICATION' | 'LEAVE_REQUEST';
        count: number;
        label: string;
        items?: Array<{
            id: string | number;
            label: string;
            action_url?: string;
        }>;
    }>;
    urgent_alerts: Array<{
        type: 'SUBSTITUTION' | 'LEAVE_CLASH';
        message: string;
        severity: 'HIGH' | 'MEDIUM' | 'LOW';
        action_url?: string;
    }>;
}

export interface StudentDashboardData {
    student_name: string;
    class_name: string;
    attendance_percentage: number;
    upcoming_exams: Array<{
        id: string;
        subject__name: string;
        exam_date: string;
        start_time: string;
        end_time: string;
        max_marks: number;
        examination__name: string;
    }>;
    homework_due: Array<{
        id: string;
        title: string;
        subject__name: string;
        due_date: string;
        max_marks: number;
    }>;
}

export interface ParentDashboardData {
    greeting: string;
    children_summary: Array<{
        student_id: string;
        name: string;
        relation: string;
        class_name: string | null;
        attendance_percentage: number;
        pending_fees: number;
        homework_pending: number;
    }>;
}

// --- Sync Types ---

export interface SyncPushPayload {
    changes: Array<{
        temp_id: string;
        entity: string;
        action: 'CREATE' | 'UPDATE';
        data: Record<string, any>;
    }>;
}

export interface SyncPushResult {
    results: Array<{
        temp_id: string;
        status: 'SUCCESS' | 'ERROR';
        server_id?: string;
        synced_at?: string;
        error?: string;
    }>;
}

export interface SyncPullResult {
    updates: Record<string, Array<Record<string, any>>>;
    new_sync_token: string;
}

// --- Class Roster Types ---

export interface ClassRosterStudent {
    id: string;
    name: string;
    roll_number: string;
    last_attendance_status?: string;
}

// --- Service ---

class BffService {
    // Dashboards
    async getAdminDashboard(): Promise<AdminDashboardData> {
        return apiClient.get<AdminDashboardData>(`${BFF_PREFIX}/dashboard/admin/`);
    }

    async getTeacherDashboard(): Promise<TeacherDashboardData> {
        return apiClient.get<TeacherDashboardData>(`${BFF_PREFIX}/dashboard/teacher/`);
    }

    async getTeacherHome(): Promise<TeacherHomeData> {
        return apiClient.get<TeacherHomeData>(`${BFF_PREFIX}/teacher/home/`);
    }

    async getStudentDashboard(): Promise<StudentDashboardData> {
        return apiClient.get<StudentDashboardData>(`${BFF_PREFIX}/dashboard/student/`);
    }

    async getParentDashboard(): Promise<ParentDashboardData> {
        return apiClient.get<ParentDashboardData>(`${BFF_PREFIX}/dashboard/parent/`);
    }

    // Sync
    async pushSync(payload: SyncPushPayload): Promise<SyncPushResult> {
        return apiClient.post<SyncPushResult>(`${BFF_PREFIX}/sync/push/`, payload);
    }

    async pullSync(lastSyncedAt?: string): Promise<SyncPullResult> {
        const params = lastSyncedAt ? { last_synced_at: lastSyncedAt } : {};
        return apiClient.get<SyncPullResult>(`${BFF_PREFIX}/sync/pull/`, { params });
    }

    // Class Roster (lightweight student list for attendance)
    async getClassRoster(sectionId: string, date?: string): Promise<ClassRosterStudent[]> {
        const params: Record<string, string> = { section_id: sectionId };
        if (date) params.date = date;
        return apiClient.get<ClassRosterStudent[]>(`${BFF_PREFIX}/attendance/class-roster/`, { params });
    }

    // Notifications
    async getNotificationFeed(page: number = 1): Promise<any> {
        return apiClient.get(`${BFF_PREFIX}/notifications/feed/`, { params: { page } });
    }

    // Branding
    async getSchoolBranding(): Promise<any> {
        return apiClient.get(`${BFF_PREFIX}/branding/`);
    }
}

export const bffService = new BffService();
export default bffService;
