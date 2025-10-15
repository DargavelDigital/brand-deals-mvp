import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { randomUUID } from 'crypto';

export type CreditType = 'AUDIT' | 'MEDIA_PACK' | 'OUTREACH';

export async function requireCredits(type: CreditType, amount: number, workspaceId: string): Promise<void> {
  try {
    // Check if user is admin - admins bypass credit system
    const session = await getServerSession(authOptions);
    
    if (session?.user?.isAdmin) {
      console.log('🔓 Admin bypass - unlimited access for:', session.user.email);
      console.log('   Action:', type, '| Amount:', amount, '| Workspace:', workspaceId);
      console.log('   Admin role:', session.user.adminRole || 'ADMIN');
      return; // Skip all credit checks for admins!
    }
    
    // Regular user - check credit balance
    const creditEntries = await prisma().creditLedger.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate current balance from most recent entry
    const currentBalance = creditEntries.length > 0 ? creditEntries[0].balanceAfter : 0;

    if (currentBalance < amount) {
      throw new Error(`Insufficient credits. Required: ${amount}, Available: ${currentBalance}. Please upgrade your plan or purchase more credits.`);
    }

    // Deduct credits
    const newBalance = currentBalance - amount;
    await prisma().creditLedger.create({
      data: {
        id: randomUUID(),
        workspaceId,
        delta: -amount,
        balanceAfter: newBalance,
        kind: type === 'AUDIT' || type === 'MEDIA_PACK' ? 'AI' : 'EMAIL',
        reason: `${type} operation consumed ${amount} credit(s)`,
        ref: `${type.toLowerCase()}-deduction`
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
    // Check if user is admin - show unlimited for admins
    const session = await getServerSession(authOptions);
    
    if (session?.user?.isAdmin) {
      console.log('🔓 Admin viewing balance - showing unlimited');
      return 999999; // Show unlimited credits for admins
    }
    
    const creditEntries = await prisma().creditLedger.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 1
    });

    // Return balanceAfter from most recent entry
    return creditEntries.length > 0 ? creditEntries[0].balanceAfter : 0;
  } catch (error) {
    console.error('Failed to get credit balance:', error);
    return 0;
  }
}
