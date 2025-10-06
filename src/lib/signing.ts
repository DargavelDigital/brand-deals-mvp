import jwt from 'jsonwebtoken'
import { env } from './env'

const SECRET = env.MEDIA_PACK_SIGNING_SECRET || 'dev-secret'
export function signPayload(payload: object, expiresIn = '10m') {
  const token = jwt.sign(payload, SECRET, { expiresIn })
  // Make token URL-safe by replacing problematic characters
  return token.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}
export function verifyToken<T=any>(token: string): T | null {
  try { 
    // Convert URL-safe token back to JWT format
    const jwtToken = token.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding if needed
    const paddedToken = jwtToken + '='.repeat((4 - jwtToken.length % 4) % 4)
    return jwt.verify(paddedToken, SECRET) as T 
  } catch { return null }
}
