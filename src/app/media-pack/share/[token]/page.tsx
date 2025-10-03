import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { token: string } }) {
  const pack = await db().mediaPack.findFirst({ where: { shareToken: params.token }, select: { id: true, packId: true, variant: true } });
  if (!pack) notFound();

  const latest = await db().mediaPackFile.findFirst({
    where: { packIdRef: pack.id, variant: pack.variant },
    orderBy: { createdAt: "desc" },
    select: { id: true }
  });
  if (!latest) {
    // optional: trigger generation on-demand here
    return <div style={{ padding: 32 }}>File not generated yet.</div>;
  }

  const fileUrl = `/api/media-pack/file/${latest.id}`;
  return (
    <iframe
      src={`/pdf/viewer.html?file=${encodeURIComponent(fileUrl)}`}
      style={{ width: "100%", height: "100vh", border: "none" }}
    />
  );
}
