export type ResolvedWorkspace = { id: string; slug: string; isDemo: boolean }

export async function resolveWorkspace(req: Request): Promise<ResolvedWorkspace> {
  // In prod you'd check a session/cookie/jwt. For now, keep it permissive:
  const url = new URL(req.url)
  const ws = url.searchParams.get('ws') || 'demo-workspace'
  return { id: ws, slug: ws, isDemo: ws === 'demo-workspace' }
}
