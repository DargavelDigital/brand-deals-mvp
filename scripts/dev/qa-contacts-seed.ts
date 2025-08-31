import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
  try {
    // Get workspace slug from env or fallback to demo
    const workspaceSlug = process.env.WORKSPACE_SLUG || 'demo-workspace'
    
    // Find or create workspace
    let workspace = await prisma.workspace.findUnique({
      where: { slug: workspaceSlug }
    })
    
    if (!workspace) {
      console.log(`Creating workspace: ${workspaceSlug}`)
      workspace = await prisma.workspace.create({
        data: {
          slug: workspaceSlug,
          name: 'QA Test Workspace',
          featureFlags: {}
        }
      })
    }
    
    console.log(`Using workspace: ${workspace.name} (${workspace.id})`)
    
    // Sample contact data with intentional duplicates
    const contacts = [
      // Exact email duplicates (case variants)
      { name: 'John Smith', email: 'john.smith@company.com', company: 'Company A', status: 'ACTIVE', verifiedStatus: 'VALID', seniority: 'Manager', tags: ['lead', 'priority'] },
      { name: 'John Smith', email: 'JOHN.SMITH@COMPANY.COM', company: 'Company A', status: 'ACTIVE', verifiedStatus: 'VALID', seniority: 'Manager', tags: ['lead', 'priority'] },
      { name: 'John Smith', email: 'john.smith@COMPANY.com', company: 'Company A', status: 'ACTIVE', verifiedStatus: 'VALID', seniority: 'Manager', tags: ['lead', 'priority'] },
      
      // Domain duplicates
      { name: 'Alice Johnson', email: 'alice@techcorp.com', company: 'TechCorp', status: 'ACTIVE', verifiedStatus: 'VALID', seniority: 'Director', tags: ['enterprise'] },
      { name: 'Bob Wilson', email: 'bob@techcorp.com', company: 'TechCorp', status: 'ACTIVE', verifiedStatus: 'VALID', seniority: 'VP', tags: ['enterprise'] },
      { name: 'Carol Davis', email: 'carol@techcorp.com', company: 'TechCorp', status: 'ACTIVE', verifiedStatus: 'VALID', seniority: 'Manager', tags: ['enterprise'] },
      
      // Unique contacts
      { name: 'David Brown', email: 'david@startup.io', company: 'Startup.io', status: 'ACTIVE', verifiedStatus: 'UNVERIFIED', seniority: 'C-Level', tags: ['startup', 'founder'] },
      { name: 'Emma Garcia', email: 'emma@agency.net', company: 'Creative Agency', status: 'ACTIVE', verifiedStatus: 'VALID', seniority: 'Director', tags: ['agency', 'creative'] },
      { name: 'Frank Miller', email: 'frank@enterprise.co', company: 'Enterprise Co', status: 'INACTIVE', verifiedStatus: 'RISKY', seniority: 'Individual Contributor', tags: ['enterprise', 'inactive'] },
      { name: 'Grace Lee', email: 'grace@consulting.biz', company: 'Consulting Biz', status: 'ACTIVE', verifiedStatus: 'VALID', seniority: 'VP', tags: ['consulting', 'strategy'] },
      { name: 'Henry Taylor', email: 'henry@retail.store', company: 'Retail Store', status: 'ACTIVE', verifiedStatus: 'VALID', seniority: 'Manager', tags: ['retail', 'b2c'] },
      { name: 'Ivy Chen', email: 'ivy@saas.app', company: 'SaaS App', status: 'ACTIVE', verifiedStatus: 'VALID', seniority: 'Director', tags: ['saas', 'b2b'] }
    ]
    
    console.log(`Inserting ${contacts.length} contacts...`)
    
    // Insert contacts using raw SQL to avoid type issues
    console.log('Inserting contacts...')
    
    for (const contact of contacts) {
      try {
        await prisma.$executeRaw`
          INSERT INTO "Contact" (
            "id", "workspaceId", "name", "email", "company", "status", 
            "verifiedStatus", "seniority", "tags", "score", "source", 
            "createdAt", "updatedAt"
          ) VALUES (
            ${randomUUID()}, ${workspace.id}, ${contact.name}, ${contact.email}, 
            ${contact.company}, ${contact.status}::text::"ContactStatus", 
            ${contact.verifiedStatus}::text::"ContactVerificationStatus", 
            ${contact.seniority}, ${contact.tags}, ${Math.floor(Math.random() * 100)}, 
            ${'qa-seed'}, NOW(), NOW()
          )
          ON CONFLICT ("workspaceId", "email") DO NOTHING
        `
      } catch (error) {
        console.log(`⚠️  Skipped ${contact.email} (likely duplicate)`)
      }
    }
    
    console.log(`✅ Contacts insertion completed`)
    
    // Verify duplicates exist
    const duplicateEmails = await prisma.$queryRaw<Array<{ email: string; count: bigint }>>`
      SELECT lower(email) AS email, COUNT(*) as count 
      FROM "Contact" 
      WHERE "workspaceId" = ${workspace.id} 
        AND email IS NOT NULL 
        AND email != ''
      GROUP BY lower(email) 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `
    
    const duplicateDomains = await prisma.$queryRaw<Array<{ domain: string; count: bigint }>>`
      SELECT split_part(lower(email), '@', 2) AS domain, COUNT(*) as count 
      FROM "Contact" 
      WHERE "workspaceId" = ${workspace.id} 
        AND email IS NOT NULL 
        AND email != ''
        AND email LIKE '%@%'
      GROUP BY split_part(lower(email), '@', 2) 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `
    
    console.log(`📊 Duplicate Summary:`)
    console.log(`   Email duplicates: ${duplicateEmails.length} groups`)
    duplicateEmails.forEach(dup => console.log(`     ${dup.email}: ${dup.count} contacts`))
    
    console.log(`   Domain duplicates: ${duplicateDomains.length} groups`)
    duplicateDomains.forEach(dup => console.log(`     ${dup.domain}: ${dup.count} contacts`))
    
    const totalDuplicates = duplicateEmails.length + duplicateDomains.length
    console.log(`\n🎯 Total duplicate groups: ${totalDuplicates}`)
    
    if (totalDuplicates > 0) {
      console.log(`✅ Duplicates created successfully - test FEATURE_CONTACTS_DEDUPE=true`)
    } else {
      console.log(`⚠️  No duplicates found - check data insertion`)
    }
    
  } catch (error) {
    console.error('❌ Error seeding contacts:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
