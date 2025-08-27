import { createTrace, withTrace, logAIEvent, createAIEvent, redactPII } from './observability'

// Example 1: Basic tracing
export async function exampleBasicTracing() {
  const trace = createTrace()
  
  // Simulate some async operation
  const result = await withTrace(
    async (data: string) => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return `Processed: ${data}`
    },
    trace
  )('test data')
  
  console.log('Result:', result)
  console.log('Trace ID:', trace.traceId)
}

// Example 2: AI event logging
export function exampleAIEventLogging() {
  const trace = createTrace()
  
  // Simulate AI call completion
  const aiEvent = createAIEvent(
    trace,
    'openai',
    'generate_email_draft',
    {
      input: 150,
      output: 300,
      total: 450
    },
    {
      creator: 'john_doe',
      brand: 'nike',
      temperature: 0.7
    }
  )
  
  logAIEvent(aiEvent)
}

// Example 3: PII redaction
export function examplePIIRedaction() {
  const sensitiveText = `
    Hi John Smith, please contact me at john.smith@company.com
    or call me at +1-555-123-4567. My colleague Jane Doe
    can be reached at jane.doe@company.com.
  `
  
  const redacted = redactPII(sensitiveText)
  console.log('Original:', sensitiveText)
  console.log('Redacted:', redacted)
}

// Example 4: API route with tracing
export async function exampleAPIRoute() {
  const trace = createTrace()
  
  // Add trace ID to headers
  const headers = {
    'Content-Type': 'application/json',
    'x-trace-id': trace.traceId
  }
  
  // Simulate API call
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt: 'Generate content' })
  })
  
  // The trace ID will be propagated through the request
  console.log('API call completed with trace:', trace.traceId)
}

// Example 5: Database operation with tracing
export async function exampleDatabaseOperation() {
  const trace = createTrace()
  
  // Simulate database write with trace context
  const dbOperation = withTrace(
    async (data: any) => {
      // Simulate DB write
      await new Promise(resolve => setTimeout(resolve, 50))
      console.log('DB write completed with trace:', trace.traceId)
      return { id: '123', ...data }
    },
    trace
  )
  
  const result = await dbOperation({ name: 'test', value: 42 })
  return result
}

// Example 6: Complete AI workflow with tracing
export async function exampleCompleteAIWorkflow() {
  const trace = createTrace()
  console.log('🤖 Starting AI workflow with trace:', trace.traceId)
  
  try {
    // Step 1: Analyze profile
    const profileAnalysis = await withTrace(
      async (profile: string) => {
        await new Promise(resolve => setTimeout(resolve, 200))
        return { niche: 'fitness', tone: 'casual' }
      },
      trace
    )('fitness_creator_profile')
    
    // Step 2: Generate brand matches
    const brandMatches = await withTrace(
      async (analysis: any) => {
        await new Promise(resolve => setTimeout(resolve, 150))
        return [{ brand: 'Nike', score: 85 }, { brand: 'Adidas', score: 78 }]
      },
      trace
    )(profileAnalysis)
    
    // Step 3: Create email draft
    const emailDraft = await withTrace(
      async (matches: any[]) => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return { subject: 'Partnership Opportunity', body: 'Hi there...' }
      },
      trace
    )(brandMatches)
    
    // Log final AI event
    const finalEvent = createAIEvent(
      trace,
      'openai',
      'complete_workflow',
      { input: 500, output: 800, total: 1300 },
      { steps: 3, brands: brandMatches.length }
    )
    logAIEvent(finalEvent)
    
    return { profileAnalysis, brandMatches, emailDraft }
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 
                        (error?.message || error?.toString?.() || 'Unknown error')
    console.error('Workflow failed:', errorMessage)
    throw error
  }
}
