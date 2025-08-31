import { describe, it, expect, afterEach } from 'vitest'

describe('env module - missing DATABASE_URL', () => {
  const originalEnv = process.env

  afterEach(() => {
    // Restore original process.env
    process.env = originalEnv
  })

  it('should throw helpful error when DATABASE_URL is missing', async () => {
    // Set up environment without DATABASE_URL
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      APP_ENV: 'development',
      // DATABASE_URL is intentionally omitted
    }

    // Test that importing the module throws an error
    await expect(import('@/lib/env')).rejects.toThrow()
    
    // Verify the error message contains DATABASE_URL
    try {
      await import('@/lib/env')
    } catch (error) {
      expect((error as Error).message).toContain('DATABASE_URL')
    }
  })
})
