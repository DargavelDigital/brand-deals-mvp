/**
 * Client-side environment variable helper
 * Centralizes defaults and provides type-safe access to NEXT_PUBLIC_* variables
 */

type ClientEnvKey = 
  | 'NODE_ENV'
  | 'NEXT_PUBLIC_CRM_LIGHT_ENABLED'
  | 'NEXT_PUBLIC_FEATURE_CONTACTS_DEDUPE'
  | 'NEXT_PUBLIC_FEATURE_CONTACTS_BULK'
  | 'NEXT_PUBLIC_ENABLE_DEMO_AUTH'
  | 'NEXT_PUBLIC_VAPID_PUBLIC_KEY'
  | 'NEXT_PUBLIC_DEMO_MODE'
  | 'NEXT_PUBLIC_REALTIME'
  | 'NEXT_PUBLIC_CRM_DEBUG'
  | 'NEXT_PUBLIC_AI_ADAPT_FEEDBACK'
  | 'NEXT_PUBLIC_PWA_ENABLED'
  | 'NEXT_PUBLIC_PUSH_ENABLED'
  | 'NEXT_PUBLIC_SAFETY_MODERATION'
  | 'NEXT_PUBLIC_NETFX_ENABLED'
  | 'NEXT_PUBLIC_NETFX_AB_ENABLED'
  | 'NEXT_PUBLIC_NETFX_KMIN'
  | 'NEXT_PUBLIC_NETFX_DP_EPSILON'
  | 'NEXT_PUBLIC_NETFX_PLAYBOOKS'
  | 'NEXT_PUBLIC_FEATURE_BRANDRUN_PROGRESS_VIZ'
  | 'NEXT_PUBLIC_FEATURE_OBSERVABILITY'
  | 'NEXT_PUBLIC_DEV_DEMO_AUTH'
  | 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY';

// Default values for client environment variables
const CLIENT_ENV_DEFAULTS: Record<ClientEnvKey, string | undefined> = {
  'NODE_ENV': 'development',
  'NEXT_PUBLIC_CRM_LIGHT_ENABLED': 'false',
  'NEXT_PUBLIC_FEATURE_CONTACTS_DEDUPE': 'false',
  'NEXT_PUBLIC_FEATURE_CONTACTS_BULK': 'false',
  'NEXT_PUBLIC_ENABLE_DEMO_AUTH': 'false',
  'NEXT_PUBLIC_VAPID_PUBLIC_KEY': undefined,
  'NEXT_PUBLIC_DEMO_MODE': 'false',
  'NEXT_PUBLIC_REALTIME': 'false',
  'NEXT_PUBLIC_CRM_DEBUG': 'false',
  'NEXT_PUBLIC_AI_ADAPT_FEEDBACK': 'false',
  'NEXT_PUBLIC_PWA_ENABLED': 'false',
  'NEXT_PUBLIC_PUSH_ENABLED': 'false',
  'NEXT_PUBLIC_SAFETY_MODERATION': 'false',
  'NEXT_PUBLIC_NETFX_ENABLED': 'false',
  'NEXT_PUBLIC_NETFX_AB_ENABLED': 'false',
  'NEXT_PUBLIC_NETFX_KMIN': undefined,
  'NEXT_PUBLIC_NETFX_DP_EPSILON': undefined,
  'NEXT_PUBLIC_NETFX_PLAYBOOKS': 'false',
  'NEXT_PUBLIC_FEATURE_BRANDRUN_PROGRESS_VIZ': 'false',
  'NEXT_PUBLIC_FEATURE_OBSERVABILITY': 'false',
  'NEXT_PUBLIC_DEV_DEMO_AUTH': 'false',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': undefined,
};

/**
 * Get a client-side environment variable with optional default value
 * @param key - The environment variable key (must start with NEXT_PUBLIC_)
 * @param defaultValue - Optional default value if not set
 * @returns The environment variable value or default
 * @throws Error if key is required but not set and no default provided
 */
export function get(key: ClientEnvKey, defaultValue?: string): string {
  const value = process.env[key];
  
  if (value !== undefined) {
    return value;
  }
  
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  
  const envDefault = CLIENT_ENV_DEFAULTS[key];
  if (envDefault !== undefined) {
    return envDefault;
  }
  
  throw new Error(`Required client environment variable ${key} is not set and no default provided`);
}

/**
 * Get a client-side environment variable as a boolean
 * @param key - The environment variable key
 * @param defaultValue - Optional default boolean value
 * @returns The boolean value
 */
export function getBoolean(key: ClientEnvKey, defaultValue?: boolean): boolean {
  const value = get(key, defaultValue?.toString());
  return value === 'true' || value === '1';
}

/**
 * Get a client-side environment variable as a number
 * @param key - The environment variable key
 * @param defaultValue - Optional default number value
 * @returns The number value
 */
export function getNumber(key: ClientEnvKey, defaultValue?: number): number {
  const value = get(key, defaultValue?.toString());
  const parsed = Number(value);
  if (isNaN(parsed)) {
    throw new Error(`Invalid number value for ${key}: ${value}`);
  }
  return parsed;
}

/**
 * Check if a client-side environment variable is set to a truthy value
 * @param key - The environment variable key
 * @returns True if the value is truthy ('true', '1', etc.)
 */
export function isEnabled(key: ClientEnvKey): boolean {
  const value = process.env[key];
  return value === 'true' || value === '1';
}

/**
 * Get all client environment variables with their current values
 * @returns Object with all client env vars and their values
 */
export function getAll(): Record<ClientEnvKey, string | undefined> {
  const result = {} as Record<ClientEnvKey, string | undefined>;
  
  for (const key of Object.keys(CLIENT_ENV_DEFAULTS) as ClientEnvKey[]) {
    result[key] = process.env[key] ?? CLIENT_ENV_DEFAULTS[key];
  }
  
  return result;
}
