import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as hrAPI from '../../api/hrPayroll';

const safeList = (payload) =>
    Array.isArray(payload) ? payload : (payload?.results ?? []);
const safePagination = (payload) => ({
    count: payload?.count ?? 0,
    next: payload?.next ?? null,
    previous: payload?.previous ?? null,
});

// ── Async Thunks ──

export const fetchDepartments = createAsyncThunk(
    'hrPayroll/fetchDepartments',
    async (params = {}, { rejectWithValue }) => {
        try { const res = await hrAPI.getDepartments(params); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data || err.message); }
    }
);

export const fetchDesignations = createAsyncThunk(
    'hrPayroll/fetchDesignations',
    async (params = {}, { rejectWithValue }) => {
        try { const res = await hrAPI.getDesignations(params); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data || err.message); }
    }
);

export const fetchSalaryComponents = createAsyncThunk(
    'hrPayroll/fetchSalaryComponents',
    async (params = {}, { rejectWithValue }) => {
        try { const res = await hrAPI.getSalaryComponents(params); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data || err.message); }
    }
);

export const fetchPayrollRuns = createAsyncThunk(
    'hrPayroll/fetchPayrollRuns',
    async (params = {}, { rejectWithValue }) => {
        try { const res = await hrAPI.getPayrollRuns(params); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data || err.message); }
    }
);

export const createPayrollRun = createAsyncThunk(
    'hrPayroll/createPayrollRun',
    async (data, { rejectWithValue }) => {
        try { const res = await hrAPI.createPayrollRun(data); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data || err.message); }
    }
);

export const fetchPayslips = createAsyncThunk(
    'hrPayroll/fetchPayslips',
    async (params = {}, { rejectWithValue }) => {
        try { const res = await hrAPI.getPayslips(params); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data || err.message); }
    }
);

export const fetchPayslipById = createAsyncThunk(
    'hrPayroll/fetchPayslipById',
    async (id, { rejectWithValue }) => {
        try { const res = await hrAPI.getPayslipById(id); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data || err.message); }
    }
);

export const fetchHRDashboardStats = createAsyncThunk(
    'hrPayroll/fetchDashboardStats',
    async (_, { rejectWithValue }) => {
        try { const res = await hrAPI.getHRDashboardStats(); return res.data; }
        catch (err) { return rejectWithValue(err.response?.data || err.message); }
    }
);

// ── Slice ──

const initialState = {
    departments: [],
    departmentPagination: { count: 0, next: null, previous: null },
    designations: [],
    salaryComponents: [],
    payrollRuns: [],
    payrollPagination: { count: 0, next: null, previous: null },
    payslips: [],
    payslipPagination: { count: 0, next: null, previous: null },
    currentPayslip: null,
    dashboardStats: null,
    filters: { search: '', status: '', year: '', month: '', page: 1, pageSize: 20 },
    loading: false,
    error: null,
};

const hrPayrollSlice = createSlice({
    name: 'hrPayroll',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => { state.filters = initialState.filters; },
        clearError: (state) => { state.error = null; },
        clearCurrentPayslip: (state) => { state.currentPayslip = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDepartments.fulfilled, (state, action) => {
                state.departments = safeList(action.payload);
                state.departmentPagination = safePagination(action.payload);
            })
            .addCase(fetchDesignations.fulfilled, (state, action) => { state.designations = safeList(action.payload); })
            .addCase(fetchSalaryComponents.fulfilled, (state, action) => { state.salaryComponents = safeList(action.payload); })
            .addCase(fetchPayrollRuns.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchPayrollRuns.fulfilled, (state, action) => {
                state.loading = false;
                state.payrollRuns = safeList(action.payload);
                state.payrollPagination = safePagination(action.payload);
            })
            .addCase(fetchPayrollRuns.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createPayrollRun.fulfilled, (state, action) => {
                state.payrollRuns = [action.payload, ...state.payrollRuns];
            })
            .addCase(fetchPayslips.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchPayslips.fulfilled, (state, action) => {
                state.loading = false;
                state.payslips = safeList(action.payload);
                state.payslipPagination = safePagination(action.payload);
            })
            .addCase(fetchPayslips.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(fetchPayslipById.fulfilled, (state, action) => { state.currentPayslip = action.payload; })
            .addCase(fetchHRDashboardStats.fulfilled, (state, action) => { state.dashboardStats = action.payload; });
    },
});

// ── Selectors ──
export const selectDepartments = (state) => state.hrPayroll.departments;
export const selectDepartmentPagination = (state) => state.hrPayroll.departmentPagination;
export const selectDesignations = (state) => state.hrPayroll.designations;
export const selectSalaryComponents = (state) => state.hrPayroll.salaryComponents;
export const selectPayrollRuns = (state) => state.hrPayroll.payrollRuns;
export const selectPayrollPagination = (state) => state.hrPayroll.payrollPagination;
export const selectPayslips = (state) => state.hrPayroll.payslips;
export const selectPayslipPagination = (state) => state.hrPayroll.payslipPagination;
export const selectCurrentPayslip = (state) => state.hrPayroll.currentPayslip;
export const selectHRDashboardStats = (state) => state.hrPayroll.dashboardStats;
export const selectHRFilters = (state) => state.hrPayroll.filters;
export const selectHRLoading = (state) => state.hrPayroll.loading;

export const { setFilters, resetFilters, clearError, clearCurrentPayslip } = hrPayrollSlice.actions;
export default hrPayrollSlice.reducer;
