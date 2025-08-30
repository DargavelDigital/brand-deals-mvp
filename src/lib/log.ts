import { isDevelopment } from './env'

// Shim for Sentry/Logtail - no-op in development
export const log = {
  info: (message: string, context?: Record<string, any>) => {
    if (isDevelopment()) {
      console.info(`[INFO] ${message}`, context || '')
    }
  },
  
  warn: (message: string, context?: Record<string, any>) => {
    if (isDevelopment()) {
      console.warn(`[WARN] ${message}`, context || '')
    }
  },
  
  error: (message: string, error?: Error, context?: Record<string, any>) => {
    if (isDevelopment()) {
      console.error(`[ERROR] ${message}`, error || '', context || '')
    }
  },
  
  // For production, these would send to Sentry/Logtail
  captureException: (error: Error, context?: Record<string, any>) => {
    if (isDevelopment()) {
      console.error(`[EXCEPTION] ${error.message}`, error.stack, context || '')
    }
  },
  
  captureMessage: (message: string, level: 'info' | 'warn' | 'error' = 'info', context?: Record<string, any>) => {
    if (isDevelopment()) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'info'
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context || '')
    }
  }
}
