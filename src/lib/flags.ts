import { prisma } from './prisma'
import { env } from './env'

export type FeatureFlag = 
  | 'AI_AUDIT_V2'
  | 'AI_MATCH_V2'
  | 'MATCH_LOCAL_ENABLED'
  | 'OUTREACH_TONES'
  | 'BRANDRUN_ONETOUCH'
  | 'MEDIAPACK_V2'

// Export the exact FLAG_KEYS as specified
export const FLAG_KEYS: FeatureFlag[] = [
  'AI_AUDIT_V2',
  'AI_MATCH_V2', 
  'MATCH_LOCAL_ENABLED',
  'OUTREACH_TONES',
  'BRANDRUN_ONETOUCH',
  'MEDIAPACK_V2'
]

export type FeatureFlagValue = boolean | string | number

const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  AI_AUDIT_V2: false,
  AI_MATCH_V2: false,
  MATCH_LOCAL_ENABLED: true,  // Enable local brand discovery by default
  OUTREACH_TONES: false,
  BRANDRUN_ONETOUCH: false,
  MEDIAPACK_V2: false,
}

// Add the exact functions from your specifications
const truthy = new Set(['1', 'true', 'on', 'yes'])

export function parseEnvBool(val: string | undefined): boolean {
  if (!val) return false
  return truthy.has(val.toLowerCase())
}

export function allFlags(workspaceFlags?: Record<string, unknown> | null) {
  return (Object.keys(DEFAULT_FLAGS) as FeatureFlag[]).reduce((acc, k) => {
    acc[k] = isFlagEnabledSync(k)
    return acc
  }, {} as Record<FeatureFlag, boolean>)
}

/**
 * Get environment variable value for a feature flag
 */
function getEnvFlag(key: FeatureFlag): boolean {
  const envKey = key as keyof typeof DEFAULT_FLAGS
  const value = env[envKey as keyof typeof env]
  
  if (value === undefined) {
    return DEFAULT_FLAGS[envKey]
  }
  
  // Parse boolean values
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  
  // Default to false for invalid values
  return false
}

/**
 * Get workspace-specific feature flag override
 */
async function getWorkspaceFlag(key: FeatureFlag, workspaceId: string): Promise<boolean | null> {
  try {
    const workspace = await prisma().workspace.findUnique({
      where: { id: workspaceId },
      select: { featureFlags: true }
    })
    
    if (!workspace?.featureFlags) return null
    
    const flags = workspace.featureFlags as Record<string, any>
    return flags[key] ?? null
  } catch (error) {
    console.warn(`Failed to get workspace flag ${key} for ${workspaceId}:`, error)
    return null
  }
}

/**
 * Check if a feature flag is enabled
 * Priority: Workspace override > Environment variable > Default
 */
export async function isFlagEnabled(key: FeatureFlag, workspaceId?: string): Promise<boolean> {
  // Check workspace override first
  if (workspaceId) {
    const workspaceValue = await getWorkspaceFlag(key, workspaceId)
    if (workspaceValue !== null) {
      return Boolean(workspaceValue)
    }
  }
  
  // Fallback to environment variable
  return getEnvFlag(key)
}

// Simple flag function for server-side use
export function flag(name: string) {
  const v = (env[name as keyof typeof env] ?? '').toLowerCase()
  return v === '1' || v === 'true'
}

export const flags = {
  adminConsole: env.FLAG_ADMIN_CONSOLE === '1',
  mediapackV2: flag('MEDIAPACK_V2'),
  outreachEnabled: flag('OUTREACH_ENABLED'),
  contacts: {
    dedupe: flag('FEATURE_CONTACTS_DEDUPE'),
    bulk: flag('FEATURE_CONTACTS_BULK'),
  },
  social: {
    youtube: (env.SOCIAL_YOUTUBE_ENABLED ?? '0').match(/^(1|true)$/i) != null,
    instagram: (() => {
      const result = typeof env.SOCIAL_INSTAGRAM_ENABLED === 'boolean' ? env.SOCIAL_INSTAGRAM_ENABLED : (env.SOCIAL_INSTAGRAM_ENABLED ?? '0').match(/^(1|true)$/i) != null;
      console.log('Instagram feature flag:', { 
        raw: env.SOCIAL_INSTAGRAM_ENABLED, 
        type: typeof env.SOCIAL_INSTAGRAM_ENABLED, 
        result 
      }); // Debug log
      return result;
    })(),
    tiktok: (env.SOCIAL_TIKTOK_ENABLED ?? '0').match(/^(1|true)$/i) != null,
  },
  brandrun: {
    progressViz: flag('BRANDRUN_PROGRESS_VIZ'),
  },
  snapshotTtlHours: Number(env.SNAPSHOT_TTL_HOURS ?? 6),
  qa: {
    aiDryRun: env.AI_DRY_RUN === 'true',
  },
  perf: {
    aiDefaultTimeoutMs: Number(env.AI_DEFAULT_TIMEOUT_MS ?? 90000),  // Increased to 90s for GPT-5 reasoning
    aiDefaultMaxRetries: Number(env.AI_DEFAULT_MAX_RETRIES ?? 1),
    aiBackoffBaseMs: Number(env.AI_BACKOFF_BASE_MS ?? 500),
  },
  costs: {
    defaultCpmInput: Number(env.AI_COSTS_CPM_INPUT_USD ?? 0.005),
    defaultCpmOutput: Number(env.AI_COSTS_CPM_OUTPUT_USD ?? 0.015),
  },
  provider: {
    openai: {
      timeoutMs: Number(env.OPENAI_TIMEOUT_MS ?? 0) || undefined,
      maxRetries: Number(env.OPENAI_MAX_RETRIES ?? 0) || undefined,
    }
  }
}

/**
 * Check if a feature flag is enabled (synchronous version)
 * Only checks environment variables, no workspace overrides
 */
export function isFlagEnabledSync(key: FeatureFlag): boolean {
  return getEnvFlag(key)
}

/**
 * Get all feature flags for a workspace
 */
export async function getWorkspaceFlags(workspaceId: string): Promise<Record<FeatureFlag, boolean>> {
  const flags: Record<FeatureFlag, boolean> = {} as Record<FeatureFlag, boolean>
  
  for (const key of Object.keys(DEFAULT_FLAGS) as FeatureFlag[]) {
    flags[key] = await isFlagEnabled(key, workspaceId)
  }
  
  return flags
}

/**
 * Set a feature flag for a specific workspace
 */
export async function setWorkspaceFlag(
  workspaceId: string, 
  key: FeatureFlag, 
  value: boolean
): Promise<void> {
  try {
    const workspace = await prisma().workspace.findUnique({
      where: { id: workspaceId },
      select: { featureFlags: true }
    })
    
    const currentFlags = (workspace?.featureFlags as Record<string, any>) || {}
    const updatedFlags = { ...currentFlags, [key]: value }
    
    await prisma().workspace.update({
      where: { id: workspaceId },
      data: { featureFlags: updatedFlags }
    })
  } catch (error) {
    console.error(`Failed to set workspace flag ${key} for ${workspaceId}:`, error)
    throw new Error(`Failed to set feature flag: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Reset a workspace feature flag to use environment default
 */
export async function resetWorkspaceFlag(workspaceId: string, key: FeatureFlag): Promise<void> {
  try {
    const workspace = await prisma().workspace.findUnique({
      where: { id: workspaceId },
      select: { featureFlags: true }
    })
    
    if (!workspace?.featureFlags) return
    
    const currentFlags = workspace.featureFlags as Record<string, any>
    const { [key]: removed, ...updatedFlags } = currentFlags
    
    await prisma().workspace.update({
      where: { id: workspaceId },
      data: { featureFlags: updatedFlags }
    })
  } catch (error) {
    console.error(`Failed to reset workspace flag ${key} for ${workspaceId}:`, error)
    throw new Error(`Failed to reset feature flag: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get all available feature flag keys
 */
export function getAvailableFlags(): FeatureFlag[] {
  return Object.keys(DEFAULT_FLAGS) as FeatureFlag[]
}

/**
 * Get default value for a feature flag
 */
export function getDefaultFlagValue(key: FeatureFlag): boolean {
  return DEFAULT_FLAGS[key]
}


