import { prisma } from '@/lib/prisma';

export type CreditType = 'AUDIT' | 'MEDIA_PACK' | 'OUTREACH';

export async function requireCredits(type: CreditType, amount: number, workspaceId: string): Promise<void> {
  try {
    // Get current credit balance
    const creditEntries = await prisma().creditLedger.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate current balance
    const currentBalance = creditEntries.reduce((balance, entry) => {
      return balance + entry.amount;
    }, 0);

    if (currentBalance < amount) {
      throw new Error(`Insufficient credits. Required: ${amount}, Available: ${currentBalance}. Please upgrade your plan or purchase more credits.`);
    }

    // Deduct credits
    await prisma().creditLedger.create({
      data: {
        workspaceId,
        type,
        amount: -amount,
        description: `${type} operation consumed ${amount} credit(s)`
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to process credits');
  }
}

export async function getCreditBalance(workspaceId: string): Promise<number> {
  try {
    const creditEntries = await prisma().creditLedger.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });

    return creditEntries.reduce((balance, entry) => {
      return balance + entry.amount;
    }, 0);
  } catch (error) {
    console.error('Failed to get credit balance:', error);
    return 0;
  }
}
