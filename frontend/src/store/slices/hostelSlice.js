import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as hostelAPI from '../../api/hostel';

// ── Async Thunks ──

export const fetchHostels = createAsyncThunk(
    'hostel/fetchHostels',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await hostelAPI.getHostels(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchHostelDashboardStats = createAsyncThunk(
    'hostel/fetchDashboardStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await hostelAPI.getDashboardStats();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchRooms = createAsyncThunk(
    'hostel/fetchRooms',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await hostelAPI.getRooms(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchAllocations = createAsyncThunk(
    'hostel/fetchAllocations',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await hostelAPI.getAllocations(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchComplaints = createAsyncThunk(
    'hostel/fetchComplaints',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await hostelAPI.getComplaints(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchVisitors = createAsyncThunk(
    'hostel/fetchVisitors',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await hostelAPI.getVisitors(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchMessMenus = createAsyncThunk(
    'hostel/fetchMessMenus',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await hostelAPI.getMessMenus(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ── Helpers ──
const safeList = (payload) =>
    Array.isArray(payload) ? payload : (payload?.results ?? []);
const safePagination = (payload) => ({
    count: payload?.count ?? 0,
    next: payload?.next ?? null,
    previous: payload?.previous ?? null,
});

// ── Slice ──

const initialState = {
    hostels: [],
    dashboardStats: null,
    rooms: [],
    roomPagination: { count: 0, next: null, previous: null },
    allocations: [],
    complaints: [],
    complaintPagination: { count: 0, next: null, previous: null },
    visitors: [],
    messMenus: [],
    filters: { search: '', hostel: '', status: '', page: 1, pageSize: 20 },
    loading: false,
    error: null,
};

const hostelSlice = createSlice({
    name: 'hostel',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        clearError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHostels.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchHostels.fulfilled, (state, action) => {
                state.loading = false;
                state.hostels = safeList(action.payload);
            })
            .addCase(fetchHostels.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchHostelDashboardStats.fulfilled, (state, action) => {
                state.dashboardStats = action.payload;
            })
            .addCase(fetchRooms.pending, (state) => { state.loading = true; })
            .addCase(fetchRooms.fulfilled, (state, action) => {
                state.loading = false;
                state.rooms = safeList(action.payload);
                state.roomPagination = safePagination(action.payload);
            })
            .addCase(fetchRooms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAllocations.fulfilled, (state, action) => {
                state.allocations = safeList(action.payload);
            })
            .addCase(fetchComplaints.fulfilled, (state, action) => {
                state.complaints = safeList(action.payload);
                state.complaintPagination = safePagination(action.payload);
            })
            .addCase(fetchVisitors.fulfilled, (state, action) => {
                state.visitors = safeList(action.payload);
            })
            .addCase(fetchMessMenus.fulfilled, (state, action) => {
                state.messMenus = safeList(action.payload);
            });
    },
});

// ── Selectors ──
export const selectHostels = (state) => state.hostel.hostels;
export const selectHostelDashboardStats = (state) => state.hostel.dashboardStats;
export const selectRooms = (state) => state.hostel.rooms;
export const selectRoomPagination = (state) => state.hostel.roomPagination;
export const selectAllocations = (state) => state.hostel.allocations;
export const selectComplaints = (state) => state.hostel.complaints;
export const selectVisitors = (state) => state.hostel.visitors;
export const selectMessMenus = (state) => state.hostel.messMenus;
export const selectHostelFilters = (state) => state.hostel.filters;
export const selectHostelLoading = (state) => state.hostel.loading;

export const { setFilters, resetFilters, clearError } = hostelSlice.actions;
export default hostelSlice.reducer;
