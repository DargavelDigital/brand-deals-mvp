import 'dotenv/config'
import { getPrisma } from '@/src/lib/db'

async function main() {
  const prisma = getPrisma()
  if (!prisma) {
    console.error('No Prisma client available')
    process.exit(1)
  }

  console.log('🌱 Seeding test data...')

  // idempotent seed for tests (brands, a creator, etc.)
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: { 
      slug: 'demo-workspace', 
      name: 'Demo Workspace',
      featureFlags: {
        'OUTREACH_TONES': true,
        'MP_TRACKING': true,
        'MP_CONVERSION_DASHBOARD': true
      }
    }
  })

  console.log('✅ Workspace created:', workspace.slug)

  // Create a test brand for One-Touch to use
  const brand = await prisma.brand.upsert({
    where: { id: 'test-brand-001' },
    update: {},
    create: {
      id: 'test-brand-001',
      name: 'Test Fitness Brand',
      description: 'A test brand for E2E testing',
      website: 'https://test-fitness.com',
      category: 'fitness',
      workspaceId: workspace.id,
      status: 'active'
    }
  })

  console.log('✅ Test brand created:', brand.name)

  // Create a test contact
  const contact = await prisma.contact.upsert({
    where: { id: 'test-contact-001' },
    update: {},
    create: {
      id: 'test-contact-001',
      name: 'Test Contact',
      email: 'test@example.com',
      company: 'Test Company',
      workspaceId: workspace.id,
      status: 'active'
    }
  })

  console.log('✅ Test contact created:', contact.name)

  // Create a test media pack
  const mediaPack = await prisma.mediaPack.upsert({
    where: { id: 'test-media-pack-001' },
    update: {},
    create: {
      id: 'test-media-pack-001',
      shareToken: 'test-token-001',
      variant: 'classic',
      workspaceId: workspace.id,
      brandId: brand.id
    }
  })

  console.log('✅ Test media pack created:', mediaPack.id)

  console.log('🎉 Test data seeding complete!')
}

main().catch((error) => {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
}).finally(() => {
  process.exit(0)
})
