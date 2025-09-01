// src/lib/clientFlags.ts
'use client'

import { getBoolean } from './clientEnv'

export function useClientFlag(name: 'crm.light.enabled', fallback = false) {
  // These values are inlined at build time by Next.js for the client bundle
  if (name === 'crm.light.enabled') {
    return getBoolean('NEXT_PUBLIC_CRM_LIGHT_ENABLED', fallback);
  }
  return fallback;
}
