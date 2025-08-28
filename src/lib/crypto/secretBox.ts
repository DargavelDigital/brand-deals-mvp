import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALG = 'aes-256-gcm'

function keyBuf() {
  const hex = process.env.SECRET_MASTER_KEY
  if (!hex) throw new Error('SECRET_MASTER_KEY missing')
  const buf = Buffer.from(hex, hex.length === 64 ? 'hex' : 'utf8')
  if (![32].includes(buf.length)) throw new Error('MASTER_KEY must be 32 bytes')
  return buf
}

export function encrypt(data: Buffer | string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALG, keyBuf(), iv)
  const enc = Buffer.concat([cipher.update(typeof data === 'string' ? Buffer.from(data) : data), cipher.final()])
  const tag = cipher.getAuthTag()
  return { enc, iv, tag }
}

export function decrypt(enc: Buffer, iv: Buffer, tag: Buffer) {
  const decipher = createDecipheriv(ALG, keyBuf(), iv)
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(enc), decipher.final()])
  return dec
}
