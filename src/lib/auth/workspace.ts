export type ResolvedWorkspace = { id: string; slug: string; isDemo: boolean }

export async function resolveWorkspace(req: Request): Promise<ResolvedWorkspace | null> {
  // Check for workspace in query params (no demo fallback)
  const url = new URL(req.url)
  const ws = url.searchParams.get('ws')
  
  if (!ws) {
    return null; // No workspace ID provided
  }
  
  return { id: ws, slug: ws, isDemo: false }
}
