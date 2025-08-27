import 'server-only'
import { cookies } from 'next/headers'
import type { ConnectionStatus, PlatformId } from '@/types/connections'
import { PLATFORMS } from '@/config/platforms'

// Optional DB import (surrounded by try/catch so we don't explode on Netlify/edge)
async function getDbRows() {
  try {
    const { prisma } = await import('@/lib/prisma')
    return await prisma?.socialAccount.findMany?.() ?? []
  } catch { return [] }
}

function statusFromCookie(platform: PlatformId): Partial<ConnectionStatus> | null {
  const jar = cookies()
  const map: Record<PlatformId, string> = {
    instagram: 'ig_conn',
    tiktok: 'tt_conn',
    youtube: 'yt_conn',
    x: 'x_conn',
    facebook: 'fb_conn',
    linkedin: 'li_conn',
    onlyfans: 'of_conn',
  }
  const name = map[platform]
  if (!name) return null
  const raw = jar.get(name)?.value
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    return {
      connected: true,
      username: data.username ?? undefined,
      expiresAt: data.expiresAt ?? null,
      status: 'active',
      raw: data,
    }
  } catch { return null }
}

export async function getAllConnectionStatus(): Promise<ConnectionStatus[]> {
  const dbRows = await getDbRows()

  return PLATFORMS.map((p): ConnectionStatus => {
    const row = dbRows.find((r: any) => r?.provider === p.id)
    // Prefer DB, fallback to cookie, otherwise none
    if (row) {
      const expires = row.meta?.expiresAt ?? null
      const expired = expires ? Date.parse(expires) < Date.now() : false
      return {
        platform: p.id as PlatformId,
        connected: true,
        username: row.username ?? undefined,
        lastSync: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
        expiresAt: expires,
        status: expired ? 'expired' : 'active',
        raw: row,
      }
    }
    const cookie = statusFromCookie(p.id as PlatformId)
    if (cookie) {
      const expired = cookie.expiresAt ? Date.parse(cookie.expiresAt) < Date.now() : false
      return {
        platform: p.id as PlatformId,
        connected: true,
        username: cookie.username,
        lastSync: null,
        expiresAt: cookie.expiresAt ?? null,
        status: expired ? 'expired' : 'active',
        raw: cookie.raw,
      }
    }
    return { platform: p.id as PlatformId, connected: false, status: 'none', lastSync: null, expiresAt: null }
  })
}
