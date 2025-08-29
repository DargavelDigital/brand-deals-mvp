import { on } from '@/lib/jobs';
import { prisma } from '@/lib/prisma';
import { getProviders } from '@/services/providers';
// TODO: Import searchBroker when available
// import { searchBroker } from '@/services/brands/searchBroker';

// Job handler for refreshing brand matches
on('match:refresh', async (payload: { workspaceId: string }) => {
  const { workspaceId } = payload;
  
  try {
    // Get workspace and check if continuous discovery is enabled
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { auditSnapshots: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    
    if (!workspace) {
      console.log(`Workspace ${workspaceId} not found for match refresh`);
      return;
    }
    
    const providers = getProviders(workspaceId);
    if (!providers.features.matchContinuousDiscovery) {
      console.log(`Continuous discovery disabled for workspace ${workspaceId}`);
      return;
    }
    
    // Get latest audit snapshot
    const latestAudit = workspace.auditSnapshots[0];
    if (!latestAudit) {
      console.log(`No audit snapshot found for workspace ${workspaceId}`);
      return;
    }
    
    console.log(`Starting match refresh for workspace ${workspaceId}`);
    
    // TODO: Run brand search to get fresh candidates when searchBroker is available
    // const candidates = await searchBroker.search({
    //   workspaceId,
    //   auditId: latestAudit.id,
    //   limit: 100, // Get more candidates for discovery
    // });
    
    // For now, use mock candidates
    const candidates = [
      { id: 'mock-1', name: 'Mock Brand 1', domain: 'mock1.com' },
      { id: 'mock-2', name: 'Mock Brand 2', domain: 'mock2.com' }
    ];
    
    // Get existing cached candidates
    const existingCache = await prisma.brandCandidateCache.findMany({
      where: { workspaceId },
      select: { domain: true, payload: true }
    });
    
    const existingDomains = new Set(existingCache.map(c => c.domain));
    const newDomains: string[] = [];
    
    // Process each candidate
    for (const candidate of candidates) {
      if (candidate.domain && !existingDomains.has(candidate.domain)) {
        // New brand discovered
        newDomains.push(candidate.domain);
        
        // Cache the new candidate
        await prisma.brandCandidateCache.upsert({
          where: { workspaceId_domain: { workspaceId, domain: candidate.domain } },
          create: {
            workspaceId,
            domain: candidate.domain,
            payload: candidate,
            discoveredAt: new Date(),
          },
          update: {
            payload: candidate,
            refreshedAt: new Date(),
          }
        });
      } else if (candidate.domain) {
        // Update existing candidate
        await prisma.brandCandidateCache.update({
          where: { workspaceId_domain: { workspaceId, domain: candidate.domain } },
          data: {
            payload: candidate,
            refreshedAt: new Date(),
          }
        });
      }
    }
    
    // Create notification for new discoveries
    if (newDomains.length > 0) {
      await prisma.notification.create({
        data: {
          workspaceId,
          type: 'NEW_BRANDS_DISCOVERED',
          title: 'New Brand Matches Discovered',
          message: `Found ${newDomains.length} new brands that match your profile`,
          payload: { newDomains, count: newDomains.length },
        }
      });
      
      console.log(`Discovered ${newDomains.length} new brands for workspace ${workspaceId}`);
    }
    
    console.log(`Match refresh completed for workspace ${workspaceId}`);
    
  } catch (error) {
    console.error(`Match refresh failed for workspace ${workspaceId}:`, error);
  }
});

// Weekly cron job to refresh all active workspaces
export async function runWeeklyMatchRefresh() {
  try {
    console.log('Starting weekly match refresh for all workspaces');
    
    // Get all active workspaces
    const workspaces = await prisma.workspace.findMany({
      where: { deletedAt: null },
      select: { id: true }
    });
    
    // Queue refresh job for each workspace
    for (const workspace of workspaces) {
      await import('@/lib/jobs').then(({ enqueue }) => 
        enqueue('match:refresh', { workspaceId: workspace.id })
      );
    }
    
    console.log(`Queued match refresh for ${workspaces.length} workspaces`);
    
  } catch (error) {
    console.error('Weekly match refresh failed:', error);
  }
}
