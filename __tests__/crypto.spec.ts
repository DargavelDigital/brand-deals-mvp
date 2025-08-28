import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { encrypt, decrypt } from '../src/lib/crypto/secretBox'

describe('Crypto Functions', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Set a test master key (32 bytes = 64 hex chars)
    process.env.SECRET_MASTER_KEY = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should encrypt and decrypt string data', () => {
    const testData = 'sensitive-api-key-123'
    const encrypted = encrypt(testData)
    
    expect(encrypted.enc).toBeDefined()
    expect(encrypted.iv).toBeDefined()
    expect(encrypted.tag).toBeDefined()
    
    const decrypted = decrypt(encrypted.enc, encrypted.iv, encrypted.tag)
    expect(decrypted.toString('utf8')).toBe(testData)
  })

  it('should encrypt and decrypt buffer data', () => {
    const testData = Buffer.from('binary-secret-data')
    const encrypted = encrypt(testData)
    
    const decrypted = decrypt(encrypted.enc, encrypted.iv, encrypted.tag)
    expect(decrypted).toEqual(testData)
  })

  it('should generate different ciphertexts for same plaintext', () => {
    const testData = 'same-data'
    const encrypted1 = encrypt(testData)
    const encrypted2 = encrypt(testData)
    
    expect(encrypted1.enc).not.toEqual(encrypted2.enc)
    expect(encrypted1.iv).not.toEqual(encrypted2.iv)
    expect(encrypted1.tag).not.toEqual(encrypted2.tag)
  })

  it('should throw error when SECRET_MASTER_KEY is missing', () => {
    delete process.env.SECRET_MASTER_KEY
    expect(() => encrypt('test')).toThrow('SECRET_MASTER_KEY missing')
  })
})
