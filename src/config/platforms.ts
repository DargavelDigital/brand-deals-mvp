export type PlatformId =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'x'
  | 'facebook'
  | 'linkedin'
  | 'onlyfans'

export type Platform = {
  id: PlatformId
  label: string
  href?: string // optionally link to per-platform connect, if you add later
  enabled?: boolean // Whether platform is functional (default: false = coming soon)
  visible?: boolean // Whether to show in UI (default: true)
}

export const PLATFORMS: Platform[] = [
  { id: 'instagram', label: 'Instagram', enabled: true, visible: true },
  { id: 'youtube', label: 'YouTube', enabled: false, visible: true },
  { id: 'tiktok', label: 'TikTok', enabled: false, visible: true },
  { id: 'onlyfans', label: 'OnlyFans', enabled: false, visible: true },
  { id: 'x', label: 'X (Twitter)', enabled: false, visible: false },
  { id: 'facebook', label: 'Facebook', enabled: false, visible: false },
  { id: 'linkedin', label: 'LinkedIn', enabled: false, visible: false },
]
