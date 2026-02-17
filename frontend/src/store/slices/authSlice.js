import { createSlice } from '@reduxjs/toolkit'

// Helper to get user from localStorage
const getUserFromStorage = () => {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return null;
    }
};

// Helper to get tenant features from localStorage
const getFeaturesFromStorage = () => {
    try {
        const featuresStr = localStorage.getItem('tenant_features');
        return featuresStr ? JSON.parse(featuresStr) : null;
    } catch (error) {
        console.error('Error parsing tenant features from localStorage:', error);
        return null;
    }
};

const initialState = {
    user: getUserFromStorage(),
    token: localStorage.getItem('access_token') || null,
    isAuthenticated: !!localStorage.getItem('access_token'),
    loading: false,
    error: null,
    // Feature flags
    tenantFeatures: getFeaturesFromStorage(),
    subscriptionTier: localStorage.getItem('subscription_tier') || 'BASIC',
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload.user
            state.token = action.payload.access
            state.isAuthenticated = true
            state.loading = false
            state.error = null
            localStorage.setItem('access_token', action.payload.access)
            localStorage.setItem('refresh_token', action.payload.refresh)
            localStorage.setItem('user', JSON.stringify(action.payload.user))
        },
        loginStart: (state) => {
            state.loading = true
            state.error = null
        },
        loginFailure: (state, action) => {
            state.loading = false
            state.error = action.payload
            state.isAuthenticated = false
        },
        logout: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            state.loading = false
            state.error = null
            state.tenantFeatures = null
            state.subscriptionTier = 'BASIC'
            // Clear all auth and tenant data
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            localStorage.removeItem('selectedTenant')
            localStorage.removeItem('tenant_id')
            localStorage.removeItem('tenant_subdomain')
            localStorage.removeItem('tenant_name')
            localStorage.removeItem('tenant_features')
            localStorage.removeItem('subscription_tier')
        },
        setTenantFeatures: (state, action) => {
            state.tenantFeatures = action.payload.features
            state.subscriptionTier = action.payload.subscription_tier || 'BASIC'
            localStorage.setItem('tenant_features', JSON.stringify(action.payload.features))
            localStorage.setItem('subscription_tier', action.payload.subscription_tier || 'BASIC')
        },
        updateUserInStore: (state, action) => {
            state.user = { ...state.user, ...action.payload }
            localStorage.setItem('user', JSON.stringify(state.user))
        },
    },
})

export const { loginSuccess, loginStart, loginFailure, logout, setTenantFeatures, updateUserInStore } = authSlice.actions
export default authSlice.reducer
