
import apiClient from './client';

export interface AdminException {
    id: string;
    title: string;
    description: string;
    entity_id: string | number;
    entity_type: string;
    action_url?: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    metadata?: Record<string, any>;
}

export interface ExceptionsResponse {
    summary: {
        total: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    categories: Record<string, AdminException[]>;
}

export const adminService = {
    /**
     * Fetch admin dashboard exceptions/action items
     */
    getExceptions: async (params?: { date?: string }): Promise<ExceptionsResponse> => {
        const response = await apiClient.get('/core/admin/exceptions/', { params });
        return response;
    },
};
