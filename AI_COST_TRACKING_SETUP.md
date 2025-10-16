# 💰 AI Cost Tracking - Setup Instructions

## ⚠️ CRITICAL: Run Database Migration First!

Before the AI cost tracking will work, you MUST create the database table.

### **Option 1: Local Development (Recommended)**

```bash
npx prisma db push
```

This will sync your schema with the database.

### **Option 2: Production (Neon Console)**

If `npx prisma db push` doesn't work, run this SQL in your Neon console:

```sql
CREATE TABLE ai_usage_logs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  user_id TEXT,
  feature TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  input_cost DOUBLE PRECISION NOT NULL,
  output_cost DOUBLE PRECISION NOT NULL,
  total_cost DOUBLE PRECISION NOT NULL,
  request_id TEXT,
  duration INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES "Workspace"(id) ON DELETE CASCADE
);

CREATE INDEX ai_usage_logs_workspace_id_idx ON ai_usage_logs(workspace_id);
CREATE INDEX ai_usage_logs_user_id_idx ON ai_usage_logs(user_id);
CREATE INDEX ai_usage_logs_created_at_idx ON ai_usage_logs(created_at);
CREATE INDEX ai_usage_logs_feature_idx ON ai_usage_logs(feature);
CREATE INDEX ai_usage_logs_provider_idx ON ai_usage_logs(provider);
```

---

## ✅ What's Tracking Now:

After running the migration, these features will automatically track AI costs:

### **1. Brand Research (Perplexity)**
- ✅ Tracks every "Generate More" click
- ✅ Records tokens, cost, duration
- ✅ Marks success/failure

### **2. Audit Insights (GPT-4o)**
- ⚠️ **Coming Soon** - Need to add tracking to audit service
- Will track every audit run

### **3. Media Pack Generation**
- ⚠️ **Coming Soon** - Need to add tracking to media pack service
- Will track every pack generation

---

## 🎯 What You'll Be Able To See:

### **Admin Dashboard (`/admin/ai-costs`)**

```
💰 AI Cost Tracking

Total AI Cost: $127.45
Total Tokens: 2.5M tokens
Active Workspaces: 23

By Provider:
- OpenAI: $89.23 (1.2M tokens, 345 requests)
- Perplexity: $38.22 (1.3M tokens, 89 requests)

By Feature:
- audit_insights: $67.12
- brand_research: $42.89
- media_pack: $17.44

Top 10 Workspaces by Cost:
1. Acme Corp - $45.23 (234 requests)
2. Tech Startup - $32.11 (156 requests)
...
```

### **Per-Workspace View**

Each workspace admin page will show:
- Total AI costs for that workspace
- Breakdown by provider (OpenAI, Perplexity)
- Breakdown by feature (audit, brand research, etc.)
- Cost trends over time

---

## 📊 Current Tracking Status:

| Feature | Status | Cost Tracking |
|---------|--------|---------------|
| Brand Research (Perplexity) | ✅ **LIVE** | Automatic |
| Audit Insights (GPT-4o) | ⚠️ TODO | Need to add |
| Media Pack AI | ⚠️ TODO | Need to add |
| Email Suggestions | ⚠️ TODO | Need to add |

---

## 🔧 Adding Tracking to Other Features:

To add tracking to audit or other AI features:

```typescript
import { trackAIUsage } from '@/services/ai/track-usage';

// In your AI service:
const startTime = Date.now();

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
});

const duration = Date.now() - startTime;

// Track usage
if (response.usage) {
  await trackAIUsage({
    workspaceId: workspaceId,
    userId: userId, // optional
    feature: 'audit_insights', // or 'media_pack', 'email_suggestions'
    model: 'gpt-4o',
    provider: 'openai',
    usage: {
      prompt_tokens: response.usage.prompt_tokens,
      completion_tokens: response.usage.completion_tokens,
      total_tokens: response.usage.total_tokens,
    },
    requestId: response.id,
    duration: duration,
    success: true,
  });
}
```

---

## 💡 Next Steps:

1. ✅ **Run the database migration** (see top of this file)
2. ✅ **Test brand research** - it should now track costs automatically
3. ⚠️ **Add tracking to audit service** - follow pattern above
4. ⚠️ **Add tracking to media pack** - follow pattern above
5. ✅ **Access admin dashboard** - go to `/admin/ai-costs` (admin only)

---

## 🎉 Benefits:

- **Track every AI dollar spent**
- **See which features cost the most**
- **Monitor per-workspace usage**
- **Calculate profit margins**
- **Optimize expensive features**
- **Budget forecasting**

---

**After running the migration, AI cost tracking is live!** 📊

