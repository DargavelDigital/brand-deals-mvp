import { AsyncLocalStorage } from 'async_hooks'

const traceStorage = new AsyncLocalStorage<string>()

export interface TraceContext {
  traceId: string
  withTrace: <T>(fn: () => T | Promise<T>) => T | Promise<T>
}

export function startTrace(name: string): TraceContext {
  const traceId = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    traceId,
    withTrace: <T>(fn: () => T | Promise<T>): T | Promise<T> => {
      return traceStorage.run(traceId, fn)
    }
  }
}

export function getCurrentTraceId(): string | undefined {
  return traceStorage.getStore()
}

export function withTrace<T>(fn: () => T | Promise<T>): T | Promise<T> {
  const traceId = getCurrentTraceId()
  if (!traceId) {
    // If no trace context, just run the function
    return fn()
  }
  return traceStorage.run(traceId, fn)
}
