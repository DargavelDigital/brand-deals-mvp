'use client'
import { useState } from 'react'
import { logConversion } from "@/services/mediaPack/analytics"

export function CTA({ 
  mediaPackId, 
  type, 
  variant,
  className = ""
}: { 
  mediaPackId: string
  type: "call" | "proposal"
  variant: string
  className?: string
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await fetch("/api/media-pack/convert", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mediaPackId, 
          type, 
          status: "requested",
          variant 
        }),
      })
    } catch (error) {
      console.error('Failed to log conversion:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const buttonText = type === "call" ? "📅 Book a Call" : "✉️ Request Proposal"
  const buttonClass = `px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg font-medium transition-colors ${className}`

  return (
    <button 
      id={type === "call" ? "cta-book" : "cta-proposal"}
      onClick={handleClick} 
      disabled={isLoading}
      className={buttonClass}
    >
      {isLoading ? "Loading..." : buttonText}
    </button>
  )
}
