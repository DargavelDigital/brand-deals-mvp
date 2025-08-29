// src/server/events/bus.ts
import { EventEmitter } from 'events'

type BusEvent =
  | { kind: 'audit.progress'; workspaceId: string; step: string; status: 'queued'|'running'|'done'|'error'; pct?: number; traceId?: string }
  | { kind: 'pack.progress'; workspaceId: string; status: 'running'|'done'|'error'; pct?: number; traceId?: string }
  | { kind: 'match.progress'; workspaceId: string; status: 'running'|'done'|'error'; pct?: number }
  | { kind: 'outreach.reply'; workspaceId: string; threadId: string; contact: { name?: string; email: string }; snippet: string }
  | { kind: 'generic'; workspaceId: string; title: string; message?: string }

class Bus extends EventEmitter {}
export const bus = globalThis.__appBus ?? new Bus()
if (!globalThis.__appBus) (globalThis as any).__appBus = bus

export function emitEvent(e: BusEvent) {
  bus.emit(`ws:${e.workspaceId}`, e)
  return e
}
