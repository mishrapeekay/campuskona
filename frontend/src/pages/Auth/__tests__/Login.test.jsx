import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Login from '../Login';
import authReducer from '../../../store/slices/authSlice';
import apiClient from '../../../api/client';
import * as featuresAPI from '../../../api/features';

// Mock API client and features
vi.mock('../../../api/client');
vi.mock('../../../api/features');

describe('Login Component', () => {
  let store;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    localStorage.clear();

    // Create fresh store for each test
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });

    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };
  });

  const renderLogin = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render login form', () => {
      renderLogin();

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('School Management System')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should have default credentials pre-filled', () => {
      renderLogin();

      const emailInput = screen.getByDisplayValue('admin@demo.com');
      const passwordInput = screen.getByDisplayValue('Admin@123');

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('should set default tenant in localStorage on mount', () => {
      renderLogin();

      expect(localStorage.getItem('selectedTenant')).toBe('demo');
      expect(localStorage.getItem('tenant_subdomain')).toBe('demo');
    });

    it('should display demo credentials', () => {
      renderLogin();

      expect(screen.getByText(/Demo Credentials:/i)).toBeInTheDocument();
      expect(screen.getByText(/admin@demo.com/i)).toBeInTheDocument();
      expect(screen.getByText(/teacher@demo.com/i)).toBeInTheDocument();
      expect(screen.getByText(/student@demo.com/i)).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should allow changing email', () => {
      renderLogin();

      const emailInput = screen.getByDisplayValue('admin@demo.com');

      fireEvent.change(emailInput, { target: { value: 'teacher@demo.com' } });

      expect(emailInput.value).toBe('teacher@demo.com');
    });

    it('should allow changing password', () => {
      renderLogin();

      const passwordInput = screen.getByDisplayValue('Admin@123');

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123' } });

      expect(passwordInput.value).toBe('NewPassword123');
    });

    it('should have email input with correct type', () => {
      renderLogin();

      const emailInput = screen.getByDisplayValue('admin@demo.com');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
    });

    it('should have password input with correct type', () => {
      renderLogin();

      const passwordInput = screen.getByDisplayValue('Admin@123');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
    });
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        data: {
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'admin@demo.com',
            user_type: 'SCHOOL_ADMIN',
          },
        },
      };

      const mockFeatures = {
        data: {
          features: ['student_management', 'attendance'],
          subscription_tier: 'PREMIUM',
        },
      };

      apiClient.post.mockResolvedValueOnce(mockResponse);
      featuresAPI.getMyFeatures.mockResolvedValueOnce(mockFeatures);

      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Should call API with correct data
      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/auth/login/', {
          email: 'admin@demo.com',
          password: 'Admin@123',
        });
      });

      // Should fetch tenant features
      await waitFor(() => {
        expect(featuresAPI.getMyFeatures).toHaveBeenCalled();
      });

      // Should redirect to dashboard
      await waitFor(() => {
        expect(window.location.href).toBe('/dashboard');
      });
    });

    it('should show error message on login failure', async () => {
      const errorMessage = 'Invalid credentials';
      apiClient.post.mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage,
          },
        },
      });

      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should show loading state during login', async () => {
      apiClient.post.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          data: {
            access: 'token',
            refresh: 'refresh',
            user: { id: '1', email: 'test@test.com' }
          }
        }), 100))
      );
      featuresAPI.getMyFeatures.mockResolvedValue({ data: {} });

      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Button should be disabled during loading
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Should show loading text
      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
      });
    });

    it('should handle network error gracefully', async () => {
      apiClient.post.mockRejectedValueOnce(new Error('Network Error'));

      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Login failed/i)).toBeInTheDocument();
      });
    });

    it('should continue login even if features fetch fails', async () => {
      const mockResponse = {
        data: {
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'admin@demo.com',
          },
        },
      };

      apiClient.post.mockResolvedValueOnce(mockResponse);
      featuresAPI.getMyFeatures.mockRejectedValueOnce(new Error('Features unavailable'));

      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Should still redirect even if features fail
      await waitFor(() => {
        expect(window.location.href).toBe('/dashboard');
      }, { timeout: 3000 });
    });

    it('should handle form submission', async () => {
      const mockResponse = {
        data: {
          access: 'token',
          refresh: 'refresh',
          user: { id: '1', email: 'admin@demo.com' },
        },
      };

      apiClient.post.mockResolvedValueOnce(mockResponse);
      featuresAPI.getMyFeatures.mockResolvedValueOnce({ data: {} });

      renderLogin();

      const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalled();
      });
    });
  });

  describe('Tenant Management', () => {
    it('should set tenant context on successful login', async () => {
      const mockResponse = {
        data: {
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'admin@demo.com',
          },
        },
      };

      apiClient.post.mockResolvedValueOnce(mockResponse);
      featuresAPI.getMyFeatures.mockResolvedValueOnce({ data: {} });

      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem('selectedTenant')).toBe('demo');
        expect(localStorage.getItem('tenant_subdomain')).toBe('demo');
      });
    });

    it('should ensure tenant is set before login API call', async () => {
      localStorage.clear(); // Clear any existing tenant

      const mockResponse = {
        data: {
          access: 'token',
          refresh: 'refresh',
          user: { id: '1', email: 'admin@demo.com' },
        },
      };

      apiClient.post.mockResolvedValueOnce(mockResponse);
      featuresAPI.getMyFeatures.mockResolvedValueOnce({ data: {} });

      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem('selectedTenant')).toBe('demo');
        expect(apiClient.post).toHaveBeenCalled();
      });
    });
  });

  describe('Error Display', () => {
    it('should not show error initially', () => {
      renderLogin();

      const errorRegex = /invalid|failed|error/i;
      const errorElements = screen.queryAllByText(errorRegex);

      // Filter out demo credentials text
      const actualErrors = errorElements.filter(el =>
        !el.textContent.includes('demo.com') &&
        !el.textContent.includes('Admin@123')
      );

      expect(actualErrors).toHaveLength(0);
    });

    it('should display error in red box when login fails', async () => {
      apiClient.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Authentication failed',
          },
        },
      });

      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorText = screen.getByText('Authentication failed');
        expect(errorText).toBeInTheDocument();
        expect(errorText).toHaveStyle({ color: '#DC2626' });
      });
    });
  });
});
