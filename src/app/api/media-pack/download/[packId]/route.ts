import { NextRequest, NextResponse } from 'next/server'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { packId: string } }
) {
  try {
    const { packId } = params
    const { searchParams } = new URL(request.url)
    const variant = searchParams.get('variant') || 'classic'
    
    // For demo purposes, we'll return a mock PDF
    // In a real implementation, this would generate and return the actual PDF
    
    const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
72 720 Td
(Brand Partnership Media Pack - ${variant.toUpperCase()} Style) Tj
0 -20 Td
(This is a demo media pack generated for testing purposes.) Tj
0 -20 Td
(Pack ID: ${packId}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000524 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
612
%%EOF`

    return new NextResponse(mockPdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="media-pack-${packId}-${variant}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Media pack download error:', error)
    return NextResponse.json(
      { error: 'Failed to download media pack' },
      { status: 500 }
    )
  }
}
