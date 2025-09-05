import { useState, useEffect } from 'react'
import useSWR from 'swr'

type TikTokStatusResponse = {
  ok: boolean
  connected: boolean
  error?: string
}

type TikTokStatus = {
  connected: boolean
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useTikTokStatus(): TikTokStatus {
  const [error, setError] = useState<string | null>(null)
  
  const { data, error: swrError, mutate, isLoading } = useSWR<TikTokStatusResponse>(
    '/api/tiktok/status',
    async (url) => {
      const response = await fetch(url, { 
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to fetch TikTok status')
      }
      
      return data
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  )

  // Clear error when data changes
  useEffect(() => {
    if (data?.ok) {
      setError(null)
    }
  }, [data])

  // Set error from SWR error
  useEffect(() => {
    if (swrError) {
      setError(swrError.message)
    }
  }, [swrError])

  return {
    connected: data?.connected || false,
    loading: isLoading,
    error,
    refetch: mutate
  }
}
