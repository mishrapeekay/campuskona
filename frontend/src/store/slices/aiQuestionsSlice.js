import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as aiQuestionsAPI from '../../api/aiQuestions';

export const fetchQuestions = createAsyncThunk(
    'aiQuestions/fetchQuestions',
    async (filters, { rejectWithValue }) => {
        try {
            const response = await aiQuestionsAPI.getQuestions(filters);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const generateAIQuestions = createAsyncThunk(
    'aiQuestions/generateAIQuestions',
    async (data, { rejectWithValue }) => {
        try {
            const response = await aiQuestionsAPI.generateQuestions(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const saveGeneratedQuestions = createAsyncThunk(
    'aiQuestions/saveGeneratedQuestions',
    async (questions, { rejectWithValue }) => {
        try {
            const response = await aiQuestionsAPI.bulkSaveQuestions(questions);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const aiQuestionsSlice = createSlice({
    name: 'aiQuestions',
    initialState: {
        questions: [],
        generatedQuestions: [], // Temporary storage for review
        loading: false,
        generating: false,
        error: null,
        pagination: {
            count: 0,
            next: null,
            previous: null,
        }
    },
    reducers: {
        clearGeneratedQuestions: (state) => {
            state.generatedQuestions = [];
        },
        updateGeneratedQuestion: (state, action) => {
            const { index, question } = action.payload;
            state.generatedQuestions[index] = { ...state.generatedQuestions[index], ...question };
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Questions
            .addCase(fetchQuestions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchQuestions.fulfilled, (state, action) => {
                state.loading = false;
                state.questions = action.payload.results || action.payload;
                state.pagination = {
                    count: action.payload.count,
                    next: action.payload.next,
                    previous: action.payload.previous,
                };
            })
            .addCase(fetchQuestions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Generate Questions
            .addCase(generateAIQuestions.pending, (state) => {
                state.generating = true;
            })
            .addCase(generateAIQuestions.fulfilled, (state, action) => {
                state.generating = false;
                state.generatedQuestions = action.payload.questions || action.payload;
            })
            .addCase(generateAIQuestions.rejected, (state, action) => {
                state.generating = false;
                state.error = action.payload;
            });
    },
});

export const { clearGeneratedQuestions, updateGeneratedQuestion } = aiQuestionsSlice.actions;
export default aiQuestionsSlice.reducer;
