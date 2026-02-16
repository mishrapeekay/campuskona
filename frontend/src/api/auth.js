import apiClient from './client'

/**
 * Authentication API endpoints
 */

export const authAPI = {
  // Login
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login/', credentials)
    return response.data
  },

  // Register
  register: async (userData) => {
    const response = await apiClient.post('/auth/register/', userData)
    return response.data
  },

  // Logout
  logout: async (refreshToken) => {
    const response = await apiClient.post('/auth/logout/', {
      refresh_token: refreshToken,
    })
    return response.data
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh/', {
      refresh: refreshToken,
    })
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/users/me/')
    return response.data
  },

  // Change password
  changePassword: async (passwords) => {
    const response = await apiClient.post('/auth/change-password/', passwords)
    return response.data
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await apiClient.post('/auth/password-reset/', { email })
    return response.data
  },

  // Confirm password reset
  confirmPasswordReset: async (data) => {
    const response = await apiClient.post('/auth/password-reset/confirm/', data)
    return response.data
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await apiClient.post('/auth/verify-email/', { token })
    return response.data
  },
}

export default authAPI
