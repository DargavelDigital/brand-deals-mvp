import { nanoid } from 'nanoid'

export async function withTrace<T>(
  req: Request, 
  fn: (ctx: { traceId: string; start: number }) => Promise<T>
) {
  const traceId = req.headers.get('x-trace-id') || nanoid()
  const start = Date.now()
  
  try {
    const out = await fn({ traceId, start })
    return out
  } finally {
    const duration = Date.now() - start
    console.log(JSON.stringify({ 
      traceId, 
      path: new URL(req.url).pathname, 
      ms: duration,
      timestamp: new Date().toISOString()
    }))
  }
}
