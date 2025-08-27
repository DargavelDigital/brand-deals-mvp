const hits: Record<string, { count: number; resetAt: number }> = {};

export function canCall(provider: 'google'|'yelp', workspaceId: string, dailyCap = 200) {
  const key = `${provider}:${workspaceId}`;
  const now = Date.now();
  const today = new Date(); today.setHours(0,0,0,0);
  if (!hits[key] || hits[key].resetAt < today.getTime()) {
    hits[key] = { count: 0, resetAt: today.getTime() + 24*60*60*1000 };
  }
  if (hits[key].count >= dailyCap) return false;
  hits[key].count++;
  return true;
}
