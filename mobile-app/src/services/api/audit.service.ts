import apiClient from './client';

export const auditService = {
    /**
     * Get platform-wide audit logs (Super Admin)
     */
    getPlatformLogs: async (params?: any) => {
        try {
            const response = await apiClient.get('/core/audit-logs/', { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get school-specific audit logs
     */
    getTenantLogs: async (schoolId?: string, params?: any) => {
        try {
            const queryParams = { ...params };
            if (schoolId) {
                queryParams.school_id = schoolId;
            }
            const response = await apiClient.get('/core/audit-logs/', { params: queryParams });
            return response;
        } catch (error) {
            throw error;
        }
    }
};
