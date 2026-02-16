import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as libraryAPI from '../../api/library';

export const fetchBooks = createAsyncThunk('library/fetchBooks', async (params, { rejectWithValue }) => {
    try {
        const response = await libraryAPI.getBooks(params);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

export const fetchIssues = createAsyncThunk('library/fetchIssues', async (params, { rejectWithValue }) => {
    try {
        const response = await libraryAPI.getIssues(params);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

export const createBook = createAsyncThunk('library/createBook', async (data, { rejectWithValue }) => {
    try {
        const response = await libraryAPI.createBook(data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

export const issueBookThunk = createAsyncThunk('library/issueBook', async ({ bookId, studentId }, { rejectWithValue }) => {
    try {
        const response = await libraryAPI.issueBook(bookId, studentId);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

export const returnBookThunk = createAsyncThunk('library/returnBook', async (issueId, { rejectWithValue }) => {
    try {
        const response = await libraryAPI.returnBook(issueId);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

export const fetchAuthors = createAsyncThunk('library/fetchAuthors', async (_, { rejectWithValue }) => {
    try {
        const response = await libraryAPI.getAuthors();
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

export const fetchCategories = createAsyncThunk('library/fetchCategories', async (_, { rejectWithValue }) => {
    try {
        const response = await libraryAPI.getCategories();
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

const initialState = {
    books: { data: [], loading: false },
    issues: { data: [], loading: false },
    authors: [],
    categories: [],
    error: null,
};

const librarySlice = createSlice({
    name: 'library',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBooks.pending, (state) => { state.books.loading = true; })
            .addCase(fetchBooks.fulfilled, (state, action) => {
                state.books.loading = false;
                state.books.data = action.payload.results || action.payload;
            })
            .addCase(fetchBooks.rejected, (state, action) => {
                state.books.loading = false;
                state.error = action.payload || 'Failed to fetch books';
            })
            .addCase(fetchIssues.fulfilled, (state, action) => {
                state.issues.data = action.payload.results || action.payload;
                state.issues.loading = false;
            })
            .addCase(createBook.fulfilled, (state, action) => {
                state.books.data.push(action.payload);
            })
            .addCase(issueBookThunk.fulfilled, (state, action) => {
                // We'll just refresh list or push if it returns full object
                state.issues.data.push(action.payload);
            })
            .addCase(returnBookThunk.fulfilled, (state, action) => {
                const index = state.issues.data.findIndex(i => i.id === action.payload.id);
                if (index !== -1) {
                    state.issues.data[index] = action.payload;
                }
            })
            .addCase(fetchAuthors.fulfilled, (state, action) => {
                state.authors = action.payload.results || action.payload;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload.results || action.payload;
            });
    },
});

export default librarySlice.reducer;
