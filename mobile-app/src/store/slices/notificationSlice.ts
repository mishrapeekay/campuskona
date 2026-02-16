import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { communicationService } from '@/services/api';
import { Notification, Notice } from '@/types/models';
import { PaginatedResponse } from '@/types/api';

interface NotificationState {
  notifications: Notification[];
  notices: Notice[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  fcmToken: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  notices: [],
  unreadCount: 0,
  totalCount: 0,
  isLoading: false,
  error: null,
  fcmToken: null,
};

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await communicationService.getNotifications();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchNotices = createAsyncThunk(
  'notification/fetchNotices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await communicationService.getNotices();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notices');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await communicationService.markAsRead(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.notices = [];
      state.unreadCount = 0;
      state.totalCount = 0;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    setFCMToken: (state, action: PayloadAction<string>) => {
      state.fcmToken = action.payload;
    },
    setNotifications: (state, action: PayloadAction<any[]>) => {
      state.notifications = action.payload as Notification[];
      state.unreadCount = action.payload.filter((n: any) => !n.read && !n.is_read).length;
      state.totalCount = action.payload.length;
    },
    addNotification: (state, action: PayloadAction<any>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read && !action.payload.is_read) {
        state.unreadCount += 1;
      }
      state.totalCount += 1;
    },
    markAllAsRead: (state, action: PayloadAction<string | undefined>) => {
      const category = action.payload;
      state.notifications = state.notifications.map((n) => {
        if (!category || n.category === category) {
          return { ...n, read: true, is_read: true };
        }
        return n;
      });
      state.unreadCount = state.notifications.filter((n) => !n.read && !n.is_read).length;
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.read && !notification.is_read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      state.totalCount = Math.max(0, state.totalCount - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<PaginatedResponse<Notification>>) => {
        state.isLoading = false;
        state.notifications = action.payload.results;
        state.totalCount = action.payload.count;
        state.unreadCount = action.payload.results.filter((n) => !n.is_read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchNotices.fulfilled, (state, action: PayloadAction<PaginatedResponse<Notice>>) => {
        state.notices = action.payload.results;
      })
      .addCase(markAsRead.fulfilled, (state, action: PayloadAction<string>) => {
        const notification = state.notifications.find((n) => n.id === action.payload);
        if (notification) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const {
  clearError,
  clearNotifications,
  incrementUnreadCount,
  setFCMToken,
  setNotifications,
  addNotification,
  markAllAsRead,
  deleteNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
