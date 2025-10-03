import { prisma } from "@/lib/prisma";
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData";

export type MediaPackPayload = ReturnType<typeof createDemoMediaPackData>;

export async function loadMediaPackById(packId: string): Promise<{ ok: boolean; source: string; data?: MediaPackPayload; error?: string }> {
  try {
    if (packId === "demo") {
      const demoData = createDemoMediaPackData();
      return { ok: true, source: "demo", data: demoData };
    }

    // Try to load from database
    try {
      const row = await prisma().mediaPack.findUnique({
        where: { id: packId },
        select: { payload: true, theme: true },
      });

      // If found with payload, return it
      if (row?.payload) {
        const payloadWithTheme = {
          ...row.payload as MediaPackPayload,
          theme: row.theme || (row.payload as MediaPackPayload).theme,
        };
        return { ok: true, source: "db", data: payloadWithTheme };
      }
    } catch (dbError) {
      console.warn("Database query failed, falling back to demo data:", dbError);
    }

    // Fallback to demo data
    const demoData = createDemoMediaPackData();
    return { ok: true, source: "demo", data: demoData };
  } catch (e: any) {
    console.error("loadMediaPackById error:", e);
    return { ok: false, source: "error", error: String(e) };
  }
}
