import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as staffAPI from '../../api/staff';

// Async thunks
export const fetchStaff = createAsyncThunk(
    'staff/fetchStaff',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await staffAPI.getStaff(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchStaffById = createAsyncThunk(
    'staff/fetchStaffById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await staffAPI.getStaffById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createStaff = createAsyncThunk(
    'staff/createStaff',
    async (staffData, { rejectWithValue }) => {
        try {
            const response = await staffAPI.createStaff(staffData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateStaff = createAsyncThunk(
    'staff/updateStaff',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await staffAPI.updateStaff(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteStaff = createAsyncThunk(
    'staff/deleteStaff',
    async (id, { rejectWithValue }) => {
        try {
            await staffAPI.deleteStaff(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const bulkUploadStaff = createAsyncThunk(
    'staff/bulkUpload',
    async (file, { rejectWithValue }) => {
        try {
            const response = await staffAPI.bulkUploadStaff(file);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const exportStaff = createAsyncThunk(
    'staff/export',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await staffAPI.exportStaff(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchStaffStatistics = createAsyncThunk(
    'staff/fetchStatistics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await staffAPI.getStaffStatistics();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchDashboardStats = createAsyncThunk(
    'staff/fetchDashboardStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await staffAPI.getDashboardStats();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchDepartments = createAsyncThunk(
    'staff/fetchDepartments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await staffAPI.getDepartments();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createDepartment = createAsyncThunk(
    'staff/createDepartment',
    async (departmentData, { rejectWithValue }) => {
        try {
            const response = await staffAPI.createDepartment(departmentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const assignSubjects = createAsyncThunk(
    'staff/assignSubjects',
    async ({ staffId, subjects }, { rejectWithValue }) => {
        try {
            const response = await staffAPI.assignSubjects(staffId, subjects);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Alias for backward compatibility
export const fetchStaffStats = fetchStaffStatistics;


// Initial state
const initialState = {
    list: [],
    current: null,
    departments: [],
    statistics: null,
    stats: null,  // Alias for statistics for backward compatibility
    filters: {
        search: '',
        department: null,
        designation: null,
        status: 'ACTIVE',
        page: 1,
        pageSize: 20,  // Automatically converted to page_size by buildQueryString
    },
    pagination: {
        count: 0,
        next: null,
        previous: null,
    },
    loading: false,
    error: null,
    bulkUploadProgress: null,
};

// Slice
const staffSlice = createSlice({
    name: 'staff',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        clearCurrentStaff: (state) => {
            state.current = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch staff
            .addCase(fetchStaff.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.results || action.payload;
                state.pagination = {
                    count: action.payload.count || 0,
                    next: action.payload.next || null,
                    previous: action.payload.previous || null,
                };
            })
            .addCase(fetchStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch staff by ID
            .addCase(fetchStaffById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStaffById.fulfilled, (state, action) => {
                state.loading = false;
                state.current = action.payload;
            })
            .addCase(fetchStaffById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create staff
            .addCase(createStaff.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.list.unshift(action.payload);
                state.current = action.payload;
            })
            .addCase(createStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update staff
            .addCase(updateStaff.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateStaff.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.list.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
                state.current = action.payload;
            })
            .addCase(updateStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete staff
            .addCase(deleteStaff.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.list = state.list.filter(s => s.id !== action.payload);
                if (state.current?.id === action.payload) {
                    state.current = null;
                }
            })
            .addCase(deleteStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Bulk upload
            .addCase(bulkUploadStaff.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.bulkUploadProgress = 0;
            })
            .addCase(bulkUploadStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.bulkUploadProgress = 100;
            })
            .addCase(bulkUploadStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.bulkUploadProgress = null;
            })

            // Fetch statistics
            .addCase(fetchStaffStatistics.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStaffStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.statistics = action.payload;
                state.stats = action.payload;  // Set both for backward compatibility
            })
            .addCase(fetchStaffStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch dashboard stats
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.statistics = action.payload;
                state.stats = action.payload;  // Set both for backward compatibility
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch departments
            .addCase(fetchDepartments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDepartments.fulfilled, (state, action) => {
                state.loading = false;
                state.departments = action.payload.results || action.payload;
            })
            .addCase(fetchDepartments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create department
            .addCase(createDepartment.fulfilled, (state, action) => {
                state.departments.push(action.payload);
            })

            // Assign subjects
            .addCase(assignSubjects.fulfilled, (state, action) => {
                const { staff_id, subjects } = action.payload;
                const subjectIds = subjects.map((s) => s.id);
                const subjectNames = subjects.map((s) => s.name);

                // Update current staff detail if viewing
                if (state.current && String(state.current.id) === String(staff_id)) {
                    state.current.subjects_taught = subjectNames;
                }

                // Update staff in list
                const index = state.list.findIndex((s) => String(s.id) === String(staff_id));
                if (index !== -1) {
                    state.list[index].subjects_taught = subjectNames;
                }
            });
    },
});

export const { setFilters, resetFilters, clearCurrentStaff, clearError } = staffSlice.actions;

// Selectors
export const selectStaff = (state) => state.staff.list;
export const selectCurrentStaff = (state) => state.staff.current;
export const selectDepartments = (state) => state.staff.departments;
export const selectStaffFilters = (state) => state.staff.filters;
export const selectStaffPagination = (state) => state.staff.pagination;
export const selectStaffLoading = (state) => state.staff.loading;
export const selectStaffError = (state) => state.staff.error;
export const selectStaffStatistics = (state) => state.staff.statistics;

export default staffSlice.reducer;
