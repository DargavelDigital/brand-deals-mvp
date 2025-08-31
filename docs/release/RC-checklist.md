# Release Candidate Checklist

## 🚀 Pre-Deployment Validation

### Feature Flags Status
| Flag | Current Value | Source | Notes |
|------|---------------|---------|-------|
| `ai.adapt.feedback` | `false` | env | AI adaptation feedback system |
| `pwa.enabled` | `false` | env | Progressive Web App features |
| `push.enabled` | `false` | env | Push notification system |
| `crm.light.enabled` | `true` | env | CRM lightweight mode |
| `crm.reminders.enabled` | `true` | env | CRM reminder system |
| `compliance.mode` | `false` | env | Compliance features |
| `safety.moderation` | `false` | env | Content safety moderation |
| `exports.enabled` | `false` | env | Data export functionality |
| `retention.enabled` | `false` | env | Data retention policies |
| `netfx.enabled` | `false` | env | Network effects features |
| `netfx.ab.enabled` | `false` | env | Network effects A/B testing |
| `netfx.playbooks.enabled` | `false` | env | Network effects playbooks |
| `inbox.pro.enabled` | `true` | env | Inbox professional features |
| `contacts.dedupe` | `false` | env | Contact deduplication |
| `contacts.bulk` | `false` | env | Bulk contact operations |
| `brandrun.progressViz` | `false` | env | Brand run progress visualization |
| `observability` | `false` | env | Observability features |

### 🧪 Smoke Test Pages
- [ ] **Dashboard** (`/dashboard`) - Main metrics and overview
- [ ] **CRM Pipeline** (`/crm`) - Deal management and reminders
- [ ] **Contacts** (`/contacts`) - Contact management
- [ ] **Brand Run** (`/brand-run`) - Brand discovery workflow
- [ ] **Outreach Inbox** (`/outreach/inbox`) - Message management
- [ ] **Tools** (`/tools/*`) - Various utility pages
- [ ] **Settings** (`/settings/*`) - Configuration pages

### 🔌 API Health Checks
```bash
# Core API endpoints
curl -f http://localhost:3000/api/health
curl -f http://localhost:3000/api/dashboard/summary
curl -f http://localhost:3000/api/contacts

# Feature-specific endpoints
curl -f http://localhost:3000/api/inbox/threads
curl -f http://localhost:3000/api/cron/check-reminders?token=test
curl -f http://localhost:3000/api/brand-run/current

# Admin endpoints
curl -f http://localhost:3000/api/admin/telemetry
curl -f http://localhost:3000/api/admin/compliance/download
```

### 🔄 Rollback Switches
| Component | Rollback Method | Notes |
|-----------|-----------------|-------|
| **Feature Flags** | Set `NEXT_PUBLIC_*` env vars to `false` | Immediate effect, no restart needed |
| **Database Schema** | Run previous migration | Requires database rollback |
| **API Changes** | Deploy previous version | Full deployment rollback |
| **UI Components** | Feature flag toggle | Hide new components instantly |

### 📋 Pre-Release Checklist
- [ ] All feature flags documented and tested
- [ ] Smoke test pages load without errors
- [ ] API endpoints respond correctly
- [ ] Database migrations tested
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Rollback procedures tested

### 🚨 Emergency Procedures
1. **Immediate Rollback**: Toggle feature flags to `false`
2. **Database Rollback**: Run `pnpm db:migrate:repair` if needed
3. **Full Rollback**: Deploy previous version tag
4. **Contact**: Notify team and stakeholders

### 📊 Monitoring Post-Deployment
- [ ] Error rates in logs
- [ ] API response times
- [ ] User engagement metrics
- [ ] Feature flag usage
- [ ] System resource usage

---

**Last Updated**: $(date)
**Release Version**: RC-$(date +%Y%m%d)
**Prepared By**: Development Team
