import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';

// Mock the Prisma client
const mockPrisma = {
  dedupeFingerprint: {
    create: vi.fn(),
    findUnique: vi.fn()
  },
  $transaction: vi.fn()
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
function createTestRequest(method: string, body?: any, headers: Record<string, string> = {}) {
  const url = 'http://localhost:3000/api/test';
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

describe('Idempotency - Duplicate POST Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.FEATURE_IDEMPOTENCY_GATE = 'warn';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 409 for duplicate requests with same Idempotency-Key', async () => {
    const idempotencyKey = 'test-key-123';
    const testData = { test: 'data' };
    
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

    // Create a test handler that performs a write operation
    const testHandler = withIdempotency(async (request: NextRequest) => {
      const body = await request.json();
      
      // Simulate a write operation
      await mockPrisma.$transaction(async (tx: any) => {
        await tx.testModel.create({ data: body });
      });
      
      return new Response(JSON.stringify({ success: true, data: body }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    // First request - should succeed
    const firstRequest = createTestRequest('POST', testData, {
      'Idempotency-Key': idempotencyKey
    });
    
    const firstResponse = await callHandler(testHandler, firstRequest);
    expect(firstResponse.status).toBe(200);
    expect(firstResponse.body.success).toBe(true);
    expect(mockPrisma.dedupeFingerprint.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);

    // Second request with same key - should return 409
    const secondRequest = createTestRequest('POST', testData, {
      'Idempotency-Key': idempotencyKey
    });
    
    const secondResponse = await callHandler(testHandler, secondRequest);
    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.ok).toBe(false);
    expect(secondResponse.body.code).toBe('DUPLICATE');
    expect(mockPrisma.dedupeFingerprint.create).toHaveBeenCalledTimes(2);
    // Transaction should not be called again
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('should allow different Idempotency-Keys to proceed', async () => {
    const key1 = 'test-key-1';
    const key2 = 'test-key-2';
    const testData = { test: 'data' };
    
    // Mock successful requests for both keys
    mockPrisma.dedupeFingerprint.create
      .mockResolvedValueOnce({ id: '1', key: key1, path: '/api/test', workspaceId: 'test-workspace' })
      .mockResolvedValueOnce({ id: '2', key: key2, path: '/api/test', workspaceId: 'test-workspace' });

    const testHandler = withIdempotency(async (request: NextRequest) => {
      const body = await request.json();
      
      await mockPrisma.$transaction(async (tx: any) => {
        await tx.testModel.create({ data: body });
      });
      
      return new Response(JSON.stringify({ success: true, data: body }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    // First request with key1
    const firstRequest = createTestRequest('POST', testData, {
      'Idempotency-Key': key1
    });
    
    const firstResponse = await callHandler(testHandler, firstRequest);
    expect(firstResponse.status).toBe(200);

    // Second request with key2 - should also succeed
    const secondRequest = createTestRequest('POST', testData, {
      'Idempotency-Key': key2
    });
    
    const secondResponse = await callHandler(testHandler, secondRequest);
    expect(secondResponse.status).toBe(200);
    expect(mockPrisma.dedupeFingerprint.create).toHaveBeenCalledTimes(2);
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(2);
  });

  it('should generate fallback key when none provided in dev mode', async () => {
    const testData = { test: 'data' };
    
    // Mock successful request
    mockPrisma.dedupeFingerprint.create.mockResolvedValueOnce({
      id: '1',
      key: expect.any(String),
      path: '/api/test',
      workspaceId: 'test-workspace'
    });

    const testHandler = withIdempotency(async (request: NextRequest) => {
      const body = await request.json();
      
      await mockPrisma.$transaction(async (tx: any) => {
        await tx.testModel.create({ data: body });
      });
      
      return new Response(JSON.stringify({ success: true, data: body }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    // Request without Idempotency-Key header
    const request = createTestRequest('POST', testData);
    
    const response = await callHandler(testHandler, request);
    expect(response.status).toBe(200);
    expect(mockPrisma.dedupeFingerprint.create).toHaveBeenCalledWith({
      data: {
        key: expect.any(String),
        path: '/api/test',
        workspaceId: 'test-workspace'
      }
    });
  });

  it('should handle database errors gracefully', async () => {
    const idempotencyKey = 'test-key-123';
    const testData = { test: 'data' };
    
    // Mock database error
    mockPrisma.dedupeFingerprint.create.mockRejectedValueOnce(
      new Error('Database connection failed')
    );

    const testHandler = withIdempotency(async (request: NextRequest) => {
      const body = await request.json();
      
      await mockPrisma.$transaction(async (tx: any) => {
        await tx.testModel.create({ data: body });
      });
      
      return new Response(JSON.stringify({ success: true, data: body }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    const request = createTestRequest('POST', testData, {
      'Idempotency-Key': idempotencyKey
    });
    
    const response = await callHandler(testHandler, request);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    // Should proceed without idempotency protection when DB fails
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });
});