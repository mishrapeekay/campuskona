import apiClient from './client';
import { StaffMember } from '@/types/models';
import { PaginatedResponse, QueryParams } from '@/types/api';

class StaffService {
    /**
     * Get list of staff members with pagination and filters
     */
    async getStaffMembers(params?: QueryParams): Promise<PaginatedResponse<StaffMember>> {
        const queryString = params ? apiClient.buildQueryString(params) : '';
        return apiClient.get<PaginatedResponse<StaffMember>>(`/staff/members/${queryString}`);
    }

    /**
     * Get staff member by ID
     */
    async getStaffMember(id: string): Promise<StaffMember> {
        return apiClient.get<StaffMember>(`/staff/members/${id}/`);
    }

    /**
     * Create new staff member
     */
    async createStaffMember(data: Partial<StaffMember>): Promise<StaffMember> {
        return apiClient.post<StaffMember>('/staff/members/', data);
    }

    /**
     * Update staff member
     */
    async updateStaffMember(id: string, data: Partial<StaffMember>): Promise<StaffMember> {
        return apiClient.patch<StaffMember>(`/staff/members/${id}/`, data);
    }

    /**
     * Delete staff member (soft delete)
     */
    async deleteStaffMember(id: string): Promise<void> {
        return apiClient.delete(`/staff/members/${id}/`);
    }
}

export const staffService = new StaffService();
export default staffService;
