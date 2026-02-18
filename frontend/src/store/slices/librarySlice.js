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
        // Backend returns { success, data, message, fine_amount }
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data);
    }
});

export const markFinePaidThunk = createAsyncThunk('library/markFinePaid', async (issueId, { rejectWithValue }) => {
    try {
        const response = await libraryAPI.markFinePaid(issueId);
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
            .addCase(fetchIssues.pending, (state) => { state.issues.loading = true; })
            .addCase(fetchIssues.fulfilled, (state, action) => {
                state.issues.data = action.payload.results || action.payload;
                state.issues.loading = false;
            })
            .addCase(fetchIssues.rejected, (state) => { state.issues.loading = false; })
            .addCase(createBook.fulfilled, (state, action) => {
                state.books.data.push(action.payload);
            })
            .addCase(issueBookThunk.fulfilled, (state, action) => {
                state.issues.data.unshift(action.payload);
            })
            .addCase(returnBookThunk.fulfilled, (state, action) => {
                // payload is { success, data, message, fine_amount }
                const returned = action.payload?.data || action.payload;
                if (returned?.id) {
                    const index = state.issues.data.findIndex(i => i.id === returned.id);
                    if (index !== -1) {
                        state.issues.data[index] = returned;
                    }
                }
            })
            .addCase(markFinePaidThunk.fulfilled, (state, action) => {
                const updated = action.payload;
                if (updated?.id) {
                    const index = state.issues.data.findIndex(i => i.id === updated.id);
                    if (index !== -1) {
                        state.issues.data[index] = updated;
                    }
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
