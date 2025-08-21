import { startScheduler, stopScheduler } from '@/services/sequence/scheduler';

let schedulerInterval: NodeJS.Timeout | null = null;

export function initializeScheduler(): void {
  if (process.env.NODE_ENV === 'development' && !schedulerInterval) {
    // Start scheduler with 1-minute intervals in development
    schedulerInterval = startScheduler(60000);
    console.log('Development sequence scheduler started');
  }
}

export function cleanupScheduler(): void {
  if (schedulerInterval) {
    stopScheduler(schedulerInterval);
    schedulerInterval = null;
    console.log('Development sequence scheduler stopped');
  }
}

// Auto-start in development
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  initializeScheduler();
  
  // Cleanup on process exit
  process.on('SIGINT', cleanupScheduler);
  process.on('SIGTERM', cleanupScheduler);
}
