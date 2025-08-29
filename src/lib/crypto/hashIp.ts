import crypto from 'crypto'

export function hashIp(ip: string) {
  if (!ip) return undefined
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 24)
}
