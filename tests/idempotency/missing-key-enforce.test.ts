import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { idempotencyGate } from '@/middleware-idempotency';

/**
 * Test utility to call middleware directly
 */
function createTestRequest(method: string, path: string, headers: Record<string, string> = {}) {
  const url = `http://localhost:3000${path}`;
  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
  return request;
}

describe('Idempotency Gate - Missing Key Enforcement', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env.FEATURE_IDEMPOTENCY_GATE = 'enforce';
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 428 for POST requests without Idempotency-Key in enforce mode', async () => {
    const request = createTestRequest('POST', '/api/test');
    
    const response = idempotencyGate(request);
    
    expect(response).toBeDefined();
    expect(response?.status).toBe(428);
    expect(response?.headers.get('X-Idempotency-Warning')).toBe('missing-key');
    
    const body = await response?.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe('IDEMPOTENCY_KEY_REQUIRED');
  });

  it('should return 428 for PUT requests without Idempotency-Key in enforce mode', () => {
    const request = createTestRequest('PUT', '/api/test');
    
    const response = idempotencyGate(request);
    
    expect(response).toBeDefined();
    expect(response?.status).toBe(428);
    expect(response?.headers.get('X-Idempotency-Warning')).toBe('missing-key');
  });

  it('should return 428 for PATCH requests without Idempotency-Key in enforce mode', () => {
    const request = createTestRequest('PATCH', '/api/test');
    
    const response = idempotencyGate(request);
    
    expect(response).toBeDefined();
    expect(response?.status).toBe(428);
    expect(response?.headers.get('X-Idempotency-Warning')).toBe('missing-key');
  });

  it('should return 428 for DELETE requests without Idempotency-Key in enforce mode', () => {
    const request = createTestRequest('DELETE', '/api/test');
    
    const response = idempotencyGate(request);
    
    expect(response).toBeDefined();
    expect(response?.status).toBe(428);
    expect(response?.headers.get('X-Idempotency-Warning')).toBe('missing-key');
  });

  it('should allow requests with Idempotency-Key in enforce mode', () => {
    const request = createTestRequest('POST', '/api/test', {
      'Idempotency-Key': 'test-key-123'
    });
    
    const response = idempotencyGate(request);
    
    expect(response).toBeDefined();
    expect(response?.status).toBe(200); // Should continue to next middleware
  });

  it('should allow GET requests without Idempotency-Key', () => {
    const request = createTestRequest('GET', '/api/test');
    
    const response = idempotencyGate(request);
    
    expect(response).toBeDefined();
    expect(response?.status).toBe(200); // Should continue to next middleware
  });

  it('should allow exempt routes without Idempotency-Key', () => {
    const exemptRoutes = [
      '/api/auth/signin',
      '/api/auth/callback',
      '/api/auth/session'
    ];
    
    for (const route of exemptRoutes) {
      const request = createTestRequest('POST', route);
      const response = idempotencyGate(request);
      expect(response).toBeDefined();
      expect(response?.status).toBe(200); // Should continue to next middleware
    }
  });

  it('should block non-exempt routes without Idempotency-Key', () => {
    const nonExemptRoutes = [
      '/api/audit/run',
      '/api/outreach/queue',
      '/api/media-pack/generate'
    ];
    
    for (const route of nonExemptRoutes) {
      const request = createTestRequest('POST', route);
      const response = idempotencyGate(request);
      expect(response).toBeDefined();
      expect(response?.status).toBe(428); // Should be blocked
    }
  });

  it('should use warn mode in development', () => {
    process.env.FEATURE_IDEMPOTENCY_GATE = 'warn';
    process.env.NODE_ENV = 'development';
    
    const request = createTestRequest('POST', '/api/test');
    
    const response = idempotencyGate(request);
    
    expect(response).toBeDefined();
    expect(response?.status).toBe(200); // Should continue with warning
    expect(response?.headers.get('X-Idempotency-Warning')).toBe('missing-key');
  });

  it('should use off mode in preview', () => {
    process.env.FEATURE_IDEMPOTENCY_GATE = 'off';
    process.env.VERCEL_ENV = 'preview';
    
    const request = createTestRequest('POST', '/api/test');
    
    const response = idempotencyGate(request);
    
    expect(response).toBeDefined();
    expect(response?.status).toBe(200); // Should continue to next middleware
  });

  it('should default to warn mode when unset', () => {
    delete process.env.FEATURE_IDEMPOTENCY_GATE;
    process.env.NODE_ENV = 'production';
    
    const request = createTestRequest('POST', '/api/test');
    
    const response = idempotencyGate(request);
    
    expect(response).toBeDefined();
    expect(response?.status).toBe(200); // Should default to warn mode
    expect(response?.headers.get('X-Idempotency-Warning')).toBe('missing-key');
  });

  it('should default to warn mode in development', () => {
    delete process.env.FEATURE_IDEMPOTENCY_GATE;
    process.env.NODE_ENV = 'development';
    
    const request = createTestRequest('POST', '/api/test');
    
    const response = idempotencyGate(request);
    
    expect(response).toBeDefined();
    expect(response?.status).toBe(200);
    expect(response?.headers.get('X-Idempotency-Warning')).toBe('missing-key');
  });

  it('should default to warn mode in preview', () => {
    delete process.env.FEATURE_IDEMPOTENCY_GATE;
    process.env.NODE_ENV = 'preview';
    process.env.VERCEL_ENV = 'preview';
    
    const request = createTestRequest('POST', '/api/test');
    
    const response = idempotencyGate(request);
    
    expect(response).toBeDefined();
    expect(response?.status).toBe(200); // Should continue to next middleware
  });
});