// Public media-pack view page (SSR, no auth)
import { headers } from "next/headers"
import MPClassic from "@/components/media-pack/templates/MPClassic"
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  headers() // hint server-only
  const packId = (searchParams.mp as string) || "demo-pack-123"
  const variant = ((searchParams.variant as string) || "classic").toLowerCase()
  const dark = searchParams.dark === "1" || searchParams.dark === "true"

  const pack = createDemoMediaPackData()
  pack.packId = packId
  const withTheme = {
    ...pack,
    theme: {
      ...pack.theme,
      variant,
      dark,
    },
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <MPClassic data={withTheme} isPublic />
      </div>
    </main>
  )
}
