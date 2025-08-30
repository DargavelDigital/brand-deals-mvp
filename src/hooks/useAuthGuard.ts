import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UseAuthGuardOptions {
  onUnauthorized?: () => void
  redirectTo?: string
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const router = useRouter()

  const handleResponse = useCallback(async (response: Response) => {
    if (response.status === 401) {
      setIsUnauthorized(true)
      options.onUnauthorized?.()
      return null
    }
    return response
  }, [options])

  const signIn = useCallback(() => {
    setIsUnauthorized(false)
    router.push(options.redirectTo || '/auth/signin')
  }, [router, options.redirectTo])

  const reset = useCallback(() => {
    setIsUnauthorized(false)
  }, [])

  return {
    isUnauthorized,
    handleResponse,
    signIn,
    reset
  }
}
