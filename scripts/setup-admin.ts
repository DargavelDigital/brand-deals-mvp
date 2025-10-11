import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function setupAdmin() {
  const email = 'paul@hypeandswagger.com';
  const name = 'Paul Caruana';

  try {
    console.log('🚀 Setting up admin account for:', email);
    console.log('');

    // 1. Create or find user
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('📝 Creating user record...');
      user = await prisma.user.create({
        data: {
          id: randomUUID(),
          email,
          name,
          emailVerified: new Date(), // Mark as verified
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      console.log('✅ User created:', user.id);
    } else {
      console.log('✅ User already exists:', user.id);
    }

    // 2. Ensure user has a workspace
    let membership = await prisma.membership.findFirst({
      where: { userId: user.id },
      include: { Workspace: true }
    });

    if (!membership) {
      console.log('📝 Creating workspace for user...');
      const workspace = await prisma.workspace.create({
        data: {
          id: randomUUID(),
          name: `${name}'s Workspace`,
          slug: `paul-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      membership = await prisma.membership.create({
        data: {
          id: randomUUID(),
          userId: user.id,
          workspaceId: workspace.id,
          role: 'OWNER',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: { Workspace: true }
      });
      console.log('✅ Workspace created:', workspace.id);
      console.log('✅ Membership created with OWNER role');
    } else {
      console.log('✅ User already has workspace:', membership.Workspace.name);
    }

    // 3. Create or update admin record
    const admin = await prisma.admin.upsert({
      where: { email },
      update: { 
        role: 'SUPER' // Ensure SUPER role
      },
      create: {
        id: randomUUID(),
        email,
        role: 'SUPER',
        createdAt: new Date(),
      }
    });

    console.log('✅ Admin record ensured:', admin.id);
    console.log('   Role:', admin.role);
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('🎉 SETUP COMPLETE!');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('📧 Email:', email);
    console.log('👤 User ID:', user.id);
    console.log('🏢 Workspace ID:', membership.workspaceId);
    console.log('🛡️  Admin Role:', admin.role);
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Login with Google OAuth using', email);
    console.log('   OR set demo cookie if testing locally');
    console.log('2. After login, Admin section will appear in sidebar');
    console.log('3. Click "Admin Console" to access /admin pages');
    console.log('');
    console.log('📌 NOTE: If using OAuth, make sure your Google account');
    console.log('   email matches:', email);

  } catch (error) {
    console.error('❌ Error during setup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin().catch((e) => {
  console.error(e);
  process.exit(1);
});

