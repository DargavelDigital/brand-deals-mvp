import 'dotenv/config'
import { getPrisma } from '@/src/lib/db'

async function main() {
  const prisma = getPrisma()
  if (!prisma) {
    throw new Error('No Prisma client available')
  }

  console.log('🚬 Running database smoke test...')

  // Test basic database connectivity
  const ok = await prisma.workspace.findFirst()
  if (!ok) {
    throw new Error('No workspace found - database may be empty or inaccessible')
  }

  console.log('✅ DB smoke OK:', ok.slug)

  // Test that we can read from key tables
  const brandCount = await prisma.brand.count()
  const contactCount = await prisma.contact.count()
  const mediaPackCount = await prisma.mediaPack.count()

  console.log(`📊 Table counts - Brands: ${brandCount}, Contacts: ${contactCount}, Media Packs: ${mediaPackCount}`)

  // Test a simple write operation (rollback)
  const testWorkspace = await prisma.workspace.create({
    data: {
      slug: `smoke-test-${Date.now()}`,
      name: 'Smoke Test Workspace'
    }
  })

  console.log('✅ Write test passed:', testWorkspace.slug)

  // Clean up test data
  await prisma.workspace.delete({
    where: { id: testWorkspace.id }
  })

  console.log('✅ Cleanup completed')
  console.log('🎉 Database smoke test passed!')
}

main().catch((error) => {
  console.error('❌ Smoke test failed:', error)
  process.exit(1)
})
