import { prisma } from "@/services/prisma";
import MPClassic from "@/components/media-pack/templates/MPClassic";
import MPBold from "@/components/media-pack/templates/MPBold";
import MPEditorial from "@/components/media-pack/templates/MPEditorial";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page({ params }: { params: { token: string } }) {
  const mp = await prisma().mediaPack.findFirst({ where: { shareToken: params.token } });
  if (!mp) return <div style={{ padding: 24 }}>Not found</div>;

  const data = { ...(mp.payload as any), theme: mp.theme as any };

  let Render: React.ReactNode;
  switch ((data.theme?.variant || "classic")) {
    case "bold": Render = <MPBold data={data} isPublic={true} />; break;
    case "editorial": Render = <MPEditorial data={data} isPublic={true} />; break;
    default: Render = <MPClassic data={data} isPublic={true} />; break;
  }

  // Download button is a tiny form/JS fetch to POST generate, then open fileUrl
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginBottom:16 }}>
        <form action="/api/media-pack/generate" method="POST" onSubmit={(e)=>{e.preventDefault();}}>
          {/* You can rewrite as a client component if preferred */}
          <a href={`/api/media-pack/generate`} onClick={(ev)=>{ev.preventDefault();}}>
            {/* Turn this into a real client button in your stack */}
            Generate & Download PDF
          </a>
        </form>
      </div>
      {Render}
    </main>
  );
}
