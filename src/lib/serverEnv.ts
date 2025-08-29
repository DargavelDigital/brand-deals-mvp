export function assertDbEnv() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
}
