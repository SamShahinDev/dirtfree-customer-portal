# Security Headers & Content Security Policy (CSP)

## Overview

This application implements comprehensive security headers and Content Security Policy (CSP) to protect against common web vulnerabilities including XSS, clickjacking, code injection, and data exfiltration.

**Implementation Date**: January 2025
**Status**: ✅ Complete - Production Ready

---

## Implementation Architecture

### Headers Configuration: `next.config.ts`

Security headers are configured in **`next.config.ts`** using the `async headers()` function for optimal performance:

**Why next.config.ts?**
- ✅ **Build-time Application**: Headers are applied at build time, not runtime
- ✅ **Universal Coverage**: Applied to ALL routes including static assets
- ✅ **Better Performance**: No runtime overhead on each request
- ✅ **Cleaner Separation**: Middleware handles auth, config handles security

**Location**: `next.config.ts:47-96`

---

## Security Headers Implemented

### 1. **X-DNS-Prefetch-Control** ✅

```typescript
{
  key: 'X-DNS-Prefetch-Control',
  value: 'on',
}
```

**Purpose**: Enables DNS prefetching for improved performance
**Protection**: N/A (performance optimization)
**Browser Support**: All modern browsers

---

### 2. **Strict-Transport-Security (HSTS)** 🔒 CRITICAL

```typescript
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload',
}
```

**Purpose**: Forces HTTPS connections
**Protection**: Prevents downgrade attacks and cookie hijacking
**Details**:
- `max-age=63072000`: 2 years (730 days)
- `includeSubDomains`: Applies to all subdomains
- `preload`: Eligible for browser HSTS preload list

**Browser Support**: All modern browsers
**Security Rating**: A+

---

### 3. **X-Frame-Options** 🔒 CRITICAL

```typescript
{
  key: 'X-Frame-Options',
  value: 'SAMEORIGIN',
}
```

**Purpose**: Controls iframe embedding
**Protection**: Prevents clickjacking attacks
**Options**:
- `DENY`: No framing allowed (most secure)
- `SAMEORIGIN`: Only same-origin framing ✅ (current)
- `ALLOW-FROM`: Specific origins only (deprecated)

**Why SAMEORIGIN?**: Allows framing by same origin (needed for some dashboard features)
**Browser Support**: All browsers

---

### 4. **X-Content-Type-Options** 🔒

```typescript
{
  key: 'X-Content-Type-Options',
  value: 'nosniff',
}
```

**Purpose**: Prevents MIME type sniffing
**Protection**: Blocks MIME-based attacks
**Details**: Forces browser to respect `Content-Type` header
**Browser Support**: All modern browsers

---

### 5. **X-XSS-Protection** ⚠️

```typescript
{
  key: 'X-XSS-Protection',
  value: '1; mode=block',
}
```

**Purpose**: Legacy XSS filter (for older browsers)
**Protection**: Blocks reflected XSS attacks
**Status**: Deprecated in modern browsers (CSP is preferred)
**Browser Support**: IE, Edge Legacy, Safari (older versions)

**Note**: Included for legacy browser support. Modern protection comes from CSP.

---

### 6. **Referrer-Policy** 🔒

```typescript
{
  key: 'Referrer-Policy',
  value: 'origin-when-cross-origin',
}
```

**Purpose**: Controls referrer information sent with requests
**Protection**: Prevents information leakage
**Details**:
- Same-origin requests: Send full URL
- Cross-origin requests: Send origin only

**Example**:
- Same origin: `https://app.example.com/dashboard` → `https://app.example.com/dashboard/page`
- Cross origin: `https://app.example.com/dashboard` → `https://external.com` (only sends `https://app.example.com`)

**Browser Support**: All modern browsers

---

### 7. **Permissions-Policy** 🔒

```typescript
{
  key: 'Permissions-Policy',
  value: 'camera=(), microphone=(), geolocation=()',
}
```

**Purpose**: Controls browser feature access
**Protection**: Prevents unauthorized feature access
**Disabled Features**:
- 📷 Camera: No camera access
- 🎤 Microphone: No microphone access
- 📍 Geolocation: No location access

**Browser Support**: Modern browsers (replaces Feature-Policy)

---

### 8. **Content-Security-Policy (CSP)** 🔒 CRITICAL

```typescript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com https://www.google-analytics.com",
    "frame-src https://js.stripe.com",
  ].join('; '),
}
```

**Purpose**: **THE MOST IMPORTANT security header** - prevents XSS, code injection, and data exfiltration
**Protection**: Controls what resources can be loaded and executed

#### CSP Directives Explained:

**1. `default-src 'self'`**
- Default policy for all resource types
- Only allows resources from same origin
- Acts as fallback for unspecified directives

**2. `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com`**
- ✅ `'self'`: Scripts from same origin
- ⚠️ `'unsafe-eval'`: Required for Stripe.js and dynamic code
- ⚠️ `'unsafe-inline'`: Required for Next.js inline scripts
- ✅ `https://js.stripe.com`: Stripe payment SDK
- ✅ `https://www.googletagmanager.com`: Google Analytics

**3. `style-src 'self' 'unsafe-inline'`**
- ✅ `'self'`: Stylesheets from same origin
- ⚠️ `'unsafe-inline'`: Required for CSS-in-JS and inline styles

**4. `img-src 'self' data: https: blob:`**
- ✅ `'self'`: Images from same origin
- ✅ `data:`: Data URIs (inline images, base64)
- ✅ `https:`: Any HTTPS image source
- ✅ `blob:`: Blob URLs (file uploads, canvas images)

**5. `font-src 'self' data:`**
- ✅ `'self'`: Fonts from same origin
- ✅ `data:`: Data URI fonts (inline web fonts)

**6. `connect-src 'self' https://*.supabase.co https://api.stripe.com https://www.google-analytics.com`**
- ✅ `'self'`: API calls to same origin
- ✅ `https://*.supabase.co`: Supabase API/Realtime
- ✅ `https://api.stripe.com`: Stripe API
- ✅ `https://www.google-analytics.com`: Analytics API

**7. `frame-src https://js.stripe.com`**
- ✅ `https://js.stripe.com`: Stripe payment iframe

#### Why `'unsafe-inline'` and `'unsafe-eval'`?

**Required for**:
- Next.js inline hydration scripts
- Stripe.js payment SDK
- CSS-in-JS libraries (styled-components, emotion)
- React inline event handlers

**Security Trade-off**:
- ⚠️ Reduces CSP protection level
- ✅ Still blocks most XSS attacks
- ✅ Prevents unauthorized script execution from external sources
- ✅ Better than no CSP at all

**Future Improvement**: Use nonce-based CSP for stricter inline script control

---

## Middleware vs next.config.ts

### Previous Implementation (middleware.ts) ❌

**Before**:
```typescript
// middleware.ts
response.headers.set('X-Frame-Options', 'DENY')
response.headers.set('X-Content-Type-Options', 'nosniff')
// ... more headers
```

**Issues**:
- ❌ Runtime overhead on every request
- ❌ Not applied to static assets
- ❌ Mixed with authentication logic

### Current Implementation (next.config.ts) ✅

**After**:
```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [/* all security headers */]
    }
  ]
}
```

**Benefits**:
- ✅ Build-time application (faster)
- ✅ Applied to ALL routes (including static)
- ✅ Cleaner architecture (separation of concerns)

### Middleware Now Focuses on Authentication

**middleware.ts** (current - 8 lines):
```typescript
export async function middleware(request: NextRequest) {
  // Update Supabase session and handle authentication redirects
  // Security headers are now configured in next.config.ts for better performance
  return await updateSession(request)
}
```

**Responsibilities**:
- ✅ Authentication checks
- ✅ Session management
- ✅ Route protection
- ✅ Redirects (login, dashboard, etc.)

---

## Testing Security Headers

### Manual Testing with curl

```bash
# Test all headers
curl -I http://localhost:3009

# Expected output:
HTTP/1.1 307 Temporary Redirect
X-DNS-Prefetch-Control: on
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' ...
```

### Browser DevTools Testing

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Load any page
4. Click on the request
5. Go to **Headers** tab
6. Verify all security headers are present

### CSP Violation Testing

**Check for CSP violations**:
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for CSP violation errors:
   - ✅ No errors = CSP configured correctly
   - ❌ "Refused to load... because it violates CSP" = Need to update CSP

**Common CSP violations to fix**:
```
❌ Refused to load script from 'https://example.com' because it violates CSP
→ Add to script-src: https://example.com

❌ Refused to connect to 'https://api.example.com' because it violates CSP
→ Add to connect-src: https://api.example.com

❌ Refused to load image from 'https://cdn.example.com' because it violates CSP
→ Already covered by img-src https: (allows all HTTPS images)
```

---

## Security Score Verification

### Online Security Header Scanners

**1. Security Headers (securityheaders.com)**
```bash
https://securityheaders.com/?q=https://your-domain.com&followRedirects=on
```
**Expected Score**: A or A+

**2. Mozilla Observatory**
```bash
https://observatory.mozilla.org/analyze/your-domain.com
```
**Expected Score**: A or A+

**3. SSL Labs**
```bash
https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com
```
**Expected Score**: A+

---

## Production Deployment Checklist

Before deploying to production, verify:

- [ ] All 8 security headers are present in next.config.ts
- [ ] CSP allows all required external resources (Stripe, Supabase, Analytics)
- [ ] HSTS header includes `preload` directive
- [ ] Test with `curl -I https://your-domain.com`
- [ ] Check browser Console for CSP violations
- [ ] Run security header scanner (securityheaders.com)
- [ ] Verify Stripe payments work (CSP allows js.stripe.com)
- [ ] Verify Supabase auth works (CSP allows *.supabase.co)
- [ ] Verify Google Analytics works (CSP allows googletagmanager.com)

---

## Troubleshooting

### Issue: Headers Not Applied

**Check 1**: Verify next.config.ts has `async headers()` function
**Check 2**: Restart dev server (`rm -rf .next && npm run dev`)
**Check 3**: Clear browser cache (Ctrl+Shift+R)

### Issue: CSP Blocking Resources

**Symptom**: "Refused to load... because it violates CSP"

**Solution**: Add the domain to the appropriate CSP directive:
```typescript
// Example: Adding new analytics provider
"connect-src 'self' https://*.supabase.co https://api.stripe.com https://analytics.newprovider.com",
```

### Issue: Stripe Not Working

**Check**: CSP allows Stripe domains
```typescript
"script-src ... https://js.stripe.com",
"connect-src ... https://api.stripe.com",
"frame-src https://js.stripe.com",
```

### Issue: HSTS Preload Rejection

**Requirements for HSTS preload list**:
1. Valid HTTPS certificate
2. Redirect HTTP to HTTPS
3. `max-age` ≥ 31536000 (1 year) ✅ (we use 2 years)
4. `includeSubDomains` directive ✅
5. `preload` directive ✅

**Submit to preload list**: https://hstspreload.org/

---

## Future Enhancements

### 1. Nonce-Based CSP ⭐ RECOMMENDED

**Current**: Uses `'unsafe-inline'` for scripts/styles
**Future**: Generate nonces for each request

**Benefits**:
- ✅ Removes need for `'unsafe-inline'`
- ✅ Stronger XSS protection
- ✅ Allows inline scripts securely

**Implementation**:
```typescript
// middleware.ts
const nonce = crypto.randomBytes(16).toString('base64')
response.headers.set('Content-Security-Policy',
  `script-src 'self' 'nonce-${nonce}' https://js.stripe.com`
)
```

### 2. Subresource Integrity (SRI)

Add integrity hashes for external scripts:
```html
<script
  src="https://js.stripe.com/v3/"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

### 3. Report-Only Mode for Testing

Test CSP changes without breaking functionality:
```typescript
{
  key: 'Content-Security-Policy-Report-Only',
  value: "default-src 'self'; report-uri /api/csp-violations"
}
```

### 4. Additional Security Headers

Consider adding:
- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`

---

## Files Modified

### Security Headers Configuration
- ✅ `next.config.ts` - Added `async headers()` function with all 8 security headers

### Middleware Cleanup
- ✅ `middleware.ts` - Removed security headers (now in next.config.ts)
- ✅ Kept authentication logic only (cleaner, more focused)

### Documentation
- ✅ `SECURITY-HEADERS.md` - This comprehensive guide

---

## Related Documentation

- `RATE-LIMITING.md` - API rate limiting implementation
- `OPTIMIZATION-SUMMARY.md` - Database caching
- `BUNDLE-OPTIMIZATION-SUMMARY.md` - Code splitting
- `PERFORMANCE-OPTIMIZATION.md` - General performance guide

---

## References

**Security Best Practices**:
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Content Security Policy Reference](https://content-security-policy.com/)

**Testing Tools**:
- [Security Headers Scanner](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [HSTS Preload](https://hstspreload.org/)

**Next.js Documentation**:
- [Security Headers in Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers)
- [Content Security Policy](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)

---

**Implementation Date**: January 2025
**Status**: ✅ Complete - Production Ready
**Security Coverage**: 8/8 headers implemented (100%) ✅
**CSP Coverage**: All required external resources whitelisted ✅
