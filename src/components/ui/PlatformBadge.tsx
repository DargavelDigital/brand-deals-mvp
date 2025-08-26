'use client'
import * as React from 'react'
import { Check, Instagram, Music2, Youtube, Twitter, Facebook, Linkedin, User } from 'lucide-react'
import type { Platform } from '@/config/platforms'

// Clean Lucide icons mapping
const ICONS: Record<string, JSX.Element> = {
  instagram: <Instagram className="w-5 h-5" />,
  tiktok: <Music2 className="w-5 h-5" />,
  youtube: <Youtube className="w-5 h-5" />,
  x: <Twitter className="w-5 h-5" />,
  facebook: <Facebook className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
  onlyfans: <User className="w-5 h-5" />,
}

function Glyph({ id }: { id: string }) {
  return ICONS[id] || <User className="w-5 h-5" />
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
