import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as reportsAPI from '../../api/reports';

// ── Async Thunks ──

export const fetchTemplates = createAsyncThunk(
    'reports/fetchTemplates',
    async (params = {}, { rejectWithValue }) => {
        try { const res = await reportsAPI.getTemplates(params); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data || err.message); }
    }
);

export const fetchTemplatesByModule = createAsyncThunk(
    'reports/fetchTemplatesByModule',
    async (_, { rejectWithValue }) => {
        try { const res = await reportsAPI.getTemplatesByModule(); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data || err.message); }
    }
);

export const fetchGeneratedReports = createAsyncThunk(
    'reports/fetchGeneratedReports',
    async (params = {}, { rejectWithValue }) => {
        try { const res = await reportsAPI.getGeneratedReports(params); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data || err.message); }
    }
);

export const generateReport = createAsyncThunk(
    'reports/generateReport',
    async (data, { rejectWithValue }) => {
        try { const res = await reportsAPI.generateReport(data); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data || err.message); }
    }
);

export const fetchReportStats = createAsyncThunk(
    'reports/fetchReportStats',
    async (_, { rejectWithValue }) => {
        try { const res = await reportsAPI.getReportStats(); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data || err.message); }
    }
);

export const fetchSchedules = createAsyncThunk(
    'reports/fetchSchedules',
    async (params = {}, { rejectWithValue }) => {
        try { const res = await reportsAPI.getSchedules(params); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data || err.message); }
    }
);

export const fetchSavedReports = createAsyncThunk(
    'reports/fetchSavedReports',
    async (params = {}, { rejectWithValue }) => {
        try { const res = await reportsAPI.getSavedReports(params); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data || err.message); }
    }
);

// ── Slice ──

const initialState = {
    templates: [],
    templatePagination: { count: 0, next: null, previous: null },
    templatesByModule: null,
    generatedReports: [],
    generatedPagination: { count: 0, next: null, previous: null },
    reportStats: null,
    schedules: [],
    savedReports: [],
    filters: { search: '', module: '', status: '', page: 1, pageSize: 20 },
    loading: false,
    generating: false,
    error: null,
};

const reportsSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => { state.filters = initialState.filters; },
        clearError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTemplates.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchTemplates.fulfilled, (state, action) => {
                state.loading = false;
                state.templates = action.payload.results;
                state.templatePagination = { count: action.payload.count, next: action.payload.next, previous: action.payload.previous };
            })
            .addCase(fetchTemplates.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(fetchTemplatesByModule.fulfilled, (state, action) => { state.templatesByModule = action.payload; })
            .addCase(fetchGeneratedReports.pending, (state) => { state.loading = true; })
            .addCase(fetchGeneratedReports.fulfilled, (state, action) => {
                state.loading = false;
                state.generatedReports = action.payload.results;
                state.generatedPagination = { count: action.payload.count, next: action.payload.next, previous: action.payload.previous };
            })
            .addCase(fetchGeneratedReports.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(generateReport.pending, (state) => { state.generating = true; state.error = null; })
            .addCase(generateReport.fulfilled, (state, action) => {
                state.generating = false;
                state.generatedReports = [action.payload, ...state.generatedReports];
            })
            .addCase(generateReport.rejected, (state, action) => { state.generating = false; state.error = action.payload; })
            .addCase(fetchReportStats.fulfilled, (state, action) => { state.reportStats = action.payload; })
            .addCase(fetchSchedules.fulfilled, (state, action) => { state.schedules = action.payload.results; })
            .addCase(fetchSavedReports.fulfilled, (state, action) => { state.savedReports = action.payload.results; });
    },
});

// ── Selectors ──
export const selectTemplates = (state) => state.reports.templates;
export const selectTemplatePagination = (state) => state.reports.templatePagination;
export const selectTemplatesByModule = (state) => state.reports.templatesByModule;
export const selectGeneratedReports = (state) => state.reports.generatedReports;
export const selectGeneratedPagination = (state) => state.reports.generatedPagination;
export const selectReportStats = (state) => state.reports.reportStats;
export const selectSchedules = (state) => state.reports.schedules;
export const selectSavedReports = (state) => state.reports.savedReports;
export const selectReportFilters = (state) => state.reports.filters;
export const selectReportLoading = (state) => state.reports.loading;
export const selectReportGenerating = (state) => state.reports.generating;

export const { setFilters, resetFilters, clearError } = reportsSlice.actions;
export default reportsSlice.reducer;
