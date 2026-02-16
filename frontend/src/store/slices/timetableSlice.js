import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as timetableAPI from '../../api/timetable';

// Async thunks
export const fetchTimeSlots = createAsyncThunk(
    'timetable/fetchTimeSlots',
    async (params, { rejectWithValue }) => {
        try {
            const response = await timetableAPI.getTimeSlots(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch time slots');
        }
    }
);

export const fetchClassTimetable = createAsyncThunk(
    'timetable/fetchClassTimetable',
    async (params, { rejectWithValue }) => {
        try {
            const response = await timetableAPI.getClassTimetable(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch timetable');
        }
    }
);

export const createClassTimetable = createAsyncThunk(
    'timetable/createClassTimetable',
    async (data, { rejectWithValue }) => {
        try {
            const response = await timetableAPI.createClassTimetable(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create timetable entry');
        }
    }
);

export const fetchWeeklyTimetable = createAsyncThunk(
    'timetable/fetchWeeklyTimetable',
    async (params, { rejectWithValue }) => {
        try {
            const response = await timetableAPI.getWeeklyTimetable(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch weekly timetable');
        }
    }
);

export const createBulkTimetable = createAsyncThunk(
    'timetable/createBulkTimetable',
    async (data, { rejectWithValue }) => {
        try {
            const response = await timetableAPI.createBulkTimetable(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create timetable');
        }
    }
);

export const fetchTeacherTimetable = createAsyncThunk(
    'timetable/fetchTeacherTimetable',
    async (params, { rejectWithValue }) => {
        try {
            const response = await timetableAPI.getTeacherTimetable(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch teacher timetable');
        }
    }
);

export const fetchMyTimetable = createAsyncThunk(
    'timetable/fetchMyTimetable',
    async (_, { rejectWithValue }) => {
        try {
            const response = await timetableAPI.getMyTimetable();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch my timetable');
        }
    }
);

export const fetchSubstitutions = createAsyncThunk(
    'timetable/fetchSubstitutions',
    async (params, { rejectWithValue }) => {
        try {
            const response = await timetableAPI.getSubstitutions(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch substitutions');
        }
    }
);

export const createSubstitution = createAsyncThunk(
    'timetable/createSubstitution',
    async (data, { rejectWithValue }) => {
        try {
            const response = await timetableAPI.createSubstitution(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create substitution');
        }
    }
);

export const approveSubstitution = createAsyncThunk(
    'timetable/approveSubstitution',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await timetableAPI.approveSubstitution(id, remarks);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to approve substitution');
        }
    }
);

export const rejectSubstitution = createAsyncThunk(
    'timetable/rejectSubstitution',
    async ({ id, remarks }, { rejectWithValue }) => {
        try {
            const response = await timetableAPI.rejectSubstitution(id, remarks);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to reject substitution');
        }
    }
);

export const fetchRooms = createAsyncThunk(
    'timetable/fetchRooms',
    async (params, { rejectWithValue }) => {
        try {
            const response = await timetableAPI.getRooms(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch rooms');
        }
    }
);

// Initial state
const initialState = {
    timeSlots: {
        data: [],
        loading: false,
        error: null,
    },
    classTimetable: {
        data: [],
        pagination: null,
        loading: false,
        error: null,
    },
    weeklyTimetable: {
        data: null,
        loading: false,
        error: null,
    },
    teacherTimetable: {
        data: [],
        loading: false,
        error: null,
    },
    myTimetable: {
        data: [],
        loading: false,
        error: null,
    },
    substitutions: {
        data: [],
        pagination: null,
        loading: false,
        error: null,
    },
    rooms: {
        data: [],
        loading: false,
        error: null,
    },
    filters: {
        academicYearId: null,
        classId: null,
        sectionId: null,
        dayOfWeek: null,
    },
    selectedEntry: null,
};

// Slice
const timetableSlice = createSlice({
    name: 'timetable',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
        setSelectedEntry: (state, action) => {
            state.selectedEntry = action.payload;
        },
        clearError: (state, action) => {
            const section = action.payload;
            if (state[section]) {
                state[section].error = null;
            }
        },
    },
    extraReducers: (builder) => {
        // Time Slots
        builder
            .addCase(fetchTimeSlots.pending, (state) => {
                state.timeSlots.loading = true;
                state.timeSlots.error = null;
            })
            .addCase(fetchTimeSlots.fulfilled, (state, action) => {
                state.timeSlots.loading = false;
                state.timeSlots.data = action.payload.results || action.payload;
            })
            .addCase(fetchTimeSlots.rejected, (state, action) => {
                state.timeSlots.loading = false;
                state.timeSlots.error = action.payload;
            });

        // Class Timetable
        builder
            .addCase(fetchClassTimetable.pending, (state) => {
                state.classTimetable.loading = true;
                state.classTimetable.error = null;
            })
            .addCase(fetchClassTimetable.fulfilled, (state, action) => {
                state.classTimetable.loading = false;
                state.classTimetable.data = action.payload.results || action.payload;
                state.classTimetable.pagination = action.payload.count ? {
                    count: action.payload.count,
                    next: action.payload.next,
                    previous: action.payload.previous,
                } : null;
            })
            .addCase(fetchClassTimetable.rejected, (state, action) => {
                state.classTimetable.loading = false;
                state.classTimetable.error = action.payload;
            });

        // Weekly Timetable
        builder
            .addCase(fetchWeeklyTimetable.pending, (state) => {
                state.weeklyTimetable.loading = true;
                state.weeklyTimetable.error = null;
            })
            .addCase(fetchWeeklyTimetable.fulfilled, (state, action) => {
                state.weeklyTimetable.loading = false;
                state.weeklyTimetable.data = action.payload;
            })
            .addCase(fetchWeeklyTimetable.rejected, (state, action) => {
                state.weeklyTimetable.loading = false;
                state.weeklyTimetable.error = action.payload;
            });

        // Create Bulk Timetable
        builder
            .addCase(createBulkTimetable.pending, (state) => {
                state.classTimetable.loading = true;
                state.classTimetable.error = null;
            })
            .addCase(createBulkTimetable.fulfilled, (state) => {
                state.classTimetable.loading = false;
            })
            .addCase(createBulkTimetable.rejected, (state, action) => {
                state.classTimetable.loading = false;
                state.classTimetable.error = action.payload;
            });

        // Teacher Timetable
        builder
            .addCase(fetchTeacherTimetable.pending, (state) => {
                state.teacherTimetable.loading = true;
                state.teacherTimetable.error = null;
            })
            .addCase(fetchTeacherTimetable.fulfilled, (state, action) => {
                state.teacherTimetable.loading = false;
                state.teacherTimetable.data = action.payload.results || action.payload;
            })
            .addCase(fetchTeacherTimetable.rejected, (state, action) => {
                state.teacherTimetable.loading = false;
                state.teacherTimetable.error = action.payload;
            });

        // My Timetable
        builder
            .addCase(fetchMyTimetable.pending, (state) => {
                state.myTimetable.loading = true;
                state.myTimetable.error = null;
            })
            .addCase(fetchMyTimetable.fulfilled, (state, action) => {
                state.myTimetable.loading = false;
                state.myTimetable.data = action.payload;
            })
            .addCase(fetchMyTimetable.rejected, (state, action) => {
                state.myTimetable.loading = false;
                state.myTimetable.error = action.payload;
            });

        // Substitutions
        builder
            .addCase(fetchSubstitutions.pending, (state) => {
                state.substitutions.loading = true;
                state.substitutions.error = null;
            })
            .addCase(fetchSubstitutions.fulfilled, (state, action) => {
                state.substitutions.loading = false;
                state.substitutions.data = action.payload.results || action.payload;
                state.substitutions.pagination = action.payload.count ? {
                    count: action.payload.count,
                    next: action.payload.next,
                    previous: action.payload.previous,
                } : null;
            })
            .addCase(fetchSubstitutions.rejected, (state, action) => {
                state.substitutions.loading = false;
                state.substitutions.error = action.payload;
            });

        // Create Substitution
        builder
            .addCase(createSubstitution.fulfilled, (state, action) => {
                state.substitutions.data.unshift(action.payload);
            });

        // Approve/Reject Substitution
        builder
            .addCase(approveSubstitution.fulfilled, (state, action) => {
                const index = state.substitutions.data.findIndex(s => s.id === action.payload.substitution.id);
                if (index !== -1) {
                    state.substitutions.data[index] = action.payload.substitution;
                }
            })
            .addCase(rejectSubstitution.fulfilled, (state, action) => {
                const index = state.substitutions.data.findIndex(s => s.id === action.payload.substitution.id);
                if (index !== -1) {
                    state.substitutions.data[index] = action.payload.substitution;
                }
            });

        // Rooms
        builder
            .addCase(fetchRooms.pending, (state) => {
                state.rooms.loading = true;
                state.rooms.error = null;
            })
            .addCase(fetchRooms.fulfilled, (state, action) => {
                state.rooms.loading = false;
                state.rooms.data = action.payload.results || action.payload;
            })
            .addCase(fetchRooms.rejected, (state, action) => {
                state.rooms.loading = false;
                state.rooms.error = action.payload;
            });
    },
});

export const { setFilters, clearFilters, setSelectedEntry, clearError } = timetableSlice.actions;
export default timetableSlice.reducer;
