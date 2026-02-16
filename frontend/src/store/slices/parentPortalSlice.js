import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as parentPortalAPI from '../../api/parentPortal';

export const fetchParentDashboard = createAsyncThunk(
    'parentPortal/fetchDashboard',
    async (studentId, { rejectWithValue }) => {
        try {
            const response = await parentPortalAPI.getParentDashboard(studentId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch dashboard');
        }
    }
);

const initialState = {
    dashboard: { data: null, loading: false },
    error: null,
};

const parentPortalSlice = createSlice({
    name: 'parentPortal',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchParentDashboard.pending, (state) => {
                state.dashboard.loading = true;
            })
            .addCase(fetchParentDashboard.fulfilled, (state, action) => {
                state.dashboard.loading = false;
                state.dashboard.data = action.payload;
            })
            .addCase(fetchParentDashboard.rejected, (state, action) => {
                state.dashboard.loading = false;
                state.error = action.payload;
            });
    },
});

export default parentPortalSlice.reducer;
