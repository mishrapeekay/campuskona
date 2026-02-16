import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as studentsAPI from '../../api/students';

// Async thunks
export const fetchStudents = createAsyncThunk(
    'students/fetchStudents',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await studentsAPI.getStudents(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchStudentById = createAsyncThunk(
    'students/fetchStudentById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await studentsAPI.getStudentById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createStudent = createAsyncThunk(
    'students/createStudent',
    async (studentData, { rejectWithValue }) => {
        try {
            const response = await studentsAPI.createStudent(studentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateStudent = createAsyncThunk(
    'students/updateStudent',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await studentsAPI.updateStudent(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteStudent = createAsyncThunk(
    'students/deleteStudent',
    async (id, { rejectWithValue }) => {
        try {
            await studentsAPI.deleteStudent(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const bulkUploadStudents = createAsyncThunk(
    'students/bulkUpload',
    async (file, { rejectWithValue }) => {
        try {
            const response = await studentsAPI.bulkUploadStudents(file);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const exportStudents = createAsyncThunk(
    'students/export',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await studentsAPI.exportStudents(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const promoteStudents = createAsyncThunk(
    'students/promote',
    async (data, { rejectWithValue }) => {
        try {
            const response = await studentsAPI.promoteStudents(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchStudentStatistics = createAsyncThunk(
    'students/fetchStatistics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await studentsAPI.getStudentStatistics();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Alias for backward compatibility
export const fetchStudentStats = fetchStudentStatistics;


// Initial state
const initialState = {
    list: [],
    current: null,
    statistics: null,
    stats: null,  // Alias for statistics for backward compatibility
    filters: {
        search: '',
        gender: null,
        category: null,
        admission_status: 'ACTIVE',  // Changed from 'status'
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
const studentsSlice = createSlice({
    name: 'students',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        clearCurrentStudent: (state) => {
            state.current = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch students
            .addCase(fetchStudents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudents.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.results || action.payload;
                state.pagination = {
                    count: action.payload.count || 0,
                    next: action.payload.next || null,
                    previous: action.payload.previous || null,
                };
            })
            .addCase(fetchStudents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch student by ID
            .addCase(fetchStudentById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentById.fulfilled, (state, action) => {
                state.loading = false;
                state.current = action.payload;
            })
            .addCase(fetchStudentById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create student
            .addCase(createStudent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createStudent.fulfilled, (state, action) => {
                state.loading = false;
                state.list.unshift(action.payload);
                state.current = action.payload;
            })
            .addCase(createStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update student
            .addCase(updateStudent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateStudent.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.list.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
                state.current = action.payload;
            })
            .addCase(updateStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete student
            .addCase(deleteStudent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteStudent.fulfilled, (state, action) => {
                state.loading = false;
                state.list = state.list.filter(s => s.id !== action.payload);
                if (state.current?.id === action.payload) {
                    state.current = null;
                }
            })
            .addCase(deleteStudent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Bulk upload
            .addCase(bulkUploadStudents.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.bulkUploadProgress = 0;
            })
            .addCase(bulkUploadStudents.fulfilled, (state, action) => {
                state.loading = false;
                state.bulkUploadProgress = 100;
            })
            .addCase(bulkUploadStudents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.bulkUploadProgress = null;
            })

            // Fetch statistics
            .addCase(fetchStudentStatistics.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStudentStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.statistics = action.payload;
                state.stats = action.payload;  // Set both for backward compatibility
            })
            .addCase(fetchStudentStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setFilters, resetFilters, clearCurrentStudent, clearError } = studentsSlice.actions;

// Selectors
export const selectStudents = (state) => state.students.list;
export const selectCurrentStudent = (state) => state.students.current;
export const selectStudentFilters = (state) => state.students.filters;
export const selectStudentPagination = (state) => state.students.pagination;
export const selectStudentLoading = (state) => state.students.loading;
export const selectStudentError = (state) => state.students.error;
export const selectStudentStatistics = (state) => state.students.statistics;

export default studentsSlice.reducer;
