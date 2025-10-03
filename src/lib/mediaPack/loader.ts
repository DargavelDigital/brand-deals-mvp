import { prisma } from "@/lib/prisma";
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData";

export type MediaPackPayload = ReturnType<typeof createDemoMediaPackData>;

export async function loadMediaPackById(packId: string): Promise<{ ok: boolean; source: string; data?: MediaPackPayload; error?: string }> {
  try {
    // For now, always return demo data to get the system working
    const demoData = createDemoMediaPackData();
    return { ok: true, source: "demo", data: demoData };
  } catch (e: any) {
    console.error("loadMediaPackById error:", e);
    return { ok: false, source: "error", error: String(e) };
  }
}
