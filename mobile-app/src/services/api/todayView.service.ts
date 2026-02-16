import apiClient from './client';
import { TodayViewResponse, ParentTodayViewResponse } from '@/types/todayView';

/**
 * Today View Aggregated API Service
 * 
 * Provides highly optimized, aggregated data for student and parent dashboards.
 * Backend implementation: apps/mobile_bff/services/today_view.py
 * 
 * Note: Uses relative paths that work with apiClient's baseURL (http://10.0.2.2:8000/api/v1)
 * The paths are constructed to go up one level and into /mobile/v1
 */

const BFF_PREFIX = '../mobile/v1';

class TodayViewService {
    /**
     * Get student today view data
     * @param studentId Optional student ID, defaults to current user
     * @param forceRefresh Force refresh to bypass cache
     */
    async getStudentToday(studentId?: string, forceRefresh: boolean = false): Promise<TodayViewResponse> {
        const params: Record<string, any> = {};
        if (studentId) params.student_id = studentId;
        if (forceRefresh) params.force_refresh = 'true';

        return apiClient.get<TodayViewResponse>(`${BFF_PREFIX}/student/today/`, { params });
    }

    /**
     * Get parent today view data (aggregated for all children)
     * @param forceRefresh Force refresh to bypass cache
     */
    async getParentToday(forceRefresh: boolean = false): Promise<ParentTodayViewResponse> {
        const params: Record<string, any> = {};
        if (forceRefresh) params.force_refresh = 'true';

        return apiClient.get<ParentTodayViewResponse>(`${BFF_PREFIX}/parent/today/`, { params });
    }

    /**
     * Invalidate cache for a specific student or section
     */
    async invalidateCache(payload: {
        student_id?: string;
        student_ids?: string[];
        section_id?: string;
        date?: string;
    }): Promise<any> {
        return apiClient.post(`${BFF_PREFIX}/today/invalidate-cache/`, payload);
    }

    /**
     * Get cache performance statistics
     */
    async getCacheStats(): Promise<any> {
        return apiClient.get(`${BFF_PREFIX}/today/cache-stats/`);
    }
}

export const todayViewService = new TodayViewService();
export default todayViewService;
