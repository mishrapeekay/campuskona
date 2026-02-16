import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { libraryService } from '@/services/api';
import { Book, BookIssue } from '@/types/models';
import { PaginatedResponse, LibraryQueryParams } from '@/types/api';

interface LibraryState {
  books: Book[];
  issuedBooks: BookIssue[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: LibraryState = {
  books: [],
  issuedBooks: [],
  totalCount: 0,
  isLoading: false,
  error: null,
};

export const fetchBooks = createAsyncThunk(
  'library/fetchBooks',
  async (params: LibraryQueryParams = {}, { rejectWithValue }) => {
    try {
      const response = await libraryService.getBooks(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch books');
    }
  }
);

export const fetchIssuedBooks = createAsyncThunk(
  'library/fetchIssuedBooks',
  async (studentId: string, { rejectWithValue }) => {
    try {
      const response = await libraryService.getIssuedBooks(studentId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch issued books');
    }
  }
);

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLibrary: (state) => {
      state.books = [];
      state.issuedBooks = [];
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action: PayloadAction<PaginatedResponse<Book>>) => {
        state.isLoading = false;
        state.books = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchIssuedBooks.fulfilled, (state, action: PayloadAction<BookIssue[]>) => {
        state.issuedBooks = action.payload;
      });
  },
});

export const { clearError, clearLibrary } = librarySlice.actions;
export default librarySlice.reducer;
