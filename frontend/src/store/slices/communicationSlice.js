import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as communicationAPI from '../../api/communication';

// Async thunks
export const fetchNotices = createAsyncThunk(
    'communication/fetchNotices',
    async (params, { rejectWithValue }) => {
        try {
            const response = await communicationAPI.getNotices(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch notices');
        }
    }
);

export const createNotice = createAsyncThunk(
    'communication/createNotice',
    async (data, { rejectWithValue }) => {
        try {
            const response = await communicationAPI.createNotice(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create notice');
        }
    }
);

export const deleteNotice = createAsyncThunk(
    'communication/deleteNotice',
    async (id, { rejectWithValue }) => {
        try {
            await communicationAPI.deleteNotice(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to delete notice');
        }
    }
);

export const fetchEvents = createAsyncThunk(
    'communication/fetchEvents',
    async (params, { rejectWithValue }) => {
        try {
            const response = await communicationAPI.getEvents(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch events');
        }
    }
);

export const createEvent = createAsyncThunk(
    'communication/createEvent',
    async (data, { rejectWithValue }) => {
        try {
            const response = await communicationAPI.createEvent(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create event');
        }
    }
);

export const fetchNotifications = createAsyncThunk(
    'communication/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await communicationAPI.getNotifications();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch notifications');
        }
    }
);

export const markRead = createAsyncThunk(
    'communication/markRead',
    async (id, { rejectWithValue }) => {
        try {
            await communicationAPI.markNotificationRead(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to mark as read');
        }
    }
);

export const markAllNotificationsRead = createAsyncThunk(
    'communication/markAllNotificationsRead',
    async (_, { rejectWithValue }) => {
        try {
            await communicationAPI.markAllNotificationsRead();
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to mark all as read');
        }
    }
);

const initialState = {
    notices: {
        data: [],
        loading: false,
        error: null,
    },
    events: {
        data: [],
        loading: false,
        error: null,
    },
    notifications: {
        data: [],
        loading: false,
        error: null,
        unreadCount: 0
    }
};

const communicationSlice = createSlice({
    name: 'communication',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.notices.error = null;
            state.events.error = null;
            state.notifications.error = null;
        }
    },
    extraReducers: (builder) => {
        // Notices
        builder
            .addCase(fetchNotices.pending, (state) => {
                state.notices.loading = true;
            })
            .addCase(fetchNotices.fulfilled, (state, action) => {
                state.notices.loading = false;
                state.notices.data = action.payload.results || action.payload;
            })
            .addCase(fetchNotices.rejected, (state, action) => {
                state.notices.loading = false;
                state.notices.error = action.payload;
            })
            .addCase(createNotice.fulfilled, (state, action) => {
                state.notices.data.unshift(action.payload);
            })
            .addCase(deleteNotice.fulfilled, (state, action) => {
                state.notices.data = state.notices.data.filter(n => n.id !== action.payload);
            });

        // Events
        builder
            .addCase(fetchEvents.pending, (state) => {
                state.events.loading = true;
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.events.loading = false;
                state.events.data = action.payload.results || action.payload;
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.events.loading = false;
                state.events.error = action.payload;
            })
            .addCase(createEvent.fulfilled, (state, action) => {
                state.events.data.push(action.payload);
            });

        // Notifications
        builder
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                const results = action.payload.results || action.payload;
                state.notifications.data = results;
                state.notifications.unreadCount = results.filter(n => !n.is_read).length;
            })
            .addCase(markRead.fulfilled, (state, action) => {
                const note = state.notifications.data.find(n => n.id === action.payload);
                if (note && !note.is_read) {
                    note.is_read = true;
                    state.notifications.unreadCount--;
                }
            })
            .addCase(markAllNotificationsRead.fulfilled, (state) => {
                state.notifications.data.forEach(n => n.is_read = true);
                state.notifications.unreadCount = 0;
            });
    },
});

export const { clearErrors } = communicationSlice.actions;
export default communicationSlice.reducer;
