import { maskPII } from '../../src/lib/admin/guards'
import { describe, it, expect } from 'vitest'

describe('maskPII', () => {
  it('redacts emails, phones, tokens, and secretish keys', () => {
    const input = {
      email: 'jane@example.com',
      token: 'sk-abc1234567890',
      phone: '447777888999',
      note: 'contact jane@example.com',
      Authorization: 'Bearer abc.def',
    }
    const out = maskPII(input)
    expect(out.email).toBe('[redacted]')
    expect(out.token).toBe('[redacted]')
    expect(out.phone).toBe('[redacted]')
    expect(out.note).not.toContain('@example.com')
    expect(out.Authorization).toBe('[redacted]')
  })
})
