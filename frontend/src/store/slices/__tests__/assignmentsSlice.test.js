import { describe, it, expect, beforeEach } from 'vitest';
import assignmentsReducer, {
  fetchAssignments,
  fetchAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  fetchSubmissions,
  gradeSubmission,
  clearError,
  clearCurrentAssignment,
} from '../assignmentsSlice';

describe('assignmentsSlice', () => {
  let initialState;

  beforeEach(() => {
    initialState = {
      assignments: { data: [], loading: false, count: 0 },
      currentAssignment: { data: null, loading: false },
      submissions: { data: [], loading: false, count: 0 },
      error: null,
    };
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = assignmentsReducer(undefined, { type: 'unknown' });
      expect(state.assignments).toBeDefined();
      expect(state.currentAssignment).toBeDefined();
      expect(state.submissions).toBeDefined();
      expect(state.error).toBeNull();
    });
  });

  describe('synchronous actions', () => {
    it('should handle clearError', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const state = assignmentsReducer(stateWithError, clearError());
      expect(state.error).toBeNull();
    });

    it('should handle clearCurrentAssignment', () => {
      const stateWithAssignment = {
        ...initialState,
        currentAssignment: { data: { id: '1', title: 'Test' }, loading: false },
      };
      const state = assignmentsReducer(stateWithAssignment, clearCurrentAssignment());
      expect(state.currentAssignment.data).toBeNull();
    });
  });

  describe('fetchAssignments', () => {
    it('should handle pending', () => {
      const state = assignmentsReducer(initialState, fetchAssignments.pending());
      expect(state.assignments.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fulfilled with paginated response', () => {
      const payload = {
        results: [
          { id: '1', title: 'Homework 1', status: 'PUBLISHED' },
          { id: '2', title: 'Homework 2', status: 'DRAFT' },
        ],
        count: 2,
      };
      const state = assignmentsReducer(initialState, fetchAssignments.fulfilled(payload));
      expect(state.assignments.loading).toBe(false);
      expect(state.assignments.data).toEqual(payload.results);
      expect(state.assignments.count).toBe(2);
    });

    it('should handle fulfilled with array response', () => {
      const payload = [
        { id: '1', title: 'Homework 1' },
      ];
      const state = assignmentsReducer(initialState, fetchAssignments.fulfilled(payload));
      expect(state.assignments.loading).toBe(false);
      expect(state.assignments.data).toEqual(payload);
      expect(state.assignments.count).toBe(1);
    });

    it('should handle rejected', () => {
      const error = 'Failed to fetch assignments';
      const state = assignmentsReducer(initialState, fetchAssignments.rejected(null, '', null, error));
      expect(state.assignments.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('fetchAssignmentById', () => {
    it('should handle pending', () => {
      const state = assignmentsReducer(initialState, fetchAssignmentById.pending());
      expect(state.currentAssignment.loading).toBe(true);
    });

    it('should handle fulfilled', () => {
      const payload = { id: '1', title: 'Math Homework', status: 'PUBLISHED' };
      const state = assignmentsReducer(initialState, fetchAssignmentById.fulfilled(payload));
      expect(state.currentAssignment.loading).toBe(false);
      expect(state.currentAssignment.data).toEqual(payload);
    });

    it('should handle rejected', () => {
      const error = 'Not found';
      const state = assignmentsReducer(initialState, fetchAssignmentById.rejected(null, '', null, error));
      expect(state.currentAssignment.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('createAssignment', () => {
    it('should handle fulfilled by adding to list', () => {
      const newAssignment = { id: '3', title: 'New Homework', status: 'DRAFT' };
      const state = assignmentsReducer(initialState, createAssignment.fulfilled(newAssignment));
      expect(state.assignments.data).toContainEqual(newAssignment);
      expect(state.assignments.count).toBe(1);
    });

    it('should handle rejected', () => {
      const error = 'Validation error';
      const state = assignmentsReducer(initialState, createAssignment.rejected(null, '', null, error));
      expect(state.error).toBe(error);
    });
  });

  describe('updateAssignment', () => {
    it('should handle fulfilled by updating in list', () => {
      const existingState = {
        ...initialState,
        assignments: {
          data: [
            { id: '1', title: 'Old Title', status: 'DRAFT' },
            { id: '2', title: 'Other', status: 'PUBLISHED' },
          ],
          loading: false,
          count: 2,
        },
      };
      const updated = { id: '1', title: 'New Title', status: 'PUBLISHED' };
      const state = assignmentsReducer(existingState, updateAssignment.fulfilled(updated));
      expect(state.assignments.data.find((a) => a.id === '1').title).toBe('New Title');
      expect(state.assignments.data.find((a) => a.id === '2').title).toBe('Other');
    });
  });

  describe('deleteAssignment', () => {
    it('should handle fulfilled by removing from list', () => {
      const existingState = {
        ...initialState,
        assignments: {
          data: [
            { id: '1', title: 'Keep' },
            { id: '2', title: 'Delete Me' },
          ],
          loading: false,
          count: 2,
        },
      };
      const state = assignmentsReducer(existingState, deleteAssignment.fulfilled('2'));
      expect(state.assignments.data).toHaveLength(1);
      expect(state.assignments.data[0].id).toBe('1');
      expect(state.assignments.count).toBe(1);
    });
  });

  describe('fetchSubmissions', () => {
    it('should handle pending', () => {
      const state = assignmentsReducer(initialState, fetchSubmissions.pending());
      expect(state.submissions.loading).toBe(true);
    });

    it('should handle fulfilled', () => {
      const payload = {
        results: [
          { id: 's1', student: '1', status: 'SUBMITTED', marks_obtained: null },
          { id: 's2', student: '2', status: 'GRADED', marks_obtained: 85 },
        ],
        count: 2,
      };
      const state = assignmentsReducer(initialState, fetchSubmissions.fulfilled(payload));
      expect(state.submissions.loading).toBe(false);
      expect(state.submissions.data).toEqual(payload.results);
      expect(state.submissions.count).toBe(2);
    });

    it('should handle rejected', () => {
      const error = 'Failed to fetch submissions';
      const state = assignmentsReducer(initialState, fetchSubmissions.rejected(null, '', null, error));
      expect(state.submissions.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('gradeSubmission', () => {
    it('should handle fulfilled by updating submission in list', () => {
      const existingState = {
        ...initialState,
        submissions: {
          data: [
            { id: 's1', student: '1', status: 'SUBMITTED', marks_obtained: null },
          ],
          loading: false,
          count: 1,
        },
      };
      const graded = { id: 's1', student: '1', status: 'GRADED', marks_obtained: 90 };
      const state = assignmentsReducer(existingState, gradeSubmission.fulfilled(graded));
      expect(state.submissions.data[0].status).toBe('GRADED');
      expect(state.submissions.data[0].marks_obtained).toBe(90);
    });

    it('should handle rejected', () => {
      const error = 'Grading failed';
      const state = assignmentsReducer(initialState, gradeSubmission.rejected(null, '', null, error));
      expect(state.error).toBe(error);
    });
  });
});
