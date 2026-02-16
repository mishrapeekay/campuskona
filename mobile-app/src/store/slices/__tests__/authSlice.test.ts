import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setTenantFeatures,
  setSubscriptionTier,
} from '../authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    tenantFeatures: [],
    subscriptionTier: null,
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('login actions', () => {
    it('should handle loginStart', () => {
      const state = authReducer(initialState, loginStart());
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle loginSuccess', () => {
      const payload = {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: {
          id: '1',
          email: 'test@test.com',
          user_type: 'STUDENT',
        },
      };

      const state = authReducer(initialState, loginSuccess(payload));
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe('mock-access-token');
      expect(state.refreshToken).toBe('mock-refresh-token');
      expect(state.user).toEqual(payload.user);
      expect(state.error).toBeNull();
    });

    it('should handle loginFailure', () => {
      const errorMessage = 'Invalid credentials';
      const state = authReducer(initialState, loginFailure(errorMessage));
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('logout', () => {
    it('should handle logout', () => {
      const authenticatedState = {
        ...initialState,
        user: { id: '1', email: 'test@test.com' },
        token: 'mock-token',
        refreshToken: 'mock-refresh',
        isAuthenticated: true,
      };

      const state = authReducer(authenticatedState, logout());
      expect(state).toEqual(initialState);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('tenant features', () => {
    it('should handle setTenantFeatures', () => {
      const features = {
        features: ['student_management', 'attendance', 'library'],
        subscription_tier: 'PREMIUM',
      };

      const state = authReducer(initialState, setTenantFeatures(features));
      expect(state.tenantFeatures).toEqual(features.features);
      expect(state.subscriptionTier).toBe('PREMIUM');
    });

    it('should handle empty features', () => {
      const features = {
        features: [],
        subscription_tier: 'BASIC',
      };

      const state = authReducer(initialState, setTenantFeatures(features));
      expect(state.tenantFeatures).toEqual([]);
      expect(state.subscriptionTier).toBe('BASIC');
    });
  });

  describe('setSubscriptionTier', () => {
    it('should handle setSubscriptionTier', () => {
      const state = authReducer(initialState, setSubscriptionTier('ENTERPRISE'));
      expect(state.subscriptionTier).toBe('ENTERPRISE');
    });

    it('should update existing subscription tier', () => {
      const existingState = {
        ...initialState,
        subscriptionTier: 'BASIC',
      };

      const state = authReducer(existingState, setSubscriptionTier('PREMIUM'));
      expect(state.subscriptionTier).toBe('PREMIUM');
    });
  });

  describe('complex scenarios', () => {
    it('should handle login flow from start to success', () => {
      let state = initialState;

      // Start login
      state = authReducer(state, loginStart());
      expect(state.loading).toBe(true);

      // Success
      const payload = {
        access: 'token',
        refresh: 'refresh',
        user: { id: '1', email: 'user@test.com' },
      };
      state = authReducer(state, loginSuccess(payload));
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);

      // Set features
      state = authReducer(state, setTenantFeatures({
        features: ['feature1'],
        subscription_tier: 'PREMIUM',
      }));
      expect(state.tenantFeatures).toHaveLength(1);

      // Logout
      state = authReducer(state, logout());
      expect(state).toEqual(initialState);
    });

    it('should handle failed login attempt', () => {
      let state = initialState;

      // Start login
      state = authReducer(state, loginStart());
      expect(state.loading).toBe(true);

      // Fail
      state = authReducer(state, loginFailure('Network error'));
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Network error');

      // Retry
      state = authReducer(state, loginStart());
      expect(state.error).toBeNull();
    });
  });
});
