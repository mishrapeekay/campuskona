import axios from 'axios';

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('access_token');

    // Add authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant header for multi-tenant support
    const selectedTenant = localStorage.getItem('selectedTenant');
    if (selectedTenant) {
      config.headers['X-Tenant-Subdomain'] = selectedTenant;
    }

    return config;
  },
  (error) => {
    console.error('[AXIOS] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/auth/refresh/`,
            { refresh: refreshToken }
          );

          const { access } = response.data;

          // Save new access token
          localStorage.setItem('access_token', access);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        // Redirect to login
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error('Permission denied:', error.response.data);
    }

    // Handle 404 Not Found errors
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.response.data);
    }

    // Handle 500 Server errors
    if (error.response?.status >= 500) {
      console.error('[AXIOS] Server error:', {
        status: error.response.status,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        data: error.response.data
      });
    }

    return Promise.reject(error);
  }
);

// Helper function to handle file uploads
export const uploadFile = async (url, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

// Helper function to download files
export const downloadFile = async (url, filename) => {
  const response = await apiClient.get(url, {
    responseType: 'blob',
  });

  // Create blob link to download
  const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = urlBlob;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();

  return response;
};

// Helper function to convert camelCase to snake_case
const toSnakeCase = (str) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// Helper function to build query string
export const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();

  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      // Convert camelCase keys to snake_case for Django REST Framework
      const snakeCaseKey = toSnakeCase(key);

      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(snakeCaseKey, v));
      } else {
        queryParams.append(snakeCaseKey, value);
      }
    }
  });

  return queryParams.toString();
};

export default apiClient;
