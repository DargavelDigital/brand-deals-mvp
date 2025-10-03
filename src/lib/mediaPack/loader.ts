import { prisma } from "@/lib/prisma";
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData";

export type MediaPackPayload = ReturnType<typeof createDemoMediaPackData>;

export async function loadMediaPackById(packId: string): Promise<{ ok: boolean; source: string; data?: MediaPackPayload; error?: string }> {
  try {
    if (packId === "demo") {
      return { ok: true, source: "demo", data: createDemoMediaPackData() };
    }

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

    // Fallback to demo data
    return { ok: true, source: "demo", data: createDemoMediaPackData() };
  } catch (e: any) {
    console.error("loadMediaPackById error:", e);
    return { ok: false, source: "error", error: String(e) };
  }
}
