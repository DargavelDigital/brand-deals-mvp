import { getBrandLogo } from '@/lib/brandLogo';

interface BrandLogoServerProps {
  domain?: string | null;
  name?: string;
  size?: number;
  className?: string;
  rounded?: boolean;
}

export default function BrandLogoServer({ domain, name, size = 32, className, rounded = true }: BrandLogoServerProps) {
  // Generate initials from name
  const initials = name ? 
    name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 
    '?';

  // If neither domain nor name is provided, show fallback
  if (!domain && !name) {
    return (
      <div 
        className={`bg-gray-200 text-gray-600 flex items-center justify-center font-semibold ${className || ''}`}
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }

  // Get the logo URL (server-safe)
  const logoUrl = getBrandLogo(domain, name);

  return (
    <img
      src={logoUrl}
      alt={name || 'Brand logo'}
      width={size}
      height={size}
      className={`${rounded ? 'rounded' : ''} ${className || ''}`}
      style={{ objectFit: 'cover' }}
      onError={(e) => {
        // Fallback to initials if image fails to load
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `<div class="bg-gray-200 text-gray-600 flex items-center justify-center font-semibold ${className || ''}" style="width: ${size}px; height: ${size}px;">${initials}</div>`;
        }
      }}
    />
  );
}
