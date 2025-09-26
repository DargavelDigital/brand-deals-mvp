import { log } from '@/lib/log';
// ultra-light in-process job bus; swap for BullMQ later
type Handler = (payload: any) => Promise<void>;
const handlers = new Map<string, Handler[]>();

export function on(name: string, handler: Handler) {
  const arr = handlers.get(name) ?? [];
  arr.push(handler);
  handlers.set(name, arr);
}

export async function enqueue(name: string, payload: any) {
  // micro queue: nextTick to free request thread
  queueMicrotask(async () => {
    const arr = handlers.get(name) ?? [];
    for (const h of arr) {
      try { await h(payload); } catch (e) { log.error(`[job:${name}]`, e); }
    }
  });
}
