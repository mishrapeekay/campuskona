import { describe, it, expect, beforeEach, vi } from 'vitest';
import studentsReducer, {
  fetchStudents,
  fetchStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkUploadStudents,
  fetchStudentStatistics,
  setFilters,
  resetFilters,
  clearCurrentStudent,
  clearError,
  selectStudents,
  selectCurrentStudent,
  selectStudentFilters,
  selectStudentPagination,
  selectStudentLoading,
  selectStudentError,
  selectStudentStatistics,
} from '../studentsSlice';

describe('studentsSlice', () => {
  let initialState;

  beforeEach(() => {
    initialState = {
      list: [],
      current: null,
      statistics: null,
      stats: null,
      filters: {
        search: '',
        gender: null,
        category: null,
        admission_status: 'ACTIVE',
        page: 1,
        pageSize: 20,
      },
      pagination: {
        count: 0,
        next: null,
        previous: null,
      },
      loading: false,
      error: null,
      bulkUploadProgress: null,
    };
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(studentsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('synchronous reducers', () => {
    it('should handle setFilters', () => {
      const newFilters = { search: 'John', gender: 'MALE' };
      const state = studentsReducer(initialState, setFilters(newFilters));

      expect(state.filters.search).toBe('John');
      expect(state.filters.gender).toBe('MALE');
      expect(state.filters.admission_status).toBe('ACTIVE'); // unchanged
    });

    it('should handle resetFilters', () => {
      const modifiedState = {
        ...initialState,
        filters: { ...initialState.filters, search: 'John', gender: 'MALE' },
      };

      const state = studentsReducer(modifiedState, resetFilters());
      expect(state.filters).toEqual(initialState.filters);
    });

    it('should handle clearCurrentStudent', () => {
      const stateWithCurrent = {
        ...initialState,
        current: { id: '1', name: 'John Doe' },
      };

      const state = studentsReducer(stateWithCurrent, clearCurrentStudent());
      expect(state.current).toBeNull();
    });

    it('should handle clearError', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error message',
      };

      const state = studentsReducer(stateWithError, clearError());
      expect(state.error).toBeNull();
    });
  });

  describe('fetchStudents async thunk', () => {
    it('should handle fetchStudents.pending', () => {
      const state = studentsReducer(initialState, fetchStudents.pending());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchStudents.fulfilled with paginated results', () => {
      const payload = {
        results: [
          { id: '1', name: 'John Doe' },
          { id: '2', name: 'Jane Smith' },
        ],
        count: 50,
        next: 'http://api/students?page=2',
        previous: null,
      };

      const state = studentsReducer(initialState, fetchStudents.fulfilled(payload));

      expect(state.loading).toBe(false);
      expect(state.list).toEqual(payload.results);
      expect(state.pagination.count).toBe(50);
      expect(state.pagination.next).toBe('http://api/students?page=2');
    });

    it('should handle fetchStudents.fulfilled with non-paginated results', () => {
      const payload = [
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' },
      ];

      const state = studentsReducer(initialState, fetchStudents.fulfilled(payload));

      expect(state.loading).toBe(false);
      expect(state.list).toEqual(payload);
      expect(state.pagination.count).toBe(0);
    });

    it('should handle fetchStudents.rejected', () => {
      const error = 'Failed to fetch students';
      const state = studentsReducer(initialState, fetchStudents.rejected(null, '', null, error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('fetchStudentById async thunk', () => {
    it('should handle fetchStudentById.pending', () => {
      const state = studentsReducer(initialState, fetchStudentById.pending());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchStudentById.fulfilled', () => {
      const payload = { id: '1', name: 'John Doe', email: 'john@test.com' };
      const state = studentsReducer(initialState, fetchStudentById.fulfilled(payload));

      expect(state.loading).toBe(false);
      expect(state.current).toEqual(payload);
    });

    it('should handle fetchStudentById.rejected', () => {
      const error = 'Student not found';
      const state = studentsReducer(initialState, fetchStudentById.rejected(null, '', null, error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('createStudent async thunk', () => {
    it('should handle createStudent.pending', () => {
      const state = studentsReducer(initialState, createStudent.pending());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle createStudent.fulfilled', () => {
      const existingState = {
        ...initialState,
        list: [{ id: '1', name: 'Existing Student' }],
      };

      const newStudent = { id: '2', name: 'New Student' };
      const state = studentsReducer(existingState, createStudent.fulfilled(newStudent));

      expect(state.loading).toBe(false);
      expect(state.list).toHaveLength(2);
      expect(state.list[0]).toEqual(newStudent); // added to beginning
      expect(state.current).toEqual(newStudent);
    });

    it('should handle createStudent.rejected', () => {
      const error = 'Validation error';
      const state = studentsReducer(initialState, createStudent.rejected(null, '', null, error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('updateStudent async thunk', () => {
    it('should handle updateStudent.pending', () => {
      const state = studentsReducer(initialState, updateStudent.pending());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle updateStudent.fulfilled', () => {
      const existingState = {
        ...initialState,
        list: [
          { id: '1', name: 'John Doe' },
          { id: '2', name: 'Jane Smith' },
        ],
      };

      const updatedStudent = { id: '1', name: 'John Updated' };
      const state = studentsReducer(existingState, updateStudent.fulfilled(updatedStudent));

      expect(state.loading).toBe(false);
      expect(state.list[0]).toEqual(updatedStudent);
      expect(state.list[1].name).toBe('Jane Smith'); // unchanged
      expect(state.current).toEqual(updatedStudent);
    });

    it('should handle updateStudent.fulfilled when student not in list', () => {
      const existingState = {
        ...initialState,
        list: [{ id: '2', name: 'Jane Smith' }],
      };

      const updatedStudent = { id: '1', name: 'John Updated' };
      const state = studentsReducer(existingState, updateStudent.fulfilled(updatedStudent));

      expect(state.loading).toBe(false);
      expect(state.list).toHaveLength(1); // list unchanged
      expect(state.current).toEqual(updatedStudent);
    });

    it('should handle updateStudent.rejected', () => {
      const error = 'Update failed';
      const state = studentsReducer(initialState, updateStudent.rejected(null, '', null, error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('deleteStudent async thunk', () => {
    it('should handle deleteStudent.pending', () => {
      const state = studentsReducer(initialState, deleteStudent.pending());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle deleteStudent.fulfilled', () => {
      const existingState = {
        ...initialState,
        list: [
          { id: '1', name: 'John Doe' },
          { id: '2', name: 'Jane Smith' },
        ],
        current: { id: '1', name: 'John Doe' },
      };

      const state = studentsReducer(existingState, deleteStudent.fulfilled('1'));

      expect(state.loading).toBe(false);
      expect(state.list).toHaveLength(1);
      expect(state.list[0].id).toBe('2');
      expect(state.current).toBeNull(); // cleared because it was the deleted student
    });

    it('should handle deleteStudent.fulfilled without clearing current if different', () => {
      const existingState = {
        ...initialState,
        list: [
          { id: '1', name: 'John Doe' },
          { id: '2', name: 'Jane Smith' },
        ],
        current: { id: '2', name: 'Jane Smith' },
      };

      const state = studentsReducer(existingState, deleteStudent.fulfilled('1'));

      expect(state.list).toHaveLength(1);
      expect(state.current.id).toBe('2'); // not cleared
    });

    it('should handle deleteStudent.rejected', () => {
      const error = 'Delete failed';
      const state = studentsReducer(initialState, deleteStudent.rejected(null, '', null, error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('bulkUploadStudents async thunk', () => {
    it('should handle bulkUploadStudents.pending', () => {
      const state = studentsReducer(initialState, bulkUploadStudents.pending());

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.bulkUploadProgress).toBe(0);
    });

    it('should handle bulkUploadStudents.fulfilled', () => {
      const payload = { success: 10, failed: 0 };
      const state = studentsReducer(initialState, bulkUploadStudents.fulfilled(payload));

      expect(state.loading).toBe(false);
      expect(state.bulkUploadProgress).toBe(100);
    });

    it('should handle bulkUploadStudents.rejected', () => {
      const error = 'Upload failed';
      const state = studentsReducer(initialState, bulkUploadStudents.rejected(null, '', null, error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
      expect(state.bulkUploadProgress).toBeNull();
    });
  });

  describe('fetchStudentStatistics async thunk', () => {
    it('should handle fetchStudentStatistics.pending', () => {
      const state = studentsReducer(initialState, fetchStudentStatistics.pending());

      expect(state.loading).toBe(true);
    });

    it('should handle fetchStudentStatistics.fulfilled', () => {
      const payload = {
        total: 100,
        active: 95,
        inactive: 5,
        by_gender: { MALE: 55, FEMALE: 45 },
      };

      const state = studentsReducer(initialState, fetchStudentStatistics.fulfilled(payload));

      expect(state.loading).toBe(false);
      expect(state.statistics).toEqual(payload);
      expect(state.stats).toEqual(payload); // backward compatibility
    });

    it('should handle fetchStudentStatistics.rejected', () => {
      const error = 'Stats fetch failed';
      const state = studentsReducer(initialState, fetchStudentStatistics.rejected(null, '', null, error));

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('selectors', () => {
    const mockState = {
      students: {
        list: [{ id: '1', name: 'John' }],
        current: { id: '1', name: 'John' },
        filters: { search: 'test' },
        pagination: { count: 1 },
        loading: true,
        error: 'error message',
        statistics: { total: 100 },
      },
    };

    it('selectStudents should return list', () => {
      expect(selectStudents(mockState)).toEqual([{ id: '1', name: 'John' }]);
    });

    it('selectCurrentStudent should return current student', () => {
      expect(selectCurrentStudent(mockState)).toEqual({ id: '1', name: 'John' });
    });

    it('selectStudentFilters should return filters', () => {
      expect(selectStudentFilters(mockState)).toEqual({ search: 'test' });
    });

    it('selectStudentPagination should return pagination', () => {
      expect(selectStudentPagination(mockState)).toEqual({ count: 1 });
    });

    it('selectStudentLoading should return loading state', () => {
      expect(selectStudentLoading(mockState)).toBe(true);
    });

    it('selectStudentError should return error', () => {
      expect(selectStudentError(mockState)).toBe('error message');
    });

    it('selectStudentStatistics should return statistics', () => {
      expect(selectStudentStatistics(mockState)).toEqual({ total: 100 });
    });
  });
});
