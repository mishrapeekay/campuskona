import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as assignmentsAPI from '../../api/assignments';

export const fetchAssignments = createAsyncThunk(
  'assignments/fetchAssignments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await assignmentsAPI.getAssignments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch assignments');
    }
  }
);

export const fetchAssignmentById = createAsyncThunk(
  'assignments/fetchAssignmentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await assignmentsAPI.getAssignmentById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch assignment');
    }
  }
);

export const createAssignment = createAsyncThunk(
  'assignments/createAssignment',
  async (data, { rejectWithValue }) => {
    try {
      const response = await assignmentsAPI.createAssignment(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create assignment');
    }
  }
);

export const updateAssignment = createAsyncThunk(
  'assignments/updateAssignment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await assignmentsAPI.updateAssignment(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update assignment');
    }
  }
);

export const deleteAssignment = createAsyncThunk(
  'assignments/deleteAssignment',
  async (id, { rejectWithValue }) => {
    try {
      await assignmentsAPI.deleteAssignment(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete assignment');
    }
  }
);

export const fetchSubmissions = createAsyncThunk(
  'assignments/fetchSubmissions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await assignmentsAPI.getSubmissions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch submissions');
    }
  }
);

export const gradeSubmission = createAsyncThunk(
  'assignments/gradeSubmission',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await assignmentsAPI.gradeSubmission(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to grade submission');
    }
  }
);

const initialState = {
  assignments: { data: [], loading: false, count: 0 },
  currentAssignment: { data: null, loading: false },
  submissions: { data: [], loading: false, count: 0 },
  error: null,
};

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Assignments
      .addCase(fetchAssignments.pending, (state) => {
        state.assignments.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.assignments.loading = false;
        state.assignments.data = action.payload.results || action.payload;
        state.assignments.count = action.payload.count || action.payload.length || 0;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.assignments.loading = false;
        state.error = action.payload;
      })
      // Fetch Single
      .addCase(fetchAssignmentById.pending, (state) => {
        state.currentAssignment.loading = true;
      })
      .addCase(fetchAssignmentById.fulfilled, (state, action) => {
        state.currentAssignment.loading = false;
        state.currentAssignment.data = action.payload;
      })
      .addCase(fetchAssignmentById.rejected, (state, action) => {
        state.currentAssignment.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.assignments.data.unshift(action.payload);
        state.assignments.count += 1;
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update
      .addCase(updateAssignment.fulfilled, (state, action) => {
        const index = state.assignments.data.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) state.assignments.data[index] = action.payload;
      })
      .addCase(updateAssignment.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.assignments.data = state.assignments.data.filter((a) => a.id !== action.payload);
        state.assignments.count -= 1;
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Submissions
      .addCase(fetchSubmissions.pending, (state) => {
        state.submissions.loading = true;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.submissions.loading = false;
        state.submissions.data = action.payload.results || action.payload;
        state.submissions.count = action.payload.count || action.payload.length || 0;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.submissions.loading = false;
        state.error = action.payload;
      })
      // Grade
      .addCase(gradeSubmission.fulfilled, (state, action) => {
        const index = state.submissions.data.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.submissions.data[index] = action.payload;
      })
      .addCase(gradeSubmission.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentAssignment } = assignmentsSlice.actions;
export default assignmentsSlice.reducer;
