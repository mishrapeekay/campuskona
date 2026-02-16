import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as examinationsAPI from '../../api/examinations';

// Async thunks
export const fetchExaminations = createAsyncThunk(
    'examinations/fetchExaminations',
    async (params, { rejectWithValue }) => {
        try {
            const response = await examinationsAPI.getExaminations(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch examinations');
        }
    }
);

export const fetchExamSchedules = createAsyncThunk(
    'examinations/fetchExamSchedules',
    async (params, { rejectWithValue }) => {
        try {
            const response = await examinationsAPI.getExamSchedules(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch schedules');
        }
    }
);

export const fetchStudentMarks = createAsyncThunk(
    'examinations/fetchStudentMarks',
    async (params, { rejectWithValue }) => {
        try {
            const response = await examinationsAPI.getStudentMarks(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch marks');
        }
    }
);

export const bulkMarkEntry = createAsyncThunk(
    'examinations/bulkMarkEntry',
    async (data, { rejectWithValue }) => {
        try {
            const response = await examinationsAPI.bulkMarkEntry(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to enter marks');
        }
    }
);

export const fetchExamResults = createAsyncThunk(
    'examinations/fetchExamResults',
    async (params, { rejectWithValue }) => {
        try {
            const response = await examinationsAPI.getExamResults(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch results');
        }
    }
);

export const fetchMyResults = createAsyncThunk(
    'examinations/fetchMyResults',
    async (_, { rejectWithValue }) => {
        try {
            const response = await examinationsAPI.getMyResults();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch my results');
        }
    }
);

export const fetchExamStatistics = createAsyncThunk(
    'examinations/fetchExamStatistics',
    async (examId, { rejectWithValue }) => {
        try {
            const response = await examinationsAPI.getExamStatistics(examId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch statistics');
        }
    }
);

export const publishResults = createAsyncThunk(
    'examinations/publishResults',
    async (examId, { rejectWithValue }) => {
        try {
            const response = await examinationsAPI.publishResults(examId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to publish results');
        }
    }
);

export const generateReportCard = createAsyncThunk(
    'examinations/generateReportCard',
    async (examResultId, { rejectWithValue }) => {
        try {
            const response = await examinationsAPI.generateReportCard(examResultId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to generate report card');
        }
    }
);

export const fetchGradeScales = createAsyncThunk(
    'examinations/fetchGradeScales',
    async (params, { rejectWithValue }) => {
        try {
            const response = await examinationsAPI.getGradeScales(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch grade scales');
        }
    }
);

export const fetchExamTypes = createAsyncThunk(
    'examinations/fetchExamTypes',
    async (params, { rejectWithValue }) => {
        try {
            const response = await examinationsAPI.getExamTypes(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch exam types');
        }
    }
);

// Initial state
const initialState = {
    examinations: {
        data: [],
        pagination: null,
        loading: false,
        error: null,
    },
    schedules: {
        data: [],
        pagination: null,
        loading: false,
        error: null,
    },
    marks: {
        data: [],
        pagination: null,
        loading: false,
        error: null,
    },
    results: {
        data: [],
        pagination: null,
        loading: false,
        error: null,
    },
    statistics: {
        data: null,
        loading: false,
        error: null,
    },
    gradeScales: {
        data: [],
        loading: false,
        error: null,
    },
    examTypes: {
        data: [],
        loading: false,
        error: null,
    },
    filters: {
        academicYearId: null,
        examinationId: null,
        classId: null,
        sectionId: null,
        status: null,
    },
    selectedExamination: null,
    selectedSchedule: null,
};

// Slice
const examinationsSlice = createSlice({
    name: 'examinations',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
        setSelectedExamination: (state, action) => {
            state.selectedExamination = action.payload;
        },
        setSelectedSchedule: (state, action) => {
            state.selectedSchedule = action.payload;
        },
        clearError: (state, action) => {
            const section = action.payload;
            if (state[section]) {
                state[section].error = null;
            }
        },
    },
    extraReducers: (builder) => {
        // Examinations
        builder
            .addCase(fetchExaminations.pending, (state) => {
                state.examinations.loading = true;
                state.examinations.error = null;
            })
            .addCase(fetchExaminations.fulfilled, (state, action) => {
                state.examinations.loading = false;
                state.examinations.data = action.payload.results || action.payload;
                state.examinations.pagination = action.payload.count ? {
                    count: action.payload.count,
                    next: action.payload.next,
                    previous: action.payload.previous,
                } : null;
            })
            .addCase(fetchExaminations.rejected, (state, action) => {
                state.examinations.loading = false;
                state.examinations.error = action.payload;
            });

        // Exam Schedules
        builder
            .addCase(fetchExamSchedules.pending, (state) => {
                state.schedules.loading = true;
                state.schedules.error = null;
            })
            .addCase(fetchExamSchedules.fulfilled, (state, action) => {
                state.schedules.loading = false;
                state.schedules.data = action.payload.results || action.payload;
                state.schedules.pagination = action.payload.count ? {
                    count: action.payload.count,
                    next: action.payload.next,
                    previous: action.payload.previous,
                } : null;
            })
            .addCase(fetchExamSchedules.rejected, (state, action) => {
                state.schedules.loading = false;
                state.schedules.error = action.payload;
            });

        // Student Marks
        builder
            .addCase(fetchStudentMarks.pending, (state) => {
                state.marks.loading = true;
                state.marks.error = null;
            })
            .addCase(fetchStudentMarks.fulfilled, (state, action) => {
                state.marks.loading = false;
                state.marks.data = action.payload.results || action.payload;
                state.marks.pagination = action.payload.count ? {
                    count: action.payload.count,
                    next: action.payload.next,
                    previous: action.payload.previous,
                } : null;
            })
            .addCase(fetchStudentMarks.rejected, (state, action) => {
                state.marks.loading = false;
                state.marks.error = action.payload;
            });

        // Bulk Mark Entry
        builder
            .addCase(bulkMarkEntry.pending, (state) => {
                state.marks.loading = true;
                state.marks.error = null;
            })
            .addCase(bulkMarkEntry.fulfilled, (state) => {
                state.marks.loading = false;
            })
            .addCase(bulkMarkEntry.rejected, (state, action) => {
                state.marks.loading = false;
                state.marks.error = action.payload;
            });

        // Exam Results
        builder
            .addCase(fetchExamResults.pending, (state) => {
                state.results.loading = true;
                state.results.error = null;
            })
            .addCase(fetchExamResults.fulfilled, (state, action) => {
                state.results.loading = false;
                state.results.data = action.payload.results || action.payload;
                state.results.pagination = action.payload.count ? {
                    count: action.payload.count,
                    next: action.payload.next,
                    previous: action.payload.previous,
                } : null;
            })
            .addCase(fetchExamResults.rejected, (state, action) => {
                state.results.loading = false;
                state.results.error = action.payload;
            })
            .addCase(fetchMyResults.pending, (state) => {
                state.results.loading = true;
                state.results.error = null;
            })
            .addCase(fetchMyResults.fulfilled, (state, action) => {
                state.results.loading = false;
                state.results.data = action.payload.results || action.payload;
            })
            .addCase(fetchMyResults.rejected, (state, action) => {
                state.results.loading = false;
                state.results.error = action.payload;
            });

        // Statistics
        builder
            .addCase(fetchExamStatistics.pending, (state) => {
                state.statistics.loading = true;
                state.statistics.error = null;
            })
            .addCase(fetchExamStatistics.fulfilled, (state, action) => {
                state.statistics.loading = false;
                state.statistics.data = action.payload;
            })
            .addCase(fetchExamStatistics.rejected, (state, action) => {
                state.statistics.loading = false;
                state.statistics.error = action.payload;
            });

        // Publish Results
        builder
            .addCase(publishResults.fulfilled, (state, action) => {
                const index = state.examinations.data.findIndex(e => e.id === action.payload.examination.id);
                if (index !== -1) {
                    state.examinations.data[index] = action.payload.examination;
                }
            });

        // Grade Scales
        builder
            .addCase(fetchGradeScales.pending, (state) => {
                state.gradeScales.loading = true;
                state.gradeScales.error = null;
            })
            .addCase(fetchGradeScales.fulfilled, (state, action) => {
                state.gradeScales.loading = false;
                state.gradeScales.data = action.payload.results || action.payload;
            })
            .addCase(fetchGradeScales.rejected, (state, action) => {
                state.gradeScales.loading = false;
                state.gradeScales.error = action.payload;
            });

        // Exam Types
        builder
            .addCase(fetchExamTypes.pending, (state) => {
                state.examTypes.loading = true;
                state.examTypes.error = null;
            })
            .addCase(fetchExamTypes.fulfilled, (state, action) => {
                state.examTypes.loading = false;
                state.examTypes.data = action.payload.results || action.payload;
            })
            .addCase(fetchExamTypes.rejected, (state, action) => {
                state.examTypes.loading = false;
                state.examTypes.error = action.payload;
            });
    },
});

export const {
    setFilters,
    clearFilters,
    setSelectedExamination,
    setSelectedSchedule,
    clearError
} = examinationsSlice.actions;

export default examinationsSlice.reducer;
