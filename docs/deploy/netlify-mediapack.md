# Netlify Media Pack Deployment Guide

This guide covers deploying the Brand Deals MVP with PDF generation capabilities on Netlify.

## Overview

The media pack generation feature uses Puppeteer with Chromium to generate PDFs from HTML templates. This requires specific configuration on Netlify to ensure proper Chrome/Chromium availability and sufficient resources.

## Prerequisites

- Netlify account with Pro plan (required for function memory/timeout configuration)
- Database connection (PostgreSQL recommended)
- Email provider configuration (Resend recommended)

## Environment Variables

### Required Variables

Set these in your Netlify site settings under "Environment variables":

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
NEXTAUTH_URL=https://your-site.netlify.app
NEXTAUTH_SECRET=your-secret-key

# Email
MAIL_DOMAIN=yourdomain.com
MAIL_FROM=noreply@yourdomain.com
RESEND_API_KEY=your-resend-key

# Chrome/Chromium (choose one option)
CHROME_EXECUTABLE_PATH=/opt/buildhome/node-deps/node_modules/@sparticuz/chromium/bin
# OR for Netlify's managed Chrome:
# CHROME_EXECUTABLE_PATH=/opt/buildhome/.netlify/functions/chrome
# NOTE: If not set, the API returns stub PDFs but doesn't 500

# Feature flags
MEDIAPACK_V2=true
ENABLE_DEMO_AUTH=1
NEXT_PUBLIC_ENABLE_DEMO_AUTH=1
```

### Optional Variables

```bash
# Development email allowlist (for testing)
ALLOW_DEV_EMAILS=".*@(example\.com|test\.com)$"

# App URL for unsubscribe links
APP_URL=https://your-site.netlify.app

# Additional feature flags
AI_ADAPT_FEEDBACK=1
FEATURE_BILLING_ENABLED=false
```

## Function Configuration

### Memory and Timeout Settings

The media pack generation requires significant resources. Configure these in your `netlify.toml`:

```toml
# Function configuration for media pack generation
[functions."/api/media-pack/generate"]
  timeout = 120
  memory = 1024

# Function configuration for other heavy operations
[functions."/api/audit/run"]
  timeout = 120
  memory = 1024

[functions."/api/outreach/queue"]
  timeout = 60
  memory = 1024
```

### Alternative: Netlify UI Configuration

You can also configure these in the Netlify UI:

1. Go to **Site settings** → **Functions**
2. Find `/api/media-pack/generate`
3. Set:
   - **Memory**: 1024 MB
   - **Timeout**: 120 seconds

## Chrome/Chromium Setup

### Option 1: @sparticuz/chromium (Recommended)

This is the most reliable option for serverless environments:

1. **Install the package** (already in package.json):
   ```bash
   pnpm add @sparticuz/chromium
   ```

2. **Set environment variable** in Netlify function environment:
   ```bash
   CHROME_EXECUTABLE_PATH=/opt/buildhome/node-deps/node_modules/@sparticuz/chromium/bin
   ```

3. **Increase function timeout and memory** for `/api/media-pack/generate`:
   - Memory: 1024 MB
   - Timeout: 120 seconds

4. **Verify in build logs** that the package is installed correctly.

**Note**: If `CHROME_EXECUTABLE_PATH` is not set, the API will return stub PDFs but won't return 500 errors. This allows the application to function in a degraded mode.

### Option 2: Netlify's Managed Chrome

If you prefer to use Netlify's managed Chrome:

1. **Set environment variable**:
   ```bash
   CHROME_EXECUTABLE_PATH=/opt/buildhome/.netlify/functions/chrome
   ```

2. **Note**: This may have different behavior and limitations.

### Option 3: Custom Chrome Binary

For advanced use cases, you can upload a custom Chrome binary:

1. **Upload Chrome binary** to your site's functions directory
2. **Set environment variable** to the binary path
3. **Ensure binary permissions** are correct

## Build Configuration

### netlify.toml

Your `netlify.toml` should include:

```toml
[build]
  command = "pnpm run build:netlify"

[build.environment]
  NODE_VERSION = "20"
  PNPM_VERSION = "10.14.0"
  NODE_MODULES_CACHE = "false"
  CHROME_EXECUTABLE_PATH = "/opt/buildhome/node-deps/node_modules/@sparticuz/chromium/bin"
  PRISMA_QUERY_ENGINE_TYPE = "binary"
  PRISMA_FORCE_DOWNLOAD = "1"
  PRISMA_SKIP_MIGRATE = "1"

[[plugins]]
  package = "@netlify/plugin-nextjs"

# Function configurations as shown above
```

### Build Scripts

Ensure your `package.json` includes:

```json
{
  "scripts": {
    "build:netlify": "next build",
    "postinstall": "prisma generate"
  }
}
```

## Testing Deployment

### 1. Chromium Debug Endpoint

Test Chromium availability:

```bash
curl https://your-site.netlify.app/api/debug/chromium
```

Expected response when Chromium is available:
```json
{
  "ok": true,
  "chromium": {
    "executablePath": "/opt/buildhome/node-deps/node_modules/@sparticuz/chromium/bin",
    "args": ["--disable-gpu", "--no-sandbox", ...],
    "headless": "new",
    "timeoutMs": 120000
  },
  "hasPuppeteerCore": true
}
```

Expected response when Chromium is not available (stub-only mode):
```json
{
  "ok": true,
  "chromium": {
    "executablePath": undefined,
    "args": ["--disable-gpu", "--no-sandbox", ...],
    "headless": "new",
    "timeoutMs": 120000
  },
  "hasPuppeteerCore": true,
  "note": "stub-only"
}
```

### 2. Media Pack Generation

Test PDF generation:

```bash
curl -X POST https://your-site.netlify.app/api/media-pack/generate \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-123" \
  -d '{"packId": "test-123", "variant": "classic", "dark": false}'
```

### 3. Stub PDF Fallback

If Chromium is not available, the system will generate a stub PDF:

- Response includes `X-Is-Stub: true` header
- PDF contains "DEMO / PREVIEW ONLY" watermark
- System continues to function without errors

## Troubleshooting

### Common Issues

#### 1. "Chromium not found" Error

**Symptoms**: PDF generation fails with Chromium not found error

**Solutions**:
- Verify `CHROME_EXECUTABLE_PATH` is set correctly
- Check that `@sparticuz/chromium` is installed
- Review build logs for package installation

#### 2. Function Timeout

**Symptoms**: Request times out after 10 seconds (default)

**Solutions**:
- Increase function timeout to 120 seconds
- Check function memory allocation (1024 MB recommended)
- Optimize PDF generation (reduce page complexity)

#### 3. Memory Issues

**Symptoms**: Function runs out of memory

**Solutions**:
- Increase function memory to 1024 MB or higher
- Optimize HTML templates (reduce image sizes, CSS complexity)
- Consider using stub PDF fallback for complex pages

#### 4. Build Failures

**Symptoms**: Build fails during deployment

**Solutions**:
- Check Node.js version (20 recommended)
- Verify PNPM version compatibility
- Review build logs for specific errors
- Ensure all dependencies are properly installed

### Debug Information

#### Check Function Logs

1. Go to **Functions** tab in Netlify dashboard
2. Click on `/api/media-pack/generate`
3. Review recent invocations and logs

#### Test Chromium Availability

Use the debug endpoint to check Chromium status:

```bash
curl https://your-site.netlify.app/api/debug/chromium
```

#### Monitor Performance

Check function metrics in Netlify dashboard:
- **Duration**: Should be under 120 seconds
- **Memory usage**: Should be under 1024 MB
- **Error rate**: Should be low

## Performance Optimization

### 1. Function Configuration

- **Memory**: 1024 MB minimum for PDF generation
- **Timeout**: 120 seconds for complex PDFs
- **Concurrency**: Limit concurrent PDF generations

### 2. PDF Optimization

- **Image compression**: Use optimized images in templates
- **CSS optimization**: Minimize CSS complexity
- **Font loading**: Use web-safe fonts or preload custom fonts

### 3. Caching Strategy

- **CDN caching**: Cache generated PDFs in CDN
- **Function caching**: Cache Chromium instances when possible
- **Template caching**: Cache HTML templates

## Security Considerations

### 1. Environment Variables

- **Never commit** sensitive environment variables
- **Use Netlify UI** for production secrets
- **Rotate keys** regularly

### 2. Function Security

- **Rate limiting**: Implement rate limiting for PDF generation
- **Authentication**: Ensure proper authentication for PDF routes
- **Input validation**: Validate all input parameters

### 3. Chrome Security

- **Sandbox mode**: Chrome runs in sandboxed mode
- **No external access**: Chrome cannot access external resources
- **Limited permissions**: Minimal file system access

## Monitoring and Alerts

### 1. Function Metrics

Monitor these metrics in Netlify dashboard:
- **Invocation count**: Number of PDF generations
- **Duration**: Average and max execution time
- **Memory usage**: Peak memory consumption
- **Error rate**: Percentage of failed requests

### 2. Custom Alerts

Set up alerts for:
- **High error rate**: > 5% function failures
- **Long duration**: > 100 seconds execution time
- **Memory issues**: > 900 MB memory usage
- **Chromium failures**: Frequent Chromium not found errors

### 3. Log Analysis

Regularly review logs for:
- **Performance patterns**: Identify slow PDF generations
- **Error trends**: Common failure causes
- **Resource usage**: Memory and CPU patterns

## Backup and Recovery

### 1. Function Configuration

- **Backup netlify.toml**: Version control configuration
- **Document changes**: Keep track of configuration changes
- **Test changes**: Always test in preview before production

### 2. Environment Variables

- **Export configuration**: Document all environment variables
- **Backup secrets**: Secure backup of API keys and secrets
- **Recovery plan**: Document recovery procedures

## Cost Optimization

### 1. Function Usage

- **Monitor usage**: Track function invocations and duration
- **Optimize code**: Reduce execution time and memory usage
- **Cache results**: Cache generated PDFs when possible

### 2. Resource Allocation

- **Right-size functions**: Use appropriate memory/timeout settings
- **Monitor costs**: Track Netlify function costs
- **Optimize triggers**: Reduce unnecessary function calls

## Support and Resources

### 1. Documentation

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Puppeteer Documentation](https://pptr.dev/)

### 2. Community

- [Netlify Community](https://community.netlify.com/)
- [Next.js Discord](https://discord.gg/nextjs)
- [Puppeteer GitHub](https://github.com/puppeteer/puppeteer)

### 3. Professional Support

- **Netlify Support**: For platform-specific issues
- **Next.js Support**: For framework-related problems
- **Custom Development**: For application-specific issues
