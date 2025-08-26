// Best-effort workspace resolution; adjust to your auth/session shape.
import { cookies } from 'next/headers'

// If you have NextAuth helpers, prefer them (e.g., auth() or getServerSession)
export async function currentWorkspaceId(): Promise<string | null> {
  try {
    // Common patterns you can extend:
    // - read a cookie set at login like "wsid"
    // - or decode a session and pick workspaceId
    const cookieStore = await cookies()
    const ws = cookieStore.get('wsid')?.value
    return ws ?? null
  } catch {
    return null
  }
}
