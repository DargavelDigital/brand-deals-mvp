import { z } from 'zod'

const envSchema = z.object({
  // Core app configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Database
  DATABASE_URL: z.string().optional(),
  
  // Feature flags - all OFF by default except observability and demo auth in dev
  FEATURE_BILLING_ENABLED: z.string().transform(val => val === 'true').default('false'),
  FEATURE_OBSERVABILITY: z.string().transform(val => val === 'true').default('false'),
  FEATURE_DEMO_AUTH: z.string().transform(val => val === 'true').default('false'),
  FEATURE_REALTIME: z.string().transform(val => val === 'true').default('false'),
  FEATURE_PUSH_NOTIFICATIONS: z.string().transform(val => val === 'true').default('false'),
  FEATURE_AI_AUDIT_V2: z.string().transform(val => val === 'true').default('false'),
  FEATURE_AI_MATCH_V2: z.string().transform(val => val === 'true').default('false'),
  FEATURE_MEDIA_PACK_V2: z.string().transform(val => val === 'true').default('false'),
  FEATURE_BRAND_RUN_ONETOUCH: z.string().transform(val => val === 'true').default('false'),
  FEATURE_OUTREACH_TONES: z.string().transform(val => val === 'true').default('false'),
  FEATURE_NETFX: z.string().transform(val => val === 'true').default('false'),
  FEATURE_NETFX_AB: z.string().transform(val => val === 'true').default('false'),
  FEATURE_COMPLIANCE_MODE: z.string().transform(val => val === 'true').default('false'),
  FEATURE_SAFETY_MODERATION: z.string().transform(val => val === 'true').default('false'),
  FEATURE_EXPORTS_ENABLED: z.string().transform(val => val === 'true').default('false'),
  FEATURE_RETENTION_ENABLED: z.string().transform(val => val === 'true').default('false'),
  FEATURE_IMPORT_CSV: z.string().transform(val => val === 'true').default('false'),
  FEATURE_IMPORT_SHEETS: z.string().transform(val => val === 'true').default('false'),
  FEATURE_CRM_HUBSPOT: z.string().transform(val => val === 'true').default('false'),
  FEATURE_CRM_PIPEDRIVE: z.string().transform(val => val === 'true').default('false'),
  FEATURE_CALENDAR_GOOGLE: z.string().transform(val => val === 'true').default('false'),
  FEATURE_CALENDAR_MICROSOFT: z.string().transform(val => val === 'true').default('false'),
  FEATURE_MATCH_INTELLIGENCE_V3: z.string().transform(val => val === 'true').default('false'),
  FEATURE_MATCH_READINESS_SIGNALS: z.string().transform(val => val === 'true').default('false'),
  FEATURE_MATCH_CONTINUOUS_DISCOVERY: z.string().transform(val => val === 'true').default('false'),
  FEATURE_MEDIAPACK_LIVE: z.string().transform(val => val === 'true').default('false'),
  FEATURE_MEDIAPACK_AB: z.string().transform(val => val === 'true').default('false'),
  FEATURE_MEDIAPACK_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  FEATURE_MEDIAPACK_CONVERSIONS: z.string().transform(val => val === 'true').default('false'),
  FEATURE_MP_TRACKING: z.string().transform(val => val === 'true').default('false'),
  FEATURE_MP_CONVERSION_DASHBOARD: z.string().transform(val => val === 'true').default('false'),
  
  // Social media features
  SOCIAL_YOUTUBE_ENABLED: z.string().transform(val => val === '1' || val === 'true').default('false'),
  SOCIAL_INSTAGRAM_ENABLED: z.string().transform(val => val === '1' || val === 'true').default('false'),
  SOCIAL_TIKTOK_ENABLED: z.string().transform(val => val === '1' || val === 'true').default('false'),
  SOCIAL_LINKEDIN_ENABLED: z.string().transform(val => val === '1' || val === 'true').default('false'),
  SOCIAL_X_ENABLED: z.string().transform(val => val === '1' || val === 'true').default('false'),
  
  // Demo and development
  DEMO_MODE: z.string().transform(val => val === 'true' || val === '1').default('false'),
  DEV_DEMO_AUTH: z.string().transform(val => val === '1').default('0'),
  NEXT_PUBLIC_DEV_DEMO_AUTH: z.string().transform(val => val === '1').default('0'),
  ENABLE_DEV_AUTH_BYPASS: z.string().transform(val => val === '1').default('0'),
  DEV_WORKSPACE_ID: z.string().optional(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // API Keys (optional in dev)
  OPENAI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  
  // Email configuration
  FROM_EMAIL: z.string().email().optional(),
  MAIL_FROM: z.string().optional(),
  MAIL_DOMAIN: z.string().optional(),
  
  // Cron and webhooks
  CRON_SECRET: z.string().optional(),
  INBOUND_SECRET: z.string().optional(),
  OUTREACH_SCHEDULER_TOKEN: z.string().optional(),
  
  // Observability
  OBS_ENABLE: z.string().transform(val => val === 'true').default('false'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // AI configuration
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_MAX_TOKENS: z.string().transform(val => parseInt(val, 10)).default('1200'),
  OPENAI_JSON: z.string().transform(val => val === 'true').default('false'),
  AI_DRY_RUN: z.string().transform(val => val === 'true').default('false'),
  AI_DEFAULT_TIMEOUT_MS: z.string().transform(val => parseInt(val, 10)).default('28000'),
  AI_DEFAULT_MAX_RETRIES: z.string().transform(val => parseInt(val, 10)).default('1'),
  AI_BACKOFF_BASE_MS: z.string().transform(val => parseInt(val, 10)).default('500'),
  AI_COSTS_CPM_INPUT_USD: z.string().transform(val => parseFloat(val)).default('0.005'),
  AI_COSTS_CPM_OUTPUT_USD: z.string().transform(val => parseFloat(val)).default('0.015'),
  
  // Social media API keys (optional)
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  TIKTOK_CLIENT_KEY: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  X_CLIENT_ID: z.string().optional(),
  X_CLIENT_SECRET: z.string().optional(),
  YOUTUBE_API_KEY: z.string().optional(),
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  YELP_API_KEY: z.string().optional(),
  
  // Media pack
  MEDIA_PACK_SIGNING_SECRET: z.string().default('dev-secret'),
  FILE_STORAGE: z.enum(['local', 's3']).default('local'),
  
  // Safety and compliance
  SAFETY_BLOCKLIST_PATH: z.string().default('./config/blocklists/safety.blocklist.txt'),
  DATA_RETENTION_DEFAULT_DAYS: z.string().transform(val => parseInt(val, 10)).default('365'),
  
  // Network effects
  NETFX_KMIN: z.string().transform(val => parseInt(val, 10)).default('10'),
  NETFX_DP_EPSILON: z.string().transform(val => parseInt(val, 10)).default('20'),
  
  // Push notifications
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),
  
  // Puppeteer
  PUPPETEER_EXECUTABLE_PATH: z.string().optional(),
  
  // Other optional features
  PWA_ENABLED: z.string().transform(val => val === '1').default('false'),
  PUSH_ENABLED: z.string().transform(val => val === '1').default('false'),
  CRM_LIGHT_ENABLED: z.string().transform(val => val === '1').default('false'),
  EXPORTS_ENABLED: z.string().transform(val => val === '1').default('false'),
  RETENTION_ENABLED: z.string().transform(val => val === '1').default('false'),
  
  // Snapshots and caching
  SNAPSHOT_TTL_HOURS: z.string().transform(val => parseInt(val, 10)).default('6'),
  
  // Brand run configuration
  BRANDRUN_SELECT_TOPN: z.string().transform(val => parseInt(val, 10)).default('6'),
  
  // Outreach configuration
  OUTREACH_ENABLED: z.string().transform(val => val === '1').default('false'),
  
  // Realtime
  REALTIME_ENABLED: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_REALTIME: z.string().transform(val => val === 'true').default('false'),
  
  // Import limits
  UPLOAD_MAX_MB: z.string().transform(val => parseInt(val, 10)).default('50'),
  
  // OnlyFans
  OFAUTH_BASE: z.string().optional(),
  OFAUTH_PUBLIC_KEY: z.string().optional(),
  OFAUTH_SECRET: z.string().optional(),
  ONLYFANSAPI_BASE: z.string().optional(),
  ONLYFANSAPI_KEY: z.string().optional(),
  ONLYFANS_ENABLE_MANUAL: z.string().transform(val => val === 'true').default('false'),
  
  // CRM integrations
  HUBSPOT_CLIENT_ID: z.string().optional(),
  HUBSPOT_CLIENT_SECRET: z.string().optional(),
  PIPEDRIVE_API_TOKEN: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  MS_CLIENT_ID: z.string().optional(),
  MS_CLIENT_SECRET: z.string().optional(),
  MS_TENANT_ID: z.string().default('common'),
  
  // Google service account
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  
  // Billing
  BILLING_PUBLIC_URL: z.string().url().optional(),
  
  // Master key for crypto operations
  SECRET_MASTER_KEY: z.string().optional(),
})

// Transform the schema to set development defaults
const envSchemaWithDefaults = envSchema.transform((data) => {
  // Set development-specific defaults
  if (data.NODE_ENV === 'development') {
    data.FEATURE_OBSERVABILITY = true
    data.FEATURE_DEMO_AUTH = true
  }
  
  return data
})

// Parse and validate environment variables
const _env = envSchemaWithDefaults.safeParse(process.env)

if (!_env.success) {
  console.error('❌ Invalid environment variables:')
  console.error(_env.error.format())
  throw new Error('Invalid environment variables')
}

export const env = _env.data

// Type export for use in other files
export type Env = typeof env

// Helper functions for common checks
export const isDevelopment = () => env.NODE_ENV === 'development'
export const isProduction = () => env.NODE_ENV === 'production'
export const isTest = () => env.NODE_ENV === 'test'

export const isDemoMode = () => env.DEMO_MODE
export const isFeatureEnabled = (feature: keyof Pick<Env, `FEATURE_${string}`>) => env[feature]
export const isSocialEnabled = (platform: keyof Pick<Env, `SOCIAL_${string}`>) => env[platform]

// Validate required environment variables for production
// Only run this validation at runtime, not during build
export function validateProductionEnv() {
  if (typeof window === 'undefined' && isProduction()) {
    const requiredInProd = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
    ] as const
    
    for (const key of requiredInProd) {
      if (!env[key]) {
        throw new Error(`Missing required environment variable in production: ${key}`)
      }
    }
  }
}
