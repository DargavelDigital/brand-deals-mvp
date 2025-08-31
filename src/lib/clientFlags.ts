// src/lib/clientFlags.ts
'use client'

export function useClientFlag(name: 'crm.light.enabled', fallback = false) {
  // These values are inlined at build time by Next.js for the client bundle
  if (name === 'crm.light.enabled') {
    const v = process.env.NEXT_PUBLIC_CRM_LIGHT_ENABLED;
    return v === 'true' ? true : false; // default expanded when missing
  }
  return fallback;
}
