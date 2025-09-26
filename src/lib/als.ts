import { AsyncLocalStorage } from 'async_hooks'

export interface RequestContext {
  requestId?: string
  workspaceId?: string
  userId?: string
  feature?: string
  [key: string]: any
}

const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>()

export function setCtx(key: string, value: any): void {
  const store = asyncLocalStorage.getStore()
  if (store) {
    store.set(key, value)
  }
}

export function getCtx<T = any>(key: string): T | undefined {
  const store = asyncLocalStorage.getStore()
  return store?.get(key)
}

export function getRequestId(): string | undefined {
  return getCtx<string>('requestId')
}

export function getWorkspaceId(): string | undefined {
  return getCtx<string>('workspaceId')
}

export function getUserId(): string | undefined {
  return getCtx<string>('userId')
}

export function getFeature(): string | undefined {
  return getCtx<string>('feature')
}

export function runWithContext<T>(context: RequestContext, callback: () => T): T {
  const store = new Map<string, any>()
  
  // Set initial context
  Object.entries(context).forEach(([key, value]) => {
    if (value !== undefined) {
      store.set(key, value)
    }
  })
  
  return asyncLocalStorage.run(store, callback)
}

export function runWithRequestId<T>(requestId: string, callback: () => T): T {
  return runWithContext({ requestId }, callback)
}

export { asyncLocalStorage }
