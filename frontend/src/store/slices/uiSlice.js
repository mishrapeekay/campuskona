import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    sidebar: {
        isOpen: true,
        isMobile: false,
    },
    modal: {
        isOpen: false,
        type: null,
        data: null,
    },
    notifications: [],
    toast: {
        isOpen: false,
        message: '',
        type: 'info', // 'success', 'error', 'warning', 'info'
        duration: 3000,
    },
    theme: 'light', // 'light' or 'dark'
    loading: {
        global: false,
        message: '',
    },
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        // Sidebar actions
        toggleSidebar: (state) => {
            state.sidebar.isOpen = !state.sidebar.isOpen;
        },
        openSidebar: (state) => {
            state.sidebar.isOpen = true;
        },
        closeSidebar: (state) => {
            state.sidebar.isOpen = false;
        },
        setMobileSidebar: (state, action) => {
            state.sidebar.isMobile = action.payload;
        },

        // Modal actions
        openModal: (state, action) => {
            state.modal.isOpen = true;
            state.modal.type = action.payload.type;
            state.modal.data = action.payload.data || null;
        },
        closeModal: (state) => {
            state.modal.isOpen = false;
            state.modal.type = null;
            state.modal.data = null;
        },

        // Notification actions
        addNotification: (state, action) => {
            state.notifications.unshift({
                id: Date.now(),
                ...action.payload,
                timestamp: new Date().toISOString(),
                read: false,
            });
        },
        markNotificationAsRead: (state, action) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification) {
                notification.read = true;
            }
        },
        markAllNotificationsAsRead: (state) => {
            state.notifications.forEach(n => {
                n.read = true;
            });
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },

        // Toast actions
        showToast: (state, action) => {
            state.toast.isOpen = true;
            state.toast.message = action.payload.message;
            state.toast.type = action.payload.type || 'info';
            state.toast.duration = action.payload.duration || 3000;
        },
        hideToast: (state) => {
            state.toast.isOpen = false;
            state.toast.message = '';
        },

        // Theme actions
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
        },

        // Global loading actions
        setGlobalLoading: (state, action) => {
            state.loading.global = action.payload.loading;
            state.loading.message = action.payload.message || '';
        },
    },
});

export const {
    toggleSidebar,
    openSidebar,
    closeSidebar,
    setMobileSidebar,
    openModal,
    closeModal,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearNotifications,
    showToast,
    hideToast,
    toggleTheme,
    setTheme,
    setGlobalLoading,
} = uiSlice.actions;

// Selectors
export const selectSidebar = (state) => state.ui.sidebar;
export const selectModal = (state) => state.ui.modal;
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotificationsCount = (state) =>
    state.ui.notifications.filter(n => !n.read).length;
export const selectToast = (state) => state.ui.toast;
export const selectTheme = (state) => state.ui.theme;
export const selectGlobalLoading = (state) => state.ui.loading;

export default uiSlice.reducer;
