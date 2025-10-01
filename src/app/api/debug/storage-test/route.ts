import { NextResponse } from "next/server";
import { uploadPDF } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Create a simple test PDF buffer
    const testPdf = Buffer.from("%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n184\n%%EOF");
    
    const result = await uploadPDF(testPdf, "test-storage.pdf");
    
    return NextResponse.json({
      ok: true,
      isNetlify: !!process.env.NETLIFY,
      result,
      message: "Storage test completed"
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      isNetlify: !!process.env.NETLIFY,
      error: String(error?.message || error),
      stack: error?.stack
    }, { status: 500 });
  }
}
