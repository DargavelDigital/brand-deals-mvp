// src/config/flags.ts
export const flags = {
  apiIntegrationsVisible:
    (process.env.NEXT_PUBLIC_API_INTEGRATIONS_VISIBLE ?? "false").toLowerCase() === "true",
};