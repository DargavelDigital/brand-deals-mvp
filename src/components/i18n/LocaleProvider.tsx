'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import { isRTL } from '@/i18n/config'

export default function LocaleProvider() {
  const locale = useLocale()
  
  useEffect(() => {
    // Set HTML lang and dir attributes
    document.documentElement.lang = locale
    document.documentElement.dir = isRTL(locale) ? 'rtl' : 'ltr'
  }, [locale])
  
  return null
}
