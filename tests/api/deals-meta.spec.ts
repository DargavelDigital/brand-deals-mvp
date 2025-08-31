import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/deals/[id]/meta/route';

// Mock dependencies
vi.mock('@/lib/auth/requireAuth', () => ({
  requireAuth: vi.fn()
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    deal: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    membership: {
      findFirst: vi.fn()
    }
  }
}));

vi.mock('@/lib/http/envelope', () => ({
  ok: vi.fn((data) => ({ ok: true, data })),
  fail: vi.fn((error, status = 400) => ({ ok: false, error, status }))
}));

describe('/api/deals/[id]/meta', () => {
  const mockRequest = (body: any) => ({
    json: vi.fn().mockResolvedValue(body)
  } as any);

  const mockParams = { id: 'deal-123' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should update deal next step successfully', async () => {
      const { requireAuth } = await import('@/lib/auth/requireAuth');
      const { prisma } = await import('@/lib/prisma');
      const { ok } = await import('@/lib/http/envelope');

      // Mock successful auth
      (requireAuth as any).mockResolvedValue({
        ok: true,
        user: { id: 'user-123' }
      });

      // Mock deal exists
      (prisma.deal.findUnique as any).mockResolvedValue({
        id: 'deal-123',
        description: 'Initial discussion',
        workspaceId: 'workspace-123'
      });

      // Mock membership exists
      (prisma.membership.findFirst as any).mockResolvedValue({
        userId: 'user-123',
        workspaceId: 'workspace-123'
      });

      // Mock successful update
      (prisma.deal.update as any).mockResolvedValue({
        id: 'deal-123',
        status: 'OPEN',
        description: 'Initial discussion//NEXT: Follow up call'
      });

      const request = mockRequest({ nextStep: 'Follow up call' });
      const response = await POST(request, { params: mockParams });
      const result = await response.json();

      expect(requireAuth).toHaveBeenCalledWith(['OWNER', 'MANAGER', 'MEMBER']);
      expect(prisma.deal.findUnique).toHaveBeenCalledWith({
        where: { id: 'deal-123' },
        include: { workspace: true }
      });
      expect(prisma.deal.update).toHaveBeenCalledWith({
        where: { id: 'deal-123' },
        data: { description: 'Initial discussion//NEXT: Follow up call' }
      });
      expect(ok).toHaveBeenCalledWith({
        id: 'deal-123',
        status: 'OPEN',
        nextStep: 'Follow up call'
      });
      expect(result.ok).toBe(true);
    });

    it('should update deal status successfully', async () => {
      const { requireAuth } = await import('@/lib/auth/requireAuth');
      const { prisma } = await import('@/lib/prisma');
      const { ok } = await import('@/lib/http/envelope');

      // Mock successful auth
      (requireAuth as any).mockResolvedValue({
        ok: true,
        user: { id: 'user-123' }
      });

      // Mock deal exists
      (prisma.deal.findUnique as any).mockResolvedValue({
        id: 'deal-123',
        description: 'Initial discussion',
        workspaceId: 'workspace-123'
      });

      // Mock membership exists
      (prisma.membership.findFirst as any).mockResolvedValue({
        userId: 'user-123',
        workspaceId: 'workspace-123'
      });

      // Mock successful update
      (prisma.deal.update as any).mockResolvedValue({
        id: 'deal-123',
        status: 'WON',
        description: 'Initial discussion'
      });

      const request = mockRequest({ status: 'WON' });
      const response = await POST(request, { params: mockParams });
      const result = await response.json();

      expect(prisma.deal.update).toHaveBeenCalledWith({
        where: { id: 'deal-123' },
        data: { status: 'WON' }
      });
      expect(ok).toHaveBeenCalledWith({
        id: 'deal-123',
        status: 'WON',
        nextStep: ''
      });
      expect(result.ok).toBe(true);
    });

    it('should return 404 for non-existent deal', async () => {
      const { requireAuth } = await import('@/lib/auth/requireAuth');
      const { prisma } = await import('@/lib/prisma');
      const { fail } = await import('@/lib/http/envelope');

      // Mock successful auth
      (requireAuth as any).mockResolvedValue({
        ok: true,
        user: { id: 'user-123' }
      });

      // Mock deal not found
      (prisma.deal.findUnique as any).mockResolvedValue(null);

      const request = mockRequest({ nextStep: 'Follow up' });
      const response = await POST(request, { params: mockParams });
      const result = await response.json();

      expect(fail).toHaveBeenCalledWith('DEAL_NOT_FOUND', 404);
      expect(result.ok).toBe(false);
      expect(result.error).toBe('DEAL_NOT_FOUND');
    });

    it('should return 400 for invalid next step type', async () => {
      const { requireAuth } = await import('@/lib/auth/requireAuth');
      const { fail } = await import('@/lib/http/envelope');

      // Mock successful auth
      (requireAuth as any).mockResolvedValue({
        ok: true,
        user: { id: 'user-123' }
      });

      const request = mockRequest({ nextStep: 123 });
      const response = await POST(request, { params: mockParams });
      const result = await response.json();

      expect(fail).toHaveBeenCalledWith('INVALID_NEXT_STEP', 400);
      expect(result.ok).toBe(false);
      expect(result.error).toBe('INVALID_NEXT_STEP');
    });

    it('should return 400 for invalid status type', async () => {
      const { requireAuth } = await import('@/lib/auth/requireAuth');
      const { fail } = await import('@/lib/http/envelope');

      // Mock successful auth
      (requireAuth as any).mockResolvedValue({
        ok: true,
        user: { id: 'user-123' }
      });

      const request = mockRequest({ status: 456 });
      const response = await POST(request, { params: mockParams });
      const result = await response.json();

      expect(fail).toHaveBeenCalledWith('INVALID_STATUS', 400);
      expect(result.ok).toBe(false);
      expect(result.error).toBe('INVALID_STATUS');
    });
  });
});
