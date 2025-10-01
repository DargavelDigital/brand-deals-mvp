// Force bundler to include @netlify/blobs v6
// This file ensures the correct SDK is bundled

import { put, get, delete: del, list } from "@netlify/blobs";

// Export these to force bundler to include them
export { put, get, del, list };

// Test function to verify correct SDK
export function testBlobsSDK() {
  return {
    hasPut: typeof put === "function",
    hasGet: typeof get === "function", 
    hasDelete: typeof del === "function",
    hasList: typeof list === "function",
    sdkVersion: "v6+"
  };
}
