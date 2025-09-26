# Observability Report

Generated: 2025-09-26T10:49:37.667Z

## Scanning Summary
- **Critical Paths Scanned**: src/app/api/, src/services/, src/lib/jobs/, src/services/brandRun/
- **Total Files Found**: 293
- **Files Processed**: 293

## Console.log Analysis
- **Critical Count**: 0
- **Total Count**: 0

### Top Offending Files


### All Console.log Statements in Critical Paths


## Request ID Management
### Generation (0)


### Propagation (0)


### Usage (0)


## Logging Configuration
- **Structured Logging**: ✅ Implemented
- **Central Logger**: ❌ Not implemented
- **New Logger**: ✅ Implemented

## Tracing Configuration
### Spans (0)


### Context (87)

- **File**: `app/api/admin/bootstrap/route.ts:12`
- **Pattern**: `trace.*id`
- **Content**: `const traceId = randomUUID();`


- **File**: `app/api/admin/bootstrap/route.ts:18`
- **Pattern**: `trace.*id`
- **Content**: `{ ok: false, error: 'UNAUTHORIZED', traceId },`


- **File**: `app/api/admin/bootstrap/route.ts:23`
- **Pattern**: `trace.*id`
- **Content**: `log.info(`[${traceId}] Admin bootstrap request started`);`


- **File**: `app/api/admin/bootstrap/route.ts:28`
- **Pattern**: `trace.*id`
- **Content**: `log.info(`[${traceId}] Database connection test successful`);`


- **File**: `app/api/admin/bootstrap/route.ts:30`
- **Pattern**: `trace.*id`
- **Content**: `log.error(`[${traceId}] Database connection test failed:`, dbError);`


- **File**: `app/api/admin/bootstrap/route.ts:35`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/admin/bootstrap/route.ts:43`
- **Pattern**: `trace.*id`
- **Content**: `log.info(`[${traceId}] Starting migrations...`);`


- **File**: `app/api/admin/bootstrap/route.ts:47`
- **Pattern**: `trace.*id`
- **Content**: `log.error(`[${traceId}] Migration failed:`, migrationResult.error);`


- **File**: `app/api/admin/bootstrap/route.ts:52`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/admin/bootstrap/route.ts:60`
- **Pattern**: `trace.*id`
- **Content**: `log.info(`[${traceId}] Migrations completed successfully`);`


- **File**: `app/api/admin/bootstrap/route.ts:63`
- **Pattern**: `trace.*id`
- **Content**: `log.info(`[${traceId}] Checking if seeding is needed...`);`


- **File**: `app/api/admin/bootstrap/route.ts:67`
- **Pattern**: `trace.*id`
- **Content**: `log.error(`[${traceId}] Seeding failed:`, seedResult.error);`


- **File**: `app/api/admin/bootstrap/route.ts:72`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/admin/bootstrap/route.ts:84`
- **Pattern**: `trace.*id`
- **Content**: `traceId`


- **File**: `app/api/admin/bootstrap/route.ts:87`
- **Pattern**: `trace.*id`
- **Content**: `log.info(`[${traceId}] Bootstrap completed successfully`, result);`


- **File**: `app/api/admin/bootstrap/route.ts:91`
- **Pattern**: `trace.*id`
- **Content**: `log.error(`[${traceId}] Bootstrap failed with unexpected error:`, error);`


- **File**: `app/api/admin/bootstrap/route.ts:97`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/admin/bootstrap/route.ts:107`
- **Pattern**: `trace.*id`
- **Content**: `const traceId = randomUUID();`


- **File**: `app/api/admin/bootstrap/route.ts:113`
- **Pattern**: `trace.*id`
- **Content**: `{ ok: false, error: 'UNAUTHORIZED', traceId },`


- **File**: `app/api/admin/bootstrap/route.ts:135`
- **Pattern**: `trace.*id`
- **Content**: `traceId`


- **File**: `app/api/admin/bootstrap/route.ts:139`
- **Pattern**: `trace.*id`
- **Content**: `log.error(`[${traceId}] Database health check failed:`, dbError);`


- **File**: `app/api/admin/bootstrap/route.ts:144`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/admin/bootstrap/route.ts:152`
- **Pattern**: `trace.*id`
- **Content**: `log.error(`[${traceId}] Health check failed:`, error);`


- **File**: `app/api/admin/bootstrap/route.ts:158`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/admin/exports/start/route.ts:2`
- **Pattern**: `trace.*id`
- **Content**: `import { withTrace } from '@/middleware/withTrace';`


- **File**: `app/api/admin/exports/start/route.ts:40`
- **Pattern**: `trace.*id`
- **Content**: `traceId: (req as any).traceId`


- **File**: `app/api/admin/exports/tick/route.ts:2`
- **Pattern**: `trace.*id`
- **Content**: `import { withTrace } from '@/middleware/withTrace';`


- **File**: `app/api/agency/invite/route.ts:13`
- **Pattern**: `trace.*id`
- **Content**: `traceId: string;`


- **File**: `app/api/agency/invite/route.ts:20`
- **Pattern**: `trace.*id`
- **Content**: `traceId: string;`


- **File**: `app/api/agency/invite/route.ts:35`
- **Pattern**: `trace.*id`
- **Content**: `const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();`


- **File**: `app/api/agency/invite/route.ts:43`
- **Pattern**: `trace.*id`
- **Content**: `return json({ ok: false, traceId, error: "FORBIDDEN" }, 403);`


- **File**: `app/api/agency/invite/route.ts:52`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/agency/invite/route.ts:88`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/agency/invite/route.ts:95`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/agency/remove/route.ts:13`
- **Pattern**: `trace.*id`
- **Content**: `traceId: string;`


- **File**: `app/api/agency/remove/route.ts:20`
- **Pattern**: `trace.*id`
- **Content**: `traceId: string;`


- **File**: `app/api/agency/remove/route.ts:41`
- **Pattern**: `trace.*id`
- **Content**: `return json({ ok: false, traceId, error: "FORBIDDEN" }, 403);`


- **File**: `app/api/agency/remove/route.ts:44`
- **Pattern**: `trace.*id`
- **Content**: `const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();`


- **File**: `app/api/agency/remove/route.ts:52`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/agency/remove/route.ts:62`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/agency/remove/route.ts:77`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/agency/remove/route.ts:83`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/audit/run/route.ts:95`
- **Pattern**: `trace.*id`
- **Content**: `traceId: trace.traceId,`


- **File**: `app/api/audit/run/route.ts:112`
- **Pattern**: `trace.*id`
- **Content**: `traceId: trace.traceId,`


- **File**: `app/api/audit/run/route.ts:234`
- **Pattern**: `trace.*id`
- **Content**: `traceId: trace.traceId,`


- **File**: `app/api/audit/run/route.ts:248`
- **Pattern**: `trace.*id`
- **Content**: `traceId: trace.traceId,`


- **File**: `app/api/audit/run/route.ts:261`
- **Pattern**: `trace.*id`
- **Content**: `traceId: trace.traceId,`


- **File**: `app/api/audit/run/route.ts:347`
- **Pattern**: `trace.*id`
- **Content**: `traceId: trace.traceId,`


- **File**: `app/api/audit/run/route.ts:368`
- **Pattern**: `trace.*id`
- **Content**: `// Add trace ID to error response headers`


- **File**: `app/api/audit/run/route.ts:370`
- **Pattern**: `trace.*id`
- **Content**: `{ ok: false, error: 'Failed to run audit', traceId: trace.traceId },`


- **File**: `app/api/audit/run/route.ts:373`
- **Pattern**: `trace.*id`
- **Content**: `errorResponse.headers.set('x-trace-id', trace.traceId);`


- **File**: `app/api/cron/check-reminders/route.ts:13`
- **Pattern**: `trace.*id`
- **Content**: `const traceId = `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}``


- **File**: `app/api/cron/check-reminders/route.ts:16`
- **Pattern**: `trace.*id`
- **Content**: `log.info(`[${traceId}] Starting reminder check...`)`


- **File**: `app/api/cron/check-reminders/route.ts:31`
- **Pattern**: `trace.*id`
- **Content**: `log.info(`[${traceId}] Found ${dealsWithReminders.length} deals with reminders`)`


- **File**: `app/api/cron/check-reminders/route.ts:64`
- **Pattern**: `trace.*id`
- **Content**: `log.info(`[${traceId}] Found ${dueReminders.length} due reminders`)`


- **File**: `app/api/cron/check-reminders/route.ts:73`
- **Pattern**: `trace.*id`
- **Content**: `log.info(`[${traceId}] REMINDER DUE: ${reminder.dealTitle} - ${reminder.note}`)`


- **File**: `app/api/cron/check-reminders/route.ts:74`
- **Pattern**: `trace.*id`
- **Content**: `log.info(`[${traceId}] Workspace: ${reminder.workspaceId}, Deal: ${reminder.dealId}`)`


- **File**: `app/api/cron/check-reminders/route.ts:75`
- **Pattern**: `trace.*id`
- **Content**: `log.info(`[${traceId}] Due at: ${reminder.reminderTime.toISOString()}`)`


- **File**: `app/api/cron/check-reminders/route.ts:91`
- **Pattern**: `trace.*id`
- **Content**: `log.warn(`[${traceId}] Failed to enqueue notification for reminder ${reminder.dealId}:`, notificationError)`


- **File**: `app/api/cron/check-reminders/route.ts:105`
- **Pattern**: `trace.*id`
- **Content**: `log.info(`[${traceId}] Processed reminder for deal ${reminder.dealId}`)`


- **File**: `app/api/cron/check-reminders/route.ts:108`
- **Pattern**: `trace.*id`
- **Content**: `log.error(`[${traceId}] Failed to process reminder for deal ${reminder.dealId}:`, dealError)`


- **File**: `app/api/cron/check-reminders/route.ts:115`
- **Pattern**: `trace.*id`
- **Content**: `traceId`


- **File**: `app/api/cron/check-reminders/route.ts:119`
- **Pattern**: `trace.*id`
- **Content**: `log.error(`[${traceId}] Reminder check failed:`, error)`


- **File**: `app/api/cron/check-reminders/route.ts:121`
- **Pattern**: `trace.*id`
- **Content**: `{ ok: false, error: 'Reminder processing failed', traceId },`


- **File**: `app/api/media-pack/convert/route.ts:4`
- **Pattern**: `trace.*id`
- **Content**: `import { newTraceId } from "@/lib/diag/trace"`


- **File**: `app/api/media-pack/convert/route.ts:7`
- **Pattern**: `trace.*id`
- **Content**: `const traceId = newTraceId()`


- **File**: `app/api/media-pack/convert/route.ts:19`
- **Pattern**: `trace.*id`
- **Content**: `await logConversion(mediaPackId, type, status, brandId, traceId)`


- **File**: `app/api/media-pack/convert/route.ts:23`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/media-pack/convert/route.ts:29`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/media-pack/scroll/route.ts:4`
- **Pattern**: `trace.*id`
- **Content**: `import { newTraceId } from "@/lib/diag/trace"`


- **File**: `app/api/media-pack/scroll/route.ts:7`
- **Pattern**: `trace.*id`
- **Content**: `const traceId = newTraceId()`


- **File**: `app/api/media-pack/scroll/route.ts:19`
- **Pattern**: `trace.*id`
- **Content**: `await logView(mediaPackId, variant, event, value, traceId)`


- **File**: `app/api/media-pack/scroll/route.ts:23`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `app/api/media-pack/scroll/route.ts:29`
- **Pattern**: `trace.*id`
- **Content**: `traceId,`


- **File**: `services/ai/aiInvoke.ts:10`
- **Pattern**: `trace.*id`
- **Content**: `traceId?: string;`


- **File**: `services/ai/aiInvoke.ts:103`
- **Pattern**: `trace.*id`
- **Content**: `traceId: opts.traceId,`


- **File**: `services/ai/openai.ts:41`
- **Pattern**: `trace.*context`
- **Content**: `const traceContext = createTrace()`


- **File**: `services/ai/openai.ts:41`
- **Pattern**: `context.*trace`
- **Content**: `const traceContext = createTrace()`


- **File**: `services/ai/openai.ts:45`
- **Pattern**: `trace.*context`
- **Content**: `log.info(`🤖 AI Call Started: ${promptKey}`, { traceId: traceContext.traceId })`


- **File**: `services/ai/openai.ts:45`
- **Pattern**: `context.*trace`
- **Content**: `log.info(`🤖 AI Call Started: ${promptKey}`, { traceId: traceContext.traceId })`


- **File**: `services/ai/openai.ts:45`
- **Pattern**: `trace.*id`
- **Content**: `log.info(`🤖 AI Call Started: ${promptKey}`, { traceId: traceContext.traceId })`


- **File**: `services/ai/openai.ts:58`
- **Pattern**: `trace.*context`
- **Content**: `traceContext,`


- **File**: `services/ai/openai.ts:72`
- **Pattern**: `trace.*context`
- **Content**: `traceContext,`


- **File**: `services/ai/runtime.ts:24`
- **Pattern**: `trace.*id`
- **Content**: `traceId: string`


- **File**: `services/ai/runtime.ts:40`
- **Pattern**: `trace.*id`
- **Content**: `traceId: opts.traceId,`


- **File**: `services/ai/runtime.ts:75`
- **Pattern**: `trace.*id`
- **Content**: `export function newTraceId() {`


- **File**: `services/audit/index.ts:26`
- **Pattern**: `trace.*id`
- **Content**: `log.info(`🔍 Starting audit with trace: ${trace.traceId}`);`


## Summary
- **Files Scanned**: 293
- **Console.log in Critical Paths**: 0
- **Request ID Generation**: 0
- **Request ID Propagation**: 0
- **Request ID Usage**: 0
- **Structured Logging**: Yes
- **Central Logger**: No
- **New Logger**: Yes
- **Tracing Spans**: 0
- **Tracing Context**: 87

## Recommendations
- ❌ **Implement request ID generation** for request tracing
- ❌ **Implement request ID propagation** across services

- ⚠️ **Consider central logger** for consistent logging

- ⚠️ **Consider implementing tracing spans** for performance monitoring


