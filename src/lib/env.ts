import { z } from "zod";

// Central schema for server-side env (secrets stay here)
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development","test","production"]).default("development"),

  // App
  APP_ENV: z.enum(["development","staging","production"]).default("development"),
  APP_URL: z.string().url().optional(),

  // Database
  DATABASE_URL: z.string().optional(),

  // Feature flags
  FEATURE_OBSERVABILITY: z.string().default("false"),
  FEATURE_DEMO_AUTH: z.string().default("false"),
  FEATURE_BILLING_ENABLED: z.string().default("false"),
  FEATURE_MATCH_LOCAL_ENABLED: z.string().default("false"),
  FEATURE_ONE_TOUCH: z.string().default("false"),
  FEATURE_REALTIME: z.string().default("false"),
  FEATURE_CONTACTS_DEDUPE: z.string().default("false"),
  FEATURE_CONTACTS_BULK: z.string().default("false"),
  FEATURE_BRANDRUN_PROGRESS_VIZ: z.string().default("false"),
  FEATURE_TIKTOK_ENABLED: z.enum(['true','false']).default('false'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_PRO: z.string().optional(),
  STRIPE_PRICE_AGENCY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),

  // Email
  SENDGRID_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  SMTP_URL: z.string().optional(),

  // Social / external
  YOUTUBE_API_KEY: z.string().optional(),
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  EXA_API_KEY: z.string().optional(),
  APOLLO_API_KEY: z.string().optional(),
  HUNTER_API_KEY: z.string().optional(),
  TIKTOK_CLIENT_KEY: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  TIKTOK_REDIRECT_URI: z.string().optional(),
  TIKTOK_SCOPES: z.string().optional(),
  TIKTOK_AUTH_BASE: z.string().optional(),
  TIKTOK_API_BASE: z.string().optional(),
  TIKTOK_REFRESH_SUPPORTED: z.string().default("false"),

  // NextAuth / auth
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Additional env vars used in codebase
  MEDIAPACK_V2: z.string().optional(),
  MEDIA_PACK_SIGNING_SECRET: z.string().optional(),
  DEMO_MODE: z.string().optional(),
  LOG_LEVEL: z.string().optional(),
  SECRET_MASTER_KEY: z.string().optional(),
  OBS_ENABLE: z.string().optional(),
  OPENAI_MODEL_JSON: z.string().optional(),
  OPENAI_MODEL_FALLBACK: z.string().optional(),
  OPENAI_TIMEOUT_MS: z.string().optional(),
  OPENAI_MAX_RETRIES: z.string().optional(),
  AI_DRY_RUN: z.string().optional(),
  AI_DEFAULT_TIMEOUT_MS: z.string().optional(),
  AI_DEFAULT_MAX_RETRIES: z.string().optional(),
  AI_BACKOFF_BASE_MS: z.string().optional(),
  AI_COSTS_CPM_INPUT_USD: z.string().optional(),
  AI_COSTS_CPM_OUTPUT_USD: z.string().optional(),
  FLAG_ADMIN_CONSOLE: z.string().optional(),
  SOCIAL_YOUTUBE_ENABLED: z.string().optional(),
  SOCIAL_INSTAGRAM_ENABLED: z.string().optional(),
  SOCIAL_TIKTOK_ENABLED: z.enum(['true','false']).default('false'),
  AUDIT_INLINE: z
    .string()
    .optional()
    .transform(v => v === 'true')
    .default(false),
  SNAPSHOT_TTL_HOURS: z.string().optional(),
  ALLOW_CONTACTS_MOCK: z.string().optional(),
  WORKSPACE_SLUG: z.string().optional(),
  PRISMA_VERSION: z.string().optional(),
  CHROME_EXECUTABLE_PATH: z.string().optional(),
  PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: z.string().optional(),
  BILLING_PUBLIC_URL: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  OPENAI_MAX_TOKENS: z.string().optional(),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_REALTIME: z.string().optional(),
  NEXT_PUBLIC_DEMO_MODE: z.string().optional(),
  NEXT_PUBLIC_DEV_DEMO_AUTH: z.string().optional(),
  NEXT_PUBLIC_ENABLE_DEMO_AUTH: z.string().optional(),
  ENABLE_DEMO_AUTH: z.string().optional(),
  
  // Feature flags for client-side use
  NEXT_PUBLIC_AI_ADAPT_FEEDBACK: z.string().optional(),
  NEXT_PUBLIC_PWA_ENABLED: z.string().optional(),
  NEXT_PUBLIC_PUSH_ENABLED: z.string().optional(),
  NEXT_PUBLIC_CRM_LIGHT_ENABLED: z.string().optional(),
  NEXT_PUBLIC_SAFETY_MODERATION: z.string().optional(),
  NEXT_PUBLIC_NETFX_ENABLED: z.string().optional(),
  NEXT_PUBLIC_NETFX_AB_ENABLED: z.string().optional(),
  NEXT_PUBLIC_NETFX_KMIN: z.string().optional(),
  NEXT_PUBLIC_NETFX_DP_EPSILON: z.string().optional(),
  NEXT_PUBLIC_NETFX_PLAYBOOKS: z.string().optional(),
  NEXT_PUBLIC_FEATURE_CONTACTS_BULK: z.string().optional(),
  NEXT_PUBLIC_FEATURE_BRANDRUN_PROGRESS_VIZ: z.string().optional(),
  NEXT_PUBLIC_FEATURE_CONTACTS_DEDUPE: z.string().optional(),
  NEXT_PUBLIC_FEATURE_OBSERVABILITY: z.string().optional(),
  NEXT_PUBLIC_BRANDRUN_V3: z.string().default(process.env.NODE_ENV === "development" ? "true" : "false"),
  NEXT_PUBLIC_TIKTOK_REFRESH_SUPPORTED: z.string().default("false"),
});

// Parse once, don't throw at import time
const _server = EnvSchema.safeParse(process.env);
if (!_server.success) {
  console.error("Invalid server environment variables:", _server.error.flatten().fieldErrors);
}

export const serverEnv = _server.success ? _server.data : ({} as z.infer<typeof EnvSchema>);

export function requireServerEnv() {
  if (!_server.success) {
    throw new Error("Invalid server environment variables");
  }
  return serverEnv;
}

export const env = serverEnv; // Legacy export for backward compatibility

// Helper: read optional vars as booleans conveniently
export const flag = (v?: string) => v === "true";

// For consumers that want optional typed access
export const optional = <T extends keyof typeof env>(key: T) => env[key] ?? undefined;

// Helper: check if we're in development mode
export const isDevelopment = () => env.NODE_ENV === "development";

// Provider availability helpers
export const providers = {
  stripe: Boolean(serverEnv.STRIPE_SECRET_KEY),
  apollo: Boolean(serverEnv.APOLLO_API_KEY),
  hunter: Boolean(serverEnv.HUNTER_API_KEY),
  exa: Boolean(serverEnv.EXA_API_KEY),
  email:
    Boolean(serverEnv.SENDGRID_API_KEY) ||
    Boolean(serverEnv.RESEND_API_KEY) ||
    Boolean(serverEnv.SMTP_URL),
};
