'use client'
import { useEffect } from 'react'

export default function TrackingSnippet({ shareToken, variant, referrer, utm, ctas }: {
  shareToken: string
  variant: string
  referrer?: string
  utm?: Record<string,string>
  ctas?: string[] // element ids of CTA buttons/links
}) {
  useEffect(() => {
    const vid = getOrSet('_mpv', crypto.randomUUID())
    const sid = getOrSet('_mps', crypto.randomUUID(), true)
    const qs = new URLSearchParams({
      t: shareToken, e: 'view', v: variant, ref: document.referrer || referrer || '',
      utm_source: utm?.source || '', utm_medium: utm?.medium || '', utm_campaign: utm?.campaign || '',
      vid, sid,
    })
    // Pixel
    const img = new Image()
    img.src = `/m/track?${qs.toString()}`
    // Dwell + scroll
    let start = Date.now(), depth = 0
    const onScroll = () => {
      const sc = Math.round(100 * (window.scrollY + window.innerHeight) / document.body.scrollHeight)
      depth = Math.max(depth, Math.min(100, sc))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('beforeunload', () => {
      navigator.sendBeacon('/m/track', JSON.stringify({
        t: shareToken, ev: 'view', v: variant, vid, sid, dwellMs: Date.now() - start, scrollDepth: depth
      }))
    })
    // CTA clicks
    ctas?.forEach(id => {
      const el = document.getElementById(id)
      if (el) el.addEventListener('click', (e:any) => {
        const href = (e.currentTarget as HTMLAnchorElement).href || ''
        navigator.sendBeacon('/m/track', JSON.stringify({
          t: shareToken, ev: 'click', v: variant, vid, sid, ctaId: id, href
        }))
      })
    })
  }, [shareToken, variant, referrer])

  function getOrSet(name:string, val:string, session=false){
    const s = session ? sessionStorage : localStorage
    const got = s.getItem(name)
    if (got) return got
    s.setItem(name, val)
    return val
  }
  return null
}
