/**
 * Returns a logo URL for a given domain using Clearbit.
 * Falls back to the app placeholder route if domain is missing/invalid.
 */
export function getBrandLogo(domain?: string | null, size: number = 40): string {
  if (domain && typeof domain === 'string') {
    const clean = domain.trim().replace(/^https?:\/\//, '').replace(/\/.+$/, '');
    if (clean) {
      // Clearbit serves variable-size favicons; keep URL simple
      return `https://logo.clearbit.com/${clean}`;
    }
  }
  // keep our placeholder route; keep size in path to avoid CLS
  return `/api/placeholder/${size}/${size}`;
}

/**
 * A simple onError handler assignment string for <img> tags
 * that swaps src to placeholder if Clearbit fails.
 */
export function onLogoError(el: HTMLImageElement, size: number = 40) {
  el.onerror = null;
  el.src = `/api/placeholder/${size}/${size}`;
}
