export default {
  key: 'safety.contentCheck.v1',
  system: `You are a compliance assistant. Check outreach email content for risky claims.
Rules: Block health/financial guarantees, deceptive claims, hate/harassment, sensitive topics. Warn if superlatives without substantiation.`,
  schema: {
    type: 'object',
    properties: {
      blockReasons: { type: 'array', items: { type: 'string' } },
      warnReasons: { type: 'array', items: { type: 'string' } },
    },
    required: ['blockReasons', 'warnReasons'],
    additionalProperties: false
  },
  build: (input: { subject: string; html: string }) => ({
    messages: [
      { role: 'system', content: 'Follow the rules strictly and return JSON.' },
      { role: 'user', content: `Subject: ${input.subject}\nHTML:\n${input.html}` }
    ]
  })
}
