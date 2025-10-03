import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { packId: string } }) {
  const pack = await db().mediaPack.findUnique({ where: { packId: params.packId }, select: { id: true, variant: true } });
  if (!pack) notFound();

  const latest = await db().mediaPackFile.findFirst({
    where: { packIdRef: pack.id, variant: pack.variant },
    orderBy: { createdAt: "desc" },
    select: { id: true }
  });
  const fileUrl = latest ? `/api/media-pack/file/${latest.id}` : "";

  return latest ? (
    <iframe src={`/pdf/viewer.html?file=${encodeURIComponent(fileUrl)}`} style={{ width: "100%", height: "100vh", border: "none" }} />
  ) : (
    <div style={{ padding: 24 }}>No preview yet. Click "Generate PDF".</div>
  );
}
