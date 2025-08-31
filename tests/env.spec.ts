import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('env module', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Set up required environment variables for tests
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      NODE_ENV: 'test',
      APP_ENV: 'development',
    }
  })

  afterEach(() => {
    // Restore original process.env
    process.env = originalEnv
  })

  it('should have NODE_ENV defined', async () => {
    const { env } = await import('@/lib/env')
    expect(env.NODE_ENV).toBeDefined()
    expect(['development', 'test', 'production']).toContain(env.NODE_ENV)
  })

  it('should handle flag function correctly', async () => {
    const { flag } = await import('@/lib/env')
    expect(flag('true')).toBe(true)
    expect(flag('false')).toBe(false)
    expect(flag(undefined)).toBe(false)
  })
})
