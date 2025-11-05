# Performance Checklist

This checklist ensures the Dirt Free Carpet Customer Portal meets all performance requirements before deployment. Use this alongside the Pre-Launch Checklist for comprehensive production readiness validation.

**Last Updated:** January 2025

---

## Quick Start

Run the automated performance audit:

```bash
# Start development server (in one terminal)
npm run dev

# Run performance audit (in another terminal)
npm run audit
```

This script automatically validates:
- ✅ Lighthouse Performance score (≥ 85)
- ✅ Lighthouse Accessibility score (≥ 90)
- ✅ Lighthouse Best Practices score (≥ 85)
- ✅ Lighthouse SEO score (≥ 90)
- ✅ Core Web Vitals (LCP, TBT, CLS)

If all automated checks pass, proceed with the manual verification steps below.

---

## 1. Automated Performance Audit

### Lighthouse Testing

```bash
# Prerequisites: Development server must be running
npm run dev

# In a separate terminal, run the audit
npm run audit
```

**Required Scores:**
- [ ] Performance: ≥ 85/100
- [ ] Accessibility: ≥ 90/100
- [ ] Best Practices: ≥ 85/100
- [ ] SEO: ≥ 90/100

**Expected Output:**
```
✅ Performance               Score: 92/100 (threshold: 85) [PASS]
✅ Accessibility             Score: 95/100 (threshold: 90) [PASS]
✅ Best Practices            Score: 92/100 (threshold: 85) [PASS]
✅ SEO                       Score: 100/100 (threshold: 90) [PASS]
```

**If Audit Fails:**
1. Review the generated `lighthouse-report.html` in the project root
2. Check "Key Optimization Opportunities" in the audit output
3. Fix issues and re-run the audit
4. Do not deploy until all thresholds are met

---

## 2. Core Web Vitals

### Target Metrics

- [ ] **LCP (Largest Contentful Paint)** < 2.5s
  - Measures loading performance
  - Critical for perceived speed
  - Target: "Good" threshold (< 2.5s)

- [ ] **FID (First Input Delay)** < 100ms
  - Measures interactivity
  - Time from user interaction to browser response
  - Target: "Good" threshold (< 100ms)
  - Note: TBT (Total Blocking Time) is used as proxy in Lighthouse

- [ ] **CLS (Cumulative Layout Shift)** < 0.1
  - Measures visual stability
  - Prevents unexpected layout shifts
  - Target: "Good" threshold (< 0.1)

### Verification

**Automated (included in `npm run audit`):**
```bash
npm run audit
```

**Manual Testing:**

1. Install Web Vitals Chrome Extension:
   https://chrome.google.com/webstore/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma

2. Visit key pages and verify metrics:
   - [ ] Dashboard (`/dashboard`)
   - [ ] Appointments page (`/dashboard/appointments`)
   - [ ] Invoices page (`/dashboard/invoices`)
   - [ ] Payment flow (`/dashboard/invoices/[id]`)
   - [ ] Loyalty rewards (`/dashboard/rewards`)

3. Check Chrome DevTools Lighthouse:
   - Open DevTools (F12)
   - Go to Lighthouse tab
   - Run audit
   - Verify Core Web Vitals pass

---

## 3. Bundle Size Optimization

### Build Analysis

```bash
npm run build
```

**Size Targets:**
- [ ] Main bundle (gzipped) < 200KB
- [ ] Total page size < 1MB
- [ ] No single component > 50KB
- [ ] Route-specific bundles < 100KB each

### Verification

Check build output for warnings:
```bash
npm run build

# Look for:
# ⚠ Compiled with warnings
# - First Load JS shared by all: XXX kB
```

**If Bundle Too Large:**

1. **Analyze bundle:**
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ```

   Add to `next.config.js`:
   ```javascript
   const withBundleAnalyzer = require('@next/bundle-analyzer')({
     enabled: process.env.ANALYZE === 'true',
   })

   module.exports = withBundleAnalyzer({
     // ... existing config
   })
   ```

   Run analysis:
   ```bash
   ANALYZE=true npm run build
   ```

2. **Common fixes:**
   - Use dynamic imports for large components
   - Remove unused dependencies
   - Optimize images (see Image Optimization section)
   - Use tree-shaking compatible libraries

---

## 4. Image Optimization

### Requirements

- [ ] All images use Next.js `<Image>` component
- [ ] Images have explicit width and height
- [ ] Large images lazy-loaded
- [ ] Images served in modern formats (WebP, AVIF)
- [ ] Image sizes appropriate for device (responsive)

### Verification

**Check Image Usage:**
```bash
# Search for non-optimized images
grep -r "<img" src/
# Should return minimal results (only external images)

# Verify Next.js Image components
grep -r "from 'next/image'" src/
# Should show Image imports
```

**Image Optimization Checklist:**
- [ ] No `<img>` tags (use Next.js `<Image>` instead)
- [ ] All images have `alt` text (accessibility)
- [ ] Images use `priority` for above-the-fold content
- [ ] Images use `loading="lazy"` for below-the-fold content
- [ ] No images larger than 500KB
- [ ] Logo/icons use SVG when possible

---

## 5. Caching Verification

### Application-Level Caching

Already implemented via LRU cache. Verify cache is working:

```bash
# Check cache statistics
curl http://localhost:3009/api/cache/stats
```

**Expected Response:**
```json
{
  "success": true,
  "caches": {
    "customers": { "size": 145, "max": 1000 },
    "notifications": { "size": 67, "max": 500 }
  },
  "performance": {
    "hitRate": "87.34%",
    "totalEntries": 342
  }
}
```

**Verification:**
- [ ] Customer cache hit rate > 80%
- [ ] Notification cache hit rate > 70%
- [ ] Cache statistics endpoint accessible
- [ ] No cache-related errors in logs

### Browser Caching

**Check Response Headers:**
```bash
# Static assets should have long cache times
curl -I http://localhost:3009/_next/static/css/[hash].css
# Should include: Cache-Control: public, max-age=31536000, immutable

# API responses should have appropriate caching
curl -I http://localhost:3009/api/health
# Should include appropriate Cache-Control headers
```

**Verification:**
- [ ] Static assets cached for 1 year
- [ ] HTML pages not cached (or short cache)
- [ ] API responses cached appropriately
- [ ] Service Worker configured (if applicable)

---

## 6. Database Query Optimization

### Index Verification

All database indexes should be applied via migration `10-add-performance-indexes.sql`.

**Verify Indexes Exist:**

Connect to Supabase and run:
```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('jobs', 'invoices', 'messages', 'notifications', 'loyalty_transactions')
ORDER BY tablename, indexname;
```

**Expected Indexes:**
- [ ] `idx_jobs_customer_date` - Jobs by customer + date
- [ ] `idx_jobs_status` - Jobs by status
- [ ] `idx_jobs_customer_status_date` - Jobs composite index
- [ ] `idx_invoices_customer_status` - Invoices by customer + status
- [ ] `idx_invoices_status` - Invoices by status
- [ ] `idx_invoices_customer_date` - Invoices by customer + date
- [ ] `idx_loyalty_transactions_customer_date` - Loyalty transactions
- [ ] `idx_messages_customer_status_date` - Messages composite
- [ ] `idx_notifications_customer_read_date` - Notifications composite

**Query Performance Testing:**

Run sample queries with `EXPLAIN ANALYZE`:
```sql
-- Test customer jobs query
EXPLAIN ANALYZE
SELECT * FROM jobs
WHERE customer_id = 'test-uuid'
  AND status = 'scheduled'
ORDER BY scheduled_date DESC
LIMIT 10;

-- Look for "Index Scan" in output (good)
-- Avoid "Seq Scan" (bad - means index not used)
```

**Performance Targets:**
- [ ] Customer lookup queries < 50ms
- [ ] Invoice queries < 100ms
- [ ] Notification queries < 50ms
- [ ] All queries use indexes (no Seq Scan on large tables)

---

## 7. Runtime Performance Monitoring

### Google Analytics Integration

**Verify GA is Configured:**
```bash
# Check environment variable
echo $NEXT_PUBLIC_GA_ID
# Should output: G-Q5YDHYY3M1 (or your GA ID)
```

**Test Performance Tracking:**

1. Open browser with dev tools
2. Navigate to dashboard
3. Check console for performance logs:
   ```
   [Performance] page_load: 1234ms
   [Performance] LCP: 2345ms
   ```

4. Verify GA events in Google Analytics:
   - Go to: Reports → Realtime → Events
   - Look for performance events (timing_complete, CLS, LCP, etc.)

**Verification:**
- [ ] `NEXT_PUBLIC_GA_ID` environment variable set
- [ ] Performance metrics logged in development
- [ ] Performance events appear in GA4 Real-time reports
- [ ] Web Vitals tracked (CLS, FID, LCP, FCP, TTFB)
- [ ] Custom performance metrics tracked

### Health Check Endpoint

```bash
# Test health check
curl http://localhost:3009/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T10:30:00.000Z",
  "checks": {
    "database": { "status": "ok", "duration": 45 },
    "service": { "status": "ok" }
  },
  "responseTime": 47,
  "uptime": 3600
}
```

**Verification:**
- [ ] Health endpoint returns 200 (healthy)
- [ ] Database check passes
- [ ] Response time < 100ms
- [ ] Health check accessible in production

---

## 8. Network Performance

### API Response Times

**Test Critical API Endpoints:**

```bash
# Time each API endpoint
time curl http://localhost:3009/api/health

# Expected: < 100ms

time curl http://localhost:3009/api/customers/me \
  -H "Authorization: Bearer [token]"

# Expected: < 200ms
```

**Response Time Targets:**
- [ ] Health check: < 100ms
- [ ] Customer data: < 200ms
- [ ] Invoice list: < 300ms
- [ ] Job list: < 300ms
- [ ] Payment processing: < 2s

### Compression

**Verify Gzip/Brotli Compression:**

```bash
# Check response headers
curl -I -H "Accept-Encoding: gzip, deflate, br" http://localhost:3009/

# Should include:
# Content-Encoding: gzip (or br for Brotli)
```

**Verification:**
- [ ] Text responses compressed (HTML, CSS, JS, JSON)
- [ ] Compression ratio > 70% for text files
- [ ] Brotli used when available (better than gzip)

---

## 9. Mobile Performance

### Mobile Testing

**Test on Real Devices:**
- [ ] iOS (iPhone 12 or newer) - Safari
- [ ] Android (recent model) - Chrome

**Mobile Performance Targets:**
- [ ] LCP < 3s on mobile
- [ ] FID < 100ms on mobile
- [ ] CLS < 0.1 on mobile
- [ ] No horizontal scroll on any page
- [ ] Touch targets ≥ 44x44px
- [ ] Forms work on mobile keyboard

### Responsive Images

**Verify Responsive Images:**
```bash
# Check for responsive image usage
grep -r "sizes=" src/
grep -r "srcSet=" src/

# Next.js Image component should handle this automatically
```

**Verification:**
- [ ] Images sized appropriately for mobile
- [ ] Mobile devices don't download desktop-size images
- [ ] Layout doesn't break on small screens (320px - 414px)

---

## 10. Third-Party Scripts

### External Dependencies

**Audit Third-Party Scripts:**
- [ ] Google Analytics (async loaded)
- [ ] Stripe.js (loaded on payment pages only)
- [ ] Sentry (error tracking)

**Performance Impact:**
- [ ] Third-party scripts loaded asynchronously
- [ ] Non-critical scripts deferred
- [ ] Total third-party script size < 100KB
- [ ] No render-blocking external scripts

### Script Loading Strategy

**Verify Script Loading:**
```bash
# Check for blocking scripts
grep -r "<script" src/app/layout.tsx

# All scripts should use:
# - async attribute
# - defer attribute
# - or Next.js Script component with strategy="afterInteractive"
```

---

## 11. Server-Side Rendering (SSR) Performance

### SSR Optimization

**Verify SSR Configuration:**
- [ ] Static pages use `export const dynamic = 'force-static'`
- [ ] Dynamic pages use `export const revalidate = [seconds]`
- [ ] No unnecessary server components
- [ ] Server components don't fetch data unnecessarily

**Test SSR Performance:**
```bash
# Build and start production server
npm run build
npm start

# Time first load (should be fast due to SSR)
time curl http://localhost:3000/
```

**SSR Performance Targets:**
- [ ] Static pages: < 100ms
- [ ] Dynamic pages: < 300ms
- [ ] No server-side errors
- [ ] Proper error boundaries for client components

---

## 12. Production Build Verification

### Build Optimization

```bash
# Production build
npm run build
```

**Verify Build Output:**
- [ ] No build errors
- [ ] No build warnings (or documented exceptions)
- [ ] All pages pre-rendered or ISR configured
- [ ] Build completes in < 5 minutes
- [ ] Output shows optimized bundle sizes

**Expected Build Output:**
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    1.2 kB         95 kB
├ ○ /dashboard                           5.4 kB         120 kB
├ ○ /dashboard/appointments              8.1 kB         125 kB
...
```

**Analysis:**
- [ ] First Load JS for each route < 150KB
- [ ] Shared chunks properly split
- [ ] Route-specific code properly separated

---

## 13. Content Delivery Network (CDN)

### Vercel Edge Network

If deployed on Vercel, the Edge Network (CDN) is automatic.

**Verification:**
- [ ] Static assets served from CDN
- [ ] Edge caching configured
- [ ] Regional replication enabled
- [ ] CDN headers present in responses

**Test CDN Performance:**
```bash
# Check response headers
curl -I https://your-domain.com/_next/static/...

# Should include:
# x-vercel-cache: HIT (or MISS for first request)
# cache-control: public, max-age=31536000, immutable
```

---

## 14. Error Tracking Performance Impact

### Sentry Configuration

**Verify Sentry Performance:**
- [ ] Sentry initialized only in production
- [ ] Performance monitoring enabled
- [ ] Sample rate configured (not 100% in production)
- [ ] Source maps uploaded
- [ ] No performance degradation from error tracking

**Check Sentry Config:**
```bash
# Verify Sentry environment variables
echo $NEXT_PUBLIC_SENTRY_DSN
echo $SENTRY_AUTH_TOKEN
```

**Performance Impact:**
- [ ] Sentry adds < 50ms to page load
- [ ] Error reporting doesn't block render
- [ ] Performance monitoring sample rate: 10-25%

---

## 15. Database Connection Pooling

### Supabase Configuration

**Verify Connection Pooling:**
- [ ] Connection pooling enabled in Supabase
- [ ] Pool size appropriate for traffic (default: 15)
- [ ] Connection timeouts configured
- [ ] No connection leak errors in logs

**Monitor Database Performance:**

In Supabase Dashboard:
1. Go to Database → Performance
2. Check:
   - [ ] Active connections < pool size
   - [ ] No slow queries (> 1s)
   - [ ] Query cache hit rate > 90%

---

## 16. Final Performance Validation

### Pre-Deployment Checklist

- [ ] All automated audits pass (`npm run audit`)
- [ ] All Core Web Vitals meet "Good" thresholds
- [ ] Bundle sizes within limits
- [ ] Images optimized
- [ ] Caching verified and working
- [ ] Database indexes applied
- [ ] Performance monitoring enabled
- [ ] Third-party scripts optimized
- [ ] Mobile performance validated
- [ ] Production build successful

### Performance Testing in Staging

Before deploying to production:

1. **Deploy to staging environment**
2. **Run full Lighthouse audit on staging:**
   ```bash
   # Install Lighthouse CLI globally (if not already installed)
   npm install -g lighthouse

   # Run audit against staging
   lighthouse https://staging.yourdomain.com \
     --output html \
     --output-path ./staging-lighthouse-report.html
   ```

3. **Verify all thresholds met in staging**
4. **Load test with realistic traffic:**
   ```bash
   # Using k6 (install: brew install k6)
   k6 run load-test.js
   ```

5. **Monitor performance metrics for 24 hours**

### Production Monitoring

After deployment:

**First 24 Hours:**
- [ ] Monitor Lighthouse scores (via PageSpeed Insights)
- [ ] Check Core Web Vitals in Google Search Console
- [ ] Monitor Sentry performance metrics
- [ ] Watch Google Analytics performance events
- [ ] Check server response times

**Ongoing:**
- [ ] Weekly Lighthouse audits
- [ ] Monthly performance reviews
- [ ] Quarterly optimization sprints
- [ ] Continuous Core Web Vitals monitoring

---

## 17. Performance Regression Prevention

### CI/CD Integration

**Prevent Performance Regressions:**

Add performance audit to your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: Performance Audit

on:
  pull_request:
    branches: [main, master]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm start &
      - run: sleep 10
      - run: npm run audit
```

**Performance Budgets:**

Create `lighthouse-budget.json`:
```json
{
  "performance": 85,
  "accessibility": 90,
  "best-practices": 85,
  "seo": 90,
  "first-contentful-paint": 2000,
  "largest-contentful-paint": 2500,
  "cumulative-layout-shift": 0.1
}
```

---

## Troubleshooting

### Common Performance Issues

#### Issue: Low Performance Score

**Symptoms:** Lighthouse Performance < 85

**Solutions:**
1. Check "Opportunities" in Lighthouse report
2. Optimize images (use Next.js Image component)
3. Reduce JavaScript bundle size
4. Enable caching
5. Use CDN for static assets

#### Issue: High LCP

**Symptoms:** LCP > 2.5s

**Solutions:**
1. Optimize largest image/element
2. Preload critical resources
3. Reduce server response time
4. Use CDN
5. Optimize CSS delivery

#### Issue: High CLS

**Symptoms:** CLS > 0.1

**Solutions:**
1. Set image dimensions explicitly
2. Reserve space for dynamic content
3. Avoid inserting content above existing content
4. Use CSS transforms for animations

#### Issue: Poor Mobile Performance

**Symptoms:** Mobile scores significantly lower than desktop

**Solutions:**
1. Optimize images for mobile
2. Reduce JavaScript bundle size
3. Test on real devices
4. Use responsive images
5. Optimize third-party scripts

---

## Resources

- **Automated Audit Script:** `npm run audit`
- **Lighthouse Report:** `lighthouse-report.html` (generated after audit)
- **Performance Monitoring Docs:** [PERFORMANCE-MONITORING.md](./PERFORMANCE-MONITORING.md)
- **Optimization Guide:** [PERFORMANCE-OPTIMIZATION.md](./PERFORMANCE-OPTIMIZATION.md)
- **Cache Management:** `GET /api/cache/stats`, `POST /api/cache/clear`
- **Health Check:** `GET /api/health`
- **Web Vitals Extension:** https://chrome.google.com/webstore/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma
- **PageSpeed Insights:** https://pagespeed.web.dev
- **Lighthouse CI:** https://github.com/GoogleChrome/lighthouse-ci

---

## Summary

This performance checklist ensures:

✅ **Lighthouse scores meet production standards** (≥ 85 Performance, ≥ 90 Accessibility, ≥ 85 Best Practices, ≥ 90 SEO)
✅ **Core Web Vitals in "Good" range** (LCP < 2.5s, FID < 100ms, CLS < 0.1)
✅ **Bundle sizes optimized** (< 200KB main bundle)
✅ **Images optimized** (Next.js Image, WebP/AVIF, lazy loading)
✅ **Caching effective** (80%+ hit rate)
✅ **Database queries optimized** (indexes applied, < 300ms response)
✅ **Monitoring enabled** (Google Analytics, Sentry, health checks)
✅ **Mobile performance validated** (responsive, fast on real devices)
✅ **Production build optimized** (no errors, optimized bundles)

**Final validation:** Run `npm run audit` before every deployment.

---

**Document Version:** 1.0
**Last Reviewed:** January 2025
