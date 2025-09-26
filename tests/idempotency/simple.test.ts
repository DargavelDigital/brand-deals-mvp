import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    dedupeFingerprint: {
      create: vi.fn(),
      findUnique: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

// Mock the log utility
vi.mock('@/lib/log', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

// Mock the ALS utility
vi.mock('@/lib/als', () => ({
  setCtx: vi.fn(),
  getCtx: vi.fn()
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

describe('Idempotency - Simple Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FEATURE_IDEMPOTENCY_GATE = 'warn';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a test request correctly', () => {
    const request = createTestRequest('POST', { test: 'data' }, {
      'Idempotency-Key': 'test-key'
    });
    
    expect(request.method).toBe('POST');
    expect(request.headers.get('Idempotency-Key')).toBe('test-key');
  });

  it('should handle JSON parsing in test utility', async () => {
    const mockHandler = async (request: NextRequest) => {
      const body = await request.json();
      return new Response(JSON.stringify({ success: true, data: body }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    const request = createTestRequest('POST', { test: 'data' });
    const response = await callHandler(mockHandler, request);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.test).toBe('data');
  });

  it('should handle errors in test utility', async () => {
    const mockHandler = async (request: NextRequest) => {
      throw new Error('Test error');
    };

    const request = createTestRequest('POST', { test: 'data' });
    const response = await callHandler(mockHandler, request);
    
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Test error');
  });
});
