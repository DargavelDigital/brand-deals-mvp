// src/config/flags.ts
// Single, backward-compatible place to read feature flags.

import { flags as libFlags } from '@/lib/flags'

// Map dotted aliases -> camelCase used in libFlags/env today
const ALIASES: Record<string, string> = {
  'mediapack.v2': 'mediapackV2',
  'ai.adapt.feedback': 'aiAdaptFeedback',
  'netfx.enabled': 'netfxEnabled',
  // add others here as you encounter them
};

function toEnvKeys(key: string) {
  // FEATURE_MEDIAPACK_V2 and MEDIAPACK_V2
  const dotted = key.includes('.') ? key : fromCamelToDotted(key);
  const snake = dotted.toUpperCase().replace(/\./g, '_');
  return {
    feature: `FEATURE_${snake}`,
    plain: snake, // MEDIAPACK_V2 style
  };
}

function fromCamelToDotted(k: string) {
  // mediapackV2 -> mediapack.v2
  return k.replace(/([a-z])([A-Z])/g, (_, a, b) => `${a}.${b.toLowerCase()}`);
}

function resolveKey(key: string) {
  return ALIASES[key] ?? key;
}

export function getFlag(key: string, fallback = false): boolean {
  const resolved = resolveKey(key);

  // 1) explicit flags object from lib
  if (resolved in libFlags) {
    // @ts-expect-error index access
    const v = libFlags[resolved];
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') return v === 'true';
  }

  // 2) env bridges (both styles)
  const { feature, plain } = toEnvKeys(resolved);
  const fromEnv =
    process.env[feature] ?? process.env[plain] ?? process.env[key];

  if (typeof fromEnv === 'string') return fromEnv === 'true';

  return fallback;
}

export const isOn = (key: string) => getFlag(key, false) === true;

// Optional: expose raw for debugging
export const flags = { ...libFlags };