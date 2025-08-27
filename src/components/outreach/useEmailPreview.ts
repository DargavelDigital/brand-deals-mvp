'use client'
import * as React from 'react'

const cache = new Map<string, any>()

export function useEmailPreview(generate: (args: any) => Promise<any>, deps: any[]) {
  const [draft, setDraft] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string|null>(null)

  const key = JSON.stringify(deps)

  const regenerate = React.useCallback(async () => {
    setError(null)
    const cached = cache.get(key)
    if (cached) { 
      setDraft(cached)
      return
    }
    
    setLoading(true)
    try {
      const res = await generate(deps)
      cache.set(key, res)
      setDraft(res)
    } catch (e: any) {
      setError(e?.message || 'Failed to generate')
    } finally {
      setLoading(false)
    }
  }, [key, generate, ...deps])

  React.useEffect(() => {
    const h = setTimeout(() => { void regenerate() }, 300)
    return () => clearTimeout(h)
  }, [regenerate])

  return { draft, loading, error, regenerate }
}
