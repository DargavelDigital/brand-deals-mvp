import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function createGoogleMembership() {
  const googleUserId = '100261300892644933608'; // Your Google user ID
  const workspaceId = '191695dd-8833-415a-8477-1660a8cb40cb'; // Workspace ID
  const email = 'paul@hypeandswagger.com';

  console.log('🔗 Creating Membership for Google user...');
  console.log('Google User ID:', googleUserId);
  console.log('Workspace ID:', workspaceId);
  console.log('');

  try {
    // 1. Check if user exists by email (Credentials user)
    console.log('📝 Finding existing user by email...');
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true }
    });

    if (!existingUser) {
      console.error('❌ No user found with email:', email);
      console.log('');
      console.log('Please create the user first using Credentials login.');
      return;
    }

    console.log('✅ Found existing user:', existingUser.id);
    console.log('   Email:', existingUser.email);
    console.log('   Name:', existingUser.name);
    console.log('');
    
    console.log('📝 Note: When you login with Google, NextAuth will link');
    console.log('   the Google account to this existing user via Account table.');
    console.log('   The membership will work for BOTH login methods!');
    console.log('');

    // 2. Check if workspace exists
    console.log('📝 Checking if workspace exists...');
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true, slug: true }
    });

    if (!workspace) {
      console.error('❌ Workspace not found with ID:', workspaceId);
      return;
    }

    console.log('✅ Workspace found:', workspace.id);
    console.log('   Name:', workspace.name);
    console.log('   Slug:', workspace.slug);
    console.log('');

    // 3. Check if membership already exists for this user
    console.log('📝 Checking for existing membership...');
    const existingMembership = await prisma.membership.findFirst({
      where: { 
        userId: existingUser.id,
        workspaceId: workspaceId
      },
      select: { 
        id: true, 
        role: true,
        createdAt: true
      }
    });

    if (existingMembership) {
      console.log('✅ Membership already exists!');
      console.log('   ID:', existingMembership.id);
      console.log('   Role:', existingMembership.role);
      console.log('   Created:', existingMembership.createdAt);
      console.log('');
      console.log('🎉 Google user is already linked to workspace!');
      return;
    }

    console.log('⚠️  No membership found, creating one...');
    console.log('');

    // 4. Create membership for the existing user
    console.log('📝 Creating membership...');
    const membership = await prisma.membership.create({
      data: {
        userId: existingUser.id,
        workspaceId: workspaceId,
        role: 'OWNER'
      },
      select: { 
        id: true, 
        role: true,
        createdAt: true
      }
    });

    console.log('✅ Membership created:', membership.id);
    console.log('   Role:', membership.role);
    console.log('   Created:', membership.createdAt);
    console.log('');

    // 5. Verify the membership
    console.log('📝 Verifying membership...');
    const verifyMembership = await prisma.membership.findFirst({
      where: { 
        userId: existingUser.id
      },
      select: {
        id: true,
        role: true,
        workspaceId: true,
        Workspace: { select: { name: true } },
        User_Membership_userIdToUser: { select: { email: true } }
      }
    });

    if (verifyMembership) {
      console.log('✅ VERIFICATION SUCCESSFUL!');
      console.log('   Membership ID:', verifyMembership.id);
      console.log('   User Email:', verifyMembership.User_Membership_userIdToUser.email);
      console.log('   Workspace:', verifyMembership.Workspace.name);
      console.log('   Role:', verifyMembership.role);
    }
    console.log('');

    console.log('═══════════════════════════════════════════');
    console.log('🎉 SUCCESS!');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('✅ User linked to workspace');
    console.log('👤 User ID:', existingUser.id);
    console.log('📧 Email:', email);
    console.log('🏢 Workspace:', workspace.name);
    console.log('🔑 Role: OWNER');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Wait for Vercel deployment to complete (if not already)');
    console.log('2. Logout from the app completely');
    console.log('3. Login with Credentials OR Google');
    console.log('   - Both methods will work!');
    console.log('   - NextAuth links accounts via email');
    console.log('4. Visit /api/debug/session');
    console.log('5. Verify workspaceId and isAdmin are set!');
    console.log('');
    console.log('Expected session data:');
    console.log('{');
    console.log('  "userId": "' + existingUser.id + '",');
    console.log('  "workspaceId": "191695dd-8833-415a-8477-1660a8cb40cb",');
    console.log('  "isAdmin": true,');
    console.log('  "adminRole": "SUPER",');
    console.log('  "membershipRole": "OWNER"');
    console.log('}');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createGoogleMembership();

