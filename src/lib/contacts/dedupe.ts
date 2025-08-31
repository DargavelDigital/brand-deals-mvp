import { ContactDTO } from '@/types/contact'

/**
 * Generate a unique key for a contact based on email or name+company
 * Used for detecting potential duplicates
 */
export function contactKey(contact: ContactDTO): string {
  // Primary key: email (most reliable)
  if (contact.email && contact.email.trim()) {
    return contact.email.toLowerCase().trim()
  }
  
  // Fallback: name + company combination
  const name = contact.name?.trim() || ''
  const company = contact.company?.trim() || ''
  
  if (name && company) {
    return `${name.toLowerCase()}|${company.toLowerCase()}`
  } else if (name) {
    return name.toLowerCase()
  } else if (company) {
    return company.toLowerCase()
  }
  
  // Last resort: use ID if nothing else available
  return contact.id
}

/**
 * Group contacts by their deduplication key
 * Returns a record where keys are contact keys and values are arrays of contacts
 */
export function groupByKey(contacts: ContactDTO[]): Record<string, ContactDTO[]> {
  const groups: Record<string, ContactDTO[]> = {}
  
  contacts.forEach(contact => {
    const key = contactKey(contact)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(contact)
  })
  
  return groups
}

/**
 * Find duplicate groups (groups with more than 1 contact)
 */
export function findDuplicateGroups(contacts: ContactDTO[]): Array<{
  key: string
  count: number
  contacts: ContactDTO[]
}> {
  const groups = groupByKey(contacts)
  
  return Object.entries(groups)
    .filter(([_, contacts]) => contacts.length > 1)
    .map(([key, contacts]) => ({
      key,
      count: contacts.length,
      contacts
    }))
    .sort((a, b) => b.count - a.count) // Sort by count descending
}

/**
 * Merge multiple contacts into one, keeping the specified contact as the target
 */
export function mergeContacts(
  contacts: ContactDTO[], 
  keepId: string
): ContactDTO | null {
  const targetContact = contacts.find(c => c.id === keepId)
  if (!targetContact) return null
  
  const otherContacts = contacts.filter(c => c.id !== keepId)
  const merged = { ...targetContact }
  
  // Merge non-empty fields from other contacts
  otherContacts.forEach(contact => {
    // Merge title if target doesn't have one
    if (!merged.title && contact.title) {
      merged.title = contact.title
    }
    
    // Merge phone if target doesn't have one
    if (!merged.phone && contact.phone) {
      merged.phone = contact.phone
    }
    
    // Merge tags (union of all tags)
    const allTags = new Set([
      ...(merged.tags || []),
      ...(contact.tags || [])
    ])
    merged.tags = Array.from(allTags)
    
    // Merge notes with separator
    if (contact.notes) {
      const separator = merged.notes ? '\n---\n' : ''
      merged.notes = `${merged.notes}${separator}${contact.notes}\n---\nMerged from ${contact.id}`
    }
    
    // Merge other fields if they exist and target doesn't
    if (!merged.seniority && contact.seniority) {
      merged.seniority = contact.seniority
    }
    
    if (!merged.department && contact.department) {
      merged.department = contact.department
    }
    
    if (!merged.nextStep && contact.nextStep) {
      merged.nextStep = contact.nextStep
    }
    
    if (!merged.remindAt && contact.remindAt) {
      merged.remindAt = contact.remindAt
    }
  })
  
  return merged
}
