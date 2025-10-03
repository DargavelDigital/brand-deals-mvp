import { NextRequest, NextResponse } from 'next/server'
import { signPayload, verifyToken } from '@/lib/signing'

export async function GET(req: NextRequest) {
  try {
    const testData = { test: 'data', timestamp: Date.now() }
    
    // Sign a token
    const token = signPayload(testData, '1h')
    console.log('Generated token:', token)
    
    // Verify the token
    const verified = verifyToken(token)
    console.log('Verified data:', verified)
    
    return NextResponse.json({
      success: true,
      token,
      verified,
      secretSet: !!process.env.MEDIA_PACK_SIGNING_SECRET,
      secretValue: process.env.MEDIA_PACK_SIGNING_SECRET ? 'set' : 'not set'
    })
  } catch (error) {
    console.error('Token debug error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
