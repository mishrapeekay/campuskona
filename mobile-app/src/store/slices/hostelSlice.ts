/**
 * Hostel Redux Slice
 * Manages state for hostels, rooms, allocations, attendance, mess menus, complaints, and visitors.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { hostelService } from '@/services/api';
import {
  Hostel,
  Room,
  RoomAllocation,
  HostelAttendance,
  MessMenu,
  HostelComplaint,
  HostelVisitor,
  HostelDashboardStats,
  HostelAttendanceSummary,
  BulkAttendanceRecord,
} from '@/services/api/hostel.service';
import { PaginatedResponse, QueryParams } from '@/types/api';

// ──────────────────────── State Interface ────────────────────────

interface HostelState {
  hostels: Hostel[];
  selectedHostel: Hostel | null;
  dashboardStats: HostelDashboardStats | null;

  rooms: Room[];
  roomsTotalCount: number;

  allocations: RoomAllocation[];

  attendance: HostelAttendance[];
  attendanceSummary: HostelAttendanceSummary | null;

  messMenus: MessMenu[];

  complaints: HostelComplaint[];
  complaintsTotalCount: number;

  visitors: HostelVisitor[];

  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: HostelState = {
  hostels: [],
  selectedHostel: null,
  dashboardStats: null,

  rooms: [],
  roomsTotalCount: 0,

  allocations: [],

  attendance: [],
  attendanceSummary: null,

  messMenus: [],

  complaints: [],
  complaintsTotalCount: 0,

  visitors: [],

  isLoading: false,
  isSubmitting: false,
  error: null,
};

// ──────────────────────── Async Thunks ────────────────────────

export const fetchHostels = createAsyncThunk(
  'hostel/fetchHostels',
  async (params: QueryParams = {}, { rejectWithValue }) => {
    try {
      return await hostelService.getHostels(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch hostels');
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'hostel/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      return await hostelService.getDashboardStats();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchRooms = createAsyncThunk(
  'hostel/fetchRooms',
  async (params: QueryParams & { hostel?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      return await hostelService.getRooms(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch rooms');
    }
  }
);

export const fetchAllocations = createAsyncThunk(
  'hostel/fetchAllocations',
  async (params: QueryParams & { room?: string; is_active?: boolean } = {}, { rejectWithValue }) => {
    try {
      return await hostelService.getAllocations(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch allocations');
    }
  }
);

export const fetchHostelAttendance = createAsyncThunk(
  'hostel/fetchAttendance',
  async (params: QueryParams & { hostel?: string; date?: string } = {}, { rejectWithValue }) => {
    try {
      return await hostelService.getAttendance(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch attendance');
    }
  }
);

export const bulkMarkAttendance = createAsyncThunk(
  'hostel/bulkMarkAttendance',
  async (
    { hostelId, date, records }: { hostelId: string; date: string; records: BulkAttendanceRecord[] },
    { rejectWithValue }
  ) => {
    try {
      return await hostelService.bulkMarkAttendance(hostelId, date, records);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark attendance');
    }
  }
);

export const fetchAttendanceSummary = createAsyncThunk(
  'hostel/fetchAttendanceSummary',
  async ({ hostelId, date }: { hostelId: string; date: string }, { rejectWithValue }) => {
    try {
      return await hostelService.getAttendanceSummary(hostelId, date);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch attendance summary');
    }
  }
);

export const fetchMessMenus = createAsyncThunk(
  'hostel/fetchMessMenus',
  async (params: QueryParams & { hostel?: string; day?: number } = {}, { rejectWithValue }) => {
    try {
      return await hostelService.getMessMenus(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch mess menus');
    }
  }
);

export const fetchComplaints = createAsyncThunk(
  'hostel/fetchComplaints',
  async (params: QueryParams & { hostel?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      return await hostelService.getComplaints(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch complaints');
    }
  }
);

export const createComplaint = createAsyncThunk(
  'hostel/createComplaint',
  async (data: Partial<HostelComplaint>, { rejectWithValue }) => {
    try {
      return await hostelService.createComplaint(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create complaint');
    }
  }
);

export const fetchVisitors = createAsyncThunk(
  'hostel/fetchVisitors',
  async (params: QueryParams & { hostel?: string } = {}, { rejectWithValue }) => {
    try {
      return await hostelService.getVisitors(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch visitors');
    }
  }
);

// ──────────────────────── Slice ────────────────────────

const hostelSlice = createSlice({
  name: 'hostel',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedHostel: (state, action: PayloadAction<Hostel>) => {
      state.selectedHostel = action.payload;
    },
    clearSelectedHostel: (state) => {
      state.selectedHostel = null;
    },
    clearHostel: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Hostels
      .addCase(fetchHostels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHostels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hostels = action.payload.results;
      })
      .addCase(fetchHostels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Dashboard Stats
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      })
      // Rooms
      .addCase(fetchRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload.results;
        state.roomsTotalCount = action.payload.count;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Allocations
      .addCase(fetchAllocations.fulfilled, (state, action) => {
        state.allocations = action.payload.results;
      })
      // Attendance
      .addCase(fetchHostelAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHostelAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attendance = action.payload.results;
      })
      .addCase(fetchHostelAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Bulk Mark Attendance
      .addCase(bulkMarkAttendance.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(bulkMarkAttendance.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(bulkMarkAttendance.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Attendance Summary
      .addCase(fetchAttendanceSummary.fulfilled, (state, action) => {
        state.attendanceSummary = action.payload;
      })
      // Mess Menus
      .addCase(fetchMessMenus.fulfilled, (state, action) => {
        state.messMenus = action.payload.results;
      })
      // Complaints
      .addCase(fetchComplaints.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.isLoading = false;
        state.complaints = action.payload.results;
        state.complaintsTotalCount = action.payload.count;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Complaint
      .addCase(createComplaint.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.complaints = [action.payload, ...state.complaints];
        state.complaintsTotalCount += 1;
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Visitors
      .addCase(fetchVisitors.fulfilled, (state, action) => {
        state.visitors = action.payload.results;
      });
  },
});

export const { clearError, setSelectedHostel, clearSelectedHostel, clearHostel } = hostelSlice.actions;
export default hostelSlice.reducer;
