import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function verifyAdminUserId() {
  const email = 'paul@hypeandswagger.com';
  const correctUserId = '6ec28d98-f4cf-44aa-a941-182e3e581fc8';

  console.log('🔍 Checking Admin record userId...');
  console.log('Email:', email);
  console.log('Correct User ID:', correctUserId);
  console.log('');

  try {
    // Find User
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      console.error('❌ User not found!');
      return;
    }

    console.log('✅ User found:', user.id);
    console.log('   Email:', user.email);
    console.log('');

    // Check Admin by email (Admin model has no userId field!)
    const adminByEmail = await prisma.admin.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, createdAt: true }
    });

    if (!adminByEmail) {
      console.error('❌ Admin record not found by email!');
      console.log('Creating Admin record...');
      
      const newAdmin = await prisma.admin.create({
        data: {
          email: user.email!,
          role: 'SUPER'
        }
      });
      
      console.log('✅ Admin created:', newAdmin.id);
      console.log('   Email:', newAdmin.email);
      console.log('   Role:', newAdmin.role);
      return;
    }

    console.log('📋 Current Admin record:');
    console.log('   Admin ID:', adminByEmail.id);
    console.log('   Email:', adminByEmail.email);
    console.log('   Role:', adminByEmail.role);
    console.log('   Created:', adminByEmail.createdAt);
    console.log('');
    
    console.log('✅ Admin record exists and is correctly configured!');
    console.log('');
    console.log('📝 NOTE: Admin model uses email for linking, not userId');
    console.log('   - JWT callback checks Admin by email');
    console.log('   - requireAdmin() checks Admin by email');
    console.log('   - Both will find this Admin record');
    console.log('');

    // Final verification
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('📊 FINAL STATUS');
    console.log('═══════════════════════════════════════════');
    console.log('User ID:', user.id);
    console.log('User Email:', user.email);
    
    const finalAdmin = await prisma.admin.findUnique({
      where: { email: user.email! },
      select: { id: true, email: true, role: true }
    });
    
    if (finalAdmin) {
      console.log('Admin exists: ✅ YES');
      console.log('Admin Email:', finalAdmin.email);
      console.log('Admin Role:', finalAdmin.role);
      console.log('');
      console.log('🚀 READY TO GO!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Wait for Vercel deployment (commit #38)');
      console.log('2. Logout completely');
      console.log('3. Login with Google or Credentials');
      console.log('4. Check /api/debug/session');
      console.log('5. Verify isAdmin = true ✅');
    } else {
      console.log('Admin exists: ❌ NO');
      console.log('Something went wrong!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdminUserId();

