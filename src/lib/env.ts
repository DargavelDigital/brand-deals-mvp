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
