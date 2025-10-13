/**
 * Add Starter Credits Script
 * 
 * Adds 10 starter credits to a specific workspace
 * 
 * Usage: npx tsx scripts/add-credits.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

const TARGET_WORKSPACE_ID = '191695dd-8833-415a-8477-1660a8cb40cb';
const CREDITS_TO_ADD = 10;

async function main() {
  try {
    console.log('🎁 Adding starter credits...');
    console.log('Target workspace:', TARGET_WORKSPACE_ID);
    console.log('Credits to add:', CREDITS_TO_ADD);
    
    // 1. Verify workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: TARGET_WORKSPACE_ID },
      select: { id: true, name: true, slug: true }
    });
    
    if (!workspace) {
      console.error('❌ Workspace not found:', TARGET_WORKSPACE_ID);
      process.exit(1);
    }
    
    console.log('✅ Workspace found:', workspace.name, `(${workspace.slug})`);
    
    // 2. Check current credit balance
    const existingCredits = await prisma.creditLedger.findMany({
      where: { workspaceId: TARGET_WORKSPACE_ID },
      orderBy: { createdAt: 'desc' }
    });
    
    const currentBalance = existingCredits.length > 0 
      ? existingCredits[0].balanceAfter 
      : 0;
    
    console.log('💰 Current balance:', currentBalance, 'credits');
    
    // 3. Add 10 starter credits
    const newBalance = currentBalance + CREDITS_TO_ADD;
    
    const creditEntry = await prisma.creditLedger.create({
      data: {
        id: randomUUID(),
        workspaceId: TARGET_WORKSPACE_ID,
        delta: CREDITS_TO_ADD,
        balanceAfter: newBalance,
        kind: 'AI', // Using 'AI' since CreditKind enum only has AI and EMAIL (no BONUS)
        reason: 'Manual starter credits addition via script',
        ref: 'add-credits-script'
      }
    });
    
    console.log('✅ Credits added successfully!');
    console.log('📊 Credit entry:', {
      id: creditEntry.id,
      delta: creditEntry.delta,
      balanceAfter: creditEntry.balanceAfter,
      kind: creditEntry.kind,
      reason: creditEntry.reason
    });
    
    // 4. Verify new balance
    const verification = await prisma.creditLedger.findMany({
      where: { workspaceId: TARGET_WORKSPACE_ID },
      orderBy: { createdAt: 'desc' },
      take: 1
    });
    
    if (verification[0]) {
      console.log('✅ Verification - New balance:', verification[0].balanceAfter, 'credits');
    }
    
    console.log('🎉 Done! Credits added successfully.');
    
  } catch (error) {
    console.error('❌ Error adding credits:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

