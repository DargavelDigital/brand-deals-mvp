import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock the feature flags
vi.mock('../src/lib/flags', () => ({
  isFlagEnabled: vi.fn()
}))

// Mock the enhanced email service
vi.mock('../src/services/providers/real/enhancedEmail', () => ({
  enhancedEmailService: {
    send: vi.fn().mockResolvedValue({ messageId: 'enhanced-email-123' }),
    sendTemplateEmail: vi.fn().mockResolvedValue({ messageId: 'enhanced-template-123' })
  }
}))

// Mock the AI helpers
vi.mock('../src/services/ai/helpers', () => ({
  aiAuditInsights: vi.fn().mockResolvedValue({ niche: 'Tech', tone: 'Professional' }),
  aiReasonsFromAudit: vi.fn().mockResolvedValue(['High audience overlap', 'Content alignment']),
  aiEmailDraft: vi.fn().mockResolvedValue({ subject: 'AI Subject', body: 'AI Body' })
}))

// Mock the audit service
vi.mock('../src/services/audit', () => ({
  runRealAudit: vi.fn().mockResolvedValue({ auditId: 'real-audit-123' })
}))

// Mock the discovery service
vi.mock('../src/services/discovery', () => ({
  discovery: {
    run: vi.fn().mockResolvedValue({ brands: [{ name: 'Real Tech Company' }] })
  }
}))

// Mock the email service
vi.mock('../src/services/email', () => ({
  email: {
    send: vi.fn().mockResolvedValue({ messageId: 'real-email-123' })
  }
}))

// Mock the media pack service
vi.mock('../src/services/mediaPack', () => ({
  mediaPack: {
    generate: vi.fn().mockResolvedValue({ htmlUrl: '/media-packs/real-123.html' })
  }
}))

describe('Feature Flag Gated Providers', () => {
  const mockWorkspaceId = 'workspace-123'
  let isFlagEnabled: any
  let providers: any

  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset environment
    process.env.DEMO_MODE = undefined
    
    // Get the mocked isFlagEnabled function
    const { isFlagEnabled: flagFn } = await import('../src/lib/flags')
    isFlagEnabled = flagFn
    
    // Import providers after mocking
    const { getProviders } = await import('../src/services/providers')
    providers = getProviders(mockWorkspaceId)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Provider Selection', () => {
    it('should return enhanced providers when workspaceId is provided', async () => {
      const { getProviders } = await import('../src/services/providers')
      const providers = getProviders(mockWorkspaceId)
      
      expect(providers).toBeDefined()
      expect(typeof providers.audit).toBe('function')
      expect(typeof providers.discovery).toBe('function')
      expect(typeof providers.email).toBe('function')
      expect(typeof providers.mediaPack).toBe('function')
    })

    it('should return mock providers when DEMO_MODE is true', async () => {
      process.env.DEMO_MODE = 'true'
      const { getProviders } = await import('../src/services/providers')
      const providers = getProviders()
      
      expect(providers).toBeDefined()
      expect(typeof providers.audit).toBe('function')
      expect(typeof providers.discovery).toBe('function')
      expect(typeof providers.email).toBe('function')
      expect(typeof providers.mediaPack).toBe('function')
    })
  })

  describe('Feature Flag Integration', () => {
    it('should call isFlagEnabled with correct parameters for audit', async () => {
      vi.mocked(isFlagEnabled).mockResolvedValue(false)
      
      await providers.audit(mockWorkspaceId, [])
      
      expect(isFlagEnabled).toHaveBeenCalledWith('AI_AUDIT_V2', mockWorkspaceId)
    })

    it('should call isFlagEnabled with correct parameters for discovery', async () => {
      vi.mocked(isFlagEnabled).mockResolvedValue(false)
      
      await providers.discovery(mockWorkspaceId, {})
      
      expect(isFlagEnabled).toHaveBeenCalledWith('AI_MATCH_V2', mockWorkspaceId)
    })

    it('should call isFlagEnabled with correct parameters for email', async () => {
      vi.mocked(isFlagEnabled).mockResolvedValue(false)
      
      await providers.email({ workspaceId: mockWorkspaceId, to: 'test@example.com', subject: 'Test', html: '<p>Test</p>' })
      
      expect(isFlagEnabled).toHaveBeenCalledWith('OUTREACH_TONES', mockWorkspaceId)
    })

    it('should call isFlagEnabled with correct parameters for media pack', async () => {
      vi.mocked(isFlagEnabled).mockResolvedValue(false)
      
      await providers.mediaPack({ workspaceId: mockWorkspaceId })
      
      expect(isFlagEnabled).toHaveBeenCalledWith('MEDIAPACK_V2', mockWorkspaceId)
    })

    it('should handle multiple flags correctly', async () => {
      // Enable some flags, disable others
      vi.mocked(isFlagEnabled)
        .mockResolvedValueOnce(true)   // AI_AUDIT_V2
        .mockResolvedValueOnce(false)  // AI_MATCH_V2
        .mockResolvedValueOnce(true)   // OUTREACH_TONES
        .mockResolvedValueOnce(false); // MEDIAPACK_V2
      
      const auditResult = await providers.audit(mockWorkspaceId, [])
      const discoveryResult = await providers.discovery(mockWorkspaceId, {})
      const emailResult = await providers.email({ workspaceId: mockWorkspaceId, to: 'test@example.com', subject: 'Test', html: '<p>Test</p>' })
      const mediaPackResult = await providers.mediaPack({ workspaceId: mockWorkspaceId })
      
      expect(auditResult).toBeDefined()
      expect(discoveryResult).toBeDefined()
      expect(emailResult).toBeDefined()
      expect(mediaPackResult).toBeDefined()
    })
  })

  describe('Individual Provider Functions', () => {
    it('should return enhanced providers when workspaceId is provided', async () => {
      const { 
        auditProvider, 
        discoveryProvider, 
        emailProvider, 
        mediaPackProvider 
      } = await import('../src/services/providers')
      
      const audit = auditProvider(mockWorkspaceId)
      const discovery = discoveryProvider(mockWorkspaceId)
      const email = emailProvider(mockWorkspaceId)
      const mediaPack = mediaPackProvider(mockWorkspaceId)
      
      expect(audit).toBeDefined()
      expect(discovery).toBeDefined()
      expect(email).toBeDefined()
      expect(mediaPack).toBeDefined()
    })

    it('should return real providers when no workspaceId is provided', async () => {
      const { 
        auditProvider, 
        discoveryProvider, 
        emailProvider, 
        mediaPackProvider 
      } = await import('../src/services/providers')
      
      const audit = auditProvider()
      const discovery = discoveryProvider()
      const email = emailProvider()
      const mediaPack = mediaPackProvider()
      
      expect(audit).toBeDefined()
      expect(discovery).toBeDefined()
      expect(email).toBeDefined()
      expect(mediaPack).toBeDefined()
    })
  })

  describe('Backward Compatibility', () => {
    it('should maintain existing API structure', async () => {
      const { getProviders } = await import('../src/services/providers')
      const providers = getProviders()
      
      expect(providers.audit).toBeDefined()
      expect(providers.discovery).toBeDefined()
      expect(providers.email).toBeDefined()
      expect(providers.mediaPack).toBeDefined()
    })

    it('should work with existing service calls', async () => {
      const { getProviders } = await import('../src/services/providers')
      const providers = getProviders()
      
      // These should work without breaking existing code
      expect(typeof providers.audit).toBe('function')
      expect(typeof providers.discovery).toBe('function')
      expect(typeof providers.email).toBe('function')
      expect(typeof providers.mediaPack).toBe('function')
    })
  })
})
