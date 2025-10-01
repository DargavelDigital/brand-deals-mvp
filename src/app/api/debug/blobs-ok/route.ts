import { NextResponse } from "next/server"
export async function GET() {
  try {
    const { getStore } = await import("@netlify/blobs")
    const store = getStore("pdfs")
    await store.set("hello.txt", new TextEncoder().encode("hi"), { contentType: "text/plain" })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
