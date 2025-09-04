import { env } from '@/lib/env';

export function oauthRedirect(path: string) {
  const base = env.NEXTAUTH_URL || env.APP_URL || '';
  if (!base) throw new Error('Missing NEXTAUTH_URL for OAuth redirects');
  return new URL(path, base).toString();
}
