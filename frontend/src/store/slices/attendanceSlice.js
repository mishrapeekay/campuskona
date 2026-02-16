import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as attendanceAPI from '../../api/attendance';

// Async thunks
export const fetchStudentAttendance = createAsyncThunk(
    'attendance/fetchStudentAttendance',
    async (params, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getStudentAttendance(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch attendance');
        }
    }
);

export const fetchClassAttendance = createAsyncThunk(
    'attendance/fetchClassAttendance',
    async (params, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getClassAttendance(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch class attendance');
        }
    }
);

export const markBulkAttendance = createAsyncThunk(
    'attendance/markBulkAttendance',
    async (data, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.markBulkAttendance(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to mark attendance');
        }
    }
);

export const fetchStudentLeaves = createAsyncThunk(
    'attendance/fetchStudentLeaves',
    async (params, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getStudentLeaves(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch leaves');
        }
    }
);

export const createStudentLeave = createAsyncThunk(
    'attendance/createStudentLeave',
    async (data, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.createStudentLeave(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create leave');
        }
    }
);

export const approveLeave = createAsyncThunk(
    'attendance/approveLeave',
    async ({ id, type, remarks }, { rejectWithValue }) => {
        try {
            const response = type === 'student'
                ? await attendanceAPI.approveStudentLeave(id, remarks)
                : await attendanceAPI.approveStaffLeave(id, remarks);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to approve leave');
        }
    }
);

export const rejectLeave = createAsyncThunk(
    'attendance/rejectLeave',
    async ({ id, type, remarks }, { rejectWithValue }) => {
        try {
            const response = type === 'student'
                ? await attendanceAPI.rejectStudentLeave(id, remarks)
                : await attendanceAPI.rejectStaffLeave(id, remarks);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to reject leave');
        }
    }
);

export const fetchAttendanceSummary = createAsyncThunk(
    'attendance/fetchAttendanceSummary',
    async (params, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getAttendanceSummary(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch summary');
        }
    }
);

export const fetchHolidays = createAsyncThunk(
    'attendance/fetchHolidays',
    async (params, { rejectWithValue }) => {
        try {
            const response = await attendanceAPI.getHolidays(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch holidays');
        }
    }
);

// Initial state
const initialState = {
    studentAttendance: {
        data: [],
        pagination: null,
        loading: false,
        error: null,
    },
    classAttendance: {
        data: null,
        loading: false,
        error: null,
    },
    leaves: {
        data: [],
        pagination: null,
        loading: false,
        error: null,
    },
    summary: {
        data: [],
        loading: false,
        error: null,
    },
    holidays: {
        data: [],
        loading: false,
        error: null,
    },
    filters: {
        date: new Date().toISOString().split('T')[0],
        classId: null,
        sectionId: null,
        status: null,
    },
    selectedAttendance: null,
};

// Slice
const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
        setSelectedAttendance: (state, action) => {
            state.selectedAttendance = action.payload;
        },
        clearError: (state, action) => {
            const section = action.payload;
            if (state[section]) {
                state[section].error = null;
            }
        },
    },
    extraReducers: (builder) => {
        // Student Attendance
        builder
            .addCase(fetchStudentAttendance.pending, (state) => {
                state.studentAttendance.loading = true;
                state.studentAttendance.error = null;
            })
            .addCase(fetchStudentAttendance.fulfilled, (state, action) => {
                state.studentAttendance.loading = false;
                state.studentAttendance.data = action.payload.results || action.payload;
                state.studentAttendance.pagination = action.payload.count ? {
                    count: action.payload.count,
                    next: action.payload.next,
                    previous: action.payload.previous,
                } : null;
            })
            .addCase(fetchStudentAttendance.rejected, (state, action) => {
                state.studentAttendance.loading = false;
                state.studentAttendance.error = action.payload;
            });

        // Class Attendance
        builder
            .addCase(fetchClassAttendance.pending, (state) => {
                state.classAttendance.loading = true;
                state.classAttendance.error = null;
            })
            .addCase(fetchClassAttendance.fulfilled, (state, action) => {
                state.classAttendance.loading = false;
                state.classAttendance.data = action.payload;
            })
            .addCase(fetchClassAttendance.rejected, (state, action) => {
                state.classAttendance.loading = false;
                state.classAttendance.error = action.payload;
            });

        // Mark Bulk Attendance
        builder
            .addCase(markBulkAttendance.pending, (state) => {
                state.classAttendance.loading = true;
                state.classAttendance.error = null;
            })
            .addCase(markBulkAttendance.fulfilled, (state) => {
                state.classAttendance.loading = false;
            })
            .addCase(markBulkAttendance.rejected, (state, action) => {
                state.classAttendance.loading = false;
                state.classAttendance.error = action.payload;
            });

        // Student Leaves
        builder
            .addCase(fetchStudentLeaves.pending, (state) => {
                state.leaves.loading = true;
                state.leaves.error = null;
            })
            .addCase(fetchStudentLeaves.fulfilled, (state, action) => {
                state.leaves.loading = false;
                state.leaves.data = action.payload.results || action.payload;
                state.leaves.pagination = action.payload.count ? {
                    count: action.payload.count,
                    next: action.payload.next,
                    previous: action.payload.previous,
                } : null;
            })
            .addCase(fetchStudentLeaves.rejected, (state, action) => {
                state.leaves.loading = false;
                state.leaves.error = action.payload;
            });

        // Create Leave
        builder
            .addCase(createStudentLeave.fulfilled, (state, action) => {
                state.leaves.data.unshift(action.payload);
            });

        // Approve/Reject Leave
        builder
            .addCase(approveLeave.fulfilled, (state, action) => {
                const index = state.leaves.data.findIndex(l => l.id === action.payload.leave.id);
                if (index !== -1) {
                    state.leaves.data[index] = action.payload.leave;
                }
            })
            .addCase(rejectLeave.fulfilled, (state, action) => {
                const index = state.leaves.data.findIndex(l => l.id === action.payload.leave.id);
                if (index !== -1) {
                    state.leaves.data[index] = action.payload.leave;
                }
            });

        // Summary
        builder
            .addCase(fetchAttendanceSummary.pending, (state) => {
                state.summary.loading = true;
                state.summary.error = null;
            })
            .addCase(fetchAttendanceSummary.fulfilled, (state, action) => {
                state.summary.loading = false;
                state.summary.data = action.payload.results || action.payload;
            })
            .addCase(fetchAttendanceSummary.rejected, (state, action) => {
                state.summary.loading = false;
                state.summary.error = action.payload;
            });

        // Holidays
        builder
            .addCase(fetchHolidays.pending, (state) => {
                state.holidays.loading = true;
                state.holidays.error = null;
            })
            .addCase(fetchHolidays.fulfilled, (state, action) => {
                state.holidays.loading = false;
                state.holidays.data = action.payload.results || action.payload;
            })
            .addCase(fetchHolidays.rejected, (state, action) => {
                state.holidays.loading = false;
                state.holidays.error = action.payload;
            });
    },
});

export const { setFilters, clearFilters, setSelectedAttendance, clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
