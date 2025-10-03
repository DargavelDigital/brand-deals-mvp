import { NextRequest, NextResponse } from "next/server"
import { renderPdfFromUrl } from "@/services/mediaPack/renderer"
import { prisma } from "@/lib/prisma"
import crypto from "node:crypto"
import { packSignature } from "@/lib/mediaPack/cacheKey"
import { getOrigin } from "@/lib/urls" // your existing helper
import { loadMediaPackById } from "@/lib/mediaPack/loader" // your safe loader

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 120

function sha256(buf: Buffer) {
  return crypto.createHash("sha256").update(buf).digest("hex")
}

export async function POST(req: NextRequest) {
  const t0 = Date.now()
  const diag: any = { stage: "start" }
  try {
    const body = await req.json().catch(() => ({}))
    const packId: string = body?.packId || "demo-pack-123"
    const variant: string = (body?.variant || "classic").toLowerCase()
    const dark: boolean = !!body?.dark
    const onePager: boolean = !!body?.onePager
    const brandColor: string = body?.brandColor || ""

    diag.input = { packId, variant, dark, onePager, brandColor }

    // Make sure pack exists or demo fallback (this also warms/validates loader)
    const pack = await loadMediaPackById(packId)
    if (!pack) {
      return NextResponse.json({ ok: false, error: "Media pack not found" }, { status: 404 })
    }

    const signature = packSignature({ packId, variant, dark, onePager, brandColor })
    diag.stage = "cache-check"

    // 1) CACHE: return existing PDF if present
    const existing = await prisma().mediaPackFile.findFirst({
      where: { packId, variant, dark, onePager, brandColor: brandColor || null },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    })
    if (existing) {
      const origin = getOrigin(req)
      const fileUrl = `${origin}/api/media-pack/file/${existing.id}`
      return NextResponse.json({ ok: true, cached: true, fileId: existing.id, fileUrl, ms: Date.now() - t0 })
    }

    // 2) RENDER via Puppeteer against your print page
    diag.stage = "build-print-url"
    const origin = getOrigin(req)
    const printUrl =
      `${origin}/media-pack/print?` +
      new URLSearchParams({
        mp: packId,
        variant,
        dark: dark ? "1" : "0",
        onePager: onePager ? "1" : "0",
        brandColor,
        // ensure server-only render path if you added a flag
        mode: "pdf",
      }).toString()

    diag.printUrl = printUrl

    diag.stage = "render"
    const pdfBuffer = await renderPdfFromUrl(printUrl)
    const digest = sha256(pdfBuffer)

    // 3) WRITE to Neon
    diag.stage = "db-write"
    const row = await prisma().mediaPackFile.create({
      data: {
        packId,
        variant,
        dark,
        onePager,
        brandColor: brandColor || null,
        mime: "application/pdf",
        size: pdfBuffer.length,
        sha256: digest,
        data: pdfBuffer,
      },
      select: { id: true },
    })

    const fileUrl = `${origin}/api/media-pack/file/${row.id}`

    return NextResponse.json({
      ok: true,
      cached: false,
      fileId: row.id,
      fileUrl,
      signature,
      ms: Date.now() - t0,
      size: pdfBuffer.length,
      sha256: digest,
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to generate media pack PDF", diag },
      { status: 500 }
    )
  }
}

export function GET() {
  return NextResponse.json({ ok: false, error: "Use POST for /api/media-pack/generate" }, { status: 405 })
}