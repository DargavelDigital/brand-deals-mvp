import { v4 as uuidv4 } from 'uuid'

// Types for AI event logging
export interface AIEvent {
  traceId: string
  provider: string
  promptKey: string
  tokensUsed?: {
    input: number
    output: number
    total: number
  }
  latencyMs: number
  timestamp: string
  metadata?: Record<string, any>
}

// Trace context for propagating through the call chain
export interface TraceContext {
  traceId: string
  startTime: number
}

// Helper to create a new trace context
export function createTrace(): TraceContext {
  return {
    traceId: uuidv4(),
    startTime: Date.now()
  }
}

// Helper to wrap functions with tracing
export function withTrace<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  traceContext: TraceContext
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    // Add trace ID to any request context if it exists
    const enhancedArgs = args.map(arg => {
      if (arg && typeof arg === 'object' && 'headers' in arg) {
        return {
          ...arg,
          headers: {
            ...arg.headers,
            'x-trace-id': traceContext.traceId
          }
        }
      }
      return arg
    })

    return fn(...enhancedArgs)
  }
}

// PII redaction helpers
function redactEmail(text: string): string {
  return text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
}

function redactName(text: string): string {
  // Simple name patterns - can be enhanced
  return text.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]')
}

function redactPhone(text: string): string {
  return text.replace(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE]')
}

// Main PII redaction function
export function redactPII(text: string): string {
  if (typeof text !== 'string') return text
  
  let redacted = text
  redacted = redactEmail(redacted)
  redacted = redactName(redacted)
  redacted = redactPhone(redacted)
  
  return redacted
}

// AI event logger
export function logAIEvent(event: AIEvent): void {
  // For now, log to console. Later can be extended to persist to DB
  const logEntry = {
    ...event,
    promptKey: redactPII(event.promptKey),
    metadata: event.metadata ? redactPII(JSON.stringify(event.metadata)) : undefined
  }
  
  console.log('🤖 AI Event:', JSON.stringify(logEntry, null, 2))
}

// Helper to calculate latency from trace context
export function calculateLatency(traceContext: TraceContext): number {
  return Date.now() - traceContext.startTime
}

// Helper to create AI event from trace context
export function createAIEvent(
  traceContext: TraceContext,
  provider: string,
  promptKey: string,
  tokensUsed?: AIEvent['tokensUsed'],
  metadata?: Record<string, any>
): AIEvent {
  return {
    traceId: traceContext.traceId,
    provider,
    promptKey,
    tokensUsed,
    latencyMs: calculateLatency(traceContext),
    timestamp: new Date().toISOString(),
    metadata
  }
}
