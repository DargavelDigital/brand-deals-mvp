import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log('Testing basic React-PDF...');
    
    // Create a very simple document
    const SimpleDoc = () => React.createElement('Document', {}, 
      React.createElement('Page', { size: 'A4' }, 
        React.createElement('Text', {}, 'Hello World')
      )
    );
    
    console.log('Rendering document...');
    const buf = await renderToBuffer(React.createElement(SimpleDoc));
    
    console.log('PDF generated successfully, size:', buf.length);
    
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="test.pdf"'
      }
    });
    
  } catch (error: any) {
    console.error('PDF test failed:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}