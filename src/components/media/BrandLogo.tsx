'use client';

import { getBrandLogo, onLogoError } from '@/lib/brandLogo';

interface BrandLogoProps {
  domain?: string | null;
  name?: string;
  size?: number;
  className?: string;
  rounded?: boolean;
}

export default function BrandLogo({ domain, name, size = 32, className, rounded = true }: BrandLogoProps) {
  // Generate initials from name
  const initials = name ? 
    name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 
    '?';

  // If neither domain nor name is provided, show fallback
  if (!domain && !name) {
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
        ?
      </div>
    );
  }

  return (
    <img
      src={getBrandLogo(domain, size)}
      width={size}
      height={size}
      alt={`${name ?? domain ?? 'Brand'} logo`}
      className={`inline-block ${rounded !== false ? 'rounded-md' : ''} border border-[var(--border)] object-cover ${className ?? ''}`}
      onError={(e) => onLogoError(e.currentTarget, size)}
    />
  );
}
