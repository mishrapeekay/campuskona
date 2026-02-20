import apiClient from './client';
import {
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
} from '@/types/api';
import { LoginResponse, User, Role, Permission } from '@/types/models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';
import { secureStorage } from '@/services/secure-storage.service';

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Collect device info for LoginHistory on backend
    const deviceInfo = await this.getDeviceInfo();
    const payload = { ...credentials, ...deviceInfo };

    const response = await apiClient.post<LoginResponse>('/auth/login/', payload);

    // Store tokens SECURELY
    await secureStorage.setTokens(response.access, response.refresh);

    // Store user data
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

    return response;
  }

  /**
   * Collect device information for LoginHistory tracking
   */
  private async getDeviceInfo(): Promise<Record<string, string>> {
    try {
      const { Platform } = require('react-native');
      const DeviceInfo = require('react-native-device-info');

      return {
        device_type: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
        device_name: await DeviceInfo.getDeviceName(),
        device_model: DeviceInfo.getModel(),
        os_version: `${Platform.OS} ${Platform.Version}`,
        app_version: DeviceInfo.getVersion(),
        user_agent: await DeviceInfo.getUserAgent(),
      };
    } catch {
      // Fallback if react-native-device-info is not available
      const { Platform } = require('react-native');
      return {
        device_type: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
        user_agent: `SchoolMgmt-Mobile/${Platform.OS}`,
      };
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/register/', userData);

    // Store tokens SECURELY
    await secureStorage.setTokens(response.access, response.refresh);

    // Store user data
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

    return response;
  }

  /**
   * Logout user — deregisters FCM token from backend before clearing session
   */
  async logout(): Promise<void> {
    // Deregister FCM token so this device stops receiving push notifications after logout
    try {
      const { Platform } = require('react-native');
      const DeviceInfo = require('react-native-device-info');
      const deviceId = await DeviceInfo.getUniqueId();
      await apiClient.delete('/communication/fcm-token/', {
        data: { device_id: deviceId, device_type: Platform.OS },
      });
    } catch (fcmError) {
      console.warn('[Logout] Could not deregister FCM token:', fcmError);
    }

    // Delete the local Firebase token so a fresh one is issued on next login
    try {
      const { default: messaging } = require('@react-native-firebase/messaging');
      await messaging().deleteToken();
    } catch (e) {
      console.warn('[Logout] Could not delete local FCM token:', e);
    }

    try {
      const refreshToken = await secureStorage.getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all stored data
      await secureStorage.clearTokens();
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.ACCESS_TOKEN, // Clean up legacy keys if they exist
        STORAGE_KEYS.REFRESH_TOKEN // Clean up legacy keys if they exist
      ]);
    }
  }

  /**
   * Refresh access token
   * Note: The client interceptor usually handles this, but explicit calls need this too.
   */
  async refreshToken(token?: string): Promise<string> {
    const refreshToken = token || await secureStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Session expired. Please login again.');
    }

    const response = await apiClient.post<{ access: string; refresh?: string }>('/auth/refresh/', {
      refresh: refreshToken,
    });

    // Determine the new refresh token (use existing if not returned)
    const newRefresh = response.refresh || refreshToken;

    // Update secure storage
    await secureStorage.setTokens(response.access, newRefresh);

    return response.access;
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/users/me/');
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response));
    return response;
  }

  /**
   * Update current user
   */
  async updateCurrentUser(userData: Partial<User>): Promise<User> {
    const currentUser = await this.getCurrentUser();
    const response = await apiClient.patch<User>(`/auth/users/${currentUser.id}/`, userData);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response));
    return response;
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(imageUri: string, mimeType: string = 'image/jpeg', fileName: string = 'avatar.jpg'): Promise<User> {
    const currentUser = await this.getCurrentUser();

    // Create FormData
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: mimeType,
      name: fileName,
    } as any);

    // Patch user with FormData
    const response = await apiClient.patch<User>(
      `/auth/users/${currentUser.id}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response));
    return response;
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/auth/change-password/', data);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    await apiClient.post('/auth/password-reset/', data);
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<void> {
    await apiClient.post('/auth/password-reset/confirm/', data);
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/verify-email/', { token });
  }

  /**
   * Get stored user data
   */
  async getStoredUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const accessToken = await secureStorage.getAccessToken();
    return !!accessToken;
  }

  /**
   * Get user roles
   */
  async getUserRoles(): Promise<Role[]> {
    const response = await apiClient.get<Role[]>('/auth/user-roles/');
    return response;
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(): Promise<string[]> {
    const user = await this.getStoredUser();
    return user?.permissions || [];
  }

  /**
   * Check if user has permission
   */
  async hasPermission(permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions();
    return permissions.includes(permission);
  }

  /**
   * Check if user has any of the permissions
   */
  async hasAnyPermission(permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions();
    return permissions.some((permission) => userPermissions.includes(permission));
  }

  /**
   * Check if user has all permissions
   */
  async hasAllPermissions(permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions();
    return permissions.every((permission) => userPermissions.includes(permission));
  }

  // ── Workstream L: OTP + Admission login ──────────────────────────────────

  /**
   * Request an OTP for phone-based login
   */
  async requestOTP(phone: string): Promise<{ session_id: string; message: string }> {
    return apiClient.post('/auth/otp/request/', { phone });
  }

  /**
   * Verify OTP and return JWT tokens
   */
  async verifyOTP(phone: string, otp: string, sessionId: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/otp/verify/', {
      phone,
      otp,
      session_id: sessionId,
    });
  }

  /**
   * Login with admission number + date of birth (student self-login)
   */
  async admissionLogin(admissionNumber: string, dateOfBirth: string): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/admission-login/', {
      admission_number: admissionNumber,
      date_of_birth: dateOfBirth,
    });
  }
}

export const authService = new AuthService();
export default authService;
