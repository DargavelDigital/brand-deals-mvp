'use client'
import * as React from 'react'
import { Check } from 'lucide-react'
import type { Platform } from '@/config/platforms'

// Minimal monochrome glyphs; neutral so the theme stays consistent.
function Glyph({ id }: { id: string }) {
  // Tiny SVG hints (not brand colors)
  switch (id) {
    case 'instagram':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" />
          <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M14 4v7a4 4 0 1 1-4 4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 6c1.2 1.8 3.2 3 5 3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    case 'youtube':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="7" width="18" height="10" rx="3" stroke="currentColor" />
          <path d="M11 10l5 3-5 3v-6z" fill="currentColor" />
        </svg>
      )
    case 'x':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      )
    case 'facebook':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M14 8h3V5h-3c-2 0-3 1.3-3 3v3H8v3h3v5h3v-5h3l1-3h-4V8z" fill="currentColor" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="9" width="4" height="11" fill="currentColor" />
          <circle cx="6" cy="6" r="2" fill="currentColor" />
          <path d="M12 9h3v2c.6-1 1.9-2 3.6-2C21 9 22 10.6 22 13.1V20h-4v-6c0-1.2-.5-2-1.7-2-1.1 0-1.8.8-1.8 2V20h-4V9z" fill="currentColor" />
        </svg>
      )
    case 'onlyfans':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="3" stroke="currentColor" />
          <path d="M4 20c1.8-3.8 5-6 8-6s6.2 2.2 8 6" stroke="currentColor" />
        </svg>
      )
    default:
      return null
  }
}

export default function PlatformBadge({
  platform,
  connected = false,
}: {
  platform: Platform
  connected?: boolean
}) {
  return (
    <div
      className="group relative flex items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3 py-2"
      title={platform.label}
    >
      <div className="grid place-items-center text-[var(--muted-fg)] group-hover:text-[var(--fg)]">
        <Glyph id={platform.id} />
      </div>
      <span className="text-sm">{platform.label}</span>
      {connected && (
        <span className="ml-auto inline-flex items-center gap-1 text-[12px] text-[var(--success)]">
          <Check size={14} /> Connected
        </span>
      )}
    </div>
  )
}
