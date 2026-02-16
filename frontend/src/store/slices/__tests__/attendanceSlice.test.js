import { describe, it, expect, beforeEach } from 'vitest';
import attendanceReducer, {
  fetchStudentAttendance,
  fetchClassAttendance,
  markBulkAttendance,
  fetchStudentLeaves,
  createStudentLeave,
  approveLeave,
  rejectLeave,
  fetchAttendanceSummary,
  fetchHolidays,
  setFilters,
  clearError,
} from '../attendanceSlice';

describe('attendanceSlice', () => {
  let initialState;

  beforeEach(() => {
    initialState = {
      studentAttendance: {
        data: [],
        pagination: null,
        loading: false,
        error: null,
      },
      classAttendance: {
        data: null,
        loading: false,
        error: null,
      },
      leaves: {
        data: [],
        pagination: null,
        loading: false,
        error: null,
      },
      summary: {
        data: [],
        loading: false,
        error: null,
      },
      holidays: {
        data: [],
        loading: false,
        error: null,
      },
      filters: {
        date: expect.any(String),
        classId: null,
        sectionId: null,
        status: null,
      },
    };
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = attendanceReducer(undefined, { type: 'unknown' });
      expect(state.studentAttendance).toBeDefined();
      expect(state.classAttendance).toBeDefined();
      expect(state.leaves).toBeDefined();
      expect(state.summary).toBeDefined();
      expect(state.holidays).toBeDefined();
    });
  });

  describe('fetchStudentAttendance', () => {
    it('should handle fetchStudentAttendance.pending', () => {
      const state = attendanceReducer(initialState, fetchStudentAttendance.pending());
      expect(state.studentAttendance.loading).toBe(true);
      expect(state.studentAttendance.error).toBeNull();
    });

    it('should handle fetchStudentAttendance.fulfilled', () => {
      const payload = {
        results: [
          { id: '1', date: '2024-01-01', status: 'PRESENT' },
          { id: '2', date: '2024-01-02', status: 'ABSENT' },
        ],
        count: 2,
      };

      const state = attendanceReducer(initialState, fetchStudentAttendance.fulfilled(payload));
      expect(state.studentAttendance.loading).toBe(false);
      expect(state.studentAttendance.data).toEqual(payload.results);
      expect(state.studentAttendance.pagination).toBeDefined();
    });

    it('should handle fetchStudentAttendance.rejected', () => {
      const error = 'Failed to fetch';
      const state = attendanceReducer(initialState, fetchStudentAttendance.rejected(null, '', null, error));
      expect(state.studentAttendance.loading).toBe(false);
      expect(state.studentAttendance.error).toBe(error);
    });
  });

  describe('fetchClassAttendance', () => {
    it('should handle fetchClassAttendance.pending', () => {
      const state = attendanceReducer(initialState, fetchClassAttendance.pending());
      expect(state.classAttendance.loading).toBe(true);
    });

    it('should handle fetchClassAttendance.fulfilled', () => {
      const payload = {
        class_id: '1',
        date: '2024-01-01',
        students: [
          { student_id: '1', status: 'PRESENT' },
          { student_id: '2', status: 'ABSENT' },
        ],
      };

      const state = attendanceReducer(initialState, fetchClassAttendance.fulfilled(payload));
      expect(state.classAttendance.loading).toBe(false);
      expect(state.classAttendance.data).toEqual(payload);
    });

    it('should handle fetchClassAttendance.rejected', () => {
      const error = 'Failed to fetch class attendance';
      const state = attendanceReducer(initialState, fetchClassAttendance.rejected(null, '', null, error));
      expect(state.classAttendance.loading).toBe(false);
      expect(state.classAttendance.error).toBe(error);
    });
  });

  describe('markBulkAttendance', () => {
    it('should handle markBulkAttendance.pending', () => {
      const state = attendanceReducer(initialState, markBulkAttendance.pending());
      expect(state.classAttendance.loading).toBe(true);
    });

    it('should handle markBulkAttendance.fulfilled', () => {
      const payload = { success: true, count: 30 };
      const state = attendanceReducer(initialState, markBulkAttendance.fulfilled(payload));
      expect(state.classAttendance.loading).toBe(false);
      // Note: markBulkAttendance.fulfilled only sets loading=false, doesn't update data
    });

    it('should handle markBulkAttendance.rejected', () => {
      const error = 'Failed to mark attendance';
      const state = attendanceReducer(initialState, markBulkAttendance.rejected(null, '', null, error));
      expect(state.classAttendance.loading).toBe(false);
      expect(state.classAttendance.error).toBe(error);
    });
  });

  describe('fetchStudentLeaves', () => {
    it('should handle fetchStudentLeaves.pending', () => {
      const state = attendanceReducer(initialState, fetchStudentLeaves.pending());
      expect(state.leaves.loading).toBe(true);
    });

    it('should handle fetchStudentLeaves.fulfilled', () => {
      const payload = {
        results: [
          { id: '1', reason: 'Sick', status: 'PENDING' },
          { id: '2', reason: 'Family event', status: 'APPROVED' },
        ],
        count: 2,
      };

      const state = attendanceReducer(initialState, fetchStudentLeaves.fulfilled(payload));
      expect(state.leaves.loading).toBe(false);
      expect(state.leaves.data).toEqual(payload.results);
    });

    it('should handle fetchStudentLeaves.rejected', () => {
      const error = 'Failed to fetch leaves';
      const state = attendanceReducer(initialState, fetchStudentLeaves.rejected(null, '', null, error));
      expect(state.leaves.loading).toBe(false);
      expect(state.leaves.error).toBe(error);
    });
  });

  describe('createStudentLeave', () => {
    it('should handle createStudentLeave.fulfilled', () => {
      const newLeave = { id: '1', reason: 'Medical', status: 'PENDING' };
      const state = attendanceReducer(initialState, createStudentLeave.fulfilled(newLeave));
      // Note: Only fulfilled case is defined in the actual slice
      expect(state.leaves.data).toContainEqual(newLeave);
    });
  });

  describe('approveLeave', () => {
    it('should handle approveLeave.fulfilled', () => {
      const existingState = {
        ...initialState,
        leaves: {
          ...initialState.leaves,
          data: [
            { id: '1', reason: 'Sick', status: 'PENDING' },
            { id: '2', reason: 'Event', status: 'PENDING' },
          ],
        },
      };

      const payload = { leave: { id: '1', reason: 'Sick', status: 'APPROVED' } };
      const state = attendanceReducer(existingState, approveLeave.fulfilled(payload));

      // Note: Payload structure is { leave: {...} }, not direct leave object
      expect(state.leaves.data.find(l => l.id === '1').status).toBe('APPROVED');
    });
  });

  describe('rejectLeave', () => {
    it('should handle rejectLeave.fulfilled', () => {
      const existingState = {
        ...initialState,
        leaves: {
          ...initialState.leaves,
          data: [{ id: '1', reason: 'Sick', status: 'PENDING' }],
        },
      };

      const payload = { leave: { id: '1', reason: 'Sick', status: 'REJECTED' } };
      const state = attendanceReducer(existingState, rejectLeave.fulfilled(payload));

      // Note: Payload structure is { leave: {...} }, not direct leave object
      expect(state.leaves.data.find(l => l.id === '1').status).toBe('REJECTED');
    });
  });

  describe('fetchAttendanceSummary', () => {
    it('should handle fetchAttendanceSummary.pending', () => {
      const state = attendanceReducer(initialState, fetchAttendanceSummary.pending());
      expect(state.summary.loading).toBe(true);
    });

    it('should handle fetchAttendanceSummary.fulfilled', () => {
      const payload = {
        total_days: 20,
        present: 18,
        absent: 2,
        percentage: 90,
      };

      const state = attendanceReducer(initialState, fetchAttendanceSummary.fulfilled(payload));
      expect(state.summary.loading).toBe(false);
      expect(state.summary.data).toEqual(payload);
    });

    it('should handle fetchAttendanceSummary.rejected', () => {
      const error = 'Failed to fetch summary';
      const state = attendanceReducer(initialState, fetchAttendanceSummary.rejected(null, '', null, error));
      expect(state.summary.loading).toBe(false);
      expect(state.summary.error).toBe(error);
    });
  });

  describe('fetchHolidays', () => {
    it('should handle fetchHolidays.pending', () => {
      const state = attendanceReducer(initialState, fetchHolidays.pending());
      expect(state.holidays.loading).toBe(true);
    });

    it('should handle fetchHolidays.fulfilled', () => {
      const payload = [
        { id: '1', name: 'New Year', date: '2024-01-01' },
        { id: '2', name: 'Independence Day', date: '2024-08-15' },
      ];

      const state = attendanceReducer(initialState, fetchHolidays.fulfilled(payload));
      expect(state.holidays.loading).toBe(false);
      expect(state.holidays.data).toEqual(payload);
    });

    it('should handle fetchHolidays.rejected', () => {
      const error = 'Failed to fetch holidays';
      const state = attendanceReducer(initialState, fetchHolidays.rejected(null, '', null, error));
      expect(state.holidays.loading).toBe(false);
      expect(state.holidays.error).toBe(error);
    });
  });

  describe('synchronous actions', () => {
    it('should handle setFilters', () => {
      const newFilters = { classId: '123', status: 'PRESENT' };
      const state = attendanceReducer(initialState, setFilters(newFilters));
      expect(state.filters.classId).toBe('123');
      expect(state.filters.status).toBe('PRESENT');
    });

    it('should handle clearError for specific section', () => {
      const stateWithErrors = {
        ...initialState,
        studentAttendance: { ...initialState.studentAttendance, error: 'Some error' },
        leaves: { ...initialState.leaves, error: 'Another error' },
      };

      // clearError requires a section name as payload
      const state = attendanceReducer(stateWithErrors, clearError('studentAttendance'));
      expect(state.studentAttendance.error).toBeNull();
      // Other sections unchanged
      expect(state.leaves.error).toBe('Another error');
    });
  });
});
