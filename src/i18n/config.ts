export const locales = ['en', 'es', 'fr'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'en'

export function isRTL(locale: string) {
  // add 'ar', 'he' later; all current pilots are LTR
  return false
}
