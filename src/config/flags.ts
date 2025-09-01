// Client-safe feature flags - only uses NEXT_PUBLIC environment variables
// This file can be imported in both client and server components

import { getBoolean, get } from '@/lib/clientEnv';

// Helper function to safely read NEXT_PUBLIC environment variables
function getPublicFlag(key: string): boolean {
  // For both server and client, we'll use a consistent approach
  // NEXT_PUBLIC variables are embedded at build time for both environments
  // We'll use a try-catch to handle cases where process.env is not available
  try {
    return process.env[key] === 'true';
  } catch {
    // If process.env is not available (client-side), return false
    // This prevents hydration mismatches by ensuring consistent behavior
    return false;
  }
}

// Alternative approach: use build-time constants for critical flags
// This ensures consistent values between server and client
const CRM_LIGHT_ENABLED = getBoolean('NEXT_PUBLIC_CRM_LIGHT_ENABLED');

// Helper function to safely read NEXT_PUBLIC environment variables
function getPublicString(key: string): string | undefined {
  if (typeof window === 'undefined') {
    // Server-side: use process.env directly
    return process.env[key];
  }
  // Client-side: use window.__NEXT_DATA__ or fallback
  return undefined;
}

// Client flags export with safe defaults
export const clientFlags = {
  'crm.light.enabled': getBoolean('NEXT_PUBLIC_CRM_LIGHT_ENABLED'),
} as const;

// Helper function for client components
export function useClientFlag(key: keyof typeof clientFlags, fallback = false) {
  return clientFlags[key] ?? fallback;
}

export const flags = {
  'ai.adapt.feedback': getPublicFlag('NEXT_PUBLIC_AI_ADAPT_FEEDBACK'),
  'pwa.enabled': getPublicFlag('NEXT_PUBLIC_PWA_ENABLED'),
  'push.enabled': getPublicFlag('NEXT_PUBLIC_PUSH_ENABLED'),
  'crm.light.enabled': CRM_LIGHT_ENABLED,
  'safety.moderation': getPublicFlag('NEXT_PUBLIC_SAFETY_MODERATION'),
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
  
  // Inbox features
  'inbox.pro.enabled': true, // Always enabled for development
  
  // CRM features
  'crm.reminders.enabled': true, // Always enabled for development
  
  // Outreach features
  'outreach.tones.enabled': true, // Always enabled for development
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
