'use client'
import { useEffect, useRef } from 'react'

export function ScrollTracker() {
  const lastScrollDepth = useRef(0)

  useEffect(() => {
    let ticking = false

    const updateScrollDepth = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight
          const depth = Math.round((scrolled / maxScroll) * 100)
          
          // Only track milestone scroll depths
          if (depth > lastScrollDepth.current && (depth === 25 || depth === 50 || depth === 75 || depth === 100)) {
            lastScrollDepth.current = depth
            
            // Send scroll event to analytics
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'scroll_depth', {
                value: depth,
                custom_parameter: 'media_pack'
              })
            }
          }
          
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', updateScrollDepth, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollDepth)
  }, [])

  // This component doesn't render anything visible
  return null
}
