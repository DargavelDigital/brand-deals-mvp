# Write Operations Inventory Report

Generated: 2025-09-26T11:04:06.459Z

## Prisma Operations by Model

### evalResult (1 operations)
- **create** in `ai/evals/scores.ts:163` (no route)
  ```typescript
  await prisma.evalResult.create({
  ```



### mediaPackView (3 operations)
- **create** in `app/(public)/media-pack/view/page.tsx:115` (/(public)/media-pack/view)
  ```typescript
  await prisma.mediaPackView.create({
  ```

- **create** in `app/m/track/route.ts:38` (/m/track)
  ```typescript
  await prisma.mediaPackView.create({
  ```

- **create** in `services/mediaPack/analytics.ts:17` (no route)
  ```typescript
  return prisma.mediaPackView.create({
  ```



### workspace (19 operations)
- **create** in `app/[locale]/brand-run/page.tsx:21` (/[locale]/brand-run)
  ```typescript
  workspace = await prisma.workspace.create({
  ```

- **update** in `app/[locale]/brand-run/page.tsx:33` (/[locale]/brand-run)
  ```typescript
  await prisma.workspace.update({
  ```

- **update** in `app/api/billing/checkout/route.ts:47` (/api/billing/checkout)
  ```typescript
  await prisma.workspace.update({
  ```

- **update** in `app/api/billing/reset-daily/route.ts:9` (/api/billing/reset-daily)
  ```typescript
  await prisma.workspace.updateMany({ data: { emailDailyUsed: 0 } })
  ```

- **update** in `app/api/billing/webhook/route.ts:52` (/api/billing/webhook)
  ```typescript
  await prisma.workspace.update({
  ```

- **update** in `app/api/billing/webhook/route.ts:69` (/api/billing/webhook)
  ```typescript
  await prisma.workspace.update({
  ```

- **upsert** in `app/api/brand-run/current/route.ts:23` (/api/brand-run/current)
  ```typescript
  const demoWorkspace = await prisma.workspace.upsert({
  ```

- **upsert** in `app/api/brand-run/upsert/route.ts:34` (/api/brand-run/upsert)
  ```typescript
  const demoWorkspace = await prisma.workspace.upsert({
  ```

- **create** in `app/api/contacts/route.ts:27` (/api/contacts)
  ```typescript
  const ws = await prisma.workspace.create({
  ```

- **update** in `app/api/stripe/webhook/route.ts:74` (/api/stripe/webhook)
  ```typescript
  await prisma.workspace.update({
  ```

- **create** in `lib/admin/bootstrap.ts:75` (no route)
  ```typescript
  const workspace = await prisma.workspace.create({
  ```

- **create** in `lib/auth/ensureWorkspace.ts:21` (no route)
  ```typescript
  const ws = await prisma.workspace.create({
  ```

- **create** in `lib/auth/nextauth-options.ts:27` (no route)
  ```typescript
  const workspace = await prisma.workspace.create({
  ```

- **update** in `lib/flags.ts:178` (no route)
  ```typescript
  await prisma.workspace.update({
  ```

- **update** in `lib/flags.ts:203` (no route)
  ```typescript
  await prisma.workspace.update({
  ```

- **create** in `lib/workspace/ensureWorkspace.ts:20` (no route)
  ```typescript
  const ws = await prisma.workspace.create({
  ```

- **update** in `services/billing/consume.ts:82` (no route)
  ```typescript
  await prisma.workspace.update({
  ```

- **update** in `services/billing/credits.ts:45` (no route)
  ```typescript
  await prisma.workspace.update({
  ```

- **update** in `services/billing/index.ts:17` (no route)
  ```typescript
  await prisma.workspace.update({ where: { id: workspaceId }, data: { stripeCustomerId: customer.id } })
  ```



### brandRun (9 operations)
- **create** in `app/[locale]/brand-run/page.tsx:66` (/[locale]/brand-run)
  ```typescript
  finalRun = await prisma.brandRun.create({
  ```

- **create** in `app/api/brand-run/one-touch/route.ts:26` (/api/brand-run/one-touch)
  ```typescript
  run = await prisma.brandRun.create({
  ```

- **update** in `app/api/brand-run/upsert/route.ts:68` (/api/brand-run/upsert)
  ```typescript
  await prisma.brandRun.update({
  ```

- **update** in `services/brandRun/orchestrator.ts:23` (no route)
  ```typescript
  await prisma.brandRun.update({
  ```

- **update** in `services/brandRun/orchestrator.ts:106` (no route)
  ```typescript
  await prisma.brandRun.update({ where: { id: runId }, data: { selectedBrandIds: selected } });
  ```

- **update** in `services/brandRun/orchestrator.ts:183` (no route)
  ```typescript
  await prisma.brandRun.update({
  ```

- **create** in `services/orchestrator/brandRunHelper.ts:12` (no route)
  ```typescript
  return await prisma.brandRun.create({
  ```

- **update** in `services/orchestrator/brandRunHelper.ts:23` (no route)
  ```typescript
  await prisma.brandRun.updateMany({
  ```

- **update** in `services/orchestrator/brandRunHelper.ts:30` (no route)
  ```typescript
  await prisma.brandRun.updateMany({
  ```



### exportJob (3 operations)
- **create** in `app/api/admin/exports/start/route.ts:29` (/api/admin/exports/start)
  ```typescript
  const job = await prisma.exportJob.create({
  ```

- **update** in `services/exports/runExport.ts:6` (no route)
  ```typescript
  const job = await prisma.exportJob.update({
  ```

- **update** in `services/exports/runExport.ts:47` (no route)
  ```typescript
  await prisma.exportJob.update({
  ```



### adminActionLog (2 operations)
- **create** in `app/api/admin/exports/start/route.ts:34` (/api/admin/exports/start)
  ```typescript
  await prisma.adminActionLog.create({
  ```

- **create** in `app/api/admin/retention/policy/route.ts:67` (/api/admin/retention/policy)
  ```typescript
  await prisma.adminActionLog.create({
  ```



### retentionPolicy (1 operations)
- **upsert** in `app/api/admin/retention/policy/route.ts:52` (/api/admin/retention/policy)
  ```typescript
  const policy = await prisma.retentionPolicy.upsert({
  ```



### runStepExecution (1 operations)
- **create** in `app/api/admin/runs/[runId]/steps/[stepExecId]/replay/route.ts:23` (/api/admin/runs/[runId]/steps/[stepExecId]/replay)
  ```typescript
  const replay = await prisma.runStepExecution.create({
  ```



### user (3 operations)
- **create** in `app/api/agency/invite/route.ts:64` (/api/agency/invite)
  ```typescript
  user = await prisma.user.create({
  ```

- **create** in `lib/admin/bootstrap.ts:86` (no route)
  ```typescript
  const user = await prisma.user.create({
  ```

- **upsert** in `lib/auth/nextauth-options.ts:9` (no route)
  ```typescript
  const user = await prisma.user.upsert({
  ```



### membership (8 operations)
- **upsert** in `app/api/agency/invite/route.ts:73` (/api/agency/invite)
  ```typescript
  const membership = await prisma.membership.upsert({
  ```

- **upsert** in `app/api/agency/list/route.ts:130` (/api/agency/list)
  ```typescript
  const membership = await prisma.membership.upsert({
  ```

- **delete** in `app/api/agency/list/route.ts:196` (/api/agency/list)
  ```typescript
  await prisma.membership.delete({
  ```

- **delete** in `app/api/agency/remove/route.ts:69` (/api/agency/remove)
  ```typescript
  await prisma.membership.delete({
  ```

- **create** in `app/api/contacts/route.ts:33` (/api/contacts)
  ```typescript
  await prisma.membership.create({
  ```

- **create** in `lib/admin/bootstrap.ts:98` (no route)
  ```typescript
  await prisma.membership.create({
  ```

- **create** in `lib/auth/nextauth-options.ts:35` (no route)
  ```typescript
  await prisma.membership.create({
  ```

- **create** in `lib/workspace/ensureWorkspace.ts:24` (no route)
  ```typescript
  await prisma.membership.create({
  ```



### workspaceMember (1 operations)
- **delete** in `app/api/agency/revoke-all/route.ts:48` (/api/agency/revoke-all)
  ```typescript
  const revokedMembers = await prisma.workspaceMember.deleteMany({
  ```



### audit (6 operations)
- **update** in `app/api/audit/run/route.ts:143` (/api/audit/run)
  ```typescript
  await prisma.audit.update({
  ```

- **update** in `app/api/audit/run/route.ts:203` (/api/audit/run)
  ```typescript
  await prisma.audit.update({
  ```

- **update** in `app/api/audit/run/route.ts:291` (/api/audit/run)
  ```typescript
  await prisma.audit.update({
  ```

- **update** in `app/api/audit/status/route.ts:74` (/api/audit/status)
  ```typescript
  await prisma.audit.update({
  ```

- **create** in `services/audit/helpers.ts:14` (no route)
  ```typescript
  const created = await prisma.audit.create({
  ```

- **create** in `services/audit/index.ts:71` (no route)
  ```typescript
  const audit = await prisma.audit.create({
  ```



### contact (15 operations)
- **update** in `app/api/contacts/[id]/notes/route.ts:57` (/api/contacts/[id]/notes)
  ```typescript
  updatedContact = await prisma.contact.update({
  ```

- **update** in `app/api/contacts/[id]/notes/route.ts:66` (/api/contacts/[id]/notes)
  ```typescript
  updatedContact = await prisma.contact.update({
  ```

- **update** in `app/api/contacts/[id]/route.ts:48` (/api/contacts/[id])
  ```typescript
  const updated = await prisma.contact.update({
  ```

- **update** in `app/api/contacts/[id]/route.ts:101` (/api/contacts/[id])
  ```typescript
  const updated = await prisma.contact.update({
  ```

- **delete** in `app/api/contacts/[id]/route.ts:122` (/api/contacts/[id])
  ```typescript
  await prisma.contact.delete({
  ```

- **update** in `app/api/contacts/bulk/route.ts:57` (/api/contacts/bulk)
  ```typescript
  await prisma.contact.updateMany({
  ```

- **update** in `app/api/contacts/bulk/route.ts:88` (/api/contacts/bulk)
  ```typescript
  await prisma.contact.update({
  ```

- **update** in `app/api/contacts/bulk/route.ts:101` (/api/contacts/bulk)
  ```typescript
  await prisma.contact.updateMany({
  ```

- **update** in `app/api/contacts/bulk/route.ts:115` (/api/contacts/bulk)
  ```typescript
  await prisma.contact.updateMany({
  ```

- **update** in `app/api/contacts/bulk-delete/route.ts:23` (/api/contacts/bulk-delete)
  ```typescript
  const result = await prisma.contact.updateMany({
  ```

- **update** in `app/api/contacts/bulk-tag/route.ts:40` (/api/contacts/bulk-tag)
  ```typescript
  return prisma.contact.update({
  ```

- **upsert** in `app/api/contacts/import/route.ts:25` (/api/contacts/import)
  ```typescript
  await prisma.contact.upsert({
  ```

- **create** in `app/api/contacts/route.ts:133` (/api/contacts)
  ```typescript
  const contact = await prisma.contact.create({
  ```

- **delete** in `app/api/imports/[id]/undo/route.ts:15` (/api/imports/[id]/undo)
  ```typescript
  if (created.contacts?.length) await prisma.contact.deleteMany({ where: { id: { in: created.contacts } }});
  ```

- **upsert** in `services/imports/ingest.ts:53` (no route)
  ```typescript
  const c = await prisma.contact.upsert({
  ```



### contactTask (2 operations)
- **create** in `app/api/contacts/[id]/tasks/route.ts:33` (/api/contacts/[id]/tasks)
  ```typescript
  const item = await prisma.contactTask.create({
  ```

- **update** in `app/api/contacts/[id]/tasks/route.ts:51` (/api/contacts/[id]/tasks)
  ```typescript
  const item = await prisma.contactTask.update({
  ```



### deal (12 operations)
- **update** in `app/api/cron/check-reminders/route.ts:97` (/api/cron/check-reminders)
  ```typescript
  await prisma.deal.update({
  ```

- **update** in `app/api/deals/[id]/meta/route.ts:77` (/api/deals/[id]/meta)
  ```typescript
  const updatedDeal = await prisma.deal.update({
  ```

- **update** in `app/api/deals/[id]/next-step/route.ts:46` (/api/deals/[id]/next-step)
  ```typescript
  const updatedDeal = await prisma.deal.update({
  ```

- **update** in `app/api/deals/[id]/route.ts:47` (/api/deals/[id])
  ```typescript
  const updatedDeal = await prisma.deal.update({
  ```

- **update** in `app/api/deals/log/route.ts:43` (/api/deals/log)
  ```typescript
  deal = await prisma.deal.update({
  ```

- **create** in `app/api/deals/log/route.ts:61` (/api/deals/log)
  ```typescript
  deal = await prisma.deal.create({
  ```

- **create** in `app/api/deals/route.ts:54` (/api/deals)
  ```typescript
  const deal = await prisma.deal.create({
  ```

- **delete** in `app/api/imports/[id]/undo/route.ts:17` (/api/imports/[id]/undo)
  ```typescript
  if (created.deals?.length) await prisma.deal.deleteMany({ where: { id: { in: created.deals } }});
  ```

- **create** in `services/imports/ingest.ts:70` (no route)
  ```typescript
  const d = await prisma.deal.create({ data: { ...data, workspaceId: opts.workspaceId, brandId: (await ensureBrand(opts.workspaceId, row, opts.mapping)).id }});
  ```

- **update** in `services/sequence/scheduler.ts:100` (no route)
  ```typescript
  await prisma.deal.updateMany({
  ```

- **create** in `services/sequence/start.ts:69` (no route)
  ```typescript
  deal = await prisma.deal.create({
  ```

- **update** in `services/sequence/start.ts:79` (no route)
  ```typescript
  await prisma.deal.update({
  ```



### verificationToken (2 operations)
- **delete** in `app/api/email/unsubscribe/[token]/route.ts:72` (/api/email/unsubscribe/[token])
  ```typescript
  await prisma.verificationToken.delete({
  ```

- **create** in `app/api/email/unsubscribe/request/route.ts:36` (/api/email/unsubscribe/request)
  ```typescript
  await prisma.verificationToken.create({
  ```



### sequenceStep (13 operations)
- **update** in `app/api/email/webhook/route.ts:84` (/api/email/webhook)
  ```typescript
  await prisma.sequenceStep.update({
  ```

- **update** in `app/api/outreach/inbound/route.ts:67` (/api/outreach/inbound)
  ```typescript
  await prisma.sequenceStep.update({ where: { id: step.id }, data: { repliedAt: new Date(), status: 'REPLIED' } })
  ```

- **update** in `app/api/outreach/queue/route.ts:79` (/api/outreach/queue)
  ```typescript
  await prisma.sequenceStep.update({
  ```

- **update** in `app/api/outreach/queue/route.ts:187` (/api/outreach/queue)
  ```typescript
  await prisma.sequenceStep.update({
  ```

- **update** in `app/api/outreach/webhooks/resend/route.ts:32` (/api/outreach/webhooks/resend)
  ```typescript
  await prisma.sequenceStep.update({ where: { id: step.id }, data: patch })
  ```

- **update** in `services/sequence/scheduler.ts:50` (no route)
  ```typescript
  await prisma.sequenceStep.update({
  ```

- **update** in `services/sequence/scheduler.ts:86` (no route)
  ```typescript
  await prisma.sequenceStep.update({
  ```

- **update** in `services/sequence/scheduler.ts:115` (no route)
  ```typescript
  await prisma.sequenceStep.update({
  ```

- **create** in `services/sequence/start.ts:108` (no route)
  ```typescript
  const step1 = await prisma.sequenceStep.create({
  ```

- **create** in `services/sequence/start.ts:129` (no route)
  ```typescript
  const step2 = await prisma.sequenceStep.create({
  ```

- **create** in `services/sequence/start.ts:149` (no route)
  ```typescript
  const step3 = await prisma.sequenceStep.create({
  ```

- **update** in `services/sequence/start.ts:201` (no route)
  ```typescript
  await prisma.sequenceStep.update({
  ```

- **update** in `services/sequence/start.ts:217` (no route)
  ```typescript
  await prisma.sequenceStep.update({
  ```



### aiFeedback (2 operations)
- **update** in `app/api/feedback/submit/route.ts:53` (/api/feedback/submit)
  ```typescript
  feedback = await prisma.aiFeedback.update({
  ```

- **create** in `app/api/feedback/submit/route.ts:63` (/api/feedback/submit)
  ```typescript
  feedback = await prisma.aiFeedback.create({
  ```



### brand (3 operations)
- **delete** in `app/api/imports/[id]/undo/route.ts:16` (/api/imports/[id]/undo)
  ```typescript
  if (created.brands?.length) await prisma.brand.deleteMany({ where: { id: { in: created.brands } }});
  ```

- **upsert** in `services/imports/ingest.ts:63` (no route)
  ```typescript
  const b = await prisma.brand.upsert({
  ```

- **upsert** in `services/imports/ingest.ts:86` (no route)
  ```typescript
  return prisma.brand.upsert({ where, create: { workspaceId, name, domain }, update: {} });
  ```



### importJob (7 operations)
- **update** in `app/api/imports/[id]/undo/route.ts:19` (/api/imports/[id]/undo)
  ```typescript
  await prisma.importJob.update({ where: { id: job.id }, data: { status: 'COMPLETED', summaryJson: { path:['undone'], set: true } as any }});
  ```

- **update** in `app/api/imports/map/route.ts:15` (/api/imports/map)
  ```typescript
  await prisma.importJob.update({ where: { id: jobId }, data: { status: 'MAPPING', summaryJson: { path: ['mapping'], set: mapping } as any }});
  ```

- **update** in `app/api/imports/run/route.ts:25` (/api/imports/run)
  ```typescript
  await prisma.importJob.update({ where: { id: jobId }, data: { status: 'RUNNING' }});
  ```

- **create** in `app/api/imports/start/route.ts:32` (/api/imports/start)
  ```typescript
  const job = await prisma.importJob.create({
  ```

- **update** in `services/imports/ingest.ts:75` (no route)
  ```typescript
  await prisma.importJob.update({
  ```

- **update** in `services/imports/jobs.ts:10` (no route)
  ```typescript
  await prisma.importJob.update({ where: { id: p.jobId }, data: { processed: { increment: p.rows.length }}});
  ```

- **update** in `services/imports/jobs.ts:14` (no route)
  ```typescript
  await prisma.importJob.update({ where: { id: jobId }, data: { status: 'COMPLETED' }});
  ```



### inboxMessage (2 operations)
- **create** in `app/api/inbox/send-reply/route.ts:42` (/api/inbox/send-reply)
  ```typescript
  const replyMessage = await prisma.inboxMessage.create({
  ```

- **create** in `app/api/inbox/threads/[id]/reply/route.ts:40` (/api/inbox/threads/[id]/reply)
  ```typescript
  const outboundMessage = await prisma.inboxMessage.create({
  ```



### inboxThread (2 operations)
- **update** in `app/api/inbox/send-reply/route.ts:57` (/api/inbox/send-reply)
  ```typescript
  await prisma.inboxThread.update({
  ```

- **update** in `app/api/inbox/threads/[id]/reply/route.ts:52` (/api/inbox/threads/[id]/reply)
  ```typescript
  await prisma.inboxThread.update({
  ```



### mediaPack (1 operations)
- **create** in `app/api/media-pack/generate/route.ts:136` (/api/media-pack/generate)
  ```typescript
  const tempMediaPack = await prisma.mediaPack.create({
  ```



### mediaPackTracking (1 operations)
- **create** in `app/api/media-pack/track/route.ts:23` (/api/media-pack/track)
  ```typescript
  const trackingRecord = await prisma.mediaPackTracking.create({
  ```



### message (3 operations)
- **create** in `app/api/outreach/conversations/[id]/reply/route.ts:43` (/api/outreach/conversations/[id]/reply)
  ```typescript
  await prisma.message.create({
  ```

- **create** in `app/api/outreach/inbound/route.ts:45` (/api/outreach/inbound)
  ```typescript
  await prisma.message.create({
  ```

- **create** in `app/api/outreach/webhooks/resend/route.ts:37` (/api/outreach/webhooks/resend)
  ```typescript
  await prisma.message.create({
  ```



### conversation (2 operations)
- **update** in `app/api/outreach/conversations/[id]/reply/route.ts:59` (/api/outreach/conversations/[id]/reply)
  ```typescript
  await prisma.conversation.update({ where: { id: conv.id }, data: { lastAt: new Date() } })
  ```

- **update** in `app/api/outreach/inbound/route.ts:62` (/api/outreach/inbound)
  ```typescript
  await prisma.conversation.update({ where: { id: conv.id }, data: { lastAt: new Date() } })
  ```



### mediaPackClick (1 operations)
- **create** in `app/m/track/route.ts:69` (/m/track)
  ```typescript
  await prisma.mediaPackClick.create({
  ```



### mediaPackConversion (2 operations)
- **create** in `app/m/track/route.ts:78` (/m/track)
  ```typescript
  await prisma.mediaPackConversion.create({
  ```

- **create** in `services/mediaPack/analytics.ts:41` (no route)
  ```typescript
  return prisma.mediaPackConversion.create({
  ```



### brandCandidateCache (3 operations)
- **upsert** in `jobs/matchRefresh.ts:67` (no route)
  ```typescript
  await prisma.brandCandidateCache.upsert({
  ```

- **update** in `jobs/matchRefresh.ts:82` (no route)
  ```typescript
  await prisma.brandCandidateCache.update({
  ```

- **create** in `services/cache/brandCandidateCache.ts:12` (no route)
  ```typescript
  await prisma.brandCandidateCache.create({
  ```



### notification (1 operations)
- **create** in `jobs/matchRefresh.ts:94` (no route)
  ```typescript
  await prisma.notification.create({
  ```



### mediaPackDaily (1 operations)
- **upsert** in `jobs/mpDailyRollup.ts:34` (no route)
  ```typescript
  await prisma.mediaPackDaily.upsert({
  ```



### activityLog (1 operations)
- **create** in `lib/activity-logger.ts:18` (no route)
  ```typescript
  await prisma.activityLog.create({
  ```



### featureFlag (1 operations)
- **create** in `lib/admin/bootstrap.ts:111` (no route)
  ```typescript
  await prisma.featureFlag.createMany({
  ```



### admin (1 operations)
- **upsert** in `lib/admin/guards.ts:9` (no route)
  ```typescript
  const admin = await prisma.admin.upsert({
  ```



### auditLog (2 operations)
- **create** in `lib/admin/guards.ts:52` (no route)
  ```typescript
  await prisma.auditLog.create({ data: { ...input, metadata: safeMeta } })
  ```

- **create** in `services/auditLog.ts:4` (no route)
  ```typescript
  await prisma.auditLog.create({
  ```



### impersonationSession (2 operations)
- **create** in `lib/admin/impersonation.ts:12` (no route)
  ```typescript
  await prisma.impersonationSession.create({ data: { adminId, workspaceId, tokenHash, reason } })
  ```

- **update** in `lib/admin/impersonation.ts:24` (no route)
  ```typescript
  await prisma.impersonationSession.updateMany({
  ```



### errorEvent (1 operations)
- **create** in `lib/errors.ts:5` (no route)
  ```typescript
  await prisma.errorEvent.create({
  ```



### dedupeFingerprint (2 operations)
- **create** in `lib/idempotency.ts:83` (no route)
  ```typescript
  await prisma.dedupeFingerprint.create({
  ```

- **delete** in `lib/idempotency.ts:318` (no route)
  ```typescript
  const result = await prisma.dedupeFingerprint.deleteMany({
  ```



### aiUsageEvent (1 operations)
- **create** in `services/ai/runtime.ts:37` (no route)
  ```typescript
  await prisma.aiUsageEvent.create({
  ```



### creditLedger (3 operations)
- **create** in `services/billing/consume.ts:63` (no route)
  ```typescript
  await prisma.creditLedger.create({
  ```

- **create** in `services/billing/consume.ts:86` (no route)
  ```typescript
  await prisma.creditLedger.create({
  ```

- **create** in `services/credits.ts:24` (no route)
  ```typescript
  await prisma.creditLedger.create({
  ```



### jobs (1 operations)
- **create** in `services/billing/credits.ts:72` (no route)
  ```typescript
  await prisma.jobs.create({
  ```



### tasks (1 operations)
- **create** in `services/billing/credits.ts:82` (no route)
  ```typescript
  await prisma.tasks.create({
  ```



### brandMatch (1 operations)
- **upsert** in `services/match/score.ts:76` (no route)
  ```typescript
  const brandMatch = await prisma.brandMatch.upsert({
  ```



### signalAggregate (1 operations)
- **create** in `services/netfx/aggregate.ts:51` (no route)
  ```typescript
  await prisma.signalAggregate.create({
  ```



### playbook (1 operations)
- **create** in `services/netfx/playbooks.ts:23` (no route)
  ```typescript
  await prisma.playbook.create({
  ```



### brandReadinessSignal (1 operations)
- **create** in `services/netfx/readiness.ts:12` (no route)
  ```typescript
  await prisma.brandReadinessSignal.create({
  ```



### signalEvent (2 operations)
- **create** in `services/outreach/telemetry.ts:21` (no route)
  ```typescript
  await prisma.signalEvent.create({
  ```

- **update** in `services/outreach/telemetry.ts:67` (no route)
  ```typescript
  await prisma.signalEvent.update({
  ```



### pushSubscription (1 operations)
- **update** in `services/push/send.ts:26` (no route)
  ```typescript
  await prisma.pushSubscription.update({ where: { endpoint: s.endpoint }, data: { disabled: true } })
  ```



### contentSafetyCheck (1 operations)
- **create** in `services/safety/contentCheck.ts:60` (no route)
  ```typescript
  await prisma.contentSafetyCheck.create({
  ```



### encryptedSecret (1 operations)
- **upsert** in `services/secrets.ts:6` (no route)
  ```typescript
  return prisma.encryptedSecret.upsert({
  ```



### outreachSequence (1 operations)
- **create** in `services/sequence/start.ts:86` (no route)
  ```typescript
  const sequence = await prisma.outreachSequence.create({
  ```



### socialSnapshotCache (1 operations)
- **create** in `services/social/snapshot.cache.ts:20` (no route)
  ```typescript
  await prisma.socialSnapshotCache.create({
  ```



### emailTemplate (1 operations)
- **upsert** in `services/templates.ts:108` (no route)
  ```typescript
  await prisma.emailTemplate.upsert({
  ```



## Risky Write Patterns (71)

### app/[locale]/brand-run/page.tsx:21-33
**Issue**: Multiple writes without transaction
```typescript
workspace = await prisma.workspace.create({
await prisma.workspace.update({
```


### app/[locale]/brand-run/page.tsx:33-66
**Issue**: Multiple writes without transaction
```typescript
await prisma.workspace.update({
finalRun = await prisma.brandRun.create({
```


### app/api/admin/exports/start/route.ts:29-34
**Issue**: Multiple writes without transaction
```typescript
const job = await prisma.exportJob.create({
await prisma.adminActionLog.create({
```


### app/api/admin/retention/policy/route.ts:52-67
**Issue**: Multiple writes without transaction
```typescript
const policy = await prisma.retentionPolicy.upsert({
await prisma.adminActionLog.create({
```


### app/api/agency/invite/route.ts:64-73
**Issue**: Multiple writes without transaction
```typescript
user = await prisma.user.create({
const membership = await prisma.membership.upsert({
```


### app/api/agency/list/route.ts:130-196
**Issue**: Multiple writes without transaction
```typescript
const membership = await prisma.membership.upsert({
await prisma.membership.delete({
```


### app/api/audit/run/route.ts:143-203
**Issue**: Multiple writes without transaction
```typescript
await prisma.audit.update({
await prisma.audit.update({
```


### app/api/audit/run/route.ts:203-291
**Issue**: Multiple writes without transaction
```typescript
await prisma.audit.update({
await prisma.audit.update({
```


### app/api/billing/webhook/route.ts:52-69
**Issue**: Multiple writes without transaction
```typescript
await prisma.workspace.update({
await prisma.workspace.update({
```


### app/api/brand-run/upsert/route.ts:34-68
**Issue**: Multiple writes without transaction
```typescript
const demoWorkspace = await prisma.workspace.upsert({
await prisma.brandRun.update({
```


### app/api/contacts/[id]/notes/route.ts:57-66
**Issue**: Multiple writes without transaction
```typescript
updatedContact = await prisma.contact.update({
updatedContact = await prisma.contact.update({
```


### app/api/contacts/[id]/route.ts:48-101
**Issue**: Multiple writes without transaction
```typescript
const updated = await prisma.contact.update({
const updated = await prisma.contact.update({
```


### app/api/contacts/[id]/route.ts:101-122
**Issue**: Multiple writes without transaction
```typescript
const updated = await prisma.contact.update({
await prisma.contact.delete({
```


### app/api/contacts/[id]/tasks/route.ts:33-51
**Issue**: Multiple writes without transaction
```typescript
const item = await prisma.contactTask.create({
const item = await prisma.contactTask.update({
```


### app/api/contacts/bulk/route.ts:57-88
**Issue**: Multiple writes without transaction
```typescript
await prisma.contact.updateMany({
await prisma.contact.update({
```


### app/api/contacts/bulk/route.ts:88-101
**Issue**: Multiple writes without transaction
```typescript
await prisma.contact.update({
await prisma.contact.updateMany({
```


### app/api/contacts/bulk/route.ts:101-115
**Issue**: Multiple writes without transaction
```typescript
await prisma.contact.updateMany({
await prisma.contact.updateMany({
```


### app/api/contacts/route.ts:27-33
**Issue**: Multiple writes without transaction
```typescript
const ws = await prisma.workspace.create({
await prisma.membership.create({
```


### app/api/contacts/route.ts:33-133
**Issue**: Multiple writes without transaction
```typescript
await prisma.membership.create({
const contact = await prisma.contact.create({
```


### app/api/deals/log/route.ts:43-61
**Issue**: Multiple writes without transaction
```typescript
deal = await prisma.deal.update({
deal = await prisma.deal.create({
```


### app/api/feedback/submit/route.ts:53-63
**Issue**: Multiple writes without transaction
```typescript
feedback = await prisma.aiFeedback.update({
feedback = await prisma.aiFeedback.create({
```


### app/api/imports/[id]/undo/route.ts:15-16
**Issue**: Multiple writes without transaction
```typescript
if (created.contacts?.length) await prisma.contact.deleteMany({ where: { id: { in: created.contacts } }});
if (created.brands?.length) await prisma.brand.deleteMany({ where: { id: { in: created.brands } }});
```


### app/api/imports/[id]/undo/route.ts:16-17
**Issue**: Multiple writes without transaction
```typescript
if (created.brands?.length) await prisma.brand.deleteMany({ where: { id: { in: created.brands } }});
if (created.deals?.length) await prisma.deal.deleteMany({ where: { id: { in: created.deals } }});
```


### app/api/imports/[id]/undo/route.ts:17-19
**Issue**: Multiple writes without transaction
```typescript
if (created.deals?.length) await prisma.deal.deleteMany({ where: { id: { in: created.deals } }});
await prisma.importJob.update({ where: { id: job.id }, data: { status: 'COMPLETED', summaryJson: { path:['undone'], set: true } as any }});
```


### app/api/inbox/send-reply/route.ts:42-57
**Issue**: Multiple writes without transaction
```typescript
const replyMessage = await prisma.inboxMessage.create({
await prisma.inboxThread.update({
```


### app/api/inbox/threads/[id]/reply/route.ts:40-52
**Issue**: Multiple writes without transaction
```typescript
const outboundMessage = await prisma.inboxMessage.create({
await prisma.inboxThread.update({
```


### app/api/outreach/conversations/[id]/reply/route.ts:43-59
**Issue**: Multiple writes without transaction
```typescript
await prisma.message.create({
await prisma.conversation.update({ where: { id: conv.id }, data: { lastAt: new Date() } })
```


### app/api/outreach/inbound/route.ts:45-62
**Issue**: Multiple writes without transaction
```typescript
await prisma.message.create({
await prisma.conversation.update({ where: { id: conv.id }, data: { lastAt: new Date() } })
```


### app/api/outreach/inbound/route.ts:62-67
**Issue**: Multiple writes without transaction
```typescript
await prisma.conversation.update({ where: { id: conv.id }, data: { lastAt: new Date() } })
await prisma.sequenceStep.update({ where: { id: step.id }, data: { repliedAt: new Date(), status: 'REPLIED' } })
```


### app/api/outreach/queue/route.ts:79-187
**Issue**: Multiple writes without transaction
```typescript
await prisma.sequenceStep.update({
await prisma.sequenceStep.update({
```


### app/api/outreach/webhooks/resend/route.ts:32-37
**Issue**: Multiple writes without transaction
```typescript
await prisma.sequenceStep.update({ where: { id: step.id }, data: patch })
await prisma.message.create({
```


### app/m/track/route.ts:38-69
**Issue**: Multiple writes without transaction
```typescript
await prisma.mediaPackView.create({
await prisma.mediaPackClick.create({
```


### app/m/track/route.ts:69-78
**Issue**: Multiple writes without transaction
```typescript
await prisma.mediaPackClick.create({
await prisma.mediaPackConversion.create({
```


### jobs/matchRefresh.ts:67-82
**Issue**: Multiple writes without transaction
```typescript
await prisma.brandCandidateCache.upsert({
await prisma.brandCandidateCache.update({
```


### jobs/matchRefresh.ts:82-94
**Issue**: Multiple writes without transaction
```typescript
await prisma.brandCandidateCache.update({
await prisma.notification.create({
```


### lib/admin/bootstrap.ts:75-86
**Issue**: Multiple writes without transaction
```typescript
const workspace = await prisma.workspace.create({
const user = await prisma.user.create({
```


### lib/admin/bootstrap.ts:86-98
**Issue**: Multiple writes without transaction
```typescript
const user = await prisma.user.create({
await prisma.membership.create({
```


### lib/admin/bootstrap.ts:98-111
**Issue**: Multiple writes without transaction
```typescript
await prisma.membership.create({
await prisma.featureFlag.createMany({
```


### lib/admin/guards.ts:9-52
**Issue**: Multiple writes without transaction
```typescript
const admin = await prisma.admin.upsert({
await prisma.auditLog.create({ data: { ...input, metadata: safeMeta } })
```


### lib/admin/impersonation.ts:12-24
**Issue**: Multiple writes without transaction
```typescript
await prisma.impersonationSession.create({ data: { adminId, workspaceId, tokenHash, reason } })
await prisma.impersonationSession.updateMany({
```


### lib/auth/nextauth-options.ts:9-27
**Issue**: Multiple writes without transaction
```typescript
const user = await prisma.user.upsert({
const workspace = await prisma.workspace.create({
```


### lib/auth/nextauth-options.ts:27-35
**Issue**: Multiple writes without transaction
```typescript
const workspace = await prisma.workspace.create({
await prisma.membership.create({
```


### lib/flags.ts:178-203
**Issue**: Multiple writes without transaction
```typescript
await prisma.workspace.update({
await prisma.workspace.update({
```


### lib/idempotency.ts:83-318
**Issue**: Multiple writes without transaction
```typescript
await prisma.dedupeFingerprint.create({
const result = await prisma.dedupeFingerprint.deleteMany({
```


### lib/workspace/ensureWorkspace.ts:20-24
**Issue**: Multiple writes without transaction
```typescript
const ws = await prisma.workspace.create({
await prisma.membership.create({
```


### services/billing/consume.ts:63-82
**Issue**: Multiple writes without transaction
```typescript
await prisma.creditLedger.create({
await prisma.workspace.update({
```


### services/billing/consume.ts:82-86
**Issue**: Multiple writes without transaction
```typescript
await prisma.workspace.update({
await prisma.creditLedger.create({
```


### services/billing/credits.ts:45-72
**Issue**: Multiple writes without transaction
```typescript
await prisma.workspace.update({
await prisma.jobs.create({
```


### services/billing/credits.ts:72-82
**Issue**: Multiple writes without transaction
```typescript
await prisma.jobs.create({
await prisma.tasks.create({
```


### services/brandRun/orchestrator.ts:23-106
**Issue**: Multiple writes without transaction
```typescript
await prisma.brandRun.update({
await prisma.brandRun.update({ where: { id: runId }, data: { selectedBrandIds: selected } });
```


### services/brandRun/orchestrator.ts:106-183
**Issue**: Multiple writes without transaction
```typescript
await prisma.brandRun.update({ where: { id: runId }, data: { selectedBrandIds: selected } });
await prisma.brandRun.update({
```


### services/exports/runExport.ts:6-47
**Issue**: Multiple writes without transaction
```typescript
const job = await prisma.exportJob.update({
await prisma.exportJob.update({
```


### services/imports/ingest.ts:53-63
**Issue**: Multiple writes without transaction
```typescript
const c = await prisma.contact.upsert({
const b = await prisma.brand.upsert({
```


### services/imports/ingest.ts:63-70
**Issue**: Multiple writes without transaction
```typescript
const b = await prisma.brand.upsert({
const d = await prisma.deal.create({ data: { ...data, workspaceId: opts.workspaceId, brandId: (await ensureBrand(opts.workspaceId, row, opts.mapping)).id }});
```


### services/imports/ingest.ts:70-75
**Issue**: Multiple writes without transaction
```typescript
const d = await prisma.deal.create({ data: { ...data, workspaceId: opts.workspaceId, brandId: (await ensureBrand(opts.workspaceId, row, opts.mapping)).id }});
await prisma.importJob.update({
```


### services/imports/ingest.ts:75-86
**Issue**: Multiple writes without transaction
```typescript
await prisma.importJob.update({
return prisma.brand.upsert({ where, create: { workspaceId, name, domain }, update: {} });
```


### services/imports/jobs.ts:10-14
**Issue**: Multiple writes without transaction
```typescript
await prisma.importJob.update({ where: { id: p.jobId }, data: { processed: { increment: p.rows.length }}});
await prisma.importJob.update({ where: { id: jobId }, data: { status: 'COMPLETED' }});
```


### services/mediaPack/analytics.ts:17-41
**Issue**: Multiple writes without transaction
```typescript
return prisma.mediaPackView.create({
return prisma.mediaPackConversion.create({
```


### services/orchestrator/brandRunHelper.ts:12-23
**Issue**: Multiple writes without transaction
```typescript
return await prisma.brandRun.create({
await prisma.brandRun.updateMany({
```


### services/orchestrator/brandRunHelper.ts:23-30
**Issue**: Multiple writes without transaction
```typescript
await prisma.brandRun.updateMany({
await prisma.brandRun.updateMany({
```


### services/outreach/telemetry.ts:21-67
**Issue**: Multiple writes without transaction
```typescript
await prisma.signalEvent.create({
await prisma.signalEvent.update({
```


### services/sequence/scheduler.ts:50-86
**Issue**: Multiple writes without transaction
```typescript
await prisma.sequenceStep.update({
await prisma.sequenceStep.update({
```


### services/sequence/scheduler.ts:86-100
**Issue**: Multiple writes without transaction
```typescript
await prisma.sequenceStep.update({
await prisma.deal.updateMany({
```


### services/sequence/scheduler.ts:100-115
**Issue**: Multiple writes without transaction
```typescript
await prisma.deal.updateMany({
await prisma.sequenceStep.update({
```


### services/sequence/start.ts:69-79
**Issue**: Multiple writes without transaction
```typescript
deal = await prisma.deal.create({
await prisma.deal.update({
```


### services/sequence/start.ts:79-86
**Issue**: Multiple writes without transaction
```typescript
await prisma.deal.update({
const sequence = await prisma.outreachSequence.create({
```


### services/sequence/start.ts:86-108
**Issue**: Multiple writes without transaction
```typescript
const sequence = await prisma.outreachSequence.create({
const step1 = await prisma.sequenceStep.create({
```


### services/sequence/start.ts:108-129
**Issue**: Multiple writes without transaction
```typescript
const step1 = await prisma.sequenceStep.create({
const step2 = await prisma.sequenceStep.create({
```


### services/sequence/start.ts:129-149
**Issue**: Multiple writes without transaction
```typescript
const step2 = await prisma.sequenceStep.create({
const step3 = await prisma.sequenceStep.create({
```


### services/sequence/start.ts:149-201
**Issue**: Multiple writes without transaction
```typescript
const step3 = await prisma.sequenceStep.create({
await prisma.sequenceStep.update({
```


### services/sequence/start.ts:201-217
**Issue**: Multiple writes without transaction
```typescript
await prisma.sequenceStep.update({
await prisma.sequenceStep.update({
```


## Multi-Model Routes (13)

### /m/track
**Models**: mediaPackView, mediaPackClick, mediaPackConversion
**Risk**: Multiple models in single route


### /[locale]/brand-run
**Models**: workspace, brandRun
**Risk**: Multiple models in single route


### /api/brand-run/upsert
**Models**: workspace, brandRun
**Risk**: Multiple models in single route


### /api/contacts
**Models**: workspace, membership, contact
**Risk**: Multiple models in single route


### /api/admin/exports/start
**Models**: exportJob, adminActionLog
**Risk**: Multiple models in single route


### /api/admin/retention/policy
**Models**: adminActionLog, retentionPolicy
**Risk**: Multiple models in single route


### /api/agency/invite
**Models**: user, membership
**Risk**: Multiple models in single route


### /api/imports/[id]/undo
**Models**: contact, deal, brand, importJob
**Risk**: Multiple models in single route


### /api/outreach/inbound
**Models**: sequenceStep, message, conversation
**Risk**: Multiple models in single route


### /api/outreach/webhooks/resend
**Models**: sequenceStep, message
**Risk**: Multiple models in single route


### /api/inbox/send-reply
**Models**: inboxMessage, inboxThread
**Risk**: Multiple models in single route


### /api/inbox/threads/[id]/reply
**Models**: inboxMessage, inboxThread
**Risk**: Multiple models in single route


### /api/outreach/conversations/[id]/reply
**Models**: message, conversation
**Risk**: Multiple models in single route


## Idempotency Analysis
### Found Idempotency Patterns (64)

- **header** in `app/api/audit/run/route.ts:12`
  ```typescript
  import { withIdempotency, tx } from '@/lib/idempotency';
  ```


- **header** in `app/api/audit/run/route.ts:379`
  ```typescript
  export const POST = withRequestContext(withIdempotency(handlePOST));
  ```


- **header** in `app/api/media-pack/generate/route.ts:16`
  ```typescript
  import { withIdempotency, tx } from '@/lib/idempotency'
  ```


- **header** in `app/api/media-pack/generate/route.ts:323`
  ```typescript
  export const POST = withRequestContext(withIdempotency(handlePOST))
  ```


- **header** in `app/api/outreach/queue/route.ts:12`
  ```typescript
  import { withIdempotency, tx } from '@/lib/idempotency'
  ```


- **header** in `app/api/outreach/queue/route.ts:203`
  ```typescript
  export const POST = withRequestContext(withIdempotency(handlePOST));
  ```


- **token_check** in `app/m/track/route.ts:22`
  ```typescript
  const mp = await prisma.mediaPack.findUnique({ where: { shareToken: t || '' } })
  ```


- **token_check** in `app/m/track/route.ts:65`
  ```typescript
  const mp = await prisma.mediaPack.findUnique({ where: { shareToken: t } })
  ```


- **header** in `lib/idempotency.ts:7`
  ```typescript
  export interface IdempotencyConfig {
  ```


- **header** in `lib/idempotency.ts:14`
  ```typescript
  export interface IdempotencyResult {
  ```


- **header** in `lib/idempotency.ts:21`
  ```typescript
  * Generate a stable SHA-256 hash for request idempotency
  ```


- **header** in `lib/idempotency.ts:39`
  ```typescript
  * Extract idempotency key from request headers or generate fallback
  ```


- **header** in `lib/idempotency.ts:41`
  ```typescript
  export function requireIdempotencyKey(req: NextRequest): string {
  ```


- **header** in `lib/idempotency.ts:42`
  ```typescript
  // Try to get from Idempotency-Key header first
  ```


- **header** in `lib/idempotency.ts:43`
  ```typescript
  const headerKey = req.headers.get('Idempotency-Key')
  ```


- **header** in `lib/idempotency.ts:61`
  ```typescript
  throw new Error('Idempotency-Key header required in production')
  ```


- **header** in `lib/idempotency.ts:76`
  ```typescript
  async function checkIdempotency(
  ```


- **header** in `lib/idempotency.ts:77`
  ```typescript
  config: IdempotencyConfig
  ```


- **header** in `lib/idempotency.ts:78`
  ```typescript
  ): Promise<IdempotencyResult> {
  ```


- **header** in `lib/idempotency.ts:82`
  ```typescript
  // Try to create idempotency record
  ```


- **header** in `lib/idempotency.ts:92`
  ```typescript
  log.info('Idempotency key registered', {
  ```


- **header** in `lib/idempotency.ts:93`
  ```typescript
  feature: 'idempotency',
  ```


- **header** in `lib/idempotency.ts:106`
  ```typescript
  feature: 'idempotency',
  ```


- **header** in `lib/idempotency.ts:116`
  ```typescript
  // If database is not available, log warning and proceed without idempotency
  ```


- **header** in `lib/idempotency.ts:118`
  ```typescript
  log.warn('Database not available, proceeding without idempotency protection', {
  ```


- **header** in `lib/idempotency.ts:119`
  ```typescript
  feature: 'idempotency',
  ```


- **header** in `lib/idempotency.ts:136`
  ```typescript
  * Wrapper for route handlers that adds idempotency protection
  ```


- **header** in `lib/idempotency.ts:138`
  ```typescript
  export function withIdempotency<T extends any[]>(
  ```


- **header** in `lib/idempotency.ts:145`
  ```typescript
  // Only apply idempotency to state-changing methods
  ```


- **header** in `lib/idempotency.ts:173`
  ```typescript
  log.warn('Could not extract workspace ID for idempotency', {
  ```


- **header** in `lib/idempotency.ts:174`
  ```typescript
  feature: 'idempotency',
  ```


- **header** in `lib/idempotency.ts:180`
  ```typescript
  // Generate idempotency key
  ```


- **header** in `lib/idempotency.ts:181`
  ```typescript
  let idempotencyKey: string
  ```


- **header** in `lib/idempotency.ts:183`
  ```typescript
  idempotencyKey = requireIdempotencyKey(req)
  ```


- **header** in `lib/idempotency.ts:185`
  ```typescript
  // If we can't get a key, proceed without idempotency protection
  ```


- **header** in `lib/idempotency.ts:186`
  ```typescript
  log.warn('Proceeding without idempotency protection', {
  ```


- **header** in `lib/idempotency.ts:187`
  ```typescript
  feature: 'idempotency',
  ```


- **header** in `lib/idempotency.ts:194`
  ```typescript
  const config: IdempotencyConfig = {
  ```


- **header** in `lib/idempotency.ts:195`
  ```typescript
  key: idempotencyKey,
  ```


- **header** in `lib/idempotency.ts:202`
  ```typescript
  let result: IdempotencyResult
  ```


- **header** in `lib/idempotency.ts:204`
  ```typescript
  result = await checkIdempotency(config)
  ```


- **header** in `lib/idempotency.ts:206`
  ```typescript
  // If idempotency check fails completely, proceed without protection
  ```


- **header** in `lib/idempotency.ts:207`
  ```typescript
  log.warn('Idempotency check failed, proceeding without protection', {
  ```


- **header** in `lib/idempotency.ts:208`
  ```typescript
  feature: 'idempotency',
  ```


- **header** in `lib/idempotency.ts:209`
  ```typescript
  key: idempotencyKey,
  ```


- **header** in `lib/idempotency.ts:214`
  ```typescript
  result = { isDuplicate: false, key: idempotencyKey }
  ```


- **header** in `lib/idempotency.ts:221`
  ```typescript
  feature: 'idempotency',
  ```


- **header** in `lib/idempotency.ts:222`
  ```typescript
  key: idempotencyKey,
  ```


- **header** in `lib/idempotency.ts:233`
  ```typescript
  idempotencyKey
  ```


- **header** in `lib/idempotency.ts:238`
  ```typescript
  'X-Idempotency-Key': idempotencyKey,
  ```


- **header** in `lib/idempotency.ts:248`
  ```typescript
  // Add idempotency key to response headers
  ```


- **header** in `lib/idempotency.ts:249`
  ```typescript
  response.headers.set('X-Idempotency-Key', idempotencyKey)
  ```


- **header** in `lib/idempotency.ts:253`
  ```typescript
  log.info('Request processed with idempotency', {
  ```


- **header** in `lib/idempotency.ts:254`
  ```typescript
  feature: 'idempotency',
  ```


- **header** in `lib/idempotency.ts:255`
  ```typescript
  key: idempotencyKey,
  ```


- **header** in `lib/idempotency.ts:267`
  ```typescript
  log.error('Idempotency wrapper error', {
  ```


- **header** in `lib/idempotency.ts:268`
  ```typescript
  feature: 'idempotency',
  ```


- **header** in `lib/idempotency.ts:273`
  ```typescript
  // If idempotency fails, still try to execute the handler
  ```


- **header** in `lib/idempotency.ts:277`
  ```typescript
  log.error('Handler execution failed after idempotency error', {
  ```


- **header** in `lib/idempotency.ts:278`
  ```typescript
  feature: 'idempotency',
  ```


- **header** in `lib/idempotency.ts:312`
  ```typescript
  * Clean up old idempotency records (run periodically)
  ```


- **header** in `lib/idempotency.ts:314`
  ```typescript
  export async function cleanupIdempotencyRecords(olderThanDays: number = 7): Promise<number> {
  ```


- **header** in `lib/idempotency.ts:329`
  ```typescript
  log.info('Cleaned up old idempotency records', {
  ```


- **header** in `lib/idempotency.ts:330`
  ```typescript
  feature: 'idempotency-cleanup',
  ```


### Missing Idempotency (34)

- **/api/billing/checkout**: Write operations without idempotency protection


- **/api/billing/reset-daily**: Write operations without idempotency protection


- **/api/brand-run/upsert**: Write operations without idempotency protection


- **/api/contacts**: Write operations without idempotency protection


- **/api/brand-run/one-touch**: Write operations without idempotency protection


- **/api/admin/exports/start**: Write operations without idempotency protection


- **/api/admin/retention/policy**: Write operations without idempotency protection


- **/api/admin/runs/[runId]/steps/[stepExecId]/replay**: Write operations without idempotency protection


- **/api/agency/invite**: Write operations without idempotency protection


- **/api/agency/list**: Write operations without idempotency protection


- **/api/audit/status**: Write operations without idempotency protection


- **/api/contacts/[id]/notes**: Write operations without idempotency protection


- **/api/contacts/[id]**: Write operations without idempotency protection


- **/api/contacts/bulk**: Write operations without idempotency protection


- **/api/contacts/bulk-delete**: Write operations without idempotency protection


- **/api/contacts/bulk-tag**: Write operations without idempotency protection


- **/api/contacts/import**: Write operations without idempotency protection


- **/api/contacts/[id]/tasks**: Write operations without idempotency protection


- **/api/deals/[id]/meta**: Write operations without idempotency protection


- **/api/deals/[id]/next-step**: Write operations without idempotency protection


- **/api/deals/[id]**: Write operations without idempotency protection


- **/api/deals/log**: Write operations without idempotency protection


- **/api/deals**: Write operations without idempotency protection


- **/api/email/unsubscribe/request**: Write operations without idempotency protection


- **/api/outreach/inbound**: Write operations without idempotency protection


- **/api/feedback/submit**: Write operations without idempotency protection


- **/api/imports/[id]/undo**: Write operations without idempotency protection


- **/api/imports/map**: Write operations without idempotency protection


- **/api/imports/run**: Write operations without idempotency protection


- **/api/imports/start**: Write operations without idempotency protection


- **/api/inbox/send-reply**: Write operations without idempotency protection


- **/api/inbox/threads/[id]/reply**: Write operations without idempotency protection


- **/api/media-pack/track**: Write operations without idempotency protection


- **/api/outreach/conversations/[id]/reply**: Write operations without idempotency protection


## Summary
- **Total Models with Writes**: 53
- **Total Write Operations**: 160
- **Risky Patterns**: 71
- **Multi-Model Routes**: 13
- **Idempotency Patterns Found**: 64
- **Routes Missing Idempotency**: 34


