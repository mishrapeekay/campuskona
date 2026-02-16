import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import RoleBasedRoute from '../RoleBasedRoute'
import { renderWithProviders } from '../../test/test-utils'

const AdminContent = () => <div>Admin Content</div>

describe('RoleBasedRoute', () => {
  it('renders outlet for allowed role', () => {
    renderWithProviders(
      <Routes>
        <Route
          element={<RoleBasedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']} />}
        >
          <Route path="/" element={<AdminContent />} />
        </Route>
      </Routes>,
      {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            loading: false,
            user: { id: '1', user_type: 'SCHOOL_ADMIN' },
            token: 'token',
            refreshToken: null,
            error: null,
          },
        },
      }
    )
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('redirects to /unauthorized for disallowed role', () => {
    renderWithProviders(
      <Routes>
        <Route
          element={<RoleBasedRoute allowedRoles={['SCHOOL_ADMIN']} />}
        >
          <Route path="/" element={<AdminContent />} />
        </Route>
        <Route path="/unauthorized" element={<div>Access Denied</div>} />
      </Routes>,
      {
        preloadedState: {
          auth: {
            isAuthenticated: true,
            loading: false,
            user: { id: '1', user_type: 'STUDENT' },
            token: 'token',
            refreshToken: null,
            error: null,
          },
        },
      }
    )
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
    expect(screen.getByText('Access Denied')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    renderWithProviders(
      <Routes>
        <Route
          element={<RoleBasedRoute allowedRoles={['SCHOOL_ADMIN']} />}
        >
          <Route path="/" element={<AdminContent />} />
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
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
