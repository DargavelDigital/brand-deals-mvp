import { describe, it, expect } from 'vitest'
import { roleAtLeast } from '../src/lib/auth/types'

describe('roleAtLeast', () => {
  const cases: Array<[any, any, boolean]> = [
    ['owner','admin', true],
    ['admin','owner', false],
    ['member','viewer', true],
    ['viewer','member', false],
    ['owner','owner', true],
    ['admin','admin', true],
    ['member','member', true],
    ['viewer','viewer', true],
    ['owner','viewer', true],
    ['admin','member', true],
    ['member','admin', false],
    ['viewer','admin', false],
  ]
  
  for (const [have, need, out] of cases) {
    it(`${have} >= ${need} -> ${out}`, () => {
      expect(roleAtLeast(have, need)).toBe(out)
    })
  }

  it('should handle invalid roles gracefully', () => {
    // Invalid roles return undefined, so undefined >= undefined = false
    expect(roleAtLeast('invalid' as any, 'admin')).toBe(false)
    expect(roleAtLeast('admin', 'invalid' as any)).toBe(false)
    expect(roleAtLeast('invalid' as any, 'invalid' as any)).toBe(false)
  })
})
