/**
 * Geolocation utilities with non-prompting guards
 * Prevents automatic geolocation prompts while allowing user-initiated requests
 */

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * Get current position with non-prompting guard
 * Only requests location if permission is already granted
 */
export async function getCurrentPositionSafely(
  onSuccess: (coords: GeolocationCoords) => void,
  onError?: (error: GeolocationPositionError) => void,
  options: GeolocationOptions = {}
): Promise<void> {
  // Check if we're in a browser environment
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    onError?.(new Error("Geolocation not supported") as GeolocationPositionError);
    return;
  }

  // Don't trigger a prompt. Only run if already granted.
  try {
    const perm = await (navigator.permissions as any)?.query?.({ 
      name: "geolocation" as PermissionName 
    });
    if (perm && perm.state !== "granted") {
      onError?.(new Error("Geolocation permission not granted") as GeolocationPositionError);
      return;
    }
  } catch {
    // If permissions API is not available, proceed anyway
    // This is a user-initiated call, so it's acceptable
  }

  // Set up cancellation guard
  let cancelled = false;
  const cleanup = () => { cancelled = true; };

  navigator.geolocation.getCurrentPosition(
    (pos) => { 
      if (!cancelled) {
        onSuccess({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      }
    },
    (error) => { 
      if (!cancelled) {
        onError?.(error);
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 300000, // 5 minutes cache
      ...options
    }
  );

  return cleanup;
}

/**
 * Check if geolocation is available and permission is granted
 * Non-blocking check that doesn't trigger prompts
 */
export async function isGeolocationAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return false;
  }

  try {
    const perm = await (navigator.permissions as any)?.query?.({ 
      name: "geolocation" as PermissionName 
    });
    return perm?.state === "granted";
  } catch {
    // If permissions API is not available, assume it's available
    // This allows user-initiated calls to proceed
    return true;
  }
}
