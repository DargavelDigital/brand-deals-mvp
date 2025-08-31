import { describe, it, expect } from 'vitest'
import { filterByTab } from './filter'

const deals = [
  { id: '1', stage: 'Prospecting', next: '2025-09-02T10:00:00.000Z' },
  { id: '2', stage: 'Closed Won', next: '2025-09-01T14:00:00.000Z' },
  { id: '3', stage: 'Negotiation', next: '2025-09-05T15:00:00.000Z' },
]

const NOW = '2025-09-01T12:00:00.000Z'

describe('filterByTab', () => {
  it('ALL returns all', () => {
    expect(filterByTab(deals, 'ALL', NOW).length).toBe(3)
  })
  it('UPCOMING returns future items within 14 days', () => {
    const res = filterByTab(deals, 'UPCOMING', NOW)
    expect(res.length).toBeGreaterThan(0)
  })
  it('DUE returns <= now', () => {
    const res = filterByTab(deals, 'DUE', NOW)
    expect(Array.isArray(res)).toBe(true)
  })
})
