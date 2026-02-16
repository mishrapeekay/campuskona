/**
 * HR & Payroll Redux Slice
 * Manages state for departments, designations, salary structures, payroll runs, and payslips.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { hrPayrollService } from '@/services/api';
import {
  Department,
  Designation,
  SalaryStructure,
  PayrollRun,
  Payslip,
  HRDashboardStats,
} from '@/services/api/hrPayroll.service';
import { PaginatedResponse, QueryParams } from '@/types/api';

// ──────────────────────── State Interface ────────────────────────

interface HRPayrollState {
  departments: Department[];
  designations: Designation[];

  salaryStructures: SalaryStructure[];
  selectedSalaryStructure: SalaryStructure | null;

  payrollRuns: PayrollRun[];
  payrollRunsTotalCount: number;
  selectedPayrollRun: PayrollRun | null;

  payslips: Payslip[];
  payslipsTotalCount: number;
  selectedPayslip: Payslip | null;

  dashboardStats: HRDashboardStats | null;

  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: HRPayrollState = {
  departments: [],
  designations: [],

  salaryStructures: [],
  selectedSalaryStructure: null,

  payrollRuns: [],
  payrollRunsTotalCount: 0,
  selectedPayrollRun: null,

  payslips: [],
  payslipsTotalCount: 0,
  selectedPayslip: null,

  dashboardStats: null,

  isLoading: false,
  isSubmitting: false,
  error: null,
};

// ──────────────────────── Async Thunks ────────────────────────

export const fetchDepartments = createAsyncThunk(
  'hrPayroll/fetchDepartments',
  async (params: QueryParams = {}, { rejectWithValue }) => {
    try {
      return await hrPayrollService.getDepartments(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch departments');
    }
  }
);

export const fetchDesignations = createAsyncThunk(
  'hrPayroll/fetchDesignations',
  async (params: QueryParams & { department?: string } = {}, { rejectWithValue }) => {
    try {
      return await hrPayrollService.getDesignations(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch designations');
    }
  }
);

export const fetchSalaryStructures = createAsyncThunk(
  'hrPayroll/fetchSalaryStructures',
  async (params: QueryParams & { staff?: string; is_active?: boolean } = {}, { rejectWithValue }) => {
    try {
      return await hrPayrollService.getSalaryStructures(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch salary structures');
    }
  }
);

export const fetchSalaryStructure = createAsyncThunk(
  'hrPayroll/fetchSalaryStructure',
  async (id: string, { rejectWithValue }) => {
    try {
      return await hrPayrollService.getSalaryStructure(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch salary structure');
    }
  }
);

export const fetchPayrollRuns = createAsyncThunk(
  'hrPayroll/fetchPayrollRuns',
  async (params: QueryParams & { status?: string; year?: number } = {}, { rejectWithValue }) => {
    try {
      return await hrPayrollService.getPayrollRuns(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch payroll runs');
    }
  }
);

export const processPayrollRun = createAsyncThunk(
  'hrPayroll/processPayrollRun',
  async (id: string, { rejectWithValue }) => {
    try {
      return await hrPayrollService.processPayrollRun(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to process payroll');
    }
  }
);

export const fetchPayslips = createAsyncThunk(
  'hrPayroll/fetchPayslips',
  async (params: QueryParams & { staff?: string; status?: string; year?: number; month?: number } = {}, { rejectWithValue }) => {
    try {
      return await hrPayrollService.getPayslips(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch payslips');
    }
  }
);

export const fetchPayslip = createAsyncThunk(
  'hrPayroll/fetchPayslip',
  async (id: string, { rejectWithValue }) => {
    try {
      return await hrPayrollService.getPayslip(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch payslip');
    }
  }
);

export const fetchHRDashboardStats = createAsyncThunk(
  'hrPayroll/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      return await hrPayrollService.getDashboardStats();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch HR dashboard stats');
    }
  }
);

// ──────────────────────── Slice ────────────────────────

const hrPayrollSlice = createSlice({
  name: 'hrPayroll',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedPayrollRun: (state, action: PayloadAction<PayrollRun>) => {
      state.selectedPayrollRun = action.payload;
    },
    clearSelectedPayrollRun: (state) => {
      state.selectedPayrollRun = null;
    },
    setSelectedPayslip: (state, action: PayloadAction<Payslip>) => {
      state.selectedPayslip = action.payload;
    },
    clearSelectedPayslip: (state) => {
      state.selectedPayslip = null;
    },
    clearHRPayroll: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Departments
      .addCase(fetchDepartments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = action.payload.results;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Designations
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.designations = action.payload.results;
      })
      // Salary Structures
      .addCase(fetchSalaryStructures.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalaryStructures.fulfilled, (state, action) => {
        state.isLoading = false;
        state.salaryStructures = action.payload.results;
      })
      .addCase(fetchSalaryStructures.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Single Salary Structure
      .addCase(fetchSalaryStructure.fulfilled, (state, action) => {
        state.selectedSalaryStructure = action.payload;
      })
      // Payroll Runs
      .addCase(fetchPayrollRuns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayrollRuns.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payrollRuns = action.payload.results;
        state.payrollRunsTotalCount = action.payload.count;
      })
      .addCase(fetchPayrollRuns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Process Payroll
      .addCase(processPayrollRun.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(processPayrollRun.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const idx = state.payrollRuns.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.payrollRuns[idx] = action.payload;
        state.selectedPayrollRun = action.payload;
      })
      .addCase(processPayrollRun.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Payslips
      .addCase(fetchPayslips.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayslips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payslips = action.payload.results;
        state.payslipsTotalCount = action.payload.count;
      })
      .addCase(fetchPayslips.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Single Payslip
      .addCase(fetchPayslip.fulfilled, (state, action) => {
        state.selectedPayslip = action.payload;
      })
      // Dashboard Stats
      .addCase(fetchHRDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      });
  },
});

export const {
  clearError,
  setSelectedPayrollRun,
  clearSelectedPayrollRun,
  setSelectedPayslip,
  clearSelectedPayslip,
  clearHRPayroll,
} = hrPayrollSlice.actions;

export default hrPayrollSlice.reducer;
