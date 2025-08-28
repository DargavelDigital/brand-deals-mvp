import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withTimeout, retry, calcCostUSD, newTraceId } from '../src/services/ai/runtime'

describe('AI Runtime Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  describe('withTimeout', () => {
    it('should resolve when promise completes before timeout', async () => {
      const fastPromise = Promise.resolve('success')
      const result = withTimeout(fastPromise, 1000, 'test')
      
      await expect(result).resolves.toBe('success')
    })

    it('should reject when promise times out', async () => {
      const slowPromise = new Promise(resolve => setTimeout(resolve, 2000))
      const result = withTimeout(slowPromise, 1000, 'test')
      
      await expect(result).rejects.toThrow('Timeout test after 1000ms')
    })
  })

  describe('retry', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success')
      const result = await retry(fn, 3, 100)
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry and eventually succeed', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success')
      
      const result = await retry(fn, 3, 100)
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should fail after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('persistent failure'))
      
      await expect(retry(fn, 2, 100)).rejects.toThrow('persistent failure')
      expect(fn).toHaveBeenCalledTimes(3) // initial + 2 retries
    })

    it('should use exponential backoff with jitter', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success')
      
      const start = Date.now()
      await retry(fn, 2, 100)
      const duration = Date.now() - start
      
      // Should have some delay between attempts
      expect(duration).toBeGreaterThan(0)
    })
  })

  describe('calcCostUSD', () => {
    it('should calculate costs with default CPMs', () => {
      const result = calcCostUSD({
        inputTokens: 1000,
        outputTokens: 500
      })
      
      // Default: input $0.005/1k, output $0.015/1k
      expect(result.inputCostUsd).toBe(0.005)
      expect(result.outputCostUsd).toBe(0.0075)
      expect(result.totalCostUsd).toBe(0.0125)
    })

    it('should use custom CPMs when provided', () => {
      const result = calcCostUSD({
        inputTokens: 2000,
        outputTokens: 1000,
        cpmInput: 0.01,
        cpmOutput: 0.02
      })
      
      expect(result.inputCostUsd).toBe(0.02) // 2k * 0.01/1k
      expect(result.outputCostUsd).toBe(0.02) // 1k * 0.02/1k
      expect(result.totalCostUsd).toBe(0.04)
    })

    it('should handle zero tokens', () => {
      const result = calcCostUSD({
        inputTokens: 0,
        outputTokens: 0
      })
      
      expect(result.inputCostUsd).toBe(0)
      expect(result.outputCostUsd).toBe(0)
      expect(result.totalCostUsd).toBe(0)
    })
  })

  describe('newTraceId', () => {
    it('should generate unique trace IDs', () => {
      const id1 = newTraceId()
      const id2 = newTraceId()
      
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })
  })
})
