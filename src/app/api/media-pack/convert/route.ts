import { NextResponse } from "next/server"
import { safe } from "@/lib/api/safeHandler"
import { logConversion } from "@/services/mediaPack/analytics"
import { newTraceId } from "@/lib/diag/trace"

export const POST = safe(async (req: Request) => {
  const traceId = newTraceId()
  const { mediaPackId, type, status, brandId, variant } = await req.json()
  
  if (!mediaPackId || !type || !status) {
    return NextResponse.json({ 
      ok: false, 
      error: 'MISSING_REQUIRED_FIELDS',
      message: 'mediaPackId, type, and status are required'
    }, { status: 400 })
  }

  try {
    await logConversion(mediaPackId, type, status, brandId, traceId)
    
    return NextResponse.json({ 
      ok: true, 
      traceId,
      message: 'Conversion logged successfully'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      ok: false, 
      traceId,
      error: 'CONVERSION_LOG_FAILED',
      message: error.message || 'Failed to log conversion'
    }, { status: 500 })
  }
}, { route: '/api/media-pack/convert' })
