import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Update all workspaces to ensure they have featureFlags set
  const result = await prisma.workspace.updateMany({
    data: { featureFlags: {} }
  })
  
  console.log(`Updated ${result.count} workspaces with featureFlags: {}`)
}
main().finally(() => prisma.$disconnect())
