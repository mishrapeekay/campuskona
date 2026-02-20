import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '@/constants';
import { ApiError, ApiResponse } from '@/types/api';
import { secureStorage } from '@/services/secure-storage.service';

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request Interceptor
    this.instance.interceptors.request.use(
      async (config) => {
        // Add access token to headers
        const accessToken = await secureStorage.getAccessToken();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Add tenant subdomain to headers (only if not already set by the caller,
        // and not in super admin platform mode)
        if (!config.headers['X-Tenant-Subdomain']) {
          const isSuperAdminMode = await AsyncStorage.getItem(STORAGE_KEYS.SUPER_ADMIN_MODE);
          if (isSuperAdminMode !== 'true') {
            const tenantData = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_TENANT);
            if (tenantData) {
              const tenant = JSON.parse(tenantData);
              config.headers['X-Tenant-Subdomain'] = tenant.subdomain;
              if (__DEV__) {
                console.log(`🏫 API Request to tenant: ${tenant.subdomain} (${tenant.school_name})`);
              }
            }
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 Unauthorized - Token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.instance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await secureStorage.getRefreshToken();

            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            // Call refresh endpoint directly using axios to avoid interceptors
            const response = await axios.post(
              `${API_CONFIG.BASE_URL}/auth/refresh`,
              { refresh_token: refreshToken },
              {
                headers: { ...API_CONFIG.HEADERS }
              }
            );

            const { access_token, refresh_token: new_refresh_token } = response.data.data;

            await secureStorage.setTokens(access_token, new_refresh_token);

            this.processQueue(null, access_token);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            await secureStorage.clearTokens();
            // Trigger logout action in Redux
            if (this.onLogout) {
              this.onLogout();
            }
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private onLogout: (() => void) | null = null;

  public setLogoutCallback(callback: () => void) {
    this.onLogout = callback;
  }

  private async handleLogout() {
    await secureStorage.clearTokens();
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_DATA,
    ]);

    if (this.onLogout) {
      this.onLogout();
    }
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data: any = error.response.data;

      let message = ERROR_MESSAGES.UNKNOWN_ERROR;

      switch (status) {
        case 400:
          message = data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
          break;
        case 401:
          message = data?.message || ERROR_MESSAGES.UNAUTHORIZED;
          break;
        case 403:
          message = data?.message || ERROR_MESSAGES.FORBIDDEN;
          break;
        case 404:
          message = data?.message || ERROR_MESSAGES.NOT_FOUND;
          break;
        case 500:
        case 502:
        case 503:
          message = ERROR_MESSAGES.SERVER_ERROR;
          break;
        default:
          message = data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
      }

      return {
        message,
        errors: data?.errors,
        status,
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        message: ERROR_MESSAGES.NETWORK_ERROR,
        status: 0,
      };
    } else {
      // Error in request configuration
      return {
        message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
        status: 0,
      };
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.delete(url, config);
    return response.data;
  }

  // Generic Request Method
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance(config);
    return response.data;
  }

  // File Upload
  async uploadFile<T = any>(
    url: string,
    file: any,
    additionalData?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    const response: AxiosResponse<T> = await this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // File Download
  async downloadFile(url: string, filename: string): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
    });

    // Platform-specific file download logic would go here
    // For now, just return the blob data
    return response.data;
  }

  // Build query string from params
  buildQueryString(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((item) => queryParams.append(key, String(item)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}

export const apiClient = new ApiClient();
export default apiClient;
