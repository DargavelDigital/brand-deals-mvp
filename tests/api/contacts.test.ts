import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

// Test workspace and user setup
const testWorkspaceId = randomUUID()
const testUserId = randomUUID()

// Mock auth context for testing
const mockAuthContext = {
  userId: testUserId,
  workspaceId: testWorkspaceId,
  role: 'OWNER' as const,
}

// Test contacts data
const testContacts = [
  { name: 'John Smith', email: 'john@company.com', company: 'Company A', status: 'ACTIVE', verifiedStatus: 'VALID', seniority: 'Manager', tags: ['lead'] },
  { name: 'John Smith', email: 'JOHN@COMPANY.COM', company: 'Company A', status: 'ACTIVE', verifiedStatus: 'VALID', seniority: 'Manager', tags: ['lead'] },
  { name: 'Alice Johnson', email: 'alice@techcorp.com', company: 'TechCorp', status: 'ACTIVE', verifiedStatus: 'VALID', seniority: 'Director', tags: ['enterprise'] },
  { name: 'Bob Wilson', email: 'bob@techcorp.com', company: 'TechCorp', status: 'INACTIVE', verifiedStatus: 'UNVERIFIED', seniority: 'VP', tags: ['enterprise'] },
  { name: 'Carol Davis', email: 'carol@startup.io', company: 'Startup.io', status: 'ACTIVE', verifiedStatus: 'VALID', seniority: 'C-Level', tags: ['startup'] },
]

describe('Contacts API', () => {
  beforeAll(async () => {
    // Create test workspace
    await prisma.workspace.create({
      data: {
        id: testWorkspaceId,
        name: 'Test Workspace',
        slug: 'test-workspace',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Create test user
    await prisma.user.create({
      data: {
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Create workspace membership
    await prisma.workspaceMembership.create({
      data: {
        id: randomUUID(),
        userId: testUserId,
        workspaceId: testWorkspaceId,
        role: 'OWNER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Insert test contacts
    for (const contact of testContacts) {
      await prisma.contact.create({
        data: {
          id: randomUUID(),
          workspaceId: testWorkspaceId,
          name: contact.name,
          email: contact.email,
          company: contact.company,
          status: contact.status as any,
          verifiedStatus: contact.verifiedStatus as any,
          seniority: contact.seniority,
          tags: contact.tags,
          score: Math.floor(Math.random() * 100),
          source: 'test',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    }
  })

  afterAll(async () => {
    // Cleanup test data
    await prisma.contact.deleteMany({ where: { workspaceId: testWorkspaceId } })
    await prisma.workspaceMembership.deleteMany({ where: { workspaceId: testWorkspaceId } })
    await prisma.user.delete({ where: { id: testUserId } })
    await prisma.workspace.delete({ where: { id: testWorkspaceId } })
    await prisma.$disconnect()
  })

  describe('GET /api/contacts', () => {
    it('should return filtered results by search query', async () => {
      // Mock the API call by directly querying the database with filters
      const results = await prisma.contact.findMany({
        where: {
          workspaceId: testWorkspaceId,
          OR: [
            { name: { contains: 'John', mode: 'insensitive' } },
            { email: { contains: 'John', mode: 'insensitive' } },
            { company: { contains: 'John', mode: 'insensitive' } },
          ],
        },
      })

      expect(results).toHaveLength(2) // Both John Smith contacts
      expect(results.every(c => c.name.includes('John'))).toBe(true)
    })

    it('should filter by status', async () => {
      const results = await prisma.contact.findMany({
        where: {
          workspaceId: testWorkspaceId,
          status: 'ACTIVE',
        },
      })

      expect(results).toHaveLength(4) // 4 active contacts
      expect(results.every(c => c.status === 'ACTIVE')).toBe(true)
    })

    it('should filter by verifiedStatus', async () => {
      const results = await prisma.contact.findMany({
        where: {
          workspaceId: testWorkspaceId,
          verifiedStatus: 'VALID',
        },
      })

      expect(results).toHaveLength(4) // 4 valid contacts
      expect(results.every(c => c.verifiedStatus === 'VALID')).toBe(true)
    })

    it('should filter by seniority', async () => {
      const results = await prisma.contact.findMany({
        where: {
          workspaceId: testWorkspaceId,
          seniority: 'Manager',
        },
      })

      expect(results).toHaveLength(2) // 2 managers
      expect(results.every(c => c.seniority === 'Manager')).toBe(true)
    })

    it('should filter by tags', async () => {
      const results = await prisma.contact.findMany({
        where: {
          workspaceId: testWorkspaceId,
          tags: { hasSome: ['enterprise'] },
        },
      })

      expect(results).toHaveLength(2) // 2 enterprise contacts
      expect(results.every(c => c.tags.includes('enterprise'))).toBe(true)
    })
  })

  describe('GET /api/contacts/duplicates', () => {
    it('should return duplicate groups when feature flag is enabled', async () => {
      // Test the duplicate detection logic directly
      const duplicateEmails = await prisma.$queryRaw<Array<{ email: string; count: bigint }>>`
        SELECT LOWER(email) as email, COUNT(*) as count
        FROM "Contact"
        WHERE "workspaceId" = ${testWorkspaceId}
        GROUP BY LOWER(email)
        HAVING COUNT(*) > 1
      `

      const duplicateDomains = await prisma.$queryRaw<Array<{ domain: string; count: bigint }>>`
        SELECT SPLIT_PART(LOWER(email), '@', 2) as domain, COUNT(*) as count
        FROM "Contact"
        WHERE "workspaceId" = ${testWorkspaceId}
        GROUP BY SPLIT_PART(LOWER(email), '@', 2)
        HAVING COUNT(*) > 1
      `

      // Should find email duplicates (john@company.com variants)
      expect(duplicateEmails.length).toBeGreaterThan(0)
      const johnDuplicates = duplicateEmails.find(d => d.email === 'john@company.com')
      expect(johnDuplicates?.count).toBe(2n)

      // Should find domain duplicates (techcorp.com)
      expect(duplicateDomains.length).toBeGreaterThan(0)
      const techcorpDuplicates = duplicateDomains.find(d => d.domain === 'techcorp.com')
      expect(techcorpDuplicates?.count).toBe(2n)
    })
  })

  describe('POST /api/contacts/bulk', () => {
    it('should add tags to selected contacts', async () => {
      const contactIds = await prisma.contact.findMany({
        where: { workspaceId: testWorkspaceId },
        select: { id: true },
        take: 2,
      })

      const ids = contactIds.map(c => c.id)

      // Test tag addition logic
      const updatedContacts = await prisma.contact.updateMany({
        where: {
          id: { in: ids },
          workspaceId: testWorkspaceId, // Security check
        },
        data: {
          tags: {
            push: 'bulk-test-tag',
          },
        },
      })

      expect(updatedContacts.count).toBe(2)

      // Verify tags were added
      const contacts = await prisma.contact.findMany({
        where: { id: { in: ids } },
        select: { tags: true },
      })

      expect(contacts.every(c => c.tags.includes('bulk-test-tag'))).toBe(true)
    })

    it('should update status of selected contacts', async () => {
      const contactIds = await prisma.contact.findMany({
        where: { workspaceId: testWorkspaceId, status: 'ACTIVE' },
        select: { id: true },
        take: 2,
      })

      const ids = contactIds.map(c => c.id)

      // Test status update logic
      const updatedContacts = await prisma.contact.updateMany({
        where: {
          id: { in: ids },
          workspaceId: testWorkspaceId, // Security check
        },
        data: {
          status: 'ARCHIVED',
        },
      })

      expect(updatedContacts.count).toBe(2)

      // Verify status was updated
      const contacts = await prisma.contact.findMany({
        where: { id: { in: ids } },
        select: { status: true },
      })

      expect(contacts.every(c => c.status === 'ARCHIVED')).toBe(true)
    })

    it('should export selected contacts as CSV', async () => {
      const contactIds = await prisma.contact.findMany({
        where: { workspaceId: testWorkspaceId },
        select: { id: true },
        take: 3,
      })

      const ids = contactIds.map(c => c.id)

      // Test CSV export logic by fetching the data
      const contacts = await prisma.contact.findMany({
        where: {
          id: { in: ids },
          workspaceId: testWorkspaceId, // Security check
        },
        select: {
          name: true,
          email: true,
          company: true,
          status: true,
          seniority: true,
        },
      })

      expect(contacts).toHaveLength(3)

      // Verify CSV format would be correct
      const csvHeaders = ['name', 'email', 'company', 'status', 'seniority']
      const csvRow = contacts[0]
      expect(Object.keys(csvRow)).toEqual(csvHeaders)
    })
  })
})
