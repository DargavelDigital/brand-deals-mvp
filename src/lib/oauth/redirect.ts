export function oauthRedirect(path: string) {
  const base = process.env.NEXTAUTH_URL || process.env.APP_URL || '';
  if (!base) throw new Error('Missing NEXTAUTH_URL for OAuth redirects');
  return new URL(path, base).toString();
}
