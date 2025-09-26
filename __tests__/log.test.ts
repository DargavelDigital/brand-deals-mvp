import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { log } from '../src/lib/log'
import { runWithContext } from '../src/lib/als'

// Mock console methods
const mockConsoleLog = vi.fn()
const mockConsoleWarn = vi.fn()
const mockConsoleError = vi.fn()

beforeAll(() => {
  global.console = {
    ...global.console,
    log: mockConsoleLog,
    warn: mockConsoleWarn,
    error: mockConsoleError,
  }
})

beforeEach(() => {
  mockConsoleLog.mockClear()
  mockConsoleWarn.mockClear()
  mockConsoleError.mockClear()
})

describe('log', () => {
  describe('format', () => {
    it('should format info log with all fields', () => {
      runWithContext({
        requestId: 'req-123',
        workspaceId: 'ws-456',
        feature: 'audit'
      }, () => {
        log.info('Test message', { userId: 'user-789' })
      })

      expect(mockConsoleLog).toHaveBeenCalledTimes(1)
      const logCall = mockConsoleLog.mock.calls[0][0]
      const parsed = JSON.parse(logCall)

      expect(parsed).toMatchObject({
        ts: expect.any(String),
        level: 'info',
        msg: 'Test message',
        requestId: 'req-123',
        workspaceId: 'ws-456',
        feature: 'audit',
        meta: { userId: 'user-789' }
      })
    })

    it('should format warn log with minimal fields', () => {
      runWithContext({
        requestId: 'req-456'
      }, () => {
        log.warn('Warning message')
      })

      expect(mockConsoleWarn).toHaveBeenCalledTimes(1)
      const logCall = mockConsoleWarn.mock.calls[0][0]
      const parsed = JSON.parse(logCall)

      expect(parsed).toMatchObject({
        ts: expect.any(String),
        level: 'warn',
        msg: 'Warning message',
        requestId: 'req-456'
      })
      expect(parsed.workspaceId).toBeUndefined()
      expect(parsed.feature).toBeUndefined()
      expect(parsed.meta).toBeUndefined()
    })

    it('should format error log with context', () => {
      runWithContext({
        requestId: 'req-789',
        workspaceId: 'ws-abc',
        feature: 'stripe-webhook'
      }, () => {
        log.error('Error occurred', { error: 'Validation failed', code: 400 })
      })

      expect(mockConsoleError).toHaveBeenCalledTimes(1)
      const logCall = mockConsoleError.mock.calls[0][0]
      const parsed = JSON.parse(logCall)

      expect(parsed).toMatchObject({
        ts: expect.any(String),
        level: 'error',
        msg: 'Error occurred',
        requestId: 'req-789',
        workspaceId: 'ws-abc',
        feature: 'stripe-webhook',
        meta: { error: 'Validation failed', code: 400 }
      })
    })

    it('should handle missing context gracefully', () => {
      log.info('No context message')

      expect(mockConsoleLog).toHaveBeenCalledTimes(1)
      const logCall = mockConsoleLog.mock.calls[0][0]
      const parsed = JSON.parse(logCall)

      expect(parsed).toMatchObject({
        ts: expect.any(String),
        level: 'info',
        msg: 'No context message'
      })
      expect(parsed.requestId).toBeUndefined()
      expect(parsed.workspaceId).toBeUndefined()
      expect(parsed.feature).toBeUndefined()
    })

    it('should exclude undefined values from output', () => {
      runWithContext({
        requestId: 'req-123',
        workspaceId: undefined,
        feature: 'test'
      }, () => {
        log.info('Test message', { valid: 'value', invalid: undefined })
      })

      expect(mockConsoleLog).toHaveBeenCalledTimes(1)
      const logCall = mockConsoleLog.mock.calls[0][0]
      const parsed = JSON.parse(logCall)

      expect(parsed).toMatchObject({
        ts: expect.any(String),
        level: 'info',
        msg: 'Test message',
        requestId: 'req-123',
        feature: 'test',
        meta: { valid: 'value' }
      })
      expect(parsed.workspaceId).toBeUndefined()
      expect(parsed.meta.invalid).toBeUndefined()
    })

    it('should use correct console method for each level', () => {
      runWithContext({ requestId: 'req-123' }, () => {
        log.info('info message')
        log.warn('warn message')
        log.error('error message')
      })

      expect(mockConsoleLog).toHaveBeenCalledTimes(1)
      expect(mockConsoleWarn).toHaveBeenCalledTimes(1)
      expect(mockConsoleError).toHaveBeenCalledTimes(1)
    })

    it('should generate valid JSON', () => {
      runWithContext({
        requestId: 'req-123',
        workspaceId: 'ws-456',
        feature: 'test'
      }, () => {
        log.info('Test message', { complex: { nested: 'value' }, array: [1, 2, 3] })
      })

      expect(mockConsoleLog).toHaveBeenCalledTimes(1)
      const logCall = mockConsoleLog.mock.calls[0][0]
      
      // Should be valid JSON
      expect(() => JSON.parse(logCall)).not.toThrow()
      
      const parsed = JSON.parse(logCall)
      expect(parsed.meta.complex.nested).toBe('value')
      expect(parsed.meta.array).toEqual([1, 2, 3])
    })
  })
})
