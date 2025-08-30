import { buildPlaybooks } from '@/services/netfx/playbooks';
import { prisma } from '@/lib/prisma';

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
    signalAggregate: {
      findMany: jest.fn()
    },
    playbook: {
      create: jest.fn()
    }
  }
}));

jest.mock('@/ai/aiInvoke', () => ({
  aiInvoke: jest.fn()
}));

jest.mock('@/config/flags', () => ({
  isOn: jest.fn()
}));

describe('buildPlaybooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates a playbook for available segment', async () => {
    const { isOn } = require('@/config/flags');
    isOn.mockReturnValue(true);

    const mockSegments = [
      { industry: 'beauty', sizeBand: '51-200', region: 'EU', season: 'Q3' }
    ];

    const mockAggregates = [
      {
        industry: 'beauty',
        sizeBand: '51-200',
        region: 'EU',
        season: 'Q3',
        tone: 'professional',
        templateFamily: 'intro_v1',
        sendDow: 2,
        sendHour: 9,
        sends: 50,
        replies: 10,
        wins: 2,
        revenueUsd: 5000,
        kmin: 10,
        dpEpsilon: 20,
        computedAt: new Date()
      }
    ];

    (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockSegments);
    (prisma.signalAggregate.findMany as jest.Mock).mockResolvedValue(mockAggregates);
    (prisma.playbook.create as jest.Mock).mockResolvedValue({});

    const { aiInvoke } = require('@/ai/aiInvoke');
    aiInvoke.mockResolvedValue({
      tone: 'professional',
      steps: 3,
      delaysDays: [2, 3],
      subjectHints: ['Personalized approach', 'Value proposition'],
      sendDow: [2, 3],
      sendHour: [9, 15],
      rationale: 'Professional tone performs best for this segment'
    });

    await buildPlaybooks();

    expect(prisma.playbook.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        industry: 'beauty',
        sizeBand: '51-200',
        region: 'EU',
        season: 'Q3'
      })
    });
  });

  test('skips segments with no aggregates', async () => {
    const { isOn } = require('@/config/flags');
    isOn.mockReturnValue(true);

    const mockSegments = [
      { industry: 'beauty', sizeBand: '51-200', region: 'EU', season: 'Q3' }
    ];

    (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockSegments);
    (prisma.signalAggregate.findMany as jest.Mock).mockResolvedValue([]);

    await buildPlaybooks();

    expect(prisma.playbook.create).not.toHaveBeenCalled();
  });
});
