import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createTrace,
  withTrace,
  logAIEvent,
  createAIEvent,
  redactPII,
  calculateLatency
} from '../src/lib/observability'

// Mock console.log to capture output
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

describe('Observability System', () => {
  beforeEach(() => {
    mockConsoleLog.mockClear()
  })

  describe('createTrace', () => {
    it('should create a trace with unique ID and timestamp', () => {
      const trace1 = createTrace()
      const trace2 = createTrace()

      expect(trace1.traceId).toBeDefined()
      expect(trace1.traceId).toHaveLength(36) // UUID v4 length
      expect(trace1.startTime).toBeGreaterThan(0)
      expect(trace1.traceId).not.toBe(trace2.traceId)
    })
  })

  describe('withTrace', () => {
    it('should wrap function and add trace ID to headers', async () => {
      const trace = createTrace()
      const mockFn = vi.fn().mockResolvedValue('result')
      
      const tracedFn = withTrace(mockFn, trace)
      const result = await tracedFn({ headers: { 'Content-Type': 'application/json' } })

      expect(result).toBe('result')
      expect(mockFn).toHaveBeenCalledWith({
        headers: {
          'Content-Type': 'application/json',
          'x-trace-id': trace.traceId
        }
      })
    })

    it('should not modify arguments without headers', async () => {
      const trace = createTrace()
      const mockFn = vi.fn().mockResolvedValue('result')
      
      const tracedFn = withTrace(mockFn, trace)
      const result = await tracedFn('simple arg')

      expect(result).toBe('result')
      expect(mockFn).toHaveBeenCalledWith('simple arg')
    })
  })

  describe('redactPII', () => {
    it('should redact email addresses', () => {
      const text = 'Contact me at john@example.com or jane@test.org'
      const redacted = redactPII(text)
      
      expect(redacted).toBe('Contact me at [EMAIL] or [EMAIL]')
    })

    it('should redact names', () => {
      const text = 'Hi John Smith, this is Jane Doe speaking'
      const redacted = redactPII(text)
      
      expect(redacted).toBe('[NAME] Smith, this is [NAME] speaking')
    })

    it('should redact phone numbers', () => {
      const text = 'Call me at +1-555-123-4567 or (555) 987-6543'
      const redacted = redactPII(text)
      
      expect(redacted).toBe('Call me at [PHONE] or [PHONE]')
    })

    it('should handle mixed PII', () => {
      const text = 'Hi John Smith, email me at john@example.com or call +1-555-123-4567'
      const redacted = redactPII(text)
      
      expect(redacted).toBe('[NAME] Smith, email me at [EMAIL] or call [PHONE]')
    })

    it('should return non-string input unchanged', () => {
      expect(redactPII(123)).toBe(123)
      expect(redactPII(null)).toBe(null)
      expect(redactPII(undefined)).toBe(undefined)
    })
  })

  describe('calculateLatency', () => {
    it('should calculate correct latency', async () => {
      const trace = createTrace()
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const latency = calculateLatency(trace)
      expect(latency).toBeGreaterThanOrEqual(45) // Allow some tolerance
    })
  })

  describe('createAIEvent', () => {
    it('should create AI event with correct structure', () => {
      const trace = createTrace()
      const event = createAIEvent(
        trace,
        'openai',
        'test_prompt',
        { input: 100, output: 200, total: 300 },
        { test: 'data' }
      )

      expect(event.traceId).toBe(trace.traceId)
      expect(event.provider).toBe('openai')
      expect(event.promptKey).toBe('test_prompt')
      expect(event.tokensUsed).toEqual({ input: 100, output: 200, total: 300 })
      expect(event.metadata).toEqual({ test: 'data' })
      expect(event.timestamp).toBeDefined()
      expect(event.latencyMs).toBeGreaterThanOrEqual(0)
    })
  })

  describe('logAIEvent', () => {
    it('should log AI event to console with PII redaction', () => {
      const event = {
        traceId: 'test-trace',
        provider: 'openai',
        promptKey: 'Hi John Smith, email me at john@example.com',
        tokensUsed: { input: 100, output: 200, total: 300 },
        latencyMs: 150,
        timestamp: '2024-01-01T00:00:00Z',
        metadata: { user: 'john@example.com' }
      }

      logAIEvent(event)

      // Should be called once with the full event
      expect(mockConsoleLog).toHaveBeenCalledTimes(1)
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '🤖 AI Event:',
        expect.stringContaining('"promptKey": "[NAME] Smith, email me at [EMAIL]"')
      )
    })
  })
})
