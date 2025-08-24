export type Social = 'instagram'|'tiktok'|'youtube'|'x'|'facebook'|'linkedin'

export default function SocialLogo({ name, className='size-5' }:{ name: Social; className?: string }){
  switch(name){
    case 'instagram': return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.75-.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>
    )
    case 'tiktok': return (
      <svg viewBox="0 0 256 256" className={className} aria-hidden><path fill="currentColor" d="M170 32c10 22 27 37 54 41v38c-19-1-36-7-52-18v73c0 37-30 67-67 67s-67-30-67-67 30-67 67-67a67 67 0 0 1 12 1v40a27 27 0 1 0 15 24V32h38z"/></svg>
    )
    case 'youtube': return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden><path fill="currentColor" d="M23 7.5a4 4 0 0 0-2.8-2.8C18.2 4 12 4 12 4s-6.2 0-8.2.7A4 4 0 0 0 1 7.5 41.6 41.6 0 0 0 0 12a41.6 41.6 0 0 0 1 4.5A4 4 0 0 0 3.8 19C5.8 19.7 12 19.7 12 19.7s6.2 0 8.2-.7A4 4 0 0 0 23 16.5 41.6 41.6 0 0 0 24 12a41.6 41.6 0 0 0-1-4.5zM10 15.5v-7l6 3.5-6 3.5z"/></svg>
    )
    case 'x': return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden><path fill="currentColor" d="M18.9 2H22l-7 8.1L23.5 22H17l-5-6.4L6 22H1l7.6-8.8L.8 2H7l4.6 6L18.9 2z"/></svg>
    )
    case 'facebook': return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden><path fill="currentColor" d="M13 22v-8h3l1-4h-4V7.5c0-1.2.4-2 2.2-2H17V2.2C16.6 2.1 15.4 2 14 2c-3 0-5 1.8-5 5.2V10H6v4h3v8h4z"/></svg>
    )
    case 'linkedin': return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden><path fill="currentColor" d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zM8 8h3.8v2.2h.1c.5-1 1.8-2.2 3.9-2.2 4.2 0 5 2.8 5 6.5V24h-4v-7c0-1.7 0-3.8-2.3-3.8s-2.7 1.8-2.7 3.7V24H8V8z"/></svg>
    )
  }
}
