import apiClient from './client';
import { ApiError } from '@/types/api';

export const investorService = {
    /**
     * Get investor dashboard statistics (MRR, churn, etc.)
     */
    getDashboardStats: async () => {
        try {
            const response = await apiClient.get('/platform-finance/investor/dashboard/');
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get financial reports
     */
    getFinancialReports: async () => {
        try {
            const response = await apiClient.get('/platform-finance/reports/');
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get growth metrics
     */
    getGrowthMetrics: async () => {
        try {
            const response = await apiClient.get('/platform-finance/investor/growth/');
            return response;
        } catch (error) {
            throw error;
        }
    }
};
