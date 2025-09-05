import BrandRunClient from './BrandRunClient'
import BrandRunV3 from '@/components/run/BrandRunV3'
import AuditRunner from '@/components/audit/AuditRunner'
import { getTranslations } from 'next-intl/server'
import { getBoolean, get } from '@/lib/clientEnv'

export const dynamic = 'force-dynamic'

async function resolveWorkspace(): Promise<string> {
  // Lazy import Prisma to avoid build-time issues
  const { prisma } = await import('@/lib/prisma')
  
  // Try to find existing demo workspace
  let workspace = await prisma.workspace.findUnique({
    where: { slug: 'demo-workspace' }
  })
  
  // Create demo workspace if it doesn't exist
  if (!workspace) {
    try {
      workspace = await prisma.workspace.create({
        data: {
          name: 'Demo Workspace',
          slug: 'demo-workspace',
          featureFlags: {} // ensure not null
        }
      })
    } catch (error) {
      throw new Error('Unable to create demo workspace')
    }
  } else if (workspace.featureFlags == null) {
    // Update existing workspace if featureFlags is null
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { featureFlags: {} }
    })
  }
  
  return workspace.id
}

export default async function BrandRunPage() {
  const t = await getTranslations();
  
  try {
    // Ensure we have a valid workspace
    const workspaceId = await resolveWorkspace()
    
    // Lazy import Prisma to avoid build-time issues
    const { prisma } = await import('@/lib/prisma')
    
    // Fetch data directly from database - but don't create new runs automatically
    const run = await prisma.brandRun.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    })
    
    // Only create a run if we're using the old BrandRunClient (not V3)
    // BrandRunV3 manages its own state and doesn't need database persistence
    const isV3Enabled = getBoolean('NEXT_PUBLIC_BRANDRUN_V3') || 
                       (get('NODE_ENV') === 'development' && getBoolean('NEXT_PUBLIC_BRANDRUN_V3') !== false)
    
    let finalRun = run
    if (!run && !isV3Enabled) {
      // Only create new run for the old version
      finalRun = await prisma.brandRun.create({
        data: {
          workspaceId,
          step: 'CONNECT',
          auto: false,
          selectedBrandIds: []
        }
      })
    }

    // Use BrandRunV3 if flag is enabled, otherwise use the original layout
    if (isV3Enabled) {
      return <BrandRunV3 initialRun={finalRun} />
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brand Run</h1>
          <p className="text-[var(--muted-fg)]">
            Audit your content, pick brands, build your media pack, discover contacts, 
            and launch outreach — all in one guided flow.
          </p>
        </div>

        {/* AI Audit Runner - standalone component */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">AI Content Audit</h2>
          <AuditRunner provider="tiktok" />
        </div>

        <BrandRunClient initialRun={finalRun} />
      </div>
    )
  } catch (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brand Run</h1>
          <p className="text-[var(--muted-fg)]">
            Audit your content, pick brands, build your media pack, discover contacts, 
            and launch outreach — all in one guided flow.
          </p>
        </div>
        
        <div className="p-6 text-center text-[var(--error)]">
          Error: {error instanceof Error ? error.message : 'Unknown error occurred'}
        </div>
      </div>
    )
  }
}
