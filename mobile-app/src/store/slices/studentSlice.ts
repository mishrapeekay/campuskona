import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { studentService } from '@/services/api';
import { Student } from '@/types/models';
import { PaginatedResponse, QueryParams } from '@/types/api';

interface StudentState {
  students: Student[];
  selectedStudent: Student | null;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  students: [],
  selectedStudent: null,
  totalCount: 0,
  isLoading: false,
  error: null,
};

export const fetchStudents = createAsyncThunk(
  'student/fetchStudents',
  async (params: QueryParams = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getStudents(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch students');
    }
  }
);

export const fetchStudentById = createAsyncThunk(
  'student/fetchStudentById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await studentService.getStudentById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch student');
    }
  }
);

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setSelectedStudent: (state, action: PayloadAction<Student>) => {
      state.selectedStudent = action.payload;
    },
    clearSelectedStudent: (state) => {
      state.selectedStudent = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action: PayloadAction<PaginatedResponse<Student>>) => {
        state.isLoading = false;
        state.students = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStudentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentById.fulfilled, (state, action: PayloadAction<Student>) => {
        state.isLoading = false;
        state.selectedStudent = action.payload;
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedStudent, clearSelectedStudent, clearError } = studentSlice.actions;
export default studentSlice.reducer;
