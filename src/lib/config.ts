export const isDemo = () => {
  // Check environment variable first
  if (process.env.DEMO_MODE === "true") return true;
  
  // In development, also check cookie for session-based demo mode
  if (typeof window !== 'undefined' && isDevelopment()) {
    return document.cookie.includes('demo=1');
  }
  
  return false;
};

export const isDevelopment = () => process.env.NODE_ENV === "development";

export const isProduction = () => process.env.NODE_ENV === "production";
