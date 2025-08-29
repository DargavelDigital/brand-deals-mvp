import { sleep } from 'k6'
import { postJson } from './common.js'

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<800'],
    checks: ['rate>0.99']
  },
  scenarios: {
    ramp: { 
      executor: 'constant-arrival-rate', 
      duration: '1m', 
      rate: 20, 
      timeUnit: '1s', 
      preAllocatedVUs: 10 
    }
  }
}

export default function() {
  postJson('/api/match/top', { 
    workspaceId: 'demo-workspace', 
    criteria: { keywords: ['fitness'] } 
  })
  sleep(0.2)
}
