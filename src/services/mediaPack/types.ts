export type MediaPackVariant = 'classic' | 'bold' | 'editorial'
export type ThemeTokens = {
  mode: 'light' | 'dark'
  brandColor: string
  accent: string
  surface: string
  text: string
}
export type MediaPackInput = {
  workspaceId: string
  variant: MediaPackVariant
  theme?: Partial<ThemeTokens>
  brandIds: string[]
  includeAISummary?: boolean
}
export type MediaPackResult = {
  id: string
  htmlUrl: string
  pdfUrl: string
  variant: MediaPackVariant
}
export const defaultTheme: ThemeTokens = {
  mode: 'light',
  brandColor: '#3b82f6',
  accent: '#06b6d4',
  surface: '#ffffff',
  text: '#0b0b0c',
}
