# Email Safety System

This document describes the email safety system implemented to prevent accidental spam and provide working unsubscribe functionality.

## Overview

The email safety system provides:
- **Spam prevention** through email validation and role account detection
- **Development safety** with email allowlist restrictions
- **Compliance** with unsubscribe requirements and proper headers
- **Suppression management** using file-based storage (no schema changes)

## Email Safety Policies

### Development Environment Protection

In development (`NODE_ENV !== 'production'`), emails are restricted to an allowlist:

```bash
# Set ALLOW_DEV_EMAILS to a regex pattern
ALLOW_DEV_EMAILS=".*@(example\.com|test\.com|localhost)$"
```

**Examples:**
- `ALLOW_DEV_EMAILS=".*@example\.com$"` - Only allow @example.com emails
- `ALLOW_DEV_EMAILS=".*@(example\.com|test\.com)$"` - Allow multiple domains
- `ALLOW_DEV_EMAILS="test.*@.*"` - Allow any email starting with "test"

### Role Account Detection

The system automatically blocks emails to common role accounts and traps:

**Blocked Patterns:**
- `noreply@`, `no-reply@`, `donotreply@`
- `info@`, `admin@`, `support@`, `help@`
- `sales@`, `marketing@`, `billing@`
- `test@`, `demo@`, `example@`
- Plus addressing: `user+tag@domain.com`
- Common personal email patterns

### Suppression List

Unsubscribed emails are stored in `var/suppressions.json`:

```json
{
  "emails": [
    "user1@example.com",
    "user2@test.com"
  ]
}
```

## Unsubscribe System

### Request Unsubscribe

**Endpoint:** `POST /api/email/unsubscribe/request`

```json
{
  "email": "user@example.com",
  "workspaceId": "ws-123",
  "workspaceName": "My Workspace"
}
```

**Process:**
1. Generates secure token (32 characters)
2. Stores in `VerificationToken` table (repurposed from NextAuth)
3. Sends confirmation email with unsubscribe link
4. Token expires in 7 days

### Confirm Unsubscribe

**Endpoint:** `GET /api/email/unsubscribe/{token}`

**Process:**
1. Validates token and expiration
2. Extracts email from token identifier
3. Adds email to suppression list
4. Deletes used token
5. Returns success page

## Compliance Features

### Email Headers

All outreach emails include proper headers:

```
List-Unsubscribe: <mailto:noreply@domain.com?subject=Unsubscribe>, <https://app.com/api/email/unsubscribe/request?workspace=ws-123>
X-Hyper-Sequence: seq-123
X-Hyper-Step: 1
X-Hyper-Thread: thread-456
```

### Compliance Footer

Every email includes a compliance footer with:
- Unsubscribe links (both mailto and HTTPS)
- Mailing address
- Service identification

**Example Footer:**
```html
<div style="margin-top: 40px; padding: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666; text-align: center;">
  <p>
    You received this email because you're connected to <strong>My Workspace</strong>.
    <br>
    If you no longer wish to receive these emails, you can 
    <a href="mailto:noreply@domain.com?subject=Unsubscribe">unsubscribe via email</a> or 
    <a href="https://app.com/api/email/unsubscribe/request?email={email}&workspace=ws-123">unsubscribe online</a>.
  </p>
  <p>
    <strong>Our mailing address:</strong><br>
    noreply@domain.com<br>
    domain.com
  </p>
</div>
```

## Configuration

### Environment Variables

```bash
# Required for email sending
MAIL_DOMAIN=yourdomain.com
MAIL_FROM=noreply@yourdomain.com

# Development email allowlist (regex)
ALLOW_DEV_EMAILS=".*@(example\.com|test\.com)$"

# App URL for unsubscribe links
APP_URL=https://yourdomain.com
```

### File Structure

```
var/
  suppressions.json    # Email suppression list
```

## Integration

### Outreach Pipeline

The email safety system is integrated into the outreach queue:

```typescript
// Check if email should be sent
const emailCheck = shouldSendEmail(step.contact.email)
if (!emailCheck.allowed) {
  logEmailBlocked(step.contact.email, emailCheck.reason!)
  // Mark step as failed and continue
  continue
}

// Add compliance footer
html = appendComplianceFooter(html, workspace)

// Add List-Unsubscribe header
headers['List-Unsubscribe'] = getListUnsubscribeHeader(workspace)
```

### Logging

All email blocking is logged with structured JSON:

```json
{
  "ts": "2024-01-15T13:10:07.123Z",
  "level": "warn",
  "msg": "Email send blocked",
  "feature": "email-safety",
  "to": "user@example.com",
  "reason": "dev-block",
  "details": "Email not in ALLOW_DEV_EMAILS allowlist",
  "stepId": "step-123",
  "sequenceId": "seq-456"
}
```

## Management

### Suppression List Management

**View suppressions:**
```bash
cat var/suppressions.json
```

**Add suppression manually:**
```bash
# Edit var/suppressions.json and add email to the array
```

**Clear suppressions:**
```bash
rm var/suppressions.json
```

### Development Testing

**Test email blocking:**
```bash
# Set restrictive allowlist
export ALLOW_DEV_EMAILS=".*@example\.com$"

# Try sending to blocked domain
curl -X POST /api/outreach/queue \
  -d '{"email": "test@blocked.com"}'
# Should return 200 but log blocking
```

**Test unsubscribe flow:**
```bash
# Request unsubscribe
curl -X POST /api/email/unsubscribe/request \
  -d '{"email": "test@example.com", "workspaceId": "ws-123"}'

# Check email for confirmation link
# Visit the link to confirm unsubscribe
```

## Monitoring

### Key Metrics

- **Blocked emails**: Count by reason (dev-block, role-account, suppressed)
- **Unsubscribe rate**: Successful unsubscribes per day
- **Suppression list size**: Total suppressed emails
- **Token usage**: Unsubscribe token generation and consumption

### Alerts

Set up alerts for:
- High email blocking rates
- Unsubscribe token failures
- Suppression list growth
- Development email sends in production

## Best Practices

### Development

1. **Always set `ALLOW_DEV_EMAILS`** in development
2. **Use test domains** like `@example.com`, `@test.com`
3. **Monitor logs** for blocked emails
4. **Test unsubscribe flow** regularly

### Production

1. **Remove `ALLOW_DEV_EMAILS`** or set to empty
2. **Monitor suppression rates** for spam indicators
3. **Regular cleanup** of old unsubscribe tokens
4. **Backup suppression list** regularly

### Compliance

1. **Include unsubscribe links** in all marketing emails
2. **Honor unsubscribe requests** immediately
3. **Maintain suppression list** permanently
4. **Provide clear unsubscribe instructions**

## Troubleshooting

### Common Issues

**"Email blocked: dev-block"**
- Set `ALLOW_DEV_EMAILS` environment variable
- Ensure email matches the regex pattern

**"Email blocked: role-account"**
- Email matches role account pattern
- Use a different email address for testing

**"Email blocked: suppressed"**
- Email is in suppression list
- Remove from `var/suppressions.json` if needed

**Unsubscribe link not working**
- Check token expiration (7 days)
- Verify `APP_URL` environment variable
- Check database for token validity

### Debug Mode

Enable detailed logging:

```bash
NODE_ENV=development
LOG_LEVEL=debug
```

This will show detailed email safety decisions and token operations.

## Security Considerations

- **Token security**: Unsubscribe tokens are cryptographically secure (32 chars)
- **Token expiration**: All tokens expire in 7 days
- **One-time use**: Tokens are deleted after use
- **Email validation**: All emails are validated before processing
- **Rate limiting**: Consider adding rate limiting to unsubscribe requests

## Future Enhancements

- **Timestamp tracking** in suppression list
- **Bounce handling** integration
- **Complaint processing** from email providers
- **Analytics dashboard** for email safety metrics
- **Bulk unsubscribe** management
- **Suppression list import/export**
