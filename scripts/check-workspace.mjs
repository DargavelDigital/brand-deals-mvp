import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function checkWorkspace() {
  try {
    console.log('Checking for demo-workspace...');
    
    const workspace = await prisma.workspace.findUnique({
      where: { id: 'demo-workspace' }
    });
    
    if (workspace) {
      console.log('✅ demo-workspace exists:', workspace.name);
    } else {
      console.log('❌ demo-workspace not found, creating it...');
      
      const created = await prisma.workspace.create({
        data: {
          id: 'demo-workspace',
          name: 'Demo Workspace',
          slug: `demo-workspace-${Date.now()}`,
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Created demo-workspace:', created.name);
    }
    
    // List all workspaces
    const allWorkspaces = await prisma.workspace.findMany({
      select: { id: true, name: true, slug: true }
    });
    
    console.log('\nAll workspaces:');
    allWorkspaces.forEach(w => console.log(`- ${w.id}: ${w.name} (${w.slug})`));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkWorkspace();
