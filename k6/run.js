import { execSync } from 'node:child_process'

const which = process.argv[2] || 'matches'

console.log(`🚀 Running k6 performance test: ${which}`)

try {
  execSync(`npx k6 run -e BASE_URL=${process.env.BASE_URL || 'http://localhost:3001'} k6/${which}.js`, { 
    stdio: 'inherit' 
  })
} catch (error) {
  console.error(`❌ k6 test ${which} failed:`, error.message)
  process.exit(1)
}
