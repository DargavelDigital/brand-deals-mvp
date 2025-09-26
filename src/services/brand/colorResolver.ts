import axios from 'axios';
import Vibrant from 'node-vibrant';
import { log } from '@/lib/log';

export interface BrandColors {
  primary?: string;
  secondary?: string;
}

/**
 * Extract dominant colors from an image URL using node-vibrant
 */
async function extractImageColors(imageUrl: string): Promise<BrandColors> {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();
    
    if (palette.Vibrant && palette.Muted) {
      return {
        primary: palette.Vibrant.getHex(),
        secondary: palette.Muted.getHex()
      };
    } else if (palette.Vibrant) {
      return {
        primary: palette.Vibrant.getHex()
      };
    }
  } catch (error) {
    log.warn(`Failed to extract colors from image: ${imageUrl}`, error);
  }
  
  return {};
}

/**
 * Extract colors from HTML meta tags and favicon
 */
function extractColorsFromHTML(html: string, domain: string): BrandColors {
  const colors: BrandColors = {};
  
  try {
    // Extract theme-color meta tag
    const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
    if (themeColorMatch) {
      colors.primary = normalizeHexColor(themeColorMatch[1]);
    }
    
    // Extract msapplication-TileColor
    const tileColorMatch = html.match(/<meta[^>]*name=["']msapplication-TileColor["'][^>]*content=["']([^"']+)["']/i);
    if (tileColorMatch && !colors.primary) {
      colors.primary = normalizeHexColor(tileColorMatch[1]);
    }
    
    // Extract apple-mobile-web-app-status-bar-style
    const statusBarMatch = html.match(/<meta[^>]*name=["']apple-mobile-web-app-status-bar-style["'][^>]*content=["']([^"']+)["']/i);
    if (statusBarMatch && !colors.secondary) {
      colors.secondary = normalizeHexColor(statusBarMatch[1]);
    }
    
    // Look for favicon to extract secondary color
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i);
    if (faviconMatch) {
      const faviconUrl = faviconMatch[1].startsWith('http') 
        ? faviconMatch[1] 
        : `https://${domain}${faviconMatch[1].startsWith('/') ? '' : '/'}${faviconMatch[1]}`;
      
      // We'll process favicon colors separately if needed
      if (!colors.secondary) {
        colors.secondary = faviconUrl; // Store URL for later processing
      }
    }
    
  } catch (error) {
    log.warn('Failed to extract colors from HTML meta tags:', error);
  }
  
  return colors;
}

/**
 * Normalize color values to hex format
 */
function normalizeHexColor(color: string): string {
  // Fallback colors for common names
  const fallbackColors: Record<string, string> = {
    'black': 'var(--text)',
    'white': 'var(--bg)',
    'red': 'var(--error)',
    'green': 'var(--success)',
    'blue': 'var(--accent)',
    'yellow': 'var(--warn)',
    'cyan': 'var(--info)',
    'magenta': 'var(--accent)',
    'gray': 'var(--muted)',
    'grey': 'var(--muted)',
    'orange': 'var(--warn)',
    'purple': 'var(--accent)',
    'pink': 'var(--accent)',
    'brown': 'var(--warn)'
  };
  
  if (fallbackColors[color.toLowerCase()]) {
    return fallbackColors[color.toLowerCase()];
  }
  
  // Handle hex colors
  if (color.startsWith('#')) {
    // Ensure 6-digit hex
    if (color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    }
    if (color.length === 7) {
      return color.toUpperCase();
    }
  }
  
  // Handle RGB/RGBA
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
  }
  
      // Handle HSL/HSLA
    const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)/);
    if (hslMatch) {
      // Simple HSL to RGB conversion for common cases
      const s = parseInt(hslMatch[2]);
      const l = parseInt(hslMatch[3]);
      
      if (s === 0) {
        const gray = Math.round(l * 255 / 100);
        const hex = gray.toString(16).padStart(2, '0');
        return `#${hex}${hex}${hex}`.toUpperCase();
      }
    }
  
  return color; // Return as-is if we can't normalize
}

/**
 * Resolve brand colors from a domain by fetching the homepage and extracting colors
 */
export async function resolveBrandColors(domain: string): Promise<BrandColors> {
  try {
    log.info(`🎨 Resolving colors for ${domain}...`);
    
    // Fetch homepage HTML
    const response = await axios.get(`https://${domain}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BrandDeals-ColorBot/1.0)'
      }
    });
    
    const html = response.data;
    
    // Extract colors from HTML meta tags
    const colors = extractColorsFromHTML(html, domain);
    
    // If we have a favicon URL stored as secondary, try to extract colors from it
    if (colors.secondary && colors.secondary.startsWith('http')) {
      try {
        const faviconColors = await extractImageColors(colors.secondary);
        if (faviconColors.primary && !colors.primary) {
          colors.primary = faviconColors.primary;
        }
        if (faviconColors.secondary) {
          colors.secondary = faviconColors.secondary;
        } else {
          // If favicon color extraction failed, try to get a reasonable secondary color
          colors.secondary = colors.primary ? adjustColorBrightness(colors.primary, 0.8) : undefined;
        }
      } catch (error) {
        log.warn(`Failed to extract favicon colors for ${domain}:`, error);
        // Generate a secondary color based on primary if available
        if (colors.primary) {
          colors.secondary = adjustColorBrightness(colors.primary, 0.8);
        }
      }
    }
    
    // If we still don't have a secondary color, generate one from primary
    if (colors.primary && !colors.secondary) {
      colors.secondary = adjustColorBrightness(colors.primary, 0.8);
    }
    
    log.info(`✅ Colors resolved for ${domain}:`, colors);
    return colors;
    
  } catch (error) {
    log.warn(`❌ Failed to resolve colors for ${domain}:`, error);
    return {};
  }
}

/**
 * Adjust color brightness for generating secondary colors
 */
function adjustColorBrightness(hexColor: string, factor: number): string {
  try {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`.toUpperCase();
  } catch {
    return hexColor; // Return original if adjustment fails
  }
}
