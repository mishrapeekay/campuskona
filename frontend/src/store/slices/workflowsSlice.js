import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as workflowsAPI from '../../api/workflows';

export const fetchWorkflowRequests = createAsyncThunk(
  'workflows/fetchWorkflowRequests',
  async (params, { rejectWithValue }) => {
    try {
      const response = await workflowsAPI.fetchWorkflowRequests(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch workflow requests');
    }
  }
);

export const fetchWorkflowRequestById = createAsyncThunk(
  'workflows/fetchWorkflowRequestById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await workflowsAPI.fetchWorkflowRequest(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch workflow request');
    }
  }
);

export const approveWorkflowRequest = createAsyncThunk(
  'workflows/approveWorkflowRequest',
  async ({ id, remarks }, { rejectWithValue }) => {
    try {
      const response = await workflowsAPI.approveWorkflowRequest(id, { remarks });
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to approve workflow request');
    }
  }
);

export const rejectWorkflowRequest = createAsyncThunk(
  'workflows/rejectWorkflowRequest',
  async ({ id, remarks }, { rejectWithValue }) => {
    try {
      const response = await workflowsAPI.rejectWorkflowRequest(id, { remarks });
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to reject workflow request');
    }
  }
);

const initialState = {
  requests: { data: [], loading: false, count: 0 },
  currentRequest: { data: null, loading: false },
  error: null,
};

const workflowsSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRequest: (state) => {
      state.currentRequest.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Requests
      .addCase(fetchWorkflowRequests.pending, (state) => {
        state.requests.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflowRequests.fulfilled, (state, action) => {
        state.requests.loading = false;
        state.requests.data = action.payload.results || action.payload;
        state.requests.count = action.payload.count || action.payload.length || 0;
      })
      .addCase(fetchWorkflowRequests.rejected, (state, action) => {
        state.requests.loading = false;
        state.error = action.payload;
      })
      // Fetch Single
      .addCase(fetchWorkflowRequestById.pending, (state) => {
        state.currentRequest.loading = true;
      })
      .addCase(fetchWorkflowRequestById.fulfilled, (state, action) => {
        state.currentRequest.loading = false;
        state.currentRequest.data = action.payload;
      })
      .addCase(fetchWorkflowRequestById.rejected, (state, action) => {
        state.currentRequest.loading = false;
        state.error = action.payload;
      })
      // Approve/Reject
      .addMatcher(
        (action) => [approveWorkflowRequest.fulfilled, rejectWorkflowRequest.fulfilled].includes(action.type),
        (state, action) => {
          const index = state.requests.data.findIndex((r) => r.id === action.payload.id);
          if (index !== -1) {
            // If it's approved/rejected, we might want to update the status in the list
            // or just refetch. For now let's update if we have the data.
            if (action.payload.status === 'APPROVED' || action.payload.status === 'REJECTED') {
              state.requests.data[index].status = action.payload.status;
            }
          }
          if (state.currentRequest.data?.id === action.payload.id) {
            state.currentRequest.data = { ...state.currentRequest.data, ...action.payload };
          }
        }
      )
      .addMatcher(
        (action) => [approveWorkflowRequest.rejected, rejectWorkflowRequest.rejected].includes(action.type),
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export const { clearError, clearCurrentRequest } = workflowsSlice.actions;
export default workflowsSlice.reducer;
