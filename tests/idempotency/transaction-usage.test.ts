import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { tx } from '@/lib/idempotency';
import { prisma } from '@/lib/prisma';

// Mock the Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    user: {
      create: vi.fn()
    }
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
  } catch (error: any) {
    console.error('Handler error:', error);
    return {
      status: 500,
      headers: {},
      body: { error: error.message, stack: error.stack }
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

describe('Idempotency - Transaction Usage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should use prisma.$transaction for multi-write operations', async () => {
    const testData = { test: 'data' };
    
    // Mock successful transaction
    (prisma.$transaction as any).mockResolvedValueOnce({
      user: { id: '1', ...testData },
      profile: { id: '1', userId: '1' }
    });

    // Create a test handler that performs multiple writes
    const testHandler = async (request: NextRequest) => {
      const body = testData;
      
      // Use tx() helper for multiple writes
      const result = await tx(async (p: any) => {
        const user = await p.user.create({ data: body });
        const profile = await p.profile.create({ 
          data: { userId: user.id, ...body } 
        });
        return { user, profile };
      });
      
      return new Response(JSON.stringify({ success: true, data: result }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    const request = createTestRequest('POST', testData, {
      'Idempotency-Key': 'test-key-123'
    });
    
    const response = await callHandler(testHandler, request);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should handle transaction errors gracefully', async () => {
    const testData = { test: 'data' };
    
    // Mock transaction error
    (prisma.$transaction as any).mockRejectedValueOnce(
      new Error('Transaction failed')
    );

    const testHandler = async (request: NextRequest) => {
      const body = testData;
      
      try {
        await tx(async (p: any) => {
          await p.user.create({ data: body });
          await p.profile.create({ data: { userId: '1', ...body } });
        });
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    };

    const request = createTestRequest('POST', testData, {
      'Idempotency-Key': 'test-key-123'
    });
    
    const response = await callHandler(testHandler, request);
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Transaction failed');
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('should allow single write operations without transaction', async () => {
    const testData = { test: 'data' };
    
    // Mock successful single write
    (prisma.$transaction as any).mockResolvedValueOnce({ id: '1', ...testData });

    const testHandler = async (request: NextRequest) => {
      const body = testData;
      
      // Single write operation - no transaction needed
      const result = await prisma.user.create({ data: body });
      
      return new Response(JSON.stringify({ success: true, data: result }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    const request = createTestRequest('POST', testData, {
      'Idempotency-Key': 'test-key-123'
    });
    
    const response = await callHandler(testHandler, request);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    // Transaction should not be called for single writes
    expect(prisma.$transaction).toHaveBeenCalledTimes(0);
  });

  it('should pass the correct prisma instance to transaction function', async () => {
    const testData = { test: 'data' };
    
    // Mock successful transaction
    (prisma.$transaction as any).mockResolvedValueOnce({ id: '1', ...testData });

    const testHandler = async (request: NextRequest) => {
      const body = testData;
      
      await tx(async (p: any) => {
        // Verify that 'p' is the prisma instance
        expect(p).toBe(prisma);
        await p.user.create({ data: body });
      });
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    const request = createTestRequest('POST', testData, {
      'Idempotency-Key': 'test-key-123'
    });
    
    const response = await callHandler(testHandler, request);
    expect(response.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
