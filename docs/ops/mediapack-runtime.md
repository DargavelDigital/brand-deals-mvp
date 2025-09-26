# Media Pack Runtime Configuration

This document describes the Chromium resolver and fallback system for PDF generation in the media pack feature.

## Overview

The media pack generator uses a multi-tier fallback system to ensure PDF generation works across different deployment environments:

1. **CHROME_EXECUTABLE_PATH** environment variable (highest priority)
2. **@sparticuz/chromium** package (AWS Lambda/Netlify optimized)
3. **System Chrome** (macOS/Linux)
4. **Puppeteer bundled Chromium** (fallback)
5. **Stub PDF generation** (when no Chromium is available)

## Environment Variables

### Required for Production

Set the `CHROME_EXECUTABLE_PATH` environment variable to point to a Chromium executable:

```bash
# Netlify
CHROME_EXECUTABLE_PATH=/opt/chrome/chrome

# AWS Lambda
CHROME_EXECUTABLE_PATH=/opt/chrome/chrome

# Local development (macOS)
CHROME_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome

# Local development (Linux)
CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome
```

### Optional

- `PUPPETEER_EXECUTABLE_PATH` - Legacy support (deprecated, use CHROME_EXECUTABLE_PATH)

## Fallback Order

### 1. CHROME_EXECUTABLE_PATH (Recommended)

**Priority**: Highest  
**Use case**: Production deployments, custom Chromium installations  
**Performance**: Best (optimized for serverless)  
**Memory**: ~200MB  

```bash
export CHROME_EXECUTABLE_PATH=/opt/chrome/chrome
```

### 2. @sparticuz/chromium

**Priority**: High  
**Use case**: AWS Lambda, Netlify Functions  
**Performance**: Excellent (pre-optimized)  
**Memory**: ~150MB  

The package is already installed and will be used automatically if `CHROME_EXECUTABLE_PATH` is not set.

### 3. System Chrome

**Priority**: Medium  
**Use case**: Local development, VPS deployments  
**Performance**: Good  
**Memory**: ~300MB  

Automatically detects Chrome/Chromium installations on:
- macOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- Linux: `/usr/bin/google-chrome`, `/usr/bin/chromium-browser`
- Windows: `C:\Program Files\Google\Chrome\Application\chrome.exe`

### 4. Puppeteer Bundled

**Priority**: Low  
**Use case**: Development fallback  
**Performance**: Variable  
**Memory**: ~400MB  

Uses Puppeteer's bundled Chromium as a last resort.

### 5. Stub PDF

**Priority**: Emergency  
**Use case**: When no Chromium is available  
**Performance**: Excellent (instant)  
**Memory**: ~1MB  

Generates a single-page PDF with "DEMO / PREVIEW ONLY" watermark using pdf-lib.

## Serverless Configuration

### Netlify

Add to `netlify.toml`:

```toml
[build.environment]
  CHROME_EXECUTABLE_PATH = "/opt/chrome/chrome"

[functions]
  node_bundler = "esbuild"
  external_node_modules = ["@sparticuz/chromium"]
```

### AWS Lambda

Add to your deployment configuration:

```yaml
environment:
  CHROME_EXECUTABLE_PATH: /opt/chrome/chrome
```

### Vercel

Vercel doesn't support Chromium in serverless functions. Use the stub PDF fallback or consider using Vercel's Edge Runtime with a different approach.

## Memory and Time Limits

### Recommended Limits

- **Memory**: 1024MB minimum, 2048MB recommended
- **Timeout**: 120 seconds (2 minutes)
- **Concurrent executions**: 10-20 (depending on memory allocation)

### Memory Usage by Source

| Source | Base Memory | Peak Memory | Notes |
|--------|-------------|-------------|-------|
| CHROME_EXECUTABLE_PATH | 200MB | 300MB | Optimized for serverless |
| @sparticuz/chromium | 150MB | 250MB | Pre-optimized binary |
| System Chrome | 300MB | 500MB | Full Chrome installation |
| Puppeteer Bundled | 400MB | 600MB | Includes Node.js overhead |
| Stub PDF | 1MB | 5MB | pdf-lib only |

## Error Handling

### PDF_RENDER_FAILED

When Chromium is not available and stub generation fails:

```json
{
  "ok": false,
  "code": "PDF_RENDER_FAILED",
  "hint": "Chromium not found or timed out",
  "error": "Failed to generate media pack PDF"
}
```

### Response Headers

- `X-Is-Stub`: `true`/`false` - Indicates if the PDF is a stub
- `X-PDF-URL`: URL where the PDF is stored
- `X-Share-URL`: Signed share URL for the media pack

## Monitoring

### Structured Logging

All PDF generation events are logged with structured JSON:

```json
{
  "ts": "2024-01-15T13:10:07.123Z",
  "level": "info",
  "msg": "PDF generated successfully with Chromium",
  "requestId": "req-123",
  "feature": "mediapack-generate",
  "sizeBytes": 245760,
  "renderTimeMs": 1500,
  "source": "CHROME_EXECUTABLE_PATH"
}
```

### Key Metrics

- `renderTimeMs`: Time taken to generate PDF
- `sizeBytes`: Size of generated PDF
- `isStub`: Whether fallback was used
- `source`: Which Chromium source was used

## Troubleshooting

### Common Issues

1. **"Chromium not found"**
   - Set `CHROME_EXECUTABLE_PATH` environment variable
   - Verify the path points to a valid Chromium executable

2. **"PDF_RENDER_FAILED"**
   - Check memory allocation (increase to 2048MB)
   - Verify Chromium executable has proper permissions
   - Check timeout settings (increase to 120s)

3. **"Stub PDF generation also failed"**
   - Check pdf-lib package installation
   - Verify file system write permissions

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

This will show detailed Chromium detection and launch logs.

## Performance Optimization

### For Production

1. **Use CHROME_EXECUTABLE_PATH** with a pre-optimized Chromium binary
2. **Allocate sufficient memory** (2048MB recommended)
3. **Set appropriate timeouts** (120s for complex PDFs)
4. **Monitor memory usage** and adjust limits accordingly

### For Development

1. **Use system Chrome** for best performance
2. **Set CHROME_EXECUTABLE_PATH** to your local Chrome installation
3. **Enable debug logging** to troubleshoot issues

## Security Considerations

- Chromium runs in headless mode with sandbox disabled for serverless compatibility
- All PDF generation is isolated and doesn't persist browser state
- Stub PDFs contain no sensitive data, only watermarks and instructions
- Generated PDFs are stored using the existing storage system (local/S3)
