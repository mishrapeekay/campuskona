import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { attendanceService } from '@/services/api';
import { StudentAttendance, AttendanceSummary } from '@/types/models';
import { PaginatedResponse, AttendanceQueryParams } from '@/types/api';

interface AttendanceState {
  attendanceRecords: StudentAttendance[];
  summary: AttendanceSummary | null;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  attendanceRecords: [],
  summary: null,
  totalCount: 0,
  isLoading: false,
  error: null,
};

export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAttendance',
  async (params: AttendanceQueryParams = {}, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getStudentAttendance(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch attendance');
    }
  }
);

export const fetchAttendanceSummary = createAsyncThunk(
  'attendance/fetchSummary',
  async (studentId: string, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getAttendanceSummary(studentId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch attendance summary');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAttendance: (state) => {
      state.attendanceRecords = [];
      state.summary = null;
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action: PayloadAction<PaginatedResponse<StudentAttendance>>) => {
        state.isLoading = false;
        state.attendanceRecords = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAttendanceSummary.fulfilled, (state, action: PayloadAction<AttendanceSummary>) => {
        state.summary = action.payload;
      });
  },
});

export const { clearError, clearAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;
