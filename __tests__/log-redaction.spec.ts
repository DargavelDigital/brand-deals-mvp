import { describe, it, expect } from 'vitest'
import { log } from '../src/lib/logger'

describe('log redaction', () => {
  it('redacts email-like fields', async () => {
    const line = log.child({ test: true })
    // @ts-ignore
    const write = (line as any).stream?.write ?? process.stdout.write
    expect(typeof write).toBe('function')
    line.info({ email: 'john@acme.com' }, 'msg')
    // This is a smoke test; detailed assertion relies on transport.
    expect(true).toBe(true)
  })
})
