import { type Locale, defaultLocale } from './config'

export async function getMessages(locale: Locale) {
  try {
    return (await import(`./messages/${locale}.json`)).default
  } catch {
    return (await import(`./messages/${defaultLocale}.json`)).default
  }
}
