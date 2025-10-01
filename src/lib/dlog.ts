export function dlog(scope: string, data: Record<string, unknown>) {
  if (process.env.MEDIAPACK_DEBUG === 'true') {
    try {
      // Avoid leaking secrets: redact anything that looks like a token/key
      const safe = JSON.parse(JSON.stringify(data, (_k, v) => {
        if (typeof v === 'string' && /token|secret|key|password|cookie/i.test(v)) return '[redacted]';
        return v;
      }));
      console.log(`[${scope}]`, safe);
    } catch {
      console.log(`[${scope}]`, '[unserializable]');
    }
  }
}
