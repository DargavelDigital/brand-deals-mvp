import { NextResponse } from 'next/server'

export async function GET() {
  // Check if Instagram environment variables are configured
  const hasInstagramConfig = Boolean(
    process.env.INSTAGRAM_APP_ID && 
    process.env.INSTAGRAM_APP_SECRET
  )

  if (hasInstagramConfig) {
    // TODO: Generate actual auth URL when Instagram integration is implemented
    return NextResponse.json({
      ok: true,
      configured: true,
      authUrl: null, // Will be implemented when Instagram OAuth is ready
      reason: "CONFIGURED_BUT_NOT_IMPLEMENTED"
    })
  } else {
    return NextResponse.json({
      ok: true,
      configured: false,
      authUrl: null,
      reason: "NOT_CONFIGURED"
    })
  }
}
