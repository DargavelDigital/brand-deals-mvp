'use client'
import { useState, useEffect } from 'react'
import useSWR from 'swr'

interface InstagramStatus {
  ok: boolean
  configured: boolean
  connected: boolean
  reason: 'OK' | 'MISSING_ENV' | 'FEATURE_OFF'
  details: {
    hasAppId: boolean
    hasSecret: boolean
    appUrlSet: boolean
    redirectUri: string
    featureEnabled: boolean
  }
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useInstagramStatus() {
  const { data, error, isLoading, mutate } = useSWR<InstagramStatus>(
    '/api/instagram/status',
    fetcher,
    { revalidateOnFocus: false }
  )

  return {
    status: data,
    isLoading,
    error,
    refetch: mutate
  }
}
