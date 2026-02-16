import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import PrivateRoute from '../PrivateRoute'
import { renderWithProviders } from '../../test/test-utils'

const ProtectedContent = () => <div>Protected Content</div>

describe('PrivateRoute', () => {
  it('renders outlet when authenticated', () => {
    renderWithProviders(
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<ProtectedContent />} />
        </Route>
      </Routes>,
      {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            loading: false,
            user: { id: '1' },
            token: 'token',
            refreshToken: null,
            error: null,
          },
        },
      }
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    renderWithProviders(
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<ProtectedContent />} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      {
        preloadedState: {
          auth: {
            isAuthenticated: false,
            loading: false,
            user: null,
            token: null,
            refreshToken: null,
            error: null,
          },
        },
      }
    )
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('shows loading state while checking auth', () => {
    renderWithProviders(
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<ProtectedContent />} />
        </Route>
      </Routes>,
      {
        preloadedState: {
          auth: {
            isAuthenticated: false,
            loading: true,
            user: null,
            token: null,
            refreshToken: null,
            error: null,
          },
        },
      }
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
