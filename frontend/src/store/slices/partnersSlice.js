import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as partnersAPI from '../../api/partners';

export const fetchPartnerDashboard = createAsyncThunk(
    'partners/fetchDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const response = await partnersAPI.fetchPartnerDashboard();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch dashboard');
        }
    }
);

export const fetchLeads = createAsyncThunk(
    'partners/fetchLeads',
    async (params, { rejectWithValue }) => {
        try {
            const response = await partnersAPI.fetchLeads(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch leads');
        }
    }
);

export const fetchCommissions = createAsyncThunk(
    'partners/fetchCommissions',
    async (params, { rejectWithValue }) => {
        try {
            const response = await partnersAPI.fetchCommissions(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch commissions');
        }
    }
);

export const fetchPayouts = createAsyncThunk(
    'partners/fetchPayouts',
    async (params, { rejectWithValue }) => {
        try {
            const response = await partnersAPI.fetchPayouts(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch payouts');
        }
    }
);

const initialState = {
    dashboard: { data: null, loading: false },
    leads: { data: [], loading: false, count: 0 },
    commissions: { data: [], loading: false, count: 0 },
    payouts: { data: [], loading: false, count: 0 },
    error: null,
};

const partnersSlice = createSlice({
    name: 'partners',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Dashboard
            .addCase(fetchPartnerDashboard.pending, (state) => {
                state.dashboard.loading = true;
            })
            .addCase(fetchPartnerDashboard.fulfilled, (state, action) => {
                state.dashboard.loading = false;
                state.dashboard.data = action.payload;
            })
            .addCase(fetchPartnerDashboard.rejected, (state, action) => {
                state.dashboard.loading = false;
                state.error = action.payload;
            })
            // Leads
            .addCase(fetchLeads.pending, (state) => {
                state.leads.loading = true;
            })
            .addCase(fetchLeads.fulfilled, (state, action) => {
                state.leads.loading = false;
                state.leads.data = action.payload.results || action.payload;
                state.leads.count = action.payload.count || action.payload.length || 0;
            })
            .addCase(fetchLeads.rejected, (state, action) => {
                state.leads.loading = false;
                state.error = action.payload;
            })
            // Commissions
            .addCase(fetchCommissions.pending, (state) => {
                state.commissions.loading = true;
            })
            .addCase(fetchCommissions.fulfilled, (state, action) => {
                state.commissions.loading = false;
                state.commissions.data = action.payload.results || action.payload;
                state.commissions.count = action.payload.count || action.payload.length || 0;
            })
            .addCase(fetchCommissions.rejected, (state, action) => {
                state.commissions.loading = false;
                state.error = action.payload;
            })
            // Payouts
            .addCase(fetchPayouts.pending, (state) => {
                state.payouts.loading = true;
            })
            .addCase(fetchPayouts.fulfilled, (state, action) => {
                state.payouts.loading = false;
                state.payouts.data = action.payload.results || action.payload;
                state.payouts.count = action.payload.count || action.payload.length || 0;
            })
            .addCase(fetchPayouts.rejected, (state, action) => {
                state.payouts.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = partnersSlice.actions;
export default partnersSlice.reducer;
