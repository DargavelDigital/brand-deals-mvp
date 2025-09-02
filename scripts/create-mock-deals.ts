import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function createMockDeals() {
  try {
    // Get the first workspace (assuming there's at least one)
    const workspace = await prisma.workspace.findFirst()
    if (!workspace) {
      console.log('No workspace found. Please create a workspace first.')
      return
    }
    
    console.log('Using workspace:', workspace.id, workspace.name)

    // Get the first user in that workspace
    const user = await prisma.user.findFirst({
      where: {
        memberships: {
          some: {
            workspaceId: workspace.id
          }
        }
      }
    })

    if (!user) {
      console.log('No user found in workspace.')
      return
    }

    // Get or create a brand for the deals
    let brand = await prisma.brand.findFirst({
      where: { workspaceId: workspace.id }
    })

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: "Mock Brand",
          domain: "mockbrand.com",
          workspaceId: workspace.id
        }
      })
    }

    // Create mock deals
    const mockDeals = [
      {
        id: "1",
        title: "Acme Corp Partnership",
        description: "Initial partnership discussion//NEXT: Follow up on proposal",
        offerAmount: 2400,
        value: 2400,
        status: "OPEN" as const,
        workspaceId: workspace.id,
        creatorId: user.id,
        brandId: brand.id,
        category: "Partnership"
      },
      {
        id: "2", 
        title: "Globex Inc Campaign",
        description: "Partnership finalized//NEXT: Send thank you email",
        offerAmount: 5600,
        value: 5600,
        status: "WON" as const,
        workspaceId: workspace.id,
        creatorId: user.id,
        brandId: brand.id,
        category: "Campaign"
      },
      {
        id: "3",
        title: "Initech Collaboration",
        description: "Counter-offer received//NEXT: Schedule follow-up call",
        offerAmount: 3200,
        value: 3200,
        status: "COUNTERED" as const,
        workspaceId: workspace.id,
        creatorId: user.id,
        brandId: brand.id,
        category: "Collaboration"
      }
    ]

    for (const deal of mockDeals) {
      await prisma.deal.upsert({
        where: { id: deal.id },
        update: deal,
        create: deal
      })
      console.log(`Created/updated deal: ${deal.title}`)
    }

    console.log('Mock deals created successfully!')
  } catch (error) {
    console.error('Error creating mock deals:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createMockDeals()
