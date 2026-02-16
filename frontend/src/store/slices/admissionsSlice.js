import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as admissionsAPI from '../../api/admissions';

// ── Async Thunks ──

export const fetchEnquiries = createAsyncThunk(
    'admissions/fetchEnquiries',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await admissionsAPI.getEnquiries(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchApplications = createAsyncThunk(
    'admissions/fetchApplications',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await admissionsAPI.getApplications(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchApplicationById = createAsyncThunk(
    'admissions/fetchApplicationById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await admissionsAPI.getApplicationById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createApplication = createAsyncThunk(
    'admissions/createApplication',
    async (data, { rejectWithValue }) => {
        try {
            const response = await admissionsAPI.createApplication(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createEnquiry = createAsyncThunk(
    'admissions/createEnquiry',
    async (data, { rejectWithValue }) => {
        try {
            const response = await admissionsAPI.createEnquiry(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchEnquiryStats = createAsyncThunk(
    'admissions/fetchEnquiryStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await admissionsAPI.getEnquiryStats();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchApplicationStats = createAsyncThunk(
    'admissions/fetchApplicationStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await admissionsAPI.getApplicationStats();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchAdmissionSettings = createAsyncThunk(
    'admissions/fetchSettings',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await admissionsAPI.getAdmissionSettings(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ── Slice ──

const safeList = (payload) =>
    Array.isArray(payload) ? payload : (payload?.results ?? []);
const safePagination = (payload) => ({
    count: payload?.count ?? 0,
    next: payload?.next ?? null,
    previous: payload?.previous ?? null,
});

const initialState = {
    enquiries: [],
    enquiryPagination: { count: 0, next: null, previous: null },
    enquiryStats: null,

    applications: [],
    applicationPagination: { count: 0, next: null, previous: null },
    applicationStats: null,
    currentApplication: null,

    settings: [],

    enquiryFilters: { search: '', status: '', page: 1, pageSize: 20 },
    applicationFilters: { search: '', status: '', page: 1, pageSize: 20 },
    loading: false,
    error: null,
};

const admissionsSlice = createSlice({
    name: 'admissions',
    initialState,
    reducers: {
        setEnquiryFilters: (state, action) => {
            state.enquiryFilters = { ...state.enquiryFilters, ...action.payload };
        },
        setApplicationFilters: (state, action) => {
            state.applicationFilters = { ...state.applicationFilters, ...action.payload };
        },
        resetEnquiryFilters: (state) => {
            state.enquiryFilters = initialState.enquiryFilters;
        },
        resetApplicationFilters: (state) => {
            state.applicationFilters = initialState.applicationFilters;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentApplication: (state) => {
            state.currentApplication = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Enquiries
            .addCase(fetchEnquiries.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchEnquiries.fulfilled, (state, action) => {
                state.loading = false;
                state.enquiries = safeList(action.payload);
                state.enquiryPagination = safePagination(action.payload);
            })
            .addCase(fetchEnquiries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Applications
            .addCase(fetchApplications.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.applications = safeList(action.payload);
                state.applicationPagination = safePagination(action.payload);
            })
            .addCase(fetchApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Single Application
            .addCase(fetchApplicationById.fulfilled, (state, action) => {
                state.currentApplication = action.payload;
            })
            // Create Application
            .addCase(createApplication.fulfilled, (state, action) => {
                state.applications = [action.payload, ...state.applications];
            })
            // Create Enquiry
            .addCase(createEnquiry.fulfilled, (state, action) => {
                state.enquiries = [action.payload, ...state.enquiries];
            })
            // Stats
            .addCase(fetchEnquiryStats.fulfilled, (state, action) => { state.enquiryStats = action.payload; })
            .addCase(fetchApplicationStats.fulfilled, (state, action) => { state.applicationStats = action.payload; })
            // Settings
            .addCase(fetchAdmissionSettings.fulfilled, (state, action) => {
                state.settings = safeList(action.payload);
            });
    },
});

// ── Selectors ──
export const selectEnquiries = (state) => state.admissions.enquiries;
export const selectApplications = (state) => state.admissions.applications;
export const selectCurrentApplication = (state) => state.admissions.currentApplication;
export const selectEnquiryFilters = (state) => state.admissions.enquiryFilters;
export const selectApplicationFilters = (state) => state.admissions.applicationFilters;
export const selectEnquiryPagination = (state) => state.admissions.enquiryPagination;
export const selectApplicationPagination = (state) => state.admissions.applicationPagination;
export const selectAdmissionLoading = (state) => state.admissions.loading;
export const selectEnquiryStats = (state) => state.admissions.enquiryStats;
export const selectApplicationStats = (state) => state.admissions.applicationStats;
export const selectAdmissionSettings = (state) => state.admissions.settings;

export const { setEnquiryFilters, setApplicationFilters, resetEnquiryFilters, resetApplicationFilters, clearError, clearCurrentApplication } = admissionsSlice.actions;
export default admissionsSlice.reducer;
