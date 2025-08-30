export default {
  key: 'playbook.synth.v1',
  system: `You are a lifecycle optimizer. Given aggregate performance by segment, output best settings.`,
  schema: {
    type: 'object',
    properties: {
      tone: { type: 'string', enum: ['professional','relaxed','fun'] },
      steps: { type: 'integer', minimum: 1, maximum: 6 },
      delaysDays: { type: 'array', items: { type: 'integer', minimum: 0, maximum: 14 } },
      subjectHints: { type: 'array', items: { type: 'string' } },
      sendDow: { type: 'array', items: { type: 'integer', minimum: 0, maximum: 6 } },
      sendHour: { type: 'array', items: { type: 'integer', minimum: 0, maximum: 23 } },
      rationale: { type: 'string' }
    },
    required: ['tone','steps','delaysDays','subjectHints','sendDow','sendHour','rationale'],
    additionalProperties: false
  },
  build: (input: { aggregates: any[] }) => ({
    messages: [
      { role: 'system', content: 'Return STRICT JSON only.' },
      { role: 'user', content: `Aggregates JSON:\n${JSON.stringify(input.aggregates).slice(0,12000)}` }
    ]
  })
}
