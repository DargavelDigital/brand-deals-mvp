'use client'
import { Toaster } from 'sonner'

export function GlobalToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster 
        richColors 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </>
  )
}
