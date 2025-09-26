import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { withIdempotency, tx } from '@/lib/idempotency';
import { prisma } from '@/lib/prisma';

// Mock the Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    dedupeFingerprint: {
      create: vi.fn(),
      findUnique: vi.fn()
    },
    $transaction: vi.fn(),
    user: {
      create: vi.fn(),
      update: vi.fn()
    },
    workspace: {
      create: vi.fn(),
      update: vi.fn()
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

describe('Idempotency - Transaction Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FEATURE_IDEMPOTENCY_GATE = 'warn';
    
    // Mock successful idempotency check
    (prisma.dedupeFingerprint.create as any).mockResolvedValue({
      id: '1',
      key: 'test-key',
      path: '/api/test',
      workspaceId: 'test-workspace'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should use tx() helper for multi-write operations', async () => {
    const testData = { name: 'Test User', email: 'test@example.com' };
    
    // Mock transaction to return the result
    (prisma.$transaction as any).mockImplementation(async (callback) => {
      const tx = {
        user: {
          create: vi.fn().mockResolvedValue({ id: '1', ...testData }),
          update: vi.fn().mockResolvedValue({ id: '1', ...testData })
        },
        workspace: {
          create: vi.fn().mockResolvedValue({ id: '1', name: 'Test Workspace' })
        }
      };
      return await callback(tx);
    });

    const testHandler = withIdempotency(async (request: NextRequest) => {
      const body = testData; // Use the test data directly
      
      // Use tx() helper for multi-write operations
      const result = await tx(async (prisma) => {
        const user = await prisma.user.create({ data: body });
        const workspace = await prisma.workspace.create({ 
          data: { name: 'Test Workspace', userId: user.id } 
        });
        return { user, workspace };
      });
      
      return new Response(JSON.stringify({ success: true, data: result }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    const request = createTestRequest('POST', testData, {
      'Idempotency-Key': 'test-key'
    });
    
    const response = await callHandler(testHandler, request);
    
    expect(response.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should detect when tx() is not used for multi-write operations', async () => {
    const testData = { name: 'Test User' };
    
    // Mock the individual operations
    (prisma.user.create as any).mockResolvedValue({ id: '1', ...testData });
    (prisma.workspace.create as any).mockResolvedValue({ id: '1', name: 'Test Workspace', userId: '1' });
    
    const testHandler = withIdempotency(async (request: NextRequest) => {
      const body = testData; // Use the test data directly
      
      // BAD: Multiple writes without tx() - this should be caught by ESLint rule
      const user = await prisma.user.create({ data: body });
      const workspace = await prisma.workspace.create({ 
        data: { name: 'Test Workspace', userId: user.id } 
      });
      
      return new Response(JSON.stringify({ success: true, data: { user, workspace } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    const request = createTestRequest('POST', testData, {
      'Idempotency-Key': 'test-key'
    });
    
    const response = await callHandler(testHandler, request);
    
    expect(response.status).toBe(200);
    // Transaction should not be called since we're not using tx()
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('should handle transaction rollback on error', async () => {
    const testData = { name: 'Test User' };
    
    // Mock transaction to throw an error
    (prisma.$transaction as any).mockRejectedValueOnce(new Error('Transaction failed'));

    const testHandler = withIdempotency(async (request: NextRequest) => {
      const body = testData; // Use the test data directly
      
      try {
        const result = await tx(async (prisma) => {
          const user = await prisma.user.create({ data: body });
          const workspace = await prisma.workspace.create({ 
            data: { name: 'Test Workspace', userId: user.id } 
          });
          return { user, workspace };
        });
        
        return new Response(JSON.stringify({ success: true, data: result }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    });

    const request = createTestRequest('POST', testData, {
      'Idempotency-Key': 'test-key'
    });
    
    const response = await callHandler(testHandler, request);
    
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Transaction failed');
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('should allow single write operations without tx()', async () => {
    const testData = { name: 'Test User' };
    
    // Mock single write operation
    (prisma.user.create as any).mockResolvedValue({ id: '1', ...testData });

    const testHandler = withIdempotency(async (request: NextRequest) => {
      const body = testData; // Use the test data directly
      
      // Single write operation - tx() not required
      const user = await prisma.user.create({ data: body });
      
      return new Response(JSON.stringify({ success: true, data: user }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    const request = createTestRequest('POST', testData, {
      'Idempotency-Key': 'test-key'
    });
    
    const response = await callHandler(testHandler, request);
    
    expect(response.status).toBe(200);
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
    // Transaction should not be called for single write
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('should handle nested transactions correctly', async () => {
    const testData = { name: 'Test User' };
    
    // Mock nested transaction
    (prisma.$transaction as any).mockImplementation(async (callback) => {
      const tx = {
        user: {
          create: vi.fn().mockResolvedValue({ id: '1', ...testData }),
          update: vi.fn().mockResolvedValue({ id: '1', ...testData })
        },
        workspace: {
          create: vi.fn().mockResolvedValue({ id: '1', name: 'Test Workspace' })
        }
      };
      return await callback(tx);
    });

    const testHandler = withIdempotency(async (request: NextRequest) => {
      const body = testData; // Use the test data directly
      
      // Nested transaction scenario
      const result = await tx(async (prisma) => {
        const user = await prisma.user.create({ data: body });
        
        // Nested operation that also uses tx()
        const workspace = await tx(async (nestedPrisma) => {
          return await nestedPrisma.workspace.create({ 
            data: { name: 'Test Workspace', userId: user.id } 
          });
        });
        
        return { user, workspace };
      });
      
      return new Response(JSON.stringify({ success: true, data: result }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    const request = createTestRequest('POST', testData, {
      'Idempotency-Key': 'test-key'
    });
    
    const response = await callHandler(testHandler, request);
    
    expect(response.status).toBe(200);
    // Should be called twice - once for outer tx, once for nested tx
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });

  it('should verify tx() helper passes correct Prisma instance', async () => {
    const testData = { name: 'Test User' };
    
    // Mock transaction to verify the callback receives the correct Prisma instance
    (prisma.$transaction as any).mockImplementation(async (callback) => {
      const tx = {
        user: {
          create: vi.fn().mockResolvedValue({ id: '1', ...testData })
        }
      };
      return await callback(tx);
    });

    const testHandler = withIdempotency(async (request: NextRequest) => {
      const body = testData; // Use the test data directly
      
      await tx(async (prisma) => {
        // Verify that the prisma parameter is the transaction instance
        expect(prisma).toBeDefined();
        expect(prisma.user).toBeDefined();
        expect(prisma.user.create).toBeDefined();
        
        await prisma.user.create({ data: body });
      });
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    const request = createTestRequest('POST', testData, {
      'Idempotency-Key': 'test-key'
    });
    
    const response = await callHandler(testHandler, request);
    
    expect(response.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});