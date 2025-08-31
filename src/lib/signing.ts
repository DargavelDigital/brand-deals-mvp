import jwt from 'jsonwebtoken'
import { env } from './env'

const SECRET = env.MEDIA_PACK_SIGNING_SECRET || 'dev-secret'
export function signPayload(payload: object, expiresIn = '10m') {
  return jwt.sign(payload, SECRET, { expiresIn })
}
export function verifyToken<T=any>(token: string): T | null {
  try { return jwt.verify(token, SECRET) as T } catch { return null }
}
