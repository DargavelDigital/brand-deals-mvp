import { prisma } from '@/lib/prisma';
import { runAggregation } from '@/services/netfx/aggregate';

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
    signalAggregate: {
      create: jest.fn()
    }
  }
}));

jest.mock('@/config/flags', () => ({
  isOn: jest.fn(),
  getFlag: jest.fn()
}));

describe('runAggregation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('aggregates only when k>=kmin', async () => {
    const { isOn, getFlag } = require('@/config/flags');
    isOn.mockReturnValue(true);
    getFlag.mockReturnValue(10); // kmin = 10

    const mockRows = [
      {
        industry: 'beauty',
        sizeBand: '11-50',
        region: 'EU',
        season: 'Q3',
        tone: 'professional',
        templateFamily: 'intro_v1',
        sendDow: 2,
        sendHour: 10,
        sends: BigInt(12),
        replies: BigInt(3),
        wins: BigInt(1),
        revenueUsd: 5000
      }
    ];

    (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockRows);
    (prisma.signalAggregate.create as jest.Mock).mockResolvedValue({});

    await runAggregation();

    expect(prisma.signalAggregate.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        industry: 'beauty',
        sizeBand: '11-50',
        sends: 12,
        kmin: 10
      })
    });
  });

  test('skips segments below kmin', async () => {
    const { isOn, getFlag } = require('@/config/flags');
    isOn.mockReturnValue(true);
    getFlag.mockReturnValue(10); // kmin = 10

    const mockRows = [
      {
        industry: 'beauty',
        sizeBand: '11-50',
        region: 'EU',
        season: 'Q3',
        tone: 'professional',
        templateFamily: 'intro_v1',
        sendDow: 2,
        sendHour: 10,
        sends: BigInt(5), // below kmin
        replies: BigInt(1),
        wins: BigInt(0),
        revenueUsd: 1000
      }
    ];

    (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockRows);

    await runAggregation();

    expect(prisma.signalAggregate.create).not.toHaveBeenCalled();
  });
});
