# Email Safety and Anti-Spam Measures

This document outlines the email safety measures implemented to prevent accidental spam during testing and development.

## Overview

The email safety system includes:
- **Compliance footers** on all outgoing emails
- **List-Unsubscribe headers** for easy unsubscribing
- **Development environment restrictions** to prevent accidental sends
- **Role account blocking** to avoid common email traps
- **Suppression list management** for unsubscribed users

## Configuration

### Environment Variables

#### `ALLOW_DEV_EMAILS` (Regex Pattern)
Controls which email addresses are allowed in development/staging environments.

**Default**: `.*@(yourdomain\\.com|test\\.com|example\\.com)$`

**Examples**:
```bash
# Allow only your domain and test domains
ALLOW_DEV_EMAILS=".*@(yourdomain\\.com|test\\.com|example\\.com)$"

# Allow any email with +test in the local part
ALLOW_DEV_EMAILS=".*\\+test@.*"

# Allow specific test emails
ALLOW_DEV_EMAILS="(test|demo|dev)@.*"
```

#### `MAIL_DOMAIN` and `MAIL_FROM`
Used for compliance footers and unsubscribe links.

```bash
MAIL_DOMAIN="yourdomain.com"
MAIL_FROM="noreply@yourdomain.com"
```

## Email Safety Policies

### 1. Development Environment Blocking

In non-production environments, emails are blocked unless they match the `ALLOW_DEV_EMAILS` regex pattern.

**Blocked in dev/staging**:
- `user@gmail.com` (doesn't match allowlist)
- `test@random.com` (doesn't match allowlist)

**Allowed in dev/staging**:
- `test@yourdomain.com` (matches allowlist)
- `user+test@yourdomain.com` (matches allowlist)

### 2. Role Account Blocking

The following email patterns are automatically blocked:

**Hardcoded role accounts**:
- `noreply@`, `no-reply@`, `donotreply@`
- `info@`, `admin@`, `support@`, `help@`
- `contact@`, `sales@`, `marketing@`, `billing@`
- `abuse@`, `postmaster@`, `webmaster@`

**Pattern-based blocking**:
- Personal email patterns: `user@gmail.com`, `user@yahoo.com`
- Plus addressing: `user+tag@domain.com`
- Test patterns: `test123@`, `demo456@`, `temp789@`
- Spam patterns: `spam@`, `fake@`

### 3. Suppression List

Unsubscribed emails are stored in `var/suppressions.json`:

```json
{
  "emails": [
    "user@example.com",
    "test@domain.com"
  ]
}
```

## Unsubscribe Flow

### 1. Request Unsubscribe

**POST** `/api/email/unsubscribe/request`

```json
{
  "email": "user@example.com",
  "workspaceId": "workspace-123",
  "workspaceName": "Brand Deals MVP"
}
```

**Response**:
```json
{
  "ok": true,
  "message": "Unsubscribe request processed. Check your email for confirmation link."
}
```

### 2. Confirm Unsubscribe

**GET** `/api/email/unsubscribe/{token}`

- Verifies the token is valid and not expired
- Adds email to suppression list
- Deletes the used token
- Returns a success page

## Compliance Features

### 1. Email Footers

All outgoing emails automatically include:

- **Unsubscribe links** (both mailto and HTTPS)
- **Mailing address** from environment variables
- **Sender identification**
- **Compliance text**

### 2. List-Unsubscribe Headers

All emails include RFC-compliant `List-Unsubscribe` headers:

```
List-Unsubscribe: <mailto:noreply@yourdomain.com?subject=Unsubscribe>, <https://yourdomain.com/api/email/unsubscribe/request?workspace=123>
```

## Testing

### Manual Testing

1. **Test email safety policies**:
   ```bash
   curl -X POST http://localhost:3000/api/debug/email-safety \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

2. **Test email sending**:
   ```bash
   curl -X POST http://localhost:3000/api/debug/send-test-email \
     -H "Content-Type: application/json" \
     -d '{"to": "test@example.com", "subject": "Test", "html": "<p>Test</p>"}'
   ```

3. **Test unsubscribe flow**:
   ```bash
   # Request unsubscribe
   curl -X POST http://localhost:3000/api/email/unsubscribe/request \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "workspaceId": "test"}'
   
   # Check suppressions file
   cat var/suppressions.json
   ```

### Automated Testing

Run the email safety test suite:

```bash
npm run test:email-safety
```

## Monitoring

### Logs

Email blocking is logged with structured JSON:

```json
{
  "ts": "2025-01-27T10:00:00.000Z",
  "level": "warn",
  "msg": "Email send blocked",
  "feature": "email-safety",
  "to": "user@gmail.com",
  "reason": "dev-block",
  "details": "Email not in ALLOW_DEV_EMAILS allowlist",
  "workspaceId": "workspace-123",
  "templateKey": "welcome-email"
}
```

### Suppression Statistics

Get suppression list stats:

```typescript
import { getSuppressionStats } from '@/services/email/policies'

const stats = await getSuppressionStats()
console.log(`Total suppressions: ${stats.total}`)
```

## Production Considerations

1. **Set appropriate `ALLOW_DEV_EMAILS`** for your test domains
2. **Configure `MAIL_DOMAIN` and `MAIL_FROM`** properly
3. **Monitor suppression list growth** to identify issues
4. **Test unsubscribe flow** before going live
5. **Review email blocking logs** regularly

## Troubleshooting

### Common Issues

1. **All emails blocked in development**:
   - Check `ALLOW_DEV_EMAILS` regex pattern
   - Verify test email addresses match the pattern

2. **Unsubscribe not working**:
   - Check `var/suppressions.json` file permissions
   - Verify database connection for token storage

3. **Compliance footer missing**:
   - Ensure all email sending functions use the safety policies
   - Check `MAIL_DOMAIN` and `MAIL_FROM` environment variables

### Debug Commands

```bash
# Check email safety for specific address
curl -X POST http://localhost:3000/api/debug/email-safety \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# View suppression list
cat var/suppressions.json

# Test email sending
curl -X POST http://localhost:3000/api/debug/send-test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "subject": "Test", "html": "<p>Test</p>", "workspaceId": "test"}'
```