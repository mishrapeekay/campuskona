import { authService } from '../auth.service';
import { apiClient } from '../client';

// Mock the API client
jest.mock('../client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const credentials = {
        email: 'test@test.com',
        password: 'password123',
      };

      const mockResponse = {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: {
          id: '1',
          email: 'test@test.com',
          user_type: 'STUDENT',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authService.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login/', credentials);
      expect(result.data).toEqual(mockResponse);
    });

    it('should throw error on failed login', async () => {
      const credentials = {
        email: 'wrong@test.com',
        password: 'wrongpassword',
      };

      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      const mockResponse = { message: 'Successfully logged out' };
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authService.logout();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout/');
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle logout errors', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(authService.logout()).rejects.toThrow('Network error');
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const refreshToken = 'mock-refresh-token';
      const mockResponse = {
        access: 'new-access-token',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authService.refreshToken(refreshToken);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh/', {
        refresh: refreshToken,
      });
      expect(result.data.access).toBe('new-access-token');
    });

    it('should throw error on invalid refresh token', async () => {
      const refreshToken = 'invalid-token';
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Token is invalid or expired'));

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        'Token is invalid or expired'
      );
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'password123',
        password2: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockResponse = {
        user: {
          id: '1',
          email: 'newuser@test.com',
          first_name: 'John',
          last_name: 'Doe',
        },
        message: 'Registration successful',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authService.register(userData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register/', userData);
      expect(result.data).toEqual(mockResponse);
    });

    it('should throw error on registration failure', async () => {
      const userData = {
        email: 'existing@test.com',
        password: 'password123',
        password2: 'password123',
      };

      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('User with this email already exists')
      );

      await expect(authService.register(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should successfully request password reset', async () => {
      const email = 'user@test.com';
      const mockResponse = {
        message: 'Password reset link sent to your email',
      };

      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await authService.requestPasswordReset(email);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/password-reset/', { email });
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle non-existent email', async () => {
      const email = 'nonexistent@test.com';
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Email not found'));

      await expect(authService.requestPasswordReset(email)).rejects.toThrow('Email not found');
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user profile', async () => {
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        first_name: 'John',
        last_name: 'Doe',
        user_type: 'STUDENT',
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockUser });

      const result = await authService.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/users/me/');
      expect(result.data).toEqual(mockUser);
    });

    it('should throw error when not authenticated', async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Authentication required'));

      await expect(authService.getCurrentUser()).rejects.toThrow('Authentication required');
    });
  });
});
