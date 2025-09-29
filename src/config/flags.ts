// src/config/flags.ts

/**
 * Backward-compatible feature flag helpers.
 * - getFlag: read env (server or NEXT_PUBLIC_ on client) → boolean
 * - isOn: alias used across the app
 *
 * IMPORTANT: We intentionally keep these helpers stable so admin/telemetry
 * and server routes that import { isOn, getFlag } continue to work.
 */

function readEnv(name: string): string | undefined {
  // Prefer exact name, then NEXT_PUBLIC_ variant for client-side
  return process.env[name] ?? process.env[`NEXT_PUBLIC_${name}`];
}

export function getFlag(name: string, defaultValue = false): boolean {
  const raw = readEnv(name);
  if (raw == null) return defaultValue;
  const v = String(raw).trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on" || v === "enabled";
}

export function isOn(name: string): boolean {
  return getFlag(name, false);
}

/**
 * Centralized flags used by UI. Keep this minimal and stable.
 * You can add more named flags here over time.
 */
export const flags = {
  // Hide/show the Settings → "API & Integrations" card (default hidden)
  apiIntegrationsVisible: getFlag("NEXT_PUBLIC_API_INTEGRATIONS_VISIBLE", false),

  // Launch mode (true = IG-only mode UI toggles). Safe default = true.
  igLaunchOnly: getFlag("NEXT_PUBLIC_IG_LAUNCH_ONLY", true),
};