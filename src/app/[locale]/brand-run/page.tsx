import { prisma } from '@/lib/prisma'
import BrandRunClient from './BrandRunClient'
import { getTranslations } from 'next-intl/server'

async function resolveWorkspace(): Promise<string> {
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
    
    // Fetch data directly from database
    let run = await prisma.brandRun.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    })
    
    if (!run) {
      // Create new run if none exists
      run = await prisma.brandRun.create({
        data: {
          workspaceId,
          step: 'CONNECT',
          auto: false,
          selectedBrandIds: []
        }
      })
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

        <BrandRunClient initialRun={run} />
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
