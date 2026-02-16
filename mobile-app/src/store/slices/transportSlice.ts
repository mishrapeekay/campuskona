import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { transportService } from '@/services/api';
import { Route, Stop, Vehicle, TransportAllocation } from '@/types/models';
import { PaginatedResponse } from '@/types/api';

interface TransportState {
  routes: Route[];
  vehicles: Vehicle[];
  allocations: TransportAllocation[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: TransportState = {
  routes: [],
  vehicles: [],
  allocations: [],
  totalCount: 0,
  isLoading: false,
  error: null,
};

export const fetchRoutes = createAsyncThunk(
  'transport/fetchRoutes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transportService.getRoutes();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch routes');
    }
  }
);

export const fetchStudentTransport = createAsyncThunk(
  'transport/fetchStudentTransport',
  async (studentId: string, { rejectWithValue }) => {
    try {
      const response = await transportService.getStudentAllocation(studentId);
      // The slice expects an array, so wrap the single result in an array or adjust the slice
      // Looking at the slice, it updates 'allocations', which is TransportAllocation[]
      // Let's modify the slice to expect PaginatedResponse or modify this to return array
      // For now, let's simply return an array with the single allocation if found, or empty
      return response ? [response] : [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transport details');
    }
  }
);

const transportSlice = createSlice({
  name: 'transport',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTransport: (state) => {
      state.routes = [];
      state.vehicles = [];
      state.allocations = [];
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoutes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action: PayloadAction<PaginatedResponse<Route>>) => {
        state.isLoading = false;
        state.routes = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStudentTransport.fulfilled, (state, action: PayloadAction<TransportAllocation[]>) => {
        state.allocations = action.payload;
      });
  },
});

export const { clearError, clearTransport } = transportSlice.actions;
export default transportSlice.reducer;
