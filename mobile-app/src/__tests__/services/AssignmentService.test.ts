import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { assignmentService } from '../../services/api/assignment.service';
import apiClient from '../../services/api/client';

jest.mock('../../services/api/client');

describe('AssignmentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAssignments', () => {
        it('should fetch assignments list', async () => {
            const mockData = {
                results: [{ id: '1', title: 'Math Homework', status: 'PUBLISHED' }],
                count: 1,
            };
            (apiClient.get as jest.Mock).mockResolvedValueOnce(mockData);

            const result = await assignmentService.getAssignments();

            expect(apiClient.get).toHaveBeenCalledWith('/assignments/assignments/');
            expect(result).toEqual(mockData);
        });

        it('should fetch assignments with filters', async () => {
            const mockData = { results: [], count: 0 };
            (apiClient.get as jest.Mock).mockResolvedValueOnce(mockData);

            await assignmentService.getAssignments({ status: 'DRAFT' });

            expect(apiClient.get).toHaveBeenCalledWith(
                expect.stringContaining('/assignments/assignments/')
            );
        });
    });

    describe('getAssignment', () => {
        it('should fetch a single assignment by ID', async () => {
            const mockAssignment = { id: '1', title: 'Science Project', status: 'PUBLISHED' };
            (apiClient.get as jest.Mock).mockResolvedValueOnce(mockAssignment);

            const result = await assignmentService.getAssignment('1');

            expect(apiClient.get).toHaveBeenCalledWith('/assignments/assignments/1/');
            expect(result).toEqual(mockAssignment);
        });
    });

    describe('createAssignment', () => {
        it('should create an assignment with JSON data', async () => {
            const data = { title: 'New Homework', description: 'Do problems 1-5' };
            const mockResponse = { id: '2', ...data, status: 'DRAFT' };
            (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await assignmentService.createAssignment(data);

            expect(apiClient.post).toHaveBeenCalledWith('/assignments/assignments/', data);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('updateAssignment', () => {
        it('should update an assignment', async () => {
            const data = { title: 'Updated Title' };
            const mockResponse = { id: '1', title: 'Updated Title', status: 'PUBLISHED' };
            (apiClient.patch as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await assignmentService.updateAssignment('1', data);

            expect(apiClient.patch).toHaveBeenCalledWith('/assignments/assignments/1/', data);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('deleteAssignment', () => {
        it('should delete an assignment', async () => {
            (apiClient.delete as jest.Mock).mockResolvedValueOnce(undefined);

            await assignmentService.deleteAssignment('1');

            expect(apiClient.delete).toHaveBeenCalledWith('/assignments/assignments/1/');
        });
    });

    describe('getSubmissions', () => {
        it('should fetch submissions for an assignment', async () => {
            const mockData = {
                results: [{ id: 's1', student: '1', status: 'SUBMITTED' }],
                count: 1,
            };
            (apiClient.get as jest.Mock).mockResolvedValueOnce(mockData);

            const result = await assignmentService.getSubmissions('assignment-1');

            expect(apiClient.get).toHaveBeenCalledWith(
                expect.stringContaining('/assignments/submissions/')
            );
            expect(result).toEqual(mockData);
        });
    });

    describe('submitAssignment', () => {
        it('should submit with file upload', async () => {
            const mockResponse = { id: 's2', status: 'SUBMITTED' };
            (apiClient.uploadFile as jest.Mock).mockResolvedValueOnce(mockResponse);

            const file = { uri: 'file://test.pdf', name: 'test.pdf', type: 'application/pdf' };
            const result = await assignmentService.submitAssignment('1', 'Completed', file);

            expect(apiClient.uploadFile).toHaveBeenCalled();
            expect(result).toEqual(mockResponse);
        });
    });

    describe('gradeSubmission', () => {
        it('should grade a submission', async () => {
            const gradeData = { marks_obtained: 85, feedback: 'Well done' };
            const mockResponse = { id: 's1', status: 'GRADED', ...gradeData };
            (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await assignmentService.gradeSubmission('s1', gradeData);

            expect(apiClient.post).toHaveBeenCalledWith(
                '/assignments/submissions/s1/grade/',
                gradeData
            );
            expect(result).toEqual(mockResponse);
        });
    });
});

describe('BffService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch admin dashboard from BFF endpoint', async () => {
        const { bffService } = await import('../../services/api/bff.service');
        const mockData = {
            stats: { students: 100, staff: 20, revenue: 50000 },
            attendance_today: { total_marked: 80, present: 75 },
            recent_activities: [],
            quick_actions: [],
        };
        (apiClient.get as jest.Mock).mockResolvedValueOnce(mockData);

        const result = await bffService.getAdminDashboard();

        expect(apiClient.get).toHaveBeenCalledWith(
            expect.stringContaining('dashboard/admin/')
        );
        expect(result).toEqual(mockData);
    });

    it('should push sync changes', async () => {
        const { bffService } = await import('../../services/api/bff.service');
        const payload = {
            changes: [
                { temp_id: 'tmp1', entity: 'student_attendance', action: 'CREATE' as const, data: {} },
            ],
        };
        const mockResult = {
            results: [{ temp_id: 'tmp1', status: 'SUCCESS', server_id: 'srv1' }],
        };
        (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResult);

        const result = await bffService.pushSync(payload);

        expect(apiClient.post).toHaveBeenCalledWith(
            expect.stringContaining('sync/push/'),
            payload
        );
        expect(result.results[0].status).toBe('SUCCESS');
    });

    it('should pull sync changes', async () => {
        const { bffService } = await import('../../services/api/bff.service');
        const mockResult = {
            updates: { student_attendance: [{ id: '1', status: 'PRESENT' }] },
            new_sync_token: '2026-02-08T00:00:00Z',
        };
        (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResult);

        const result = await bffService.pullSync('2026-02-07T00:00:00Z');

        expect(apiClient.get).toHaveBeenCalledWith(
            expect.stringContaining('sync/pull/'),
            expect.any(Object)
        );
        expect(result.new_sync_token).toBeDefined();
    });
});
