import { sleep } from 'k6'
import { postJson } from './common.js'

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    checks: ['rate>0.99']
  },
  scenarios: { 
    burst: { 
      executor: 'per-vu-iterations', 
      vus: 10, 
      iterations: 5 
    } 
  }
}

export default function() {
  postJson('/api/outreach/start', {
    workspaceId: 'demo-workspace',
    pauseFirstSend: true,
    sequence: { name: 'CI load', steps: [] }
  })
  sleep(0.1)
}
