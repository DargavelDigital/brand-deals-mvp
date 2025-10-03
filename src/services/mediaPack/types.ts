export type MediaPackVariant = 'classic' | 'bold' | 'editorial' | 'modern'

export interface ThemeTokens {
  brandColor: string
  dark?: boolean
  onePager?: boolean
}

export const defaultTheme: ThemeTokens = {
  brandColor: '#3b82f6',
  dark: false,
  onePager: false
}

export interface MediaPackPayload {
  creator?: {
    displayName?: string
    handle?: string
    email?: string
    website?: string
    avatarUrl?: string
    bio?: string
  }
  socials?: Array<{
    platform: string
    url?: string
    followers?: number
  }>
  audience?: {
    metrics?: {
      followers?: number
      engagementRate?: number
      monthlyReach?: number
    }
    demographics?: Array<{
      label: string
      value: number
    }>
    locations?: Array<{
      label: string
      value: number
    }>
  }
  contentPillars?: string[]
  caseStudies?: Array<{
    brand: string
    summary: string
    result?: string
  }>
  services?: Array<{
    name: string
    price?: string
    description?: string
  }>
  rateCardNote?: string
  contact?: {
    email?: string
    website?: string
  }
  cta?: {
    text?: string
    url?: string
  }
}
