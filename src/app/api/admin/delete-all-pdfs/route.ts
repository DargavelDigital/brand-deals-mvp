import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    console.log('🗑️  Starting PDF deletion via API...');
    
    // Delete all MediaPackFile records (these contain the PDF data)
    const deletedFiles = await db().mediaPackFile.deleteMany({});
    console.log(`✅ Deleted ${deletedFiles.count} PDF files from database`);
    
    // Optionally delete MediaPack records too (uncomment if needed)
    // const deletedPacks = await db().mediaPack.deleteMany({});
    // console.log(`✅ Deleted ${deletedPacks.count} media pack records`);
    
    return NextResponse.json({
      ok: true,
      message: `Successfully deleted ${deletedFiles.count} PDF files`,
      deletedCount: deletedFiles.count
    });
    
  } catch (error) {
    console.error('❌ Error deleting PDFs:', error);
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
