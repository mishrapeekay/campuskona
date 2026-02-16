import apiClient from './client';

export interface TimetableEntry {
    id: string;
    day_of_week: string;
    time_slot: {
        id: string;
        start_time: string;
        end_time: string;
        name: string;
        type: string;
    };
    subject: {
        id: string;
        name: string;
    } | null;
    teacher: {
        id: string;
        name: string;
    } | null;
    room_number: string;
    class_name?: string;
    section_name?: string;
}

export const timetableService = {
    /**
     * Get weekly timetable for a class (Student View)
     */
    getClassTimetable: async (academicYearId: string, classId: string, sectionId: string) => {
        try {
            const response = await apiClient.get('/timetable/class-timetable/weekly_view/', {
                params: {
                    academic_year_id: academicYearId,
                    class_id: classId,
                    section_id: sectionId,
                },
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get my timetable (Teacher View)
     */
    getTeacherTimetable: async () => {
        try {
            const response = await apiClient.get<TimetableEntry[]>('/timetable/teacher-timetable/my_timetable/');
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get active time slots (Periods)
     */
    getTimeSlots: async () => {
        try {
            const response = await apiClient.get('/timetable/time-slots/periods_only/');
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default timetableService;
