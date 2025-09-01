'use client';

import { useState, useEffect, useMemo } from 'react';

interface BrandLogoProps {
  name: string;
  domain?: string;
  src?: string;
  size?: number;
}

// Simple memory cache to avoid repeat fetches
const logoCache = new Map<string, { url: string; valid: boolean }>();

export default function BrandLogo({ name, domain, src, size = 32 }: BrandLogoProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  
  // Generate initials from name
  const initials = useMemo(() => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [name]);

  // Determine the logo URL
  const logoUrl = useMemo(() => {
    if (src) return src;
    if (domain) return `https://logo.clearbit.com/${domain}`;
    return null;
  }, [src, domain]);

  // Check cache first
  useEffect(() => {
    if (!logoUrl) return;
    
    const cached = logoCache.get(logoUrl);
    if (cached) {
      if (cached.valid) {
        setImageUrl(cached.url);
      } else {
        setImageError(true);
      }
      return;
    }

    // Test if image loads successfully
    const img = new Image();
    img.onload = () => {
      logoCache.set(logoUrl, { url: logoUrl, valid: true });
      setImageUrl(logoUrl);
      setImageError(false);
    };
    img.onerror = () => {
      logoCache.set(logoUrl, { url: logoUrl, valid: false });
      setImageError(true);
    };
    img.src = logoUrl;
  }, [logoUrl]);

  // If we have a valid image URL and no errors, show the image
  if (imageUrl && !imageError) {
    return (
      <img
        src={imageUrl}
        alt={`${name} logo`}
        className="rounded-full object-cover"
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
        }}
      />
    );
  }

  // Fallback to initials in a circle
  return (
    <div
      className="flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text)] font-medium"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        fontSize: Math.max(size * 0.4, 12),
      }}
    >
      {initials}
    </div>
  );
}
