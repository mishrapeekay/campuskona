import apiClient from './client';
import {
    AcademicYear,
    Board,
    Class,
    Subject,
    TimeSlot,
    TimetableSlot
} from '@/types/models';
import { PaginatedResponse, QueryParams } from '@/types/api';

class AcademicService {
    /**
     * Get academic years
     */
    async getAcademicYears(params?: QueryParams): Promise<PaginatedResponse<AcademicYear>> {
        const queryString = params ? apiClient.buildQueryString(params) : '';
        return apiClient.get<PaginatedResponse<AcademicYear>>(`/academics/academic-years/${queryString}`);
    }

    /**
     * Get current academic year
     */
    async getCurrentAcademicYear(): Promise<AcademicYear> {
        // Assuming a custom endpoint or filter exists. Using filter for now.
        const response = await this.getAcademicYears({ is_current: true });
        if (response.results.length > 0) return response.results[0];
        throw new Error("No current academic year found");
    }

    /**
     * Get boards
     */
    async getBoards(params?: QueryParams): Promise<PaginatedResponse<Board>> {
        const queryString = params ? apiClient.buildQueryString(params) : '';
        return apiClient.get<PaginatedResponse<Board>>(`/academics/boards/${queryString}`);
    }

    /**
     * Get classes
     */
    async getClasses(params?: QueryParams): Promise<PaginatedResponse<Class>> {
        const queryString = params ? apiClient.buildQueryString(params) : '';
        return apiClient.get<PaginatedResponse<Class>>(`/academics/classes/${queryString}`);
    }

    /**
     * Get class by ID
     */
    async getClass(id: string): Promise<Class> {
        return apiClient.get<Class>(`/academics/classes/${id}/`);
    }

    /**
     * Get subjects
     */
    async getSubjects(params?: QueryParams): Promise<PaginatedResponse<Subject>> {
        const queryString = params ? apiClient.buildQueryString(params) : '';
        return apiClient.get<PaginatedResponse<Subject>>(`/academics/subjects/${queryString}`);
    }

    /**
     * Get sections
     */
    async getSections(params?: QueryParams): Promise<PaginatedResponse<any>> {
        const queryString = params ? apiClient.buildQueryString(params) : '';
        return apiClient.get<PaginatedResponse<any>>(`/academics/sections/${queryString}`);
    }

    /**
     * Get time slots
     */
    async getTimeSlots(params?: QueryParams): Promise<PaginatedResponse<TimeSlot>> {
        const queryString = params ? apiClient.buildQueryString(params) : '';
        return apiClient.get<PaginatedResponse<TimeSlot>>(`/academics/time-slots/${queryString}`);
    }

    /**
     * Get timetable slots
     */
    async getTimetableSlots(params?: QueryParams): Promise<PaginatedResponse<TimetableSlot>> {
        const queryString = params ? apiClient.buildQueryString(params) : '';
        return apiClient.get<PaginatedResponse<TimetableSlot>>(`/academics/timetable-slots/${queryString}`);
    }

    /**
     * Get teacher's classes (helper)
     * This relies on backend filtering classes by class_teacher or getting schedule
     */
    async getTeacherClasses(teacherId: string): Promise<Class[]> {
        const response = await this.getClasses({ class_teacher: teacherId });
        return response.results;
    }

    /**
     * Get teacher's daily schedule
     */
    async getTeacherSchedule(teacherId: string, date: string): Promise<TimetableSlot[]> {
        // Assuming backend supports filtering timetable by teacher and date/day
        // Calculate day of week (1-7)
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay() || 7; // Sunday=0 -> 7? Or 0. Adjusting to standard 1=Monday?
        // Let's assume standard JS getDay: 0 (Sun) to 6 (Sat). 
        // If backend expects 1(Mon)-7(Sun) or similar, adjustment needed.
        // For now passing day_of_week directly.

        const response = await apiClient.get<PaginatedResponse<TimetableSlot>>(
            `/academics/timetable-slots/?teacher=${teacherId}&day_of_week=${dayOfWeek}`
        );
        return response.results;
    }
}

export const academicService = new AcademicService();
export default academicService;
