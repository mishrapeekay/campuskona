import apiClient from './client';
import { ApiError } from '@/types/api';

export const partnerService = {
    /**
     * Get partner dashboard statistics
     */
    getDashboardStats: async () => {
        try {
            const response = await apiClient.get('/partners/dashboard/');
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get leads list
     */
    getLeads: async (params?: any) => {
        try {
            const response = await apiClient.get('/partners/leads/', { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Register a new lead
     */
    registerLead: async (data: any) => {
        try {
            const response = await apiClient.post('/partners/leads/', data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get commission ledger
     */
    getCommissionLedger: async (params?: any) => {
        try {
            const response = await apiClient.get('/partners/commissions/', { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get payout history
     */
    getPayoutHistory: async () => {
        try {
            const response = await apiClient.get('/partners/payouts/');
            return response;
        } catch (error) {
            throw error;
        }
    }
};
