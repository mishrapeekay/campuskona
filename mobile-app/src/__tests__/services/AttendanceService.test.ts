import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { attendanceService } from '../../services/api/attendance.service';
import apiClient from '../../services/api/client';
import { storageService } from '../../services/storage.service';

jest.mock('../../services/api/client');
jest.mock('../../services/storage.service');

describe('AttendanceService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch attendance records correctly', async () => {
        const mockData = [{ id: '1', status: 'PRESENT' }];
        (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

        const result = await attendanceService.getAttendance('section-id', '2024-01-01');

        expect(apiClient.get).toHaveBeenCalledWith('/attendance/student/', {
            params: { section_id: 'section-id', date: '2024-01-01' }
        });
        expect(result).toEqual(mockData);
    });

    it('should queue attendance update when offline', async () => {
        (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

        const attendanceData = { student_id: '123', status: 'PRESENT', date: '2024-01-01' };

        // @ts-ignore
        await attendanceService.markAttendance(attendanceData);

        expect(storageService.addToSyncQueue).toHaveBeenCalledWith(expect.objectContaining({
            endpoint: '/attendance/student/mark/',
            method: 'POST',
            data: attendanceData
        }));
    });
});
