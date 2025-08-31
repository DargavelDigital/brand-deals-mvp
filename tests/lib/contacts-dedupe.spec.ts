import { describe, it, expect } from 'vitest'
import { contactKey, groupByKey, findDuplicateGroups, mergeContacts } from '@/lib/contacts/dedupe'

// Mock contact data for testing
const mockContacts = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Corp',
    title: 'CEO',
    phone: '123-456-7890',
    tags: ['important', 'ceo'],
    notes: 'Main contact',
    status: 'ACTIVE',
    verifiedStatus: 'VALID',
    seniority: 'C-Level',
    department: 'Executive',
    nextStep: 'Follow up',
    remindAt: new Date('2024-01-01'),
    workspaceId: 'ws1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Corp',
    title: null,
    phone: null,
    tags: ['contact'],
    notes: null,
    status: 'ACTIVE',
    verifiedStatus: 'VALID',
    seniority: null,
    department: null,
    nextStep: null,
    remindAt: null,
    workspaceId: 'ws1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    company: 'Tech Inc',
    title: 'CTO',
    phone: '987-654-3210',
    tags: ['tech', 'cto'],
    notes: 'Technical contact',
    status: 'ACTIVE',
    verifiedStatus: 'VALID',
    seniority: 'C-Level',
    department: 'Technology',
    nextStep: 'Schedule meeting',
    remindAt: new Date('2024-01-02'),
    workspaceId: 'ws1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

describe('Contact Deduplication', () => {
  describe('contactKey', () => {
    it('should generate key from email when available', () => {
      const key = contactKey(mockContacts[0])
      expect(key).toBe('john@example.com')
    })

    it('should generate key from name+company when email not available', () => {
      const contactWithoutEmail = { ...mockContacts[0], email: null }
      const key = contactKey(contactWithoutEmail)
      expect(key).toBe('john doe|acme corp')
    })

    it('should generate key from name only when company not available', () => {
      const contactWithoutEmailOrCompany = { ...mockContacts[0], email: null, company: null }
      const key = contactKey(contactWithoutEmailOrCompany)
      expect(key).toBe('john doe')
    })

    it('should fall back to ID when no other fields available', () => {
      const minimalContact = { 
        id: '123',
        name: null,
        email: null,
        company: null,
        workspaceId: 'ws1',
        status: 'ACTIVE',
        verifiedStatus: 'VALID',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const key = contactKey(minimalContact)
      expect(key).toBe('123')
    })
  })

  describe('groupByKey', () => {
    it('should group contacts by their keys', () => {
      const groups = groupByKey(mockContacts)
      expect(Object.keys(groups)).toHaveLength(2) // 2 unique keys
      expect(groups['john@example.com']).toHaveLength(2) // 2 contacts with same email
      expect(groups['jane@example.com']).toHaveLength(1) // 1 contact with unique email
    })
  })

  describe('findDuplicateGroups', () => {
    it('should find groups with more than one contact', () => {
      const duplicateGroups = findDuplicateGroups(mockContacts)
      expect(duplicateGroups).toHaveLength(1) // Only one group has duplicates
      expect(duplicateGroups[0].count).toBe(2) // 2 contacts in duplicate group
      expect(duplicateGroups[0].key).toBe('john@example.com')
    })

    it('should sort groups by count descending', () => {
      const duplicateGroups = findDuplicateGroups(mockContacts)
      expect(duplicateGroups[0].count).toBeGreaterThanOrEqual(duplicateGroups[duplicateGroups.length - 1]?.count || 0)
    })
  })

  describe('mergeContacts', () => {
    it('should merge contacts keeping the specified contact as target', () => {
      const merged = mergeContacts(mockContacts.slice(0, 2), '1')
      expect(merged).toBeDefined()
      expect(merged?.id).toBe('1')
      expect(merged?.name).toBe('John Doe')
      expect(merged?.email).toBe('john@example.com')
      expect(merged?.title).toBe('CEO') // From first contact
      expect(merged?.tags).toContain('important')
      expect(merged?.tags).toContain('ceo')
      expect(merged?.tags).toContain('contact')
    })

    it('should return null if target contact not found', () => {
      const merged = mergeContacts(mockContacts.slice(0, 2), '999')
      expect(merged).toBeNull()
    })

    it('should merge notes with separator', () => {
      const contactsWithNotes = [
        { ...mockContacts[0], notes: 'First note' },
        { ...mockContacts[1], notes: 'Second note' }
      ]
      const merged = mergeContacts(contactsWithNotes, '1')
      expect(merged?.notes).toContain('First note')
      expect(merged?.notes).toContain('Second note')
      expect(merged?.notes).toContain('Merged from 2')
    })
  })
})
