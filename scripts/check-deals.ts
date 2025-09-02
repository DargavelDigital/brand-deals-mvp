import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function checkDeals() {
  try {
    // Get all deals
    const deals = await prisma.deal.findMany({
      include: {
        workspace: true
      }
    })
    
    console.log('Found deals:')
    deals.forEach(deal => {
      console.log(`- Deal ${deal.id}: "${deal.title}" in workspace ${deal.workspaceId} (${deal.workspace.name})`)
    })
    
    // Get all workspaces
    const workspaces = await prisma.workspace.findMany()
    console.log('\nAvailable workspaces:')
    workspaces.forEach(workspace => {
      console.log(`- ${workspace.id}: ${workspace.name}`)
    })
    
    // Get all users and their workspaces
    const users = await prisma.user.findMany({
      include: {
        memberships: {
          include: {
            workspace: true
          }
        }
      }
    })
    
    console.log('\nUsers and their workspaces:')
    users.forEach(user => {
      console.log(`- User ${user.id}: ${user.email}`)
      user.memberships.forEach(membership => {
        console.log(`  - Member of workspace: ${membership.workspaceId} (${membership.workspace.name})`)
      })
    })
    
  } catch (error) {
    console.error('Error checking deals:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDeals()
