import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as lessonPlansAPI from '../../api/lessonPlans';

export const fetchLessonPlans = createAsyncThunk(
  'lessonPlans/fetchLessonPlans',
  async (params, { rejectWithValue }) => {
    try {
      const response = await lessonPlansAPI.fetchLessonPlans(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch lesson plans');
    }
  }
);

export const fetchLessonPlanById = createAsyncThunk(
  'lessonPlans/fetchLessonPlanById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await lessonPlansAPI.fetchLessonPlanById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch lesson plan');
    }
  }
);

export const createLessonPlan = createAsyncThunk(
  'lessonPlans/createLessonPlan',
  async (data, { rejectWithValue }) => {
    try {
      const response = await lessonPlansAPI.createLessonPlan(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create lesson plan');
    }
  }
);

export const updateLessonPlan = createAsyncThunk(
  'lessonPlans/updateLessonPlan',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await lessonPlansAPI.updateLessonPlan(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update lesson plan');
    }
  }
);

export const fetchSyllabusCoverage = createAsyncThunk(
  'lessonPlans/fetchSyllabusCoverage',
  async (params, { rejectWithValue }) => {
    try {
      const response = await lessonPlansAPI.fetchSyllabusCoverage(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch syllabus coverage');
    }
  }
);

const initialState = {
  plans: { data: [], loading: false, count: 0 },
  currentPlan: { data: null, loading: false },
  coverage: { data: null, loading: false },
  error: null,
};

const lessonPlansSlice = createSlice({
  name: 'lessonPlans',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPlan: (state) => {
      state.currentPlan.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Lesson Plans
      .addCase(fetchLessonPlans.pending, (state) => {
        state.plans.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonPlans.fulfilled, (state, action) => {
        state.plans.loading = false;
        state.plans.data = action.payload.results || action.payload;
        state.plans.count = action.payload.count || action.payload.length || 0;
      })
      .addCase(fetchLessonPlans.rejected, (state, action) => {
        state.plans.loading = false;
        state.error = action.payload;
      })
      // Detail
      .addCase(fetchLessonPlanById.pending, (state) => {
        state.currentPlan.loading = true;
      })
      .addCase(fetchLessonPlanById.fulfilled, (state, action) => {
        state.currentPlan.loading = false;
        state.currentPlan.data = action.payload;
      })
      .addCase(fetchLessonPlanById.rejected, (state, action) => {
        state.currentPlan.loading = false;
        state.error = action.payload;
      })
      // Coverage
      .addCase(fetchSyllabusCoverage.pending, (state) => {
        state.coverage.loading = true;
      })
      .addCase(fetchSyllabusCoverage.fulfilled, (state, action) => {
        state.coverage.loading = false;
        state.coverage.data = action.payload;
      })
      .addCase(fetchSyllabusCoverage.rejected, (state, action) => {
        state.coverage.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentPlan } = lessonPlansSlice.actions;
export default lessonPlansSlice.reducer;
