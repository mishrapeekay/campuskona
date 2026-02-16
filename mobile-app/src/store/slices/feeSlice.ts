import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { feeService } from '@/services/api';
import { StudentFee, Payment, Invoice } from '@/types/models';
import { PaginatedResponse, FeeQueryParams } from '@/types/api';

interface FeeState {
  fees: StudentFee[];
  payments: Payment[];
  invoices: Invoice[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: FeeState = {
  fees: [],
  payments: [],
  invoices: [],
  totalCount: 0,
  isLoading: false,
  error: null,
};

export const fetchStudentFees = createAsyncThunk(
  'fee/fetchStudentFees',
  async (params: FeeQueryParams = {}, { rejectWithValue }) => {
    try {
      const response = await feeService.getStudentFees(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch fees');
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'fee/fetchPaymentHistory',
  async (studentId: string, { rejectWithValue }) => {
    try {
      const response = await feeService.getPaymentHistory(studentId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch payment history');
    }
  }
);

const feeSlice = createSlice({
  name: 'fee',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearFees: (state) => {
      state.fees = [];
      state.payments = [];
      state.invoices = [];
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentFees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentFees.fulfilled, (state, action: PayloadAction<PaginatedResponse<StudentFee>>) => {
        state.isLoading = false;
        state.fees = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchStudentFees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action: PayloadAction<Payment[]>) => {
        state.payments = action.payload;
      });
  },
});

export const { clearError, clearFees } = feeSlice.actions;
export default feeSlice.reducer;
