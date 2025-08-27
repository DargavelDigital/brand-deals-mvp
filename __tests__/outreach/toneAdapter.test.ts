import { describe, it, expect } from 'vitest'
import { toneDirectives, toneToOptions } from '../../src/services/outreach/toneAdapter'
import type { OutreachTone } from '../../src/types/outreach'

describe('Tone Adapter', () => {
  const tones: OutreachTone[] = ['professional', 'relaxed', 'fun']

  it('should have distinct directives for each tone', () => {
    const directives = tones.map(tone => toneDirectives[tone])
    
    // Ensure all directives are different
    expect(directives[0]).not.toEqual(directives[1])
    expect(directives[1]).not.toEqual(directives[2])
    expect(directives[0]).not.toEqual(directives[2])
    
    // Snapshot test each tone
    tones.forEach(tone => {
      expect(toneDirectives[tone]).toMatchSnapshot(`tone-${tone}`)
    })
  })

  it('should convert tone to options correctly', () => {
    tones.forEach(tone => {
      const options = toneToOptions(tone)
      expect(options).toEqual({ tone })
    })
  })

  it('should have all required tones defined', () => {
    tones.forEach(tone => {
      expect(toneDirectives[tone]).toBeDefined()
      expect(typeof toneDirectives[tone]).toBe('string')
      expect(toneDirectives[tone].length).toBeGreaterThan(0)
    })
  })
})
