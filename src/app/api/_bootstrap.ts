// This file ensures Epic 13 & 14 job handlers are registered
// Import it from any server module that always loads

// Import Epic 13 job handlers
import '@/services/imports/jobs';

// Import Epic 14 job handlers
import '@/jobs/matchRefresh';
import { log } from '@/lib/log';

log.info('Epic 13 & 14 job handlers registered');
