import { env, flag } from '@/lib/env';

export const flags = {
  'ai.adapt.feedback': flag(env.AI_ADAPT_FEEDBACK),
  'pwa.enabled': flag(env.PWA_ENABLED),
  'push.enabled': flag(env.PUSH_ENABLED),
  'crm.light.enabled': flag(env.CRM_LIGHT_ENABLED),
  'compliance.mode': flag(env.COMPLIANCE_MODE),
  'safety.moderation': flag(env.SAFETY_MODERATION),
  'exports.enabled': flag(env.EXPORTS_ENABLED),
  'retention.enabled': flag(env.RETENTION_ENABLED),
  'netfx.enabled': flag(env.NETFX_ENABLED),
  'netfx.ab.enabled': flag(env.NETFX_AB_ENABLED),
  'netfx.kmin': parseInt(env.NETFX_KMIN || '10', 10),
  'netfx.dp.epsilon': parseFloat(env.NETFX_DP_EPSILON || '20'), // bigger = less noise
  'netfx.playbooks.enabled': flag(env.NETFX_PLAYBOOKS),
  // Add other flags here as needed
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
