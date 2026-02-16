import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/api';
import { LoginRequest } from '@/types/api';
import { User, LoginResponse } from '@/types/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';
import { secureStorage } from '@/services/secure-storage.service';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
  // Feature flags
  tenantFeatures: Record<string, boolean> | null;
  subscriptionTier: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  error: null,
  tenantFeatures: null,
  subscriptionTier: 'BASIC',
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      // authService already stores tokens in SecureStorage and user data in AsyncStorage

      // Persist super admin mode flag so the API client skips tenant headers across restarts
      const platformRoles = ['SUPER_ADMIN', 'PARTNER', 'INVESTOR'];
      if (response.user?.user_type && platformRoles.includes(response.user.user_type)) {
        await AsyncStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_MODE, 'true');
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.SUPER_ADMIN_MODE);
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  // Clearing tokens handled by authService.logout()
  await AsyncStorage.removeItem(STORAGE_KEYS.TENANT_FEATURES);
  await AsyncStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION_TIER);
  await AsyncStorage.removeItem(STORAGE_KEYS.SUPER_ADMIN_MODE);
  // Do NOT remove selected tenant on logout, so user can re-login to same school

  try {
    await authService.logout();
  } catch (error) {
    console.log('Logout API error:', error);
  }
});

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async () => {
  return await authService.getCurrentUser();
});

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (refreshToken: string, { rejectWithValue }) => {
    try {
      const accessToken = await authService.refreshToken(refreshToken);
      // authService handles storage
      return { access: accessToken };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const fetchTenantFeatures = createAsyncThunk(
  'auth/fetchTenantFeatures',
  async (_, { rejectWithValue }) => {
    try {
      // Import api client dynamically to avoid circular deps
      const { apiClient } = require('@/services/api');
      const data = await apiClient.get('/tenants/my-features/');

      await AsyncStorage.setItem(STORAGE_KEYS.TENANT_FEATURES, JSON.stringify(data.features));
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_TIER, data.subscription_tier || 'BASIC');

      return data;
    } catch (error: any) {
      console.warn('Could not fetch tenant features:', error);
      return rejectWithValue(error.message || 'Failed to fetch features');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTokens: (state, action: PayloadAction<{ access: string; refresh: string }>) => {
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
      state.isAuthenticated = true;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setTenantFeatures: (
      state,
      action: PayloadAction<{ features: Record<string, boolean>; subscription_tier?: string }>
    ) => {
      state.tenantFeatures = action.payload.features;
      state.subscriptionTier = action.payload.subscription_tier || 'BASIC';
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        return initialState;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch user';
      })
      // Refresh Token
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.access;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        return initialState;
      })
      // Fetch Tenant Features
      .addCase(fetchTenantFeatures.fulfilled, (state, action) => {
        state.tenantFeatures = action.payload.features;
        state.subscriptionTier = action.payload.subscription_tier || 'BASIC';
      });
  },
});

export const { clearError, setTokens, setUser, setTenantFeatures } = authSlice.actions;
export default authSlice.reducer;
