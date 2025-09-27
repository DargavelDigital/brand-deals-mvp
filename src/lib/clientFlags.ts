export const socialsLaunch = (process.env.NEXT_PUBLIC_LAUNCH_SOCIALS || "instagram")
  .split(",")
  .map((s) => s.trim().toLowerCase());
export const isSocialEnabled = (p: string) => socialsLaunch.includes(p);

// Client-side flag hook for compatibility
export function useClientFlag(flagName: string, defaultValue: boolean = false): boolean {
  // This is a simple implementation - in a real app you might want to use a proper hook
  if (typeof window === 'undefined') return defaultValue;
  
  // Map flag names to environment variables or other sources
  switch (flagName) {
    case 'crm.light.enabled':
      return process.env.NEXT_PUBLIC_CRM_LIGHT_ENABLED === 'true';
    default:
      return defaultValue;
  }
}