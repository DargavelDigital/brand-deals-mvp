import { env } from './env'

export function assertDbEnv() {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
}
