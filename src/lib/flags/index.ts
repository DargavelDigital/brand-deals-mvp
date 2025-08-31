/**
 * Unified feature flags that work safely on both server and client
 * Reads from NEXT_PUBLIC_* first, falls back to server env vars
 */

function isTrue(v?: string): boolean {
  return v === '1' || v === 'true'
}

export const flags = {
  contacts: {
    dedupe: isTrue(process.env.NEXT_PUBLIC_FEATURE_CONTACTS_DEDUPE ?? process.env.FEATURE_CONTACTS_DEDUPE),
    bulk: isTrue(process.env.NEXT_PUBLIC_FEATURE_CONTACTS_BULK ?? process.env.FEATURE_CONTACTS_BULK),
  },
  brandrun: {
    progressViz: isTrue(process.env.NEXT_PUBLIC_FEATURE_BRANDRUN_PROGRESS_VIZ ?? process.env.FEATURE_BRANDRUN_PROGRESS_VIZ),
  },
  observability: isTrue(process.env.NEXT_PUBLIC_FEATURE_OBSERVABILITY ?? process.env.FEATURE_OBSERVABILITY),
}
