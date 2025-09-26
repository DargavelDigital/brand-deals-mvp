import { getRequestId, getWorkspaceId, getFeature } from './als'

export interface LogEntry {
  ts: string
  level: 'info' | 'warn' | 'error'
  msg: string
  requestId?: string
  workspaceId?: string
  feature?: string
  meta?: Record<string, any>
}

function formatLogEntry(level: LogEntry['level'], msg: string, meta?: Record<string, any>): string {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    msg,
    requestId: getRequestId(),
    workspaceId: getWorkspaceId(),
    feature: getFeature(),
    ...(meta && { meta })
  }

  // Remove undefined values
  const cleaned = Object.fromEntries(
    Object.entries(entry).filter(([_, value]) => value !== undefined)
  )

  return JSON.stringify(cleaned)
}

export const log = {
  info: (msg: string, meta?: Record<string, any>): void => {
    console.log(formatLogEntry('info', msg, meta))
  },

  warn: (msg: string, meta?: Record<string, any>): void => {
    console.warn(formatLogEntry('warn', msg, meta))
  },

  error: (msg: string, meta?: Record<string, any>): void => {
    console.error(formatLogEntry('error', msg, meta))
  }
}

export default log