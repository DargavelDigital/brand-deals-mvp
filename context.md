# PDF Generation Debug Context

## Current Issue
- PDF generation returns blank page with `about:blank` URL
- PDFShift API reports "The URL provided is invalid" error
- JWT token URL encoding has been fixed but issue persists

## System Architecture

### PDF Generation Flow
1. User clicks "Generate PDF" button
2. Frontend calls `/api/media-pack/generate-with-pdfshift`
3. API creates JWT token with brand-specific data
4. API constructs preview URL: `https://brand-deals-mvp.vercel.app/media-pack/preview?t={token}`
5. API calls PDFShift with the preview URL
6. PDFShift accesses the URL and converts to PDF
7. PDF is returned to user

### Key Files
- **Preview Page**: `src/app/(public)/media-pack/preview/page.tsx`
- **PDFShift API**: `src/app/api/media-pack/generate-with-pdfshift/route.ts`
- **Token Signing**: `src/lib/signing.ts`
- **Frontend**: `src/app/[locale]/tools/pack/page.tsx`

## Debugging Information Needed

### 1. URL Accessibility
- [ ] Can you manually access the preview URL in browser?
- [ ] What does the URL look like when generated?
- [ ] Does the URL contain any special characters?

### 2. Token Validation
- [ ] Is the JWT token being generated correctly?
- [ ] Is the token being verified properly on the preview page?
- [ ] What error appears when accessing preview without token?

### 3. PDFShift API Response
- [ ] What is the exact error message from PDFShift?
- [ ] What HTTP status code is returned?
- [ ] Are there any additional error details in the response?

### 4. Preview Page Rendering
- [ ] Does the preview page render correctly in browser?
- [ ] Are there any console errors on the preview page?
- [ ] Does the page load completely or partially?

### 5. Environment Variables
- [ ] Is `PDFSHIFT_API_KEY` set correctly?
- [ ] Is `MEDIA_PACK_SIGNING_SECRET` set correctly?
- [ ] Are there any missing environment variables?

## Test URLs to Check

### 1. Preview Page (No Token)
```
https://brand-deals-mvp.vercel.app/media-pack/preview
```
**Expected**: "Invalid preview token." message

### 2. Preview Page (With Token)
```
https://brand-deals-mvp.vercel.app/media-pack/preview?t={generated-token}
```
**Expected**: Full media pack preview

### 3. PDFShift API Test
```bash
curl -X POST https://api.pdfshift.io/v3/convert/pdf \
  -H "Authorization: Basic {base64-encoded-api-key}" \
  -H "Content-Type: application/json" \
  -d '{"source": "https://brand-deals-mvp.vercel.app/media-pack/preview?t={token}"}'
```

## Common Issues & Solutions

### Issue 1: Invalid URL
- **Cause**: JWT token contains URL-unsafe characters
- **Solution**: ✅ Fixed with URL-safe token encoding

### Issue 2: Preview Page Not Accessible
- **Cause**: Route not properly configured or middleware blocking
- **Check**: Verify `src/app/(public)/media-pack/preview/page.tsx` exists

### Issue 3: Token Verification Failing
- **Cause**: Token format mismatch between signing and verification
- **Check**: Verify `signPayload` and `verifyToken` functions

### Issue 4: PDFShift Can't Access URL
- **Cause**: URL requires authentication or has CORS issues
- **Check**: Ensure preview page is publicly accessible

### Issue 5: Preview Page Rendering Issues
- **Cause**: CSS/JS not loading properly for PDFShift
- **Check**: Verify embedded CSS in preview page

## Next Steps

1. **Test URL Accessibility**: Manually verify the preview URL works
2. **Check Token Generation**: Verify JWT tokens are created correctly
3. **Test PDFShift Directly**: Use curl to test PDFShift API
4. **Debug Preview Page**: Check for rendering issues
5. **Verify Environment**: Ensure all required env vars are set

## Logs to Check

### Server Logs
- Look for "PDFSHIFT DEBUG" messages
- Check for JWT token generation logs
- Verify URL construction logs

### Browser Console
- Check for JavaScript errors on preview page
- Verify CSS is loading correctly
- Check for network errors

### PDFShift API Response
- Check the exact error message
- Verify the URL being sent to PDFShift
- Check for any additional error details

## Environment Variables Required

```bash
PDFSHIFT_API_KEY=sk_b64080cb3a7a45d06be1516f97a29848e8b2e708
MEDIA_PACK_SIGNING_SECRET=dev-secret
NEXT_PUBLIC_APP_URL=https://brand-deals-mvp.vercel.app
```

## Quick Tests

### Test 1: Manual URL Access
1. Generate a PDF
2. Copy the preview URL from server logs
3. Paste in browser
4. Verify it shows the media pack preview

### Test 2: Token Verification
1. Check server logs for token generation
2. Verify token length and format
3. Test token verification manually

### Test 3: PDFShift Direct Test
1. Use curl to test PDFShift API directly
2. Use a simple test URL first
3. Then try with the actual preview URL

---

**Please provide the following information:**
1. The exact preview URL being generated
2. The PDFShift API error response
3. Whether the preview URL works in browser
4. Any console errors on the preview page
5. Server logs showing the token generation process


ShiftPDF (PDFShift) API and Application: Comprehensive Breakdown

Overview of PDFShift (often called ShiftPDF)

PDFShift – sometimes referred to informally as ShiftPDF – is a cloud‑based API that converts HTML or web pages to PDFs. It provides a single REST endpoint to convert a raw HTML string or a URL into a pixel‑perfect PDF. Developers supply an API key and a JSON payload describing the document, and PDFShift returns the PDF either as binary data, a Base64 string, or a link to a stored file. The service handles modern CSS (flexbox, grid, custom fonts) and JavaScript and can wait for custom conditions before capturing the page.

Key properties
	•	API endpoint: POST https://api.pdfshift.io/v3/convert/pdf
	•	Authentication: pass your secret key in the X‑API‑Key HTTP header. A sandbox mode exists (with watermark and lower limits).
	•	Rate limits: 250 documents/minute for paid plans; 10/minute in sandbox. The response headers return remaining credits and reset time.
	•	Input: supply a source field containing either a URL or raw HTML. Raw HTML (with inline CSS/JavaScript) avoids extra network requests and improves performance ￼.
	•	Output: by default the API returns binary PDF data. You can also request Base64 encoding (encode: true) or tell PDFShift to store the file on its S3 and return a public URL via the filename parameter.

Important API Parameters

The PDFShift API has many optional parameters. Some of the most relevant ones for rendering React/HTML components are summarized below (see PDFShift documentation for the full list ￼):

Parameter
Description
Example
source
Required. Raw HTML or URL to convert. Raw HTML should include the full <html> document and inline CSS & scripts.
{"source": '<html>...</html>'}
format
Controls page size. Accepts preset names (A4, Letter, etc.) or custom sizes like 1280xauto. Setting the height to auto makes the PDF’s height adapt to the content .
"format": "1280xauto"
landscape
Boolean; when true the page orientation is landscape.
margins
Object specifying top/right/bottom/left margins (units px, mm, cm, or in).
{ "top": "20mm", "right": "0mm", ... }
css
Inline CSS or URL to inject before rendering. Useful for overriding styles when exporting a React component .
"css": "body { background-color: white; }"
javascript
Inline script or URL executed before conversion. Can adjust the DOM or define functions used in wait_for .
"javascript": "document.querySelector('h1').style.color = 'red';"
wait_for
Name of a global function; PDFShift waits until this function returns true before generating the PDF . It’s crucial for asynchronous React rendering (e.g., waiting for data or fonts).
use_print
When true, uses CSS @media print; otherwise uses screen media.
pages
Select page ranges (e.g., `1
3-5`).
s3_destination
Uploads the result directly to your Amazon S3 bucket. Requires an S3 bucket policy allowing the PDFShift AWS user to write files .
webhook
URL to receive asynchronous results; helpful for high‑volume conversions.
header/footer
Objects defining HTML headers or footers with placeholders like {{page}} and {{total}} .

Typical Workflow for Rendering a React/HTML Component as a PDF

1. Prepare the HTML
	1.	Render your component to an HTML string. In React, use ReactDOMServer.renderToString() or renderToStaticMarkup() in a Node environment. Capture any CSS-in-JS styles (e.g., using styled-components’ ServerStyleSheet or Material‑UI’s ServerStyleSheets) and insert them into a <style> tag.
	2.	Embed assets inline. To reduce external network calls, embed images as Data URIs and include fonts using Base64. The PDFShift documentation stresses that providing raw HTML with inline resources speeds up conversion and works for pages not publicly accessible ￼.
	3.	Wrap everything in a complete HTML document. Ensure the markup has <html>, <head> (with meta tags and inline <style>), and <body> containing your component’s markup.
	4.	Define a ready function if needed. If your component includes asynchronous operations (e.g., chart rendering, font loading), define a global function (e.g., function isReady() { return window.myChartsLoaded; }) and pass its name via the wait_for parameter ￼. Alternatively, inject JavaScript through the javascript parameter to create the isReady function on the fly ￼.

2. Create a server-side function to call PDFShift

On Vercel, you can implement a serverless function (e.g., in pages/api/generate-pdf.js for Next.js) that receives the HTML, calls PDFShift and returns the PDF. Example using Axios:

import axios from 'axios';

export default async function handler(req, res) {
  const html = req.body.html; // HTML string generated from React component

  const params = {
    source: html,
    format: '1280xauto',       // auto height; adjust width to match your design [oai_citation:11‡pdfshift.io](https://pdfshift.io/guides/node/axios/generate-a-document-with-full-height/#:~:text=When%20you%27re%20converting%20a%20document%2C,height%7D%60%20part)
    margins: { top: '20mm', left: '10mm', bottom: '20mm', right: '10mm' },
    use_print: false,          // use screen CSS by default
    css: '',                   // optional extra CSS
    // if asynchronous rendering: javascript: 'function isReady(){...}', wait_for: 'isReady'
  };

  try {
    const response = await axios.post(
      'https://api.pdfshift.io/v3/convert/pdf',
      params,
      {
        headers: { 'X-API-Key': process.env.PDFSHIFT_API_KEY },
        responseType: 'arraybuffer' // ensures binary data is returned
      }
    );

    // The response contains binary data in response.data
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
    return res.status(200).send(Buffer.from(response.data));
  } catch (error) {
    console.error('PDF generation error', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
}

Notes:
	•	Use responseType: 'arraybuffer' so Axios doesn’t interpret the binary data.
	•	Do not expose the API key to the client. Store it in Vercel’s environment variables (e.g., PDFSHIFT_API_KEY).
	•	For large or multiple conversions, consider asynchronous processing with the webhook or s3_destination options. Setting a webhook URL will return immediately; PDFShift then sends a POST request to the webhook when the PDF is ready.

3. Handling fonts and asynchronous content

If your component relies on web fonts or dynamic data (charts, lazy‑loaded images), PDFShift might start conversion before those resources finish rendering. You can manage this through the wait_for parameter:
	•	In your HTML, define a global function (e.g., isPageReady()) that returns true only when the desired elements are ready (e.g., check document.fonts.ready or the presence of a DOM element).
	•	Pass wait_for: 'isPageReady' in the parameters. PDFShift will repeatedly evaluate the function until it returns true ￼.
	•	Optionally supply the function via the javascript parameter if the HTML itself cannot define it ￼.

4. Customizing the PDF

Headers and Footers

You can add page numbers, dates or other repeated content using the header and footer objects. Each accepts source (raw HTML), height (e.g., 50px, 10mm) and start_at (page number where it becomes visible). You can use built‑in variables like {{ page }}, {{ total }}, {{ date }}, {{ title }} and {{ url }} to insert dynamic information ￼. For example:

params.header = {
  source: '<div style="font-size:12px; text-align:right;">Page {{ page }} of {{ total }}</div>',
  height: 40,
  start_at: 1
};

CSS and JavaScript injection

The css parameter accepts either a string or a URL and injects additional styles before rendering ￼. Similarly, javascript can inject custom script to modify elements or set up wait_for conditions ￼. These parameters are useful when you want to adjust the PDF styling without altering the original component.

Automatic page dimensions

The format parameter accepts standard sizes (A4, Letter, etc.) or custom strings like '{width}x{height}'. When the height is set to auto, PDFShift computes the final height based on your content ￼. You can specify units (px, cm, mm, in). For example, "format": "1280xauto" produces a page 1280px wide with height matching the page content.

Waiting on asynchronous elements

When your page loads charts, fonts or data asynchronously, set a wait_for parameter referencing a global function returning true when everything is ready. PDFShift will evaluate this function before capturing the page ￼. This ensures that dynamic content appears in the PDF.

Saving directly to Amazon S3 or retrieving a URL

To avoid streaming large PDFs through your server, you can instruct PDFShift to store the file in your S3 bucket using the s3_destination parameter. First, grant PDFShift’s AWS user permission to put objects in your bucket using a policy like the following ￼:

{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "Allows PDFShift.io to write the generated PDF in this bucket.",
    "Effect": "Allow",
    "Principal": { "AWS": ["arn:aws:iam::804461045055:user/pdfshift"] },
    "Action": ["s3:PutObject"],
    "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
  }]
}

Then call the API with a destination such as s3://YOUR-BUCKET-NAME/path/filename.pdf. PDFShift uploads the PDF and returns a JSON response containing the final URL and metadata ￼.

Alternatively, set the filename parameter (without S3) to instruct PDFShift to store the file in its own S3 and return a URL for retrieval.

Node Example Using Axios

Below is a complete Node example (similar to the one provided by PDFShift) that converts an HTML document to a PDF using Axios ￼:

const axios = require('axios');
const fs    = require('fs');

async function convert(apiKey, params, endpoint = 'pdf') {
  if (!['pdf','png','jpg','webp'].includes(endpoint)) {
    throw new Error('Invalid endpoint');
  }

  const response = await axios.post(
    `https://api.pdfshift.io/v3/convert/${endpoint}`,
    params,
    { headers: { 'X-API-Key': apiKey }, responseType: 'arraybuffer' }
  );

  // If using filename or webhook, the response is JSON; otherwise response.data is binary
  return response.data;
}

(async () => {
  const html = '<html><body><h1>Hello world</h1></body></html>';
  const pdfBuffer = await convert(process.env.PDFSHIFT_API_KEY, { source: html });
  fs.writeFileSync('result.pdf', pdfBuffer);
  console.log('PDF saved');
})();

This example shows how to call the PDFShift API with raw HTML, retrieve the binary PDF and write it to disk. It demonstrates the essential steps: set the X‑API‑Key header, provide a source, and handle binary data.

Use‑case Considerations for Vercel/React
	•	Server vs client: PDF generation should be done on the server (e.g., a Next.js API route or serverless function). Do not call PDFShift directly from client‑side React, since you would expose your secret key.
	•	Bundling and dependencies: Use Node’s HTTP libraries (Axios, Needle, etc.) in your serverless function. PDFShift provides examples for multiple libraries, but the API call is simple enough that any HTTP client works.
	•	Environment variables: Store your PDFShift secret key as an environment variable in Vercel (e.g., PDFSHIFT_API_KEY). Use the sandbox key for development and upgrade when you need production‑level conversions.
	•	Error handling: Check response status codes and handle errors gracefully. The API may return status 400/500 with an error message. Rate‑limit headers can help you avoid hitting conversion limits.
	•	Async tasks: For long or high‑volume conversions, use webhook to process asynchronously. In such a workflow, your API route can immediately return a job ID, and your application will receive a webhook callback when the PDF is ready.
	•	GDPR/HIPAA compliance: PDFShift states that it does not store documents unless requested and is HIPAA compliant ￼. Ensure this meets your regulatory requirements.

Conclusion

PDFShift (often called ShiftPDF) is a robust API for converting HTML or web pages into high‑fidelity PDFs. By sending a JSON payload with your HTML content and optional parameters to https://api.pdfshift.io/v3/convert/pdf, you can render React components into pixel‑perfect PDFs. The service supports advanced features such as custom page sizes, margins, CSS/JS injection, headers/footers, waiting for asynchronous content, and direct storage to S3. Integrating PDFShift in a Vercel/React environment involves rendering your component to an HTML string, calling the API from a serverless function with your secret key, handling binary data, and optionally customizing the conversion with the parameters outlined above.

