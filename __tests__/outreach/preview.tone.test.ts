import { describe, it, expect, vi } from 'vitest'
import { generateOutreachEmail } from '../../src/services/outreach/generateEmail'

vi.mock('../../src/ai/invoke', () => ({
  aiInvoke: vi.fn(async (_k, _input, opts) => {
    if (opts?.tone === 'professional') {
      return { 
        subject: 'Partnership opportunity', 
        body: 'Hi ACME team, I hope this email finds you well. I am reaching out regarding a potential collaboration opportunity that aligns with your brand values and our shared audience.', 
        toneUsed: 'professional' 
      }
    }
    if (opts?.tone === 'relaxed') {
      return { 
        subject: 'Quick idea for ACME', 
        body: 'Hey ACME team — hope you\'re doing great! I wanted to reach out about a fun collaboration idea that I think could really work for both of us.', 
        toneUsed: 'relaxed' 
      }
    }
    return { 
      subject: 'Fun collab idea 🎉', 
      body: 'Hey ACME team 😄 hope you\'re having an awesome day! I\'ve got this super exciting collaboration idea that I think could be absolutely amazing for both of us!', 
      toneUsed: 'fun' 
    }
  }),
}))

describe('Tone output differences', () => {
  const base = { 
    creator: { name: 'A', niche: 'tech', country: 'US', followers: 1000 }, 
    brand: { name: 'ACME', industry: 'tech', category: 'software', country: 'US' }, 
    sequence: { settings: {} } 
  }

  it('professional vs relaxed vs fun differ', async () => {
    const pro = await generateOutreachEmail({}, { ...base, sequence: { settings: { tone: 'professional' } } })
    const rel = await generateOutreachEmail({}, { ...base, sequence: { settings: { tone: 'relaxed' } } })
    const fun = await generateOutreachEmail({}, { ...base, sequence: { settings: { tone: 'fun' } } })

    expect(pro.body).not.toEqual(rel.body)
    expect(rel.body).not.toEqual(fun.body)
    expect(pro.body).not.toEqual(fun.body)

    expect(pro).toMatchSnapshot('professional')
    expect(rel).toMatchSnapshot('relaxed')
    expect(fun).toMatchSnapshot('fun')
  })

  it('defaults to professional tone when none specified', async () => {
    const result = await generateOutreachEmail({}, base)
    expect(result.toneUsed).toBe('professional')
  })

  it('uses sequence settings tone when provided', async () => {
    const result = await generateOutreachEmail({}, { ...base, sequence: { settings: { tone: 'fun' } } })
    expect(result.toneUsed).toBe('fun')
  })
})
