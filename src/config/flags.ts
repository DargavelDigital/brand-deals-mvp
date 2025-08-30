export const flags = {
  'ai.adapt.feedback': process.env.AI_ADAPT_FEEDBACK === '1',
  // Add other flags here as needed
} as const;

export function isOn(key: keyof typeof flags): boolean {
  return !!flags[key];
}

export function isOff(key: keyof typeof flags): boolean {
  return !flags[key];
}
