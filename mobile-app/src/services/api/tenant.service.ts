import apiClient from './client';
import { ApiError } from '@/types/api';

export interface CreateTenantPayload {
    schoolInfo: any;
    subscription: any; // Define proper interfaces if possible
    adminAccount: any;
    moduleConfig: any;
}

export const tenantService = {
    /**
     * Create a new tenant with school, admin user, and config
     */
    createTenant: async (data: CreateTenantPayload) => {
        try {
            const response = await apiClient.post('/tenants/schools/', data);
            return response;
        } catch (error: any) {
            throw error;
        }
    },

    /**
     * Get tenant configuration
     */
    getTenantConfig: async (schoolId: string) => {
        try {
            const response = await apiClient.get(`/tenants/schools/${schoolId}/config/`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * List available schools (public)
     */
    getPublicSchools: async () => {
        try {
            const response = await apiClient.get('/tenants/public/list/');
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * List all schools (Super Admin)
     */
    getAllTenants: async () => {
        try {
            const response = await apiClient.get('/tenants/schools/');
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get single school details (Super Admin)
     */
    getTenantDetails: async (id: string) => {
        try {
            const response = await apiClient.get(`/tenants/schools/${id}/`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update school details or status (Super Admin)
     */
    updateTenant: async (id: string, data: any) => {
        try {
            const response = await apiClient.patch(`/tenants/schools/${id}/`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete a school (Super Admin)
     */
    deleteTenant: async (id: string) => {
        try {
            const response = await apiClient.delete(`/tenants/schools/${id}/`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get platform dashboard stats (Super Admin)
     */
    getDashboardStats: async () => {
        try {
            const response = await apiClient.get('/tenants/dashboard/stats/');
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get platform analytics (Super Admin)
     */
    getAnalytics: async (params?: any) => {
        try {
            const response = await apiClient.get('/tenants/dashboard/analytics/', { params });
            return response;
        } catch (error) {
            throw error;
        }
    }
};
