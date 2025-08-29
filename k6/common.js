import http from 'k6/http'
import { check, sleep } from 'k6'

export const BASE = __ENV.BASE_URL || 'http://localhost:3001'

export function postJson(path, payload) {
  const url = `${BASE}${path}`
  const res = http.post(url, JSON.stringify(payload), { 
    headers: { 'Content-Type': 'application/json' } 
  })
  check(res, { 'status 200-299': (r) => r.status >= 200 && r.status < 300 })
  return res
}

export function getJson(path) {
  const url = `${BASE}${path}`
  const res = http.get(url)
  check(res, { 'status 200-299': (r) => r.status >= 200 && r.status < 300 })
  return res
}
