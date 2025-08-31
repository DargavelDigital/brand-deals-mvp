// Client-safe feature flags - only uses NEXT_PUBLIC environment variables
// This file can be imported in both client and server components

// Helper function to safely read NEXT_PUBLIC environment variables
function getPublicFlag(key: string): boolean {
  if (typeof window === 'undefined') {
    // Server-side: use process.env directly
    return process.env[key] === 'true';
  }
  // Client-side: NEXT_PUBLIC variables are available at build time
  // They get embedded into the client bundle, so we can access them directly
  return process.env[key] === 'true';
}

// Helper function to safely read NEXT_PUBLIC environment variables
function getPublicString(key: string): string | undefined {
  if (typeof window === 'undefined') {
    // Server-side: use process.env directly
    return process.env[key];
  }
  // Client-side: use window.__NEXT_DATA__ or fallback
  return undefined;
}

export const flags = {
  'ai.adapt.feedback': getPublicFlag('NEXT_PUBLIC_AI_ADAPT_FEEDBACK'),
  'pwa.enabled': getPublicFlag('NEXT_PUBLIC_PWA_ENABLED'),
  'push.enabled': getPublicFlag('NEXT_PUBLIC_PUSH_ENABLED'),
  'crm.light.enabled': getPublicFlag('NEXT_PUBLIC_CRM_LIGHT_ENABLED'),
  'compliance.mode': getPublicFlag('NEXT_PUBLIC_COMPLIANCE_MODE'),
  'safety.moderation': getPublicFlag('NEXT_PUBLIC_SAFETY_MODERATION'),
  'exports.enabled': getPublicFlag('NEXT_PUBLIC_EXPORTS_ENABLED'),
  'retention.enabled': getPublicFlag('NEXT_PUBLIC_RETENTION_ENABLED'),
  'netfx.enabled': getPublicFlag('NEXT_PUBLIC_NETFX_ENABLED'),
  'netfx.ab.enabled': getPublicFlag('NEXT_PUBLIC_NETFX_AB_ENABLED'),
  'netfx.kmin': parseInt(getPublicString('NEXT_PUBLIC_NETFX_KMIN') || '10', 10),
  'netfx.dp.epsilon': parseFloat(getPublicString('NEXT_PUBLIC_NETFX_DP_EPSILON') || '20'), // bigger = less noise
  'netfx.playbooks.enabled': getPublicFlag('NEXT_PUBLIC_NETFX_PLAYBOOKS'),
  
  // Contacts features
  contacts: {
    dedupe: getPublicFlag('NEXT_PUBLIC_FEATURE_CONTACTS_DEDUPE'),
    bulk: getPublicFlag('NEXT_PUBLIC_FEATURE_CONTACTS_BULK'),
  },
  
  // Brand Run features
  brandrun: {
    progressViz: getPublicFlag('NEXT_PUBLIC_FEATURE_BRANDRUN_PROGRESS_VIZ'),
  },
  
  // Observability
  observability: getPublicFlag('NEXT_PUBLIC_FEATURE_OBSERVABILITY'),
} as const;

export function isOn(key: keyof typeof flags): boolean {
  return !!flags[key];
}

export function isOff(key: keyof typeof flags): boolean {
  return !flags[key];
}

export function getFlag<T extends keyof typeof flags>(key: T) {
  return flags[key];
}
