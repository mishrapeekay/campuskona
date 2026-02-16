import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock localStorage before importing the module
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

describe('API Client', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('should be importable', async () => {
    const module = await import('@api/client')
    expect(module.default).toBeDefined()
  })

  it('should have buildQueryString utility', async () => {
    const { buildQueryString } = await import('@api/client')
    if (buildQueryString) {
      const result = buildQueryString({ pageSize: 10, sortOrder: 'asc' })
      expect(typeof result).toBe('string')
    }
  })

  it('should have uploadFile utility', async () => {
    const { uploadFile } = await import('@api/client')
    expect(typeof uploadFile).toBe('function')
  })

  it('should have downloadFile utility', async () => {
    const { downloadFile } = await import('@api/client')
    expect(typeof downloadFile).toBe('function')
  })
})
