import { getPrisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { logView } from "@/services/mediaPack/analytics"
import { MediaPackLanding } from "@/components/media-pack/MediaPackLanding"
import { Metadata } from "next"

interface MediaPackPageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: MediaPackPageProps): Promise<Metadata> {
  const prisma = getPrisma()
  if (!prisma) {
    return { title: 'Media Pack - Database Unavailable' }
  }

  const pack = await prisma.mediaPack.findUnique({
    where: { id: await params.id },
    include: { workspace: true }
  })

  if (!pack) return { title: 'Media Pack Not Found' }

  const title = `${pack.workspace.name} Media Pack`
  const description = `Professional media pack for ${pack.workspace.name} - View rates, audience insights, and partnership opportunities.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: pack.workspace.image || '/api/placeholder/1200/630',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [pack.workspace.image || '/api/placeholder/1200/630'],
    },
  }
}

export default async function MediaPackPage({ params, searchParams }: MediaPackPageProps) {
  const prisma = getPrisma()
  if (!prisma) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Database Unavailable
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please check your database connection and try again.
          </p>
        </div>
      </div>
    )
  }

  const pack = await prisma.mediaPack.findUnique({
    where: { id: await params.id },
    include: { 
      workspace: true
    }
  })

  if (!pack) return notFound()

  const variant = pack.variant || "classic"
  
  // Log the view for analytics
  try {
    await logView(pack.id, variant, "view")
  } catch (error) {
    console.error('Failed to log view:', error)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <MediaPackLanding pack={pack} variant={variant} />
    </div>
  )
}
