import { NextResponse, type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(_req: NextRequest, { params }: { params: { key: string } }) {
  try {
    const { getStore } = await import("@netlify/blobs")
    const store = getStore("pdfs")

    // read as ArrayBuffer and stream it out
    const ab = await store.get(params.key, { type: "arrayBuffer" })
    if (!ab) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const body = new Uint8Array(ab) // NextResponse will handle it as a Uint8Array
    return new NextResponse(body, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "cache-control": "public, max-age=31536000, immutable",
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
