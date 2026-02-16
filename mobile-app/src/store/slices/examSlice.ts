import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { examService } from '@/services/api';
import { Exam, StudentMarks, Result } from '@/types/models';
import { PaginatedResponse, ExamQueryParams } from '@/types/api';

interface ExamState {
  exams: Exam[];
  marks: StudentMarks[];
  results: Result[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ExamState = {
  exams: [],
  marks: [],
  results: [],
  totalCount: 0,
  isLoading: false,
  error: null,
};

export const fetchExams = createAsyncThunk(
  'exam/fetchExams',
  async (params: ExamQueryParams = {}, { rejectWithValue }) => {
    try {
      const response = await examService.getExams(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch exams');
    }
  }
);

export const fetchStudentMarks = createAsyncThunk(
  'exam/fetchMarks',
  async (studentId: string, { rejectWithValue }) => {
    try {
      const response = await examService.getStudentMarks(studentId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch marks');
    }
  }
);

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearExams: (state) => {
      state.exams = [];
      state.marks = [];
      state.results = [];
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action: PayloadAction<PaginatedResponse<Exam>>) => {
        state.isLoading = false;
        state.exams = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStudentMarks.fulfilled, (state, action: PayloadAction<StudentMarks[]>) => {
        state.marks = action.payload;
      });
  },
});

export const { clearError, clearExams } = examSlice.actions;
export default examSlice.reducer;
