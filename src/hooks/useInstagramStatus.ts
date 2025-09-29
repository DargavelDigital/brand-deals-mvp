'use client'
import { useState, useEffect } from 'react'
import useSWR from 'swr'

interface InstagramStatus {
  ok: boolean
  configured: boolean
  connected: boolean
  authUrl: string | null
  reason: string | null
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
