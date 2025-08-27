export type PlatformId =
  | 'instagram' | 'tiktok' | 'youtube' | 'x' | 'facebook' | 'linkedin' | 'onlyfans'

export type ConnectionStatus = {
  platform: PlatformId
  connected: boolean
  username?: string
  lastSync?: string | null
  expiresAt?: string | null
  status: 'active' | 'expired' | 'error' | 'none'
  // raw holds whatever the provider/store returned (for debugging)
  raw?: Record<string, any>
}
