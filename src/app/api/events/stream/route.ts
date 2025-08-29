export const runtime = 'nodejs'
import { NextRequest } from 'next/server'
import { bus } from '@/server/events/bus'

export async function GET(req: NextRequest) {
  if (process.env.REALTIME_ENABLED !== 'true') {
    return new Response('realtime disabled', { status: 404 })
  }
  const { searchParams } = new URL(req.url)
  const ws = searchParams.get('ws') || 'demo-workspace'

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      const send = (data: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      const keepAlive = setInterval(() => controller.enqueue(encoder.encode(':\n\n')), 15000)

      const handler = (payload: any) => send(payload)
      bus.on(`ws:${ws}`, handler)

      // greet
      send({ kind: 'hello', workspaceId: ws, ts: Date.now() })

      return () => {
        clearInterval(keepAlive)
        bus.off(`ws:${ws}`, handler)
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  })
}
