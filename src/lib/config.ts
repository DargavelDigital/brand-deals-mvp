import { env } from './env'

export const isDemo = () => {
  // Check environment variable first
  if (env.DEMO_MODE === "true") return true;
  
  // In development, also check cookie for session-based demo mode
  if (typeof window !== 'undefined' && isDevelopment()) {
    return document.cookie.includes('demo=1');
  }
  
  return false;
};

export const isDevelopment = () => env.NODE_ENV === "development";

export const isProduction = () => env.NODE_ENV === "production";
