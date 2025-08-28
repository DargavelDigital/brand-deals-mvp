import pino from 'pino'

const redact = {
  paths: [
    'req.headers.authorization',
    'body.password',
    'body.token',
    'body.apiKey',
    'user.email',
    '*.access_token',
    '*.refresh_token',
    'email',
  ],
  censor: '[REDACTED]',
}

export const log = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact,
  base: { env: process.env.APP_ENV || 'development' },
  transport: process.env.APP_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
    : undefined,
})

export function logAiCall(meta: {
  traceId: string
  model: string
  promptTokens?: number
  completionTokens?: number
  costUsd?: number
}) {
  log.info({ kind: 'ai_call', ...meta }, 'AI call finished')
}
