import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the environment variable
const originalEnv = process.env.NEXT_PUBLIC_LAUNCH_SOCIALS

describe('Instagram-only mode', () => {
  beforeEach(() => {
    // Reset environment for each test
    vi.stubEnv('NEXT_PUBLIC_LAUNCH_SOCIALS', 'instagram')
    // Clear module cache to ensure fresh imports
    vi.resetModules()
  })

  afterEach(() => {
    // Restore original environment
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_LAUNCH_SOCIALS = originalEnv
    } else {
      delete process.env.NEXT_PUBLIC_LAUNCH_SOCIALS
    }
    vi.unstubAllEnvs()
  })

  it('should default to Instagram when environment variable is missing', async () => {
    // Remove the environment variable entirely
    vi.unstubAllEnvs()
    delete process.env.NEXT_PUBLIC_LAUNCH_SOCIALS
    vi.resetModules()
    
    const { socials } = await import('@/config/socials')
    
    expect(socials.enabled('instagram')).toBe(true)
    expect(socials.enabled('tiktok')).toBe(false)
    expect(socials.enabled('youtube')).toBe(false)
    expect(socials.enabled('x')).toBe(false)
    expect(socials.enabled('facebook')).toBe(false)
    expect(socials.enabled('linkedin')).toBe(false)
    
    expect(socials.listEnabled()).toEqual(['instagram'])
    expect(socials.isInstagramOnly()).toBe(true)
  })

  it('should have Instagram enabled and others disabled', async () => {
    const { socials } = await import('@/config/socials')
    
    expect(socials.enabled('instagram')).toBe(true)
    expect(socials.enabled('tiktok')).toBe(false)
    expect(socials.enabled('youtube')).toBe(false)
    expect(socials.enabled('x')).toBe(false)
    expect(socials.enabled('facebook')).toBe(false)
    expect(socials.enabled('linkedin')).toBe(false)
    
    expect(socials.listEnabled()).toEqual(['instagram'])
    expect(socials.isInstagramOnly()).toBe(true)
  })

  it('should return COMING_SOON for disabled TikTok routes', async () => {
    const { GET: tiktokStart } = await import('@/app/api/tiktok/auth/start/route')
    const { GET: tiktokCallback } = await import('@/app/api/tiktok/auth/callback/route')
    const { DELETE: tiktokDisconnect } = await import('@/app/api/tiktok/disconnect/route')
    
    const request = new NextRequest('http://localhost:3000/api/tiktok/auth/start')
    
    const startResponse = await tiktokStart(request)
    expect(startResponse.status).toBe(501)
    const startData = await startResponse.json()
    expect(startData.code).toBe('COMING_SOON')
    expect(startData.ok).toBe(false)
    
    const callbackResponse = await tiktokCallback(request)
    expect(callbackResponse.status).toBe(501)
    const callbackData = await callbackResponse.json()
    expect(callbackData.code).toBe('COMING_SOON')
    
    const disconnectRequest = new NextRequest('http://localhost:3000/api/tiktok/disconnect', { method: 'DELETE' })
    const disconnectResponse = await tiktokDisconnect(disconnectRequest)
    expect(disconnectResponse.status).toBe(501)
    const disconnectData = await disconnectResponse.json()
    expect(disconnectData.code).toBe('COMING_SOON')
  })

  it('should return COMING_SOON for disabled X routes', async () => {
    const { GET: xStart } = await import('@/app/api/x/auth/start/route')
    const { GET: xCallback } = await import('@/app/api/x/auth/callback/route')
    const { DELETE: xDisconnect } = await import('@/app/api/x/disconnect/route')
    
    const request = new NextRequest('http://localhost:3000/api/x/auth/start')
    
    const startResponse = await xStart(request)
    expect(startResponse.status).toBe(501)
    const startData = await startResponse.json()
    expect(startData.code).toBe('COMING_SOON')
    
    const callbackResponse = await xCallback(request)
    expect(callbackResponse.status).toBe(501)
    const callbackData = await callbackResponse.json()
    expect(callbackData.code).toBe('COMING_SOON')
    
    const disconnectRequest = new NextRequest('http://localhost:3000/api/x/disconnect', { method: 'DELETE' })
    const disconnectResponse = await xDisconnect(disconnectRequest)
    expect(disconnectResponse.status).toBe(501)
    const disconnectData = await disconnectResponse.json()
    expect(disconnectData.code).toBe('COMING_SOON')
  })

  it('should return COMING_SOON for disabled LinkedIn routes', async () => {
    const { GET: linkedinStart } = await import('@/app/api/linkedin/auth/start/route')
    const { GET: linkedinCallback } = await import('@/app/api/linkedin/auth/callback/route')
    const { DELETE: linkedinDisconnect } = await import('@/app/api/linkedin/disconnect/route')
    
    const request = new NextRequest('http://localhost:3000/api/linkedin/auth/start')
    
    const startResponse = await linkedinStart(request)
    expect(startResponse.status).toBe(501)
    const startData = await startResponse.json()
    expect(startData.code).toBe('COMING_SOON')
    
    const callbackResponse = await linkedinCallback(request)
    expect(callbackResponse.status).toBe(501)
    const callbackData = await callbackResponse.json()
    expect(callbackData.code).toBe('COMING_SOON')
    
    const disconnectRequest = new NextRequest('http://localhost:3000/api/linkedin/disconnect', { method: 'DELETE' })
    const disconnectResponse = await linkedinDisconnect(disconnectRequest)
    expect(disconnectResponse.status).toBe(501)
    const disconnectData = await disconnectResponse.json()
    expect(disconnectData.code).toBe('COMING_SOON')
  })

  it('should allow debug endpoint to show correct status', async () => {
    const { GET: debugRoute } = await import('@/app/api/debug/socials/route')
    
    const response = await debugRoute()
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.ok).toBe(true)
    expect(data.enabled).toEqual(['instagram'])
    expect(data.instagramOnly).toBe(true)
    expect(data.ts).toBeDefined()
  })
})

describe('Multi-platform mode', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_LAUNCH_SOCIALS', 'instagram,tiktok,youtube')
    vi.resetModules()
  })

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_LAUNCH_SOCIALS = originalEnv
    } else {
      delete process.env.NEXT_PUBLIC_LAUNCH_SOCIALS
    }
    vi.unstubAllEnvs()
  })

  it('should have multiple platforms enabled', async () => {
    const { socials } = await import('@/config/socials')
    
    expect(socials.enabled('instagram')).toBe(true)
    expect(socials.enabled('tiktok')).toBe(true)
    expect(socials.enabled('youtube')).toBe(true)
    expect(socials.enabled('x')).toBe(false)
    expect(socials.enabled('facebook')).toBe(false)
    expect(socials.enabled('linkedin')).toBe(false)
    
    expect(socials.listEnabled()).toEqual(['instagram', 'tiktok', 'youtube'])
    expect(socials.isInstagramOnly()).toBe(false)
  })

  it('should allow enabled platform routes', async () => {
    // Note: This test assumes the actual route logic would work
    // In a real test, you'd mock the actual TikTok route implementation
    const { socials } = await import('@/config/socials')
    
    expect(socials.enabled('tiktok')).toBe(true)
    // The TikTok routes should now process normally instead of returning COMING_SOON
  })
})
