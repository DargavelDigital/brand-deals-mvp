export const flags = {
  'ai.adapt.feedback': process.env.AI_ADAPT_FEEDBACK === '1',
  'pwa.enabled': process.env.PWA_ENABLED === '1',
  'push.enabled': process.env.PUSH_ENABLED === '1',
  'crm.light.enabled': process.env.CRM_LIGHT_ENABLED === '1',
  'compliance.mode': process.env.COMPLIANCE_MODE === '1',
  'safety.moderation': process.env.SAFETY_MODERATION === '1',
  'exports.enabled': process.env.EXPORTS_ENABLED === '1',
  'retention.enabled': process.env.RETENTION_ENABLED === '1',
  // Add other flags here as needed
} as const;

export function isOn(key: keyof typeof flags): boolean {
  return !!flags[key];
}

export function isOff(key: keyof typeof flags): boolean {
  return !flags[key];
}
