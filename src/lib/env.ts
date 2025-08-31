import { z } from "zod";

// Central schema for server-side env (secrets stay here)
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development","test","production"]).default("development"),

  // App
  APP_ENV: z.enum(["development","staging","production"]).default("development"),
  APP_URL: z.string().url().optional(),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Feature flags
  FEATURE_OBSERVABILITY: z.string().default("false"),
  FEATURE_DEMO_AUTH: z.string().default("false"),
  FEATURE_BILLING_ENABLED: z.string().default("false"),
  FEATURE_MATCH_LOCAL_ENABLED: z.string().default("false"),
  FEATURE_ONE_TOUCH: z.string().default("false"),
  FEATURE_REALTIME: z.string().default("false"),
  FEATURE_CONTACTS_DEDUPE: z.string().default("false"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),

  // Email
  SENDGRID_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),

  // Social / external
  YOUTUBE_API_KEY: z.string().optional(),
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  EXA_API_KEY: z.string().optional(),

  // NextAuth / auth
  NEXTAUTH_SECRET: z.string().optional(),

  // Additional env vars used in codebase
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
  SOCIAL_TIKTOK_ENABLED: z.string().optional(),
  SNAPSHOT_TTL_HOURS: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_REALTIME: z.string().optional(),
  NEXT_PUBLIC_DEMO_MODE: z.string().optional(),
  NEXT_PUBLIC_DEV_DEMO_AUTH: z.string().optional(),
  NEXT_PUBLIC_ENABLE_DEMO_AUTH: z.string().optional(),
  DEV_DEMO_AUTH: z.string().optional(),
  ENABLE_DEMO_AUTH: z.string().optional(),
  
  // Feature flags for client-side use
  NEXT_PUBLIC_AI_ADAPT_FEEDBACK: z.string().optional(),
  NEXT_PUBLIC_PWA_ENABLED: z.string().optional(),
  NEXT_PUBLIC_PUSH_ENABLED: z.string().optional(),
  NEXT_PUBLIC_CRM_LIGHT_ENABLED: z.string().optional(),
  NEXT_PUBLIC_COMPLIANCE_MODE: z.string().optional(),
  NEXT_PUBLIC_SAFETY_MODERATION: z.string().optional(),
  NEXT_PUBLIC_EXPORTS_ENABLED: z.string().optional(),
  NEXT_PUBLIC_RETENTION_ENABLED: z.string().optional(),
  NEXT_PUBLIC_NETFX_ENABLED: z.string().optional(),
  NEXT_PUBLIC_NETFX_AB_ENABLED: z.string().optional(),
  NEXT_PUBLIC_NETFX_KMIN: z.string().optional(),
  NEXT_PUBLIC_NETFX_DP_EPSILON: z.string().optional(),
  NEXT_PUBLIC_NETFX_PLAYBOOKS: z.string().optional(),
  NEXT_PUBLIC_FEATURE_CONTACTS_DEDUPE: z.string().optional(),
});

// Parse once, throw helpful error in dev if invalid
const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map(i => `- ${i.path.join(".")}: ${i.message}`).join("\n");
  // Throw only on server import; this module must never be bundled to client.
  throw new Error(`Invalid server environment variables:\n${issues}`);
}

export const env = parsed.data;

// Helper: read optional vars as booleans conveniently
export const flag = (v?: string) => v === "true";

// For consumers that want optional typed access
export const optional = <T extends keyof typeof env>(key: T) => env[key] ?? undefined;

// Helper: check if we're in development mode
export const isDevelopment = () => env.NODE_ENV === "development";
