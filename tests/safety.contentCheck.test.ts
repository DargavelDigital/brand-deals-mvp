import { contentSafetyCheck } from '@/services/safety/contentCheck';

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    contentSafetyCheck: {
      create: jest.fn().mockResolvedValue({ id: 'test-id' })
    }
  }
}));

jest.mock('@/ai/aiInvoke', () => ({
  aiInvoke: jest.fn()
}));

jest.mock('@/config/flags', () => ({
  isOn: jest.fn()
}));

describe('contentSafetyCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('blocks risky medical guarantees', async () => {
    const { isOn } = require('@/config/flags');
    isOn.mockReturnValue(false); // Disable AI moderation for this test

    const r = await contentSafetyCheck({
      workspaceId: 'ws_test',
      subject: 'Miracle cure',
      bodyHtml: 'Our product cures cancer in 2 days!'
    } as any);
    
    expect(['WARN','BLOCK']).toContain(r.verdict);
  });

  test('passes benign outreach', async () => {
    const { isOn } = require('@/config/flags');
    isOn.mockReturnValue(false); // Disable AI moderation for this test

    const r = await contentSafetyCheck({
      workspaceId: 'ws_test',
      subject: 'Intro',
      bodyHtml: 'We love your brand; here is our media pack.'
    } as any);
    
    expect(r.verdict === 'PASS' || r.verdict === 'WARN').toBeTruthy();
  });

  test('creates safety check record', async () => {
    const { isOn } = require('@/config/flags');
    isOn.mockReturnValue(false);

    await contentSafetyCheck({
      workspaceId: 'ws_test',
      subject: 'Test',
      bodyHtml: 'Test content'
    } as any);

    const { prisma } = require('@/lib/prisma');
    expect(prisma.contentSafetyCheck.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workspaceId: 'ws_test',
        subject: 'Test',
        bodyHash: expect.any(String),
        verdict: expect.any(String),
        reasons: expect.any(Array)
      })
    });
  });
});
