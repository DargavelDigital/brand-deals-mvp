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
}

export const PLATFORMS: Platform[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'x', label: 'X (Twitter)' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'onlyfans', label: 'OnlyFans' }, // experimental
]
