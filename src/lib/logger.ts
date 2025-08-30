import pino from 'pino';

const redactions = [
  'headers.authorization',
  'req.headers.cookie',
  'token',
  'accessToken',
  'refreshToken',
  'password',
  // heuristic redaction in messages:
];

const redactPII = (s: string) =>
  s
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\+?\d[\d\s().-]{6,}\d/g, '[redacted-phone]');

export const log = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: { paths: redactions, remove: true },
  formatters: {
    log(object) {
      if (object.msg) object.msg = redactPII(object.msg);
      return object;
    }
  }
});

export function logAiCall(meta: {
  traceId: string
  model: string
  promptTokens?: number
  completionTokens?: number
  costUsd?: number
}) {
  log.info({ kind: 'ai_call', ...meta }, 'AI call finished')
}
