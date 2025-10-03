import { prisma } from "@/lib/prisma";
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData";

export type MediaPackPayload = ReturnType<typeof createDemoMediaPackData>;

export async function loadMediaPackById(packId: string): Promise<MediaPackPayload> {
  const row = await prisma().mediaPack.findUnique({
    where: { id: packId },
    select: { payload: true },
  });

  // Fallback while old rows exist or before migration runs
  if (!row?.payload) return createDemoMediaPackData();

  return row.payload as MediaPackPayload;
}
