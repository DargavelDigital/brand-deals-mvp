import { NextResponse } from "next/server"
import { safe } from "@/lib/api/safeHandler"
import { logView } from "@/services/mediaPack/analytics"
import { newTraceId } from "@/lib/diag/trace"

export const POST = safe(async (req: Request) => {
  const traceId = newTraceId()
  const { mediaPackId, variant, event, value } = await req.json()
  
  if (!mediaPackId || !variant || !event || value === undefined) {
    return NextResponse.json({ 
      ok: false, 
      error: 'MISSING_REQUIRED_FIELDS',
      message: 'mediaPackId, variant, event, and value are required'
    }, { status: 400 })
  }

  try {
    await logView(mediaPackId, variant, event, value, traceId)
    
    return NextResponse.json({ 
      ok: true, 
      traceId,
      message: 'Scroll event logged successfully'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      ok: false, 
      traceId,
      error: 'SCROLL_LOG_FAILED',
      message: error.message || 'Failed to log scroll event'
    }, { status: 500 })
  }
}, { route: '/api/media-pack/scroll' })
