export function ok<T>(data: T, extra?: Record<string, unknown>) {
  return { ok: true, ...extra, data };
}

export function fail(code: string, status = 400, extra?: Record<string, unknown>) {
  return { ok: false, error: code, status, ...extra };
}
