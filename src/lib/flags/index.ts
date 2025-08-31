// Feature flags helper for the application
// This provides a centralized way to check feature flags

function isTrue(value: string | undefined): boolean {
  return value === 'true' || value === '1';
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
};
