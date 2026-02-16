import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:8000/api/v1'

export const handlers = [
  // Login
  http.post(`${BASE_URL}/auth/login/`, async ({ request }) => {
    const body = await request.json()
    if (body.email === 'admin@test.com' && body.password === 'TestPass123!') {
      return HttpResponse.json({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: {
          id: '1',
          email: 'admin@test.com',
          first_name: 'Admin',
          last_name: 'User',
          user_type: 'SCHOOL_ADMIN',
        },
      })
    }
    return HttpResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  // Token refresh
  http.post(`${BASE_URL}/auth/refresh/`, () => {
    return HttpResponse.json({
      access: 'mock-new-access-token',
    })
  }),

  // Current user
  http.get(`${BASE_URL}/auth/users/me/`, () => {
    return HttpResponse.json({
      id: '1',
      email: 'admin@test.com',
      first_name: 'Admin',
      last_name: 'User',
      user_type: 'SCHOOL_ADMIN',
      is_active: true,
    })
  }),

  // Students list
  http.get(`${BASE_URL}/students/students/`, () => {
    return HttpResponse.json({
      count: 0,
      results: [],
    })
  }),

  // Classes list
  http.get(`${BASE_URL}/academics/classes/`, () => {
    return HttpResponse.json({
      count: 0,
      results: [],
    })
  }),
]
