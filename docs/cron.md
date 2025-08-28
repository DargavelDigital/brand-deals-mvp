# Cron Jobs

## Daily Purge Job

Run daily to clean up soft-deleted workspaces older than 30 days:

```bash
curl -X POST $APP_URL/api/workspaces/purge
```

### Setup Instructions

1. **Environment Variable**: Ensure `APP_URL` is set in your cron environment
2. **Authentication**: The endpoint requires owner role authentication
3. **Schedule**: Recommended to run daily at 2 AM UTC
4. **Monitoring**: Check logs for successful purges and any errors

### Example Cron Entry

```cron
0 2 * * * curl -X POST $APP_URL/api/workspaces/purge
```

### Alternative: Use a Task Scheduler

If you're using a cloud platform:

- **Vercel**: Use Vercel Cron Jobs
- **Netlify**: Use Netlify Functions with scheduled triggers
- **AWS**: Use EventBridge with Lambda
- **GCP**: Use Cloud Scheduler with Cloud Functions

### Monitoring

The purge endpoint returns:
```json
{
  "purged": 5
}
```

Log this information for monitoring and alerting.
