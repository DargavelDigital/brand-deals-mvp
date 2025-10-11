import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function linkGoogleUser() {
  const email = 'paul@hypeandswagger.com';

  console.log('🔗 Linking user to workspace...');
  console.log('Email:', email);
  console.log('');

  try {
    // 1. Find the user by email (works for both Credentials and Google login)
    console.log('📝 Finding user by email...');
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      console.error('❌ User not found with email:', email);
      console.log('');
      console.log('Available users:');
      const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true },
        take: 10
      });
      users.forEach(u => console.log(`  - ${u.id} (${u.email})`));
      return;
    }

    console.log('✅ User found:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('');

    // 2. Check if membership already exists
    console.log('📝 Checking for existing membership...');
    const existingMembership = await prisma.membership.findFirst({
      where: { userId: user.id },
      select: { 
        id: true, 
        workspaceId: true, 
        role: true,
        Workspace: { select: { name: true } }
      }
    });

    if (existingMembership) {
      console.log('✅ Membership already exists!');
      console.log('   Workspace:', existingMembership.Workspace.name);
      console.log('   Role:', existingMembership.role);
      console.log('   Workspace ID:', existingMembership.workspaceId);
      console.log('');
      console.log('🎉 User is already linked to workspace!');
      return;
    }

    console.log('⚠️  No membership found, creating one...');
    console.log('');

    // 3. Find or create workspace
    console.log('📝 Finding workspace...');
    let workspace = await prisma.workspace.findFirst({
      where: {
        OR: [
          { name: { contains: 'Paul' } },
          { name: { contains: 'Dargavel' } },
          { slug: { contains: 'paul' } }
        ]
      },
      select: { id: true, name: true, slug: true }
    });

    if (!workspace) {
      console.log('⚠️  No workspace found, creating one...');
      workspace = await prisma.workspace.create({
        data: {
          name: `${user.name || 'User'}'s Workspace`,
          slug: `ws-${user.id.slice(0, 8)}`
        },
        select: { id: true, name: true, slug: true }
      });
      console.log('✅ Workspace created:', workspace.id);
    } else {
      console.log('✅ Workspace found:', workspace.id);
    }

    console.log('   Name:', workspace.name);
    console.log('   Slug:', workspace.slug);
    console.log('');

    // 4. Create membership
    console.log('📝 Creating membership...');
    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: 'OWNER'
      },
      select: { id: true, role: true }
    });

    console.log('✅ Membership created:', membership.id);
    console.log('   Role:', membership.role);
    console.log('');

    console.log('═══════════════════════════════════════════');
    console.log('🎉 SUCCESS!');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('👤 User:', user.email);
    console.log('🏢 Workspace:', workspace.name);
    console.log('🔑 Role:', membership.role);
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Logout from the app');
    console.log('2. Login again with Google');
    console.log('3. Visit /api/debug/session');
    console.log('4. Verify workspaceId is now set!');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkGoogleUser();

