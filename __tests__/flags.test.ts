import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  isFlagEnabled, 
  isFlagEnabledSync, 
  getWorkspaceFlags, 
  setWorkspaceFlag, 
  resetWorkspaceFlag,
  getAvailableFlags,
  getDefaultFlagValue,
  type FeatureFlag 
} from '../src/lib/flags'

// Mock Prisma
vi.mock('../src/lib/prisma', () => ({
  prisma: {
    workspace: {
      findUnique: vi.fn(),
      update: vi.fn()
    }
  }
}))

// Mock process.env
const originalEnv = process.env

describe('Feature Flags', () => {
  let mockPrisma: any

  beforeEach(async () => {
    vi.clearAllMocks()
    // Get the mocked prisma instance
    const { prisma } = await import('../src/lib/prisma')
    mockPrisma = vi.mocked(prisma)
    
    // Reset environment variables
    process.env = { ...originalEnv }
    // Clear all feature flag env vars
    process.env.AI_AUDIT_V2 = undefined
    process.env.AI_MATCH_V2 = undefined
    process.env.MATCH_LOCAL_ENABLED = undefined
    process.env.OUTREACH_TONES = undefined
    process.env.BRANDRUN_ONETOUCH = undefined
    process.env.MEDIAPACK_V2 = undefined
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('isFlagEnabledSync', () => {
    it('should return false for undefined environment variables', () => {
      expect(isFlagEnabledSync('AI_AUDIT_V2')).toBe(false)
      expect(isFlagEnabledSync('AI_MATCH_V2')).toBe(false)
    })

    it('should parse boolean environment variables correctly', () => {
      process.env.AI_AUDIT_V2 = 'true'
      process.env.AI_MATCH_V2 = 'false'
      process.env.MATCH_LOCAL_ENABLED = '1'
      process.env.OUTREACH_TONES = '0'

      expect(isFlagEnabledSync('AI_AUDIT_V2')).toBe(true)
      expect(isFlagEnabledSync('AI_MATCH_V2')).toBe(false)
      expect(isFlagEnabledSync('MATCH_LOCAL_ENABLED')).toBe(true)
      expect(isFlagEnabledSync('OUTREACH_TONES')).toBe(false)
    })

    it('should return false for invalid environment variable values', () => {
      process.env.AI_AUDIT_V2 = 'invalid'
      process.env.AI_MATCH_V2 = 'maybe'

      expect(isFlagEnabledSync('AI_AUDIT_V2')).toBe(false)
      expect(isFlagEnabledSync('AI_MATCH_V2')).toBe(false)
    })
  })

  describe('isFlagEnabled', () => {
    it('should fallback to environment variable when no workspace provided', async () => {
      process.env.AI_AUDIT_V2 = 'true'
      process.env.AI_MATCH_V2 = 'false'

      expect(await isFlagEnabled('AI_AUDIT_V2')).toBe(true)
      expect(await isFlagEnabled('AI_MATCH_V2')).toBe(false)
    })

    it('should return false for undefined flags', async () => {
      expect(await isFlagEnabled('AI_AUDIT_V2')).toBe(false)
    })
  })

  describe('getAvailableFlags', () => {
    it('should return all available feature flag keys', () => {
      const flags = getAvailableFlags()
      expect(flags).toContain('AI_AUDIT_V2')
      expect(flags).toContain('AI_MATCH_V2')
      expect(flags).toContain('MATCH_LOCAL_ENABLED')
      expect(flags).toContain('OUTREACH_TONES')
      expect(flags).toContain('BRANDRUN_ONETOUCH')
      expect(flags).toContain('MEDIAPACK_V2')
      expect(flags).toHaveLength(6)
    })
  })

  describe('getDefaultFlagValue', () => {
    it('should return false for all flags by default', () => {
      expect(getDefaultFlagValue('AI_AUDIT_V2')).toBe(false)
      expect(getDefaultFlagValue('AI_MATCH_V2')).toBe(false)
      expect(getDefaultFlagValue('MATCH_LOCAL_ENABLED')).toBe(false)
    })
  })

  describe('Workspace Flag Overrides', () => {
    const mockWorkspaceId = 'workspace-123'

    beforeEach(() => {
      mockPrisma.workspace.findUnique.mockResolvedValue(null)
      mockPrisma.workspace.update.mockResolvedValue({} as any)
    })

    it('should use workspace override when available', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue({
        featureFlags: { AI_AUDIT_V2: true, AI_MATCH_V2: false }
      } as any)

      expect(await isFlagEnabled('AI_AUDIT_V2', mockWorkspaceId)).toBe(true)
      expect(await isFlagEnabled('AI_MATCH_V2', mockWorkspaceId)).toBe(false)
    })

    it('should fallback to environment when workspace flag not set', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue({
        featureFlags: { AI_AUDIT_V2: true } // Only AI_AUDIT_V2 is set
      } as any)

      process.env.AI_MATCH_V2 = 'true'

      expect(await isFlagEnabled('AI_AUDIT_V2', mockWorkspaceId)).toBe(true)
      expect(await isFlagEnabled('AI_MATCH_V2', mockWorkspaceId)).toBe(true)
    })

    it('should handle empty workspace featureFlags', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue({
        featureFlags: {}
      } as any)

      process.env.AI_AUDIT_V2 = 'true'

      expect(await isFlagEnabled('AI_AUDIT_V2', mockWorkspaceId)).toBe(true)
    })

    it('should handle null workspace featureFlags', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue({
        featureFlags: null
      } as any)

      process.env.AI_AUDIT_V2 = 'true'

      expect(await isFlagEnabled('AI_AUDIT_V2', mockWorkspaceId)).toBe(true)
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.workspace.findUnique.mockRejectedValue(new Error('Database error'))

      process.env.AI_AUDIT_V2 = 'true'

      // Should fallback to environment variable
      expect(await isFlagEnabled('AI_AUDIT_V2', mockWorkspaceId)).toBe(true)
    })
  })

  describe('getWorkspaceFlags', () => {
    const mockWorkspaceId = 'workspace-123'

    beforeEach(() => {
      mockPrisma.workspace.findUnique.mockResolvedValue(null)
    })

    it('should return all flags with their values', async () => {
      process.env.AI_AUDIT_V2 = 'true'
      process.env.AI_MATCH_V2 = 'false'

      const flags = await getWorkspaceFlags(mockWorkspaceId)

      expect(flags).toEqual({
        AI_AUDIT_V2: true,
        AI_MATCH_V2: false,
        MATCH_LOCAL_ENABLED: false,
        OUTREACH_TONES: false,
        BRANDRUN_ONETOUCH: false,
        MEDIAPACK_V2: false,
      })
    })

    it('should respect workspace overrides', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue({
        featureFlags: { AI_AUDIT_V2: true, MEDIAPACK_V2: true }
      } as any)

      const flags = await getWorkspaceFlags(mockWorkspaceId)

      expect(flags.AI_AUDIT_V2).toBe(true)
      expect(flags.MEDIAPACK_V2).toBe(true)
      expect(flags.AI_MATCH_V2).toBe(false) // Falls back to env/default
    })
  })

  describe('setWorkspaceFlag', () => {
    const mockWorkspaceId = 'workspace-123'

    beforeEach(() => {
      mockPrisma.workspace.findUnique.mockResolvedValue(null)
      mockPrisma.workspace.update.mockResolvedValue({} as any)
    })

    it('should set a new flag when none exist', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue({
        featureFlags: null
      } as any)

      await setWorkspaceFlag(mockWorkspaceId, 'AI_AUDIT_V2', true)

      expect(mockPrisma.workspace.update).toHaveBeenCalledWith({
        where: { id: mockWorkspaceId },
        data: { featureFlags: { AI_AUDIT_V2: true } }
      })
    })

    it('should update existing flags', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue({
        featureFlags: { AI_AUDIT_V2: false, AI_MATCH_V2: true }
      } as any)

      await setWorkspaceFlag(mockWorkspaceId, 'AI_AUDIT_V2', true)

      expect(mockPrisma.workspace.update).toHaveBeenCalledWith({
        where: { id: mockWorkspaceId },
        data: { featureFlags: { AI_AUDIT_V2: true, AI_MATCH_V2: true } }
      })
    })

    it('should handle database errors', async () => {
      mockPrisma.workspace.update.mockRejectedValue(new Error('Update failed'))

      await expect(setWorkspaceFlag(mockWorkspaceId, 'AI_AUDIT_V2', true))
        .rejects.toThrow('Failed to set feature flag: Update failed')
    })
  })

  describe('resetWorkspaceFlag', () => {
    const mockWorkspaceId = 'workspace-123'

    beforeEach(() => {
      mockPrisma.workspace.findUnique.mockResolvedValue(null)
      mockPrisma.workspace.update.mockResolvedValue({} as any)
    })

    it('should remove a flag from workspace overrides', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue({
        featureFlags: { AI_AUDIT_V2: true, AI_MATCH_V2: false }
      } as any)

      await resetWorkspaceFlag(mockWorkspaceId, 'AI_AUDIT_V2')

      expect(mockPrisma.workspace.update).toHaveBeenCalledWith({
        where: { id: mockWorkspaceId },
        data: { featureFlags: { AI_MATCH_V2: false } }
      })
    })

    it('should do nothing when flag does not exist', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue({
        featureFlags: { AI_MATCH_V2: false }
      } as any)

      await resetWorkspaceFlag(mockWorkspaceId, 'AI_AUDIT_V2')

      expect(mockPrisma.workspace.update).toHaveBeenCalledWith({
        where: { id: mockWorkspaceId },
        data: { featureFlags: { AI_MATCH_V2: false } }
      })
    })

    it('should handle empty featureFlags', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue({
        featureFlags: {}
      } as any)

      await resetWorkspaceFlag(mockWorkspaceId, 'AI_AUDIT_V2')

      expect(mockPrisma.workspace.update).toHaveBeenCalledWith({
        where: { id: mockWorkspaceId },
        data: { featureFlags: {} }
      })
    })
  })

  describe('Integration Tests', () => {
    it('should handle complex workspace flag scenarios', async () => {
      const mockWorkspaceId = 'workspace-123'

      // Set some environment variables
      process.env.AI_AUDIT_V2 = 'true'
      process.env.MEDIAPACK_V2 = 'false'

      // Mock workspace with some overrides
      mockPrisma.workspace.findUnique.mockResolvedValue({
        featureFlags: { 
          AI_AUDIT_V2: false,  // Override env
          AI_MATCH_V2: true,    // Override default
          OUTREACH_TONES: null  // Should be ignored
        }
      } as any)

      // Test various combinations
      expect(await isFlagEnabled('AI_AUDIT_V2', mockWorkspaceId)).toBe(false)  // Workspace override
      expect(await isFlagEnabled('AI_MATCH_V2', mockWorkspaceId)).toBe(true)   // Workspace override
      expect(await isFlagEnabled('MEDIAPACK_V2', mockWorkspaceId)).toBe(false) // Environment
      expect(await isFlagEnabled('BRANDRUN_ONETOUCH', mockWorkspaceId)).toBe(false) // Default
    })
  })
})
