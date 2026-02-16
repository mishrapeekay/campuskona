import { describe, it, expect, beforeEach, vi } from 'vitest'
import authReducer, {
  login,
  logout,
  checkAuth,
  updateUser,
  clearError,
} from '../authSlice'
import { configureStore } from '@reduxjs/toolkit'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('reducers', () => {
    it('should return the initial state', () => {
      const state = authReducer(undefined, { type: '@@INIT' })
      expect(state).toHaveProperty('user')
      expect(state).toHaveProperty('isAuthenticated')
      expect(state).toHaveProperty('loading', false)
      expect(state).toHaveProperty('error', null)
    })

    it('updateUser should update user in state and localStorage', () => {
      const user = { id: '1', email: 'test@test.com' }
      const state = authReducer(initialState, updateUser(user))
      expect(state.user).toEqual(user)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(user)
      )
    })

    it('clearError should reset error to null', () => {
      const stateWithError = { ...initialState, error: 'Some error' }
      const state = authReducer(stateWithError, clearError())
      expect(state.error).toBeNull()
    })
  })

  describe('login thunk', () => {
    it('should set loading on pending', () => {
      const state = authReducer(initialState, login.pending('requestId'))
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should set user and tokens on fulfilled', () => {
      const payload = {
        user: { id: '1', email: 'admin@test.com', full_name: 'Admin' },
        access: 'access-token',
        refresh: 'refresh-token',
      }
      const state = authReducer(
        initialState,
        login.fulfilled(payload, 'requestId', {})
      )
      expect(state.loading).toBe(false)
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual(payload.user)
      expect(state.token).toBe('access-token')
      expect(state.refreshToken).toBe('refresh-token')
    })

    it('should set error on rejected', () => {
      const state = authReducer(
        initialState,
        login.rejected(null, 'requestId', {}, 'Invalid credentials')
      )
      expect(state.loading).toBe(false)
      expect(state.isAuthenticated).toBe(false)
      expect(state.error).toBe('Invalid credentials')
    })
  })

  describe('logout thunk', () => {
    it('should clear all auth state on fulfilled', () => {
      const authenticatedState = {
        user: { id: '1' },
        token: 'token',
        refreshToken: 'refresh',
        isAuthenticated: true,
        loading: false,
        error: null,
      }
      const state = authReducer(
        authenticatedState,
        logout.fulfilled(null, 'requestId', undefined)
      )
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.refreshToken).toBeNull()
    })
  })

  describe('checkAuth thunk', () => {
    it('should set loading on pending', () => {
      const state = authReducer(initialState, checkAuth.pending('requestId'))
      expect(state.loading).toBe(true)
    })

    it('should set user and token on fulfilled', () => {
      const payload = {
        user: { id: '1', email: 'admin@test.com' },
        token: 'valid-token',
      }
      const state = authReducer(
        initialState,
        checkAuth.fulfilled(payload, 'requestId', undefined)
      )
      expect(state.loading).toBe(false)
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual(payload.user)
    })

    it('should clear auth on rejected', () => {
      const state = authReducer(
        { ...initialState, isAuthenticated: true },
        checkAuth.rejected(null, 'requestId', undefined, 'Token expired')
      )
      expect(state.loading).toBe(false)
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
    })
  })
})
