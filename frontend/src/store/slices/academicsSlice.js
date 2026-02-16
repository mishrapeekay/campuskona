import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as academicsAPI from '../../api/academics';

// Async thunks for Academic Years
export const fetchAcademicYears = createAsyncThunk(
    'academics/fetchAcademicYears',
    async (_, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.getAcademicYears();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createAcademicYear = createAsyncThunk(
    'academics/createAcademicYear',
    async (yearData, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.createAcademicYear(yearData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const setCurrentAcademicYear = createAsyncThunk(
    'academics/setCurrentAcademicYear',
    async (yearId, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.setCurrentAcademicYear(yearId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Async thunks for Boards
export const fetchBoards = createAsyncThunk(
    'academics/fetchBoards',
    async (_, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.getBoards();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createBoard = createAsyncThunk(
    'academics/createBoard',
    async (boardData, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.createBoard(boardData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateBoard = createAsyncThunk(
    'academics/updateBoard',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.updateBoard(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Async thunks for Classes
export const fetchClasses = createAsyncThunk(
    'academics/fetchClasses',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.getClasses(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createClass = createAsyncThunk(
    'academics/createClass',
    async (classData, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.createClass(classData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateClass = createAsyncThunk(
    'academics/updateClass',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.updateClass(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Async thunks for Sections
export const fetchSections = createAsyncThunk(
    'academics/fetchSections',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.getSections(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchClassSections = createAsyncThunk(
    'academics/fetchClassSections',
    async (classId, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.getClassSections(classId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createSection = createAsyncThunk(
    'academics/createSection',
    async (sectionData, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.createSection(sectionData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateSection = createAsyncThunk(
    'academics/updateSection',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.updateSection(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Async thunks for Subjects
export const fetchSubjects = createAsyncThunk(
    'academics/fetchSubjects',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.getSubjects(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createSubject = createAsyncThunk(
    'academics/createSubject',
    async (subjectData, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.createSubject(subjectData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateSubject = createAsyncThunk(
    'academics/updateSubject',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.updateSubject(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Missing async thunks
export const updateAcademicYear = createAsyncThunk(
    'academics/updateAcademicYear',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.updateAcademicYear(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchAcademicYearById = createAsyncThunk(
    'academics/fetchAcademicYearById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.getAcademicYearById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteAcademicYear = createAsyncThunk(
    'academics/deleteAcademicYear',
    async (id, { rejectWithValue }) => {
        try {
            await academicsAPI.deleteAcademicYear(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteClass = createAsyncThunk(
    'academics/deleteClass',
    async (id, { rejectWithValue }) => {
        try {
            await academicsAPI.deleteClass(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteSubject = createAsyncThunk(
    'academics/deleteSubject',
    async (id, { rejectWithValue }) => {
        try {
            await academicsAPI.deleteSubject(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchClassById = createAsyncThunk(
    'academics/fetchClassById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.getClassById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchSubjectById = createAsyncThunk(
    'academics/fetchSubjectById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.getSubjectById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchAcademicStats = createAsyncThunk(
    'academics/fetchAcademicStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await academicsAPI.getAcademicStats();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


// Initial state
const initialState = {
    academicYears: [],
    currentAcademicYear: null,
    boards: [],
    classes: [],
    currentClass: null,
    sections: [],
    subjects: [],
    currentSubject: null,
    loading: false,
    error: null,
    filters: {
        board: null,
        class: null,
    },
};

// Slice
const academicsSlice = createSlice({
    name: 'academics',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Academic Years
            .addCase(fetchAcademicYears.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAcademicYears.fulfilled, (state, action) => {
                state.loading = false;
                state.academicYears = action.payload.results || action.payload;
                const current = state.academicYears.find(year => year.is_current);
                if (current) {
                    state.currentAcademicYear = current;
                }
            })
            .addCase(fetchAcademicYears.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createAcademicYear.fulfilled, (state, action) => {
                state.academicYears.push(action.payload);
                if (action.payload.is_current) {
                    state.currentAcademicYear = action.payload;
                }
            })

            .addCase(setCurrentAcademicYear.fulfilled, (state, action) => {
                state.academicYears = state.academicYears.map(year => ({
                    ...year,
                    is_current: year.id === action.payload.id,
                }));
                state.currentAcademicYear = action.payload;
            })

            // Boards
            .addCase(fetchBoards.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBoards.fulfilled, (state, action) => {
                state.loading = false;
                state.boards = action.payload.results || action.payload;
            })
            .addCase(fetchBoards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createBoard.fulfilled, (state, action) => {
                state.boards.push(action.payload);
            })

            .addCase(updateBoard.fulfilled, (state, action) => {
                const index = state.boards.findIndex(b => b.id === action.payload.id);
                if (index !== -1) {
                    state.boards[index] = action.payload;
                }
            })

            // Classes
            .addCase(fetchClasses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClasses.fulfilled, (state, action) => {
                state.loading = false;
                state.classes = action.payload.results || action.payload;
            })
            .addCase(fetchClasses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createClass.fulfilled, (state, action) => {
                state.classes.push(action.payload);
            })

            .addCase(updateClass.fulfilled, (state, action) => {
                const index = state.classes.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.classes[index] = action.payload;
                }
            })

            // Sections
            .addCase(fetchSections.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSections.fulfilled, (state, action) => {
                state.loading = false;
                state.sections = action.payload.results || action.payload;
            })
            .addCase(fetchSections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchClassSections.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClassSections.fulfilled, (state, action) => {
                state.loading = false;
                state.sections = action.payload.results || action.payload;
            })
            .addCase(fetchClassSections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createSection.fulfilled, (state, action) => {
                state.sections.push(action.payload);
            })

            .addCase(updateSection.fulfilled, (state, action) => {
                const index = state.sections.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.sections[index] = action.payload;
                }
            })

            // Subjects
            .addCase(fetchSubjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubjects.fulfilled, (state, action) => {
                state.loading = false;
                state.subjects = action.payload.results || action.payload;
            })
            .addCase(fetchSubjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createSubject.fulfilled, (state, action) => {
                state.subjects.push(action.payload);
            })

            .addCase(updateSubject.fulfilled, (state, action) => {
                const index = state.subjects.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.subjects[index] = action.payload;
                }
            })

            // Fetch by ID
            .addCase(fetchClassById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClassById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentClass = action.payload;
            })
            .addCase(fetchClassById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchSubjectById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubjectById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSubject = action.payload;
            })
            .addCase(fetchSubjectById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setFilters, resetFilters, clearError } = academicsSlice.actions;

// Selectors
export const selectAcademicYears = (state) => state.academics.academicYears;
export const selectCurrentAcademicYear = (state) => state.academics.currentAcademicYear;
export const selectBoards = (state) => state.academics.boards;
export const selectClasses = (state) => state.academics.classes;
export const selectSections = (state) => state.academics.sections;
export const selectSubjects = (state) => state.academics.subjects;
export const selectAcademicsLoading = (state) => state.academics.loading;
export const selectAcademicsError = (state) => state.academics.error;
export const selectAcademicsFilters = (state) => state.academics.filters;

export default academicsSlice.reducer;
