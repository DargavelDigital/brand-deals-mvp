import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    
    if (!token) {
      return new NextResponse("Invalid token", { status: 400 });
    }

    // Find the share token and associated file
    const shareToken = await prisma().mediaPackShareToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(), // Token must not be expired
        },
      },
      include: {
        file: {
          select: {
            data: true,
            filename: true,
            mimeType: true,
            size: true,
          },
        },
      },
    });

    if (!shareToken || !shareToken.file) {
      return new NextResponse("File not found or token expired", { status: 404 });
    }

    const { file } = shareToken;

    // Stream the file data
    return new NextResponse(file.data, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": file.size.toString(),
        "Content-Disposition": `inline; filename="${file.filename}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Share file streaming error:", error);
    return new NextResponse("Failed to stream file", { status: 500 });
  }
}
