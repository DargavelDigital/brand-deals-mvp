import { describe, it, expect } from 'vitest'
import { roleAtLeast } from '@/lib/auth/types'

describe('roleAtLeast', () => {
  const cases: Array<[any, any, boolean]> = [
    ['owner','admin', true],
    ['admin','owner', false],
    ['member','viewer', true],
    ['viewer','member', false],
  ]
  for (const [have, need, out] of cases) {
    it(`${have} >= ${need} -> ${out}`, () => {
      expect(roleAtLeast(have, need)).toBe(out)
    })
  }
})
