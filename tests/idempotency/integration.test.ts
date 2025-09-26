import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { idempotencyGate } from '@/middleware-idempotency-gate';

// Mock the Prisma client
const mockPrisma = {
  dedupeFingerprint: {
    create: vi.fn(),
    findUnique: vi.fn()
  },
  $transaction: vi.fn(),
  user: {
    create: vi.fn(),
    update: vi.fn()
  }
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}));

// Mock the log utility
vi.mock('@/lib/log', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

/**
 * Test utility to call Next.js API handlers directly
 */
async function callHandler(handler: any, request: NextRequest) {
  try {
    const response = await handler(request);
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.json()
    };
  } catch (error) {
    return {
      status: 500,
      headers: {},
      body: { error: error.message }
    };
  }
}

/**
 * Create a test NextRequest with headers and body
 */
function createTestRequest(method: string, path: string, body?: any, headers: Record<string, string> = {}) {
  const url = `http://localhost:3000${path}`;
  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return request;
}

describe('Idempotency - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FEATURE_IDEMPOTENCY_GATE = 'enforce';
    process.env.NODE_ENV = 'production';
    
    // Mock successful idempotency check
    mockPrisma.dedupeFingerprint.create.mockResolvedValue({
      id: '1',
      key: 'test-key',
      path: '/api/test',
      workspaceId: 'test-workspace'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should work end-to-end with middleware and handler', async () => {
    const testData = { name: 'Test User' };
    
    // Mock transaction
    mockPrisma.$transaction.mockImplementation(async (callback) => {
      const tx = {
        user: {
          create: vi.fn().mockResolvedValue({ id: '1', ...testData })
        }
      };
      return await callback(tx);
    });

    // Create a test handler that simulates a real API route
    const testHandler = withIdempotency(async (request: NextRequest) => {
      const body = await request.json();
      
      // Simulate multi-write operation
      const result = await mockPrisma.$transaction(async (prisma) => {
        const user = await prisma.user.create({ data: body });
        return { user };
      });
      
      return new Response(JSON.stringify({ success: true, data: result }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    // Test with Idempotency-Key header
    const request = createTestRequest('POST', '/api/test', testData, {
      'Idempotency-Key': 'test-key-123'
    });
    
    // First, check middleware allows the request
    const middlewareResponse = idempotencyGate(request);
    expect(middlewareResponse).toBeNull(); // Should continue
    
    // Then, process the handler
    const response = await callHandler(testHandler, request);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(mockPrisma.dedupeFingerprint.create).toHaveBeenCalledWith({
      data: {
        key: 'test-key-123',
        path: '/api/test',
        workspaceId: 'test-workspace'
      }
    });
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('should block request without Idempotency-Key in enforce mode', async () => {
    const testData = { name: 'Test User' };
    
    const request = createTestRequest('POST', '/api/test', testData);
    
    // Middleware should block the request
    const middlewareResponse = idempotencyGate(request);
    
    expect(middlewareResponse).toBeDefined();
    expect(middlewareResponse?.status).toBe(428);
    expect(middlewareResponse?.headers.get('X-Idempotency-Required')).toBe('true');
    
    const body = JSON.parse(middlewareResponse?.body as string);
    expect(body.ok).toBe(false);
    expect(body.code).toBe('IDEMPOTENCY_KEY_REQUIRED');
  });

  it('should handle duplicate requests correctly', async () => {
    const testData = { name: 'Test User' };
    const idempotencyKey = 'duplicate-test-key';
    
    // Mock successful first request
    mockPrisma.dedupeFingerprint.create.mockResolvedValueOnce({
      id: '1',
      key: idempotencyKey,
      path: '/api/test',
      workspaceId: 'test-workspace'
    });
    
    // Mock duplicate key error for second request
    const duplicateError = new Error('Unique constraint failed');
    (duplicateError as any).code = 'P2002';
    mockPrisma.dedupeFingerprint.create.mockRejectedValueOnce(duplicateError);

    const testHandler = withIdempotency(async (request: NextRequest) => {
      const body = await request.json();
      
      await mockPrisma.$transaction(async (prisma) => {
        await prisma.user.create({ data: body });
      });
      
      return new Response(JSON.stringify({ success: true, data: body }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    // First request - should succeed
    const firstRequest = createTestRequest('POST', '/api/test', testData, {
      'Idempotency-Key': idempotencyKey
    });
    
    const firstResponse = await callHandler(testHandler, firstRequest);
    expect(firstResponse.status).toBe(200);
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);

    // Second request - should return 409
    const secondRequest = createTestRequest('POST', '/api/test', testData, {
      'Idempotency-Key': idempotencyKey
    });
    
    const secondResponse = await callHandler(testHandler, secondRequest);
    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.code).toBe('DUPLICATE');
    // Transaction should not be called again
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('should handle database errors gracefully in production', async () => {
    const testData = { name: 'Test User' };
    
    // Mock database error
    mockPrisma.dedupeFingerprint.create.mockRejectedValueOnce(
      new Error('Database connection failed')
    );

    const testHandler = withIdempotency(async (request: NextRequest) => {
      const body = await request.json();
      
      await mockPrisma.$transaction(async (prisma) => {
        await prisma.user.create({ data: body });
      });
      
      return new Response(JSON.stringify({ success: true, data: body }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    const request = createTestRequest('POST', '/api/test', testData, {
      'Idempotency-Key': 'test-key'
    });
    
    const response = await callHandler(testHandler, request);
    
    // Should proceed without idempotency protection when DB fails
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('should work with different HTTP methods', async () => {
    const testData = { name: 'Updated User' };
    const idempotencyKey = 'test-key-put';
    
    // Mock successful idempotency check
    mockPrisma.dedupeFingerprint.create.mockResolvedValue({
      id: '1',
      key: idempotencyKey,
      path: '/api/test',
      workspaceId: 'test-workspace'
    });

    const testHandler = withIdempotency(async (request: NextRequest) => {
      const body = await request.json();
      
      await mockPrisma.$transaction(async (prisma) => {
        await prisma.user.update({ 
          where: { id: '1' }, 
          data: body 
        });
      });
      
      return new Response(JSON.stringify({ success: true, data: body }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    // Test PUT method
    const putRequest = createTestRequest('PUT', '/api/test', testData, {
      'Idempotency-Key': idempotencyKey
    });
    
    const putResponse = await callHandler(testHandler, putRequest);
    expect(putResponse.status).toBe(200);
    expect(mockPrisma.dedupeFingerprint.create).toHaveBeenCalledWith({
      data: {
        key: idempotencyKey,
        path: '/api/test',
        workspaceId: 'test-workspace'
      }
    });
  });

  it('should handle exempt routes correctly', async () => {
    const exemptRoutes = [
      '/api/health',
      '/api/debug/test',
      '/api/auth/signin',
      '/api/email/unsubscribe/123'
    ];
    
    for (const route of exemptRoutes) {
      const request = createTestRequest('POST', route, { test: 'data' });
      
      // Middleware should allow exempt routes
      const middlewareResponse = idempotencyGate(request);
      expect(middlewareResponse).toBeNull();
    }
  });

  it('should handle already wrapped routes correctly', async () => {
    const wrappedRoutes = [
      '/api/audit/run',
      '/api/outreach/queue',
      '/api/media-pack/generate'
    ];
    
    for (const route of wrappedRoutes) {
      const request = createTestRequest('POST', route, { test: 'data' });
      
      // Middleware should allow already wrapped routes
      const middlewareResponse = idempotencyGate(request);
      expect(middlewareResponse).toBeNull();
    }
  });
});