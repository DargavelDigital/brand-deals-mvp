import { sleep } from 'k6'
import { postJson, BASE } from './common.js'

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<5000'], // audit is heavier
    checks: ['rate>0.99']
  },
  scenarios: {
    spike: { 
      executor: 'ramping-vus', 
      stages: [
        { duration: '10s', target: 5 },
        { duration: '30s', target: 20 },
        { duration: '10s', target: 0 },
      ]
    }
  }
}

export default function() {
  postJson('/api/audit/run', { 
    workspaceId: 'demo-workspace', 
    dryRun: true 
  })
  sleep(1)
}
