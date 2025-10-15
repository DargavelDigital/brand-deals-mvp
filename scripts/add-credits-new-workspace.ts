/**
 * Add Starter Credits to New Workspace
 * 
 * Adds 10 starter credits to the new workspace created via OAuth
 * 
 * Usage: npx tsx scripts/add-credits-new-workspace.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

const TARGET_WORKSPACE_ID = 'd3d4d250-ce9f-4040-bc20-5c58939b85cc';  // New workspace from OAuth
const CREDITS_TO_ADD = 10;

async function main() {
  try {
    console.log('🎁 Adding starter credits to new workspace...');
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
        kind: 'AI',
        reason: 'Welcome bonus - new workspace via OAuth signup',
        ref: 'oauth-welcome-credits'
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
    
    // 5. Check Instagram connection
    const instagramAccount = await prisma.socialAccount.findFirst({
      where: {
        workspaceId: TARGET_WORKSPACE_ID,
        platform: 'instagram'
      },
      select: {
        id: true,
        platform: true,
        username: true,
        accessToken: true
      }
    });
    
    if (instagramAccount) {
      console.log('✅ Instagram connected:', {
        username: instagramAccount.username,
        hasToken: !!instagramAccount.accessToken
      });
    } else {
      console.log('⚠️ No Instagram account found for this workspace');
    }
    
    console.log('');
    console.log('🎉 Done! Workspace is ready to use:');
    console.log('   - Credits:', newBalance);
    console.log('   - Instagram:', instagramAccount ? 'Connected' : 'Not connected');
    
  } catch (error) {
    console.error('❌ Error:', error);
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

