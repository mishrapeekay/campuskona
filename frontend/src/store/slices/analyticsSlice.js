import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as analyticsAPI from '../../api/analytics';

export const fetchInvestorDashboard = createAsyncThunk(
  'analytics/fetchInvestorDashboard',
  async (params, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.fetchInvestorDashboard(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch investor dashboard');
    }
  }
);

export const refreshInvestorDashboard = createAsyncThunk(
  'analytics/refreshInvestorDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.refreshInvestorDashboard();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to refresh analytics');
    }
  }
);

const initialState = {
  dashboard: { data: null, loading: false },
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestorDashboard.pending, (state) => {
        state.dashboard.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestorDashboard.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.data = action.payload;
      })
      .addCase(fetchInvestorDashboard.rejected, (state, action) => {
        state.dashboard.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshInvestorDashboard.fulfilled, (state, action) => {
        // Refresh triggers a reload of the dashboard in most cases
      });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
