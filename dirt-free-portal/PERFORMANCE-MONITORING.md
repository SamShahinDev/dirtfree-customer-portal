# Performance Monitoring Documentation

## Overview

This document describes the performance monitoring implementation for the Dirt Free Carpet Customer Portal. The system tracks Core Web Vitals, page load times, API performance, and overall application health.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Files Overview](#files-overview)
4. [Configuration](#configuration)
5. [Usage Examples](#usage-examples)
6. [Health Check API](#health-check-api)
7. [Google Analytics Integration](#google-analytics-integration)
8. [Testing](#testing)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Features

### Core Web Vitals Tracking
- **CLS (Cumulative Layout Shift)**: Measures visual stability
- **FID (First Input Delay)**: Measures interactivity
- **LCP (Largest Contentful Paint)**: Measures loading performance
- **FCP (First Contentful Paint)**: Measures perceived load speed
- **TTFB (Time to First Byte)**: Measures server response time

### Performance Metrics
- Page load time tracking
- DOM interactive/complete time
- Route change performance
- API call duration measurement
- Custom performance marks and measures

### Health Monitoring
- Database connectivity check
- Service availability status
- Response time tracking
- Uptime reporting

### Analytics Integration
- Automatic reporting to Google Analytics
- Custom performance events
- Non-interaction events (don't affect bounce rate)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Root Layout                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │         PerformanceMonitor Component                │    │
│  │  - Tracks page loads                                │    │
│  │  - Monitors route changes                           │    │
│  │  - Reports Web Vitals                               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Monitoring Utilities                       │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  trackWebVitals  │  │ measurePageLoad  │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  measureApiCall  │  │ trackPerformance │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Google Analytics                           │
│  - Web Vitals events                                        │
│  - Performance timing events                                │
│  - Custom metrics                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Files Overview

### 1. `/src/lib/monitoring.ts`

Core performance monitoring utilities.

**Key Functions:**

```typescript
// Track a performance metric to Google Analytics
trackPerformance(metricName: string, value: number)

// Measure and track page load performance
measurePageLoad()

// Measure API call duration
measureApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T>

// Track Core Web Vitals
trackWebVitals(onReport?: (metric: WebVital) => void)

// Create performance marks
mark(markName: string)

// Measure duration between marks
measure(startMark: string, endMark: string): number

// Track resource loading performance
trackResourceTiming()
```

**Example Usage:**

```typescript
import { measureApiCall, trackPerformance } from '@/lib/monitoring'

// Measure API call duration
const data = await measureApiCall('fetch_invoices', async () => {
  return await fetch('/api/invoices')
})

// Track custom metric
trackPerformance('checkout_flow_duration', 3500)
```

---

### 2. `/src/components/analytics/performance-monitor.tsx`

Client component that automatically tracks performance metrics.

**Features:**
- Auto-tracks page loads on mount
- Monitors route changes
- Reports Web Vitals to Google Analytics
- Measures route transition duration

**Integration:**

Already integrated in `src/app/layout.tsx`:

```typescript
import { PerformanceMonitor } from '@/components/analytics/performance-monitor'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            <PerformanceMonitor />
          </>
        )}
      </body>
    </html>
  )
}
```

---

### 3. `/src/app/api/health/route.ts`

Health check endpoint for monitoring service status.

**Endpoint:** `GET /api/health`

**Response (Healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T10:30:00.000Z",
  "checks": {
    "database": {
      "status": "ok",
      "duration": 45
    },
    "service": {
      "status": "ok"
    }
  },
  "responseTime": 47,
  "uptime": 3600
}
```

**Response (Unhealthy):**
```json
{
  "status": "unhealthy",
  "timestamp": "2025-01-20T10:30:00.000Z",
  "checks": {
    "database": {
      "status": "error",
      "message": "Connection timeout",
      "duration": 5000
    },
    "service": {
      "status": "ok"
    }
  },
  "responseTime": 5005,
  "uptime": 3600
}
```

**Status Codes:**
- `200`: All checks passed (healthy)
- `503`: One or more checks failed (unhealthy)

---

### 4. `/src/lib/analytics.ts`

Google Analytics integration with performance tracking.

**New Functions:**

```typescript
// Track a Web Vital metric
trackWebVital(name: string, value: number, id: string)

// Track a performance metric
trackPerformanceMetric(metricName: string, value: number)
```

**Example:**

```typescript
import { trackWebVital, trackPerformanceMetric } from '@/lib/analytics'

// Track Web Vital
trackWebVital('LCP', 2500, 'v3-1234567890')

// Track custom performance metric
trackPerformanceMetric('api_checkout_duration', 450)
```

---

## Configuration

### Prerequisites

1. **Google Analytics 4 Property**
   - Required for performance tracking
   - Environment variable: `NEXT_PUBLIC_GA_ID`

2. **web-vitals Package**
   ```bash
   npm install web-vitals
   ```

### Environment Variables

Already configured in `.env.local`:

```env
NEXT_PUBLIC_GA_ID=G-Q5YDHYY3M1
```

---

## Usage Examples

### 1. Track Page Load Performance

**Automatic** - Already running via `PerformanceMonitor` component in layout.

To manually trigger:

```typescript
import { measurePageLoad } from '@/lib/monitoring'

// In a client component
useEffect(() => {
  measurePageLoad()
}, [])
```

---

### 2. Measure API Call Duration

```typescript
import { measureApiCall } from '@/lib/monitoring'

// Wrap your API call
async function fetchData() {
  const data = await measureApiCall('get_customer_data', async () => {
    const response = await fetch('/api/customers/me')
    return response.json()
  })

  return data
}
```

**What gets tracked:**
- `api_get_customer_data`: Duration of successful call
- `api_get_customer_data_error`: Duration if call fails

---

### 3. Track Custom Performance Metrics

**Using marks and measures:**

```typescript
import { mark, measure } from '@/lib/monitoring'

function handleCheckout() {
  // Mark the start
  mark('checkout_start')

  // Perform checkout operations
  await processPayment()
  await updateInventory()

  // Measure and report
  const duration = measure('checkout_start', 'checkout_complete')
  // Automatically sent to Google Analytics
}
```

**Using direct tracking:**

```typescript
import { trackPerformance } from '@/lib/monitoring'

function trackFormSubmission() {
  const startTime = performance.now()

  // Submit form
  await submitForm()

  const duration = performance.now() - startTime
  trackPerformance('form_submission', duration)
}
```

---

### 4. Track Core Web Vitals

**Automatic** - Already running via `PerformanceMonitor` component.

To access raw Web Vitals data:

```typescript
import { trackWebVitals } from '@/lib/monitoring'

trackWebVitals((metric) => {
  console.log(metric.name, metric.value)

  // Send to your analytics
  switch (metric.name) {
    case 'CLS':
      console.log('Layout shift detected:', metric.value)
      break
    case 'LCP':
      console.log('Largest Contentful Paint:', metric.value)
      break
    // ... handle other metrics
  }
})
```

---

### 5. Monitor Resource Loading

```typescript
import { trackResourceTiming } from '@/lib/monitoring'

// Call once after page load
useEffect(() => {
  // Wait for all resources to load
  window.addEventListener('load', () => {
    setTimeout(trackResourceTiming, 0)
  })
}, [])
```

**Tracks:**
- Average load time per resource type (script, stylesheet, image, fetch, etc.)
- Sent to Google Analytics as performance events

---

## Health Check API

### Using the Health Check Endpoint

**1. Manual Check:**

```bash
curl http://localhost:3000/api/health
```

**2. Uptime Monitoring:**

Configure your uptime monitoring service (e.g., Better Uptime, Pingdom, UptimeRobot) to ping:

```
https://your-domain.com/api/health
```

**Recommended Settings:**
- Check interval: 5 minutes
- Timeout: 10 seconds
- Expected status: 200
- Alert on: Status code 503

**3. Programmatic Check:**

```typescript
async function checkHealth() {
  const response = await fetch('/api/health')
  const health = await response.json()

  if (health.status === 'healthy') {
    console.log('All systems operational')
  } else {
    console.error('Service degraded:', health.checks)
  }

  return health
}
```

---

## Google Analytics Integration

### Viewing Performance Data

**1. In Google Analytics 4:**

Navigate to: **Reports** → **Engagement** → **Events**

**Web Vitals Events:**
- Event Name: `CLS`, `FID`, `LCP`, `FCP`, `TTFB`
- Category: `Web Vitals`
- Value: Metric value in milliseconds

**Performance Events:**
- Event Name: `timing_complete`
- Category: `Performance`
- Name: Metric name (e.g., `page_load`, `api_fetch_invoices`)
- Value: Duration in milliseconds

**2. Custom Reports:**

Create a custom report to view:
- Average LCP by page
- Average API call duration
- Page load time distribution
- Web Vitals trends over time

**3. Real User Monitoring (RUM):**

All metrics are from real user sessions, providing accurate performance data from production.

---

## Testing

### 1. Test Performance Monitoring

**Development Mode:**

Performance metrics are logged to console in development:

```bash
npm run dev
```

Open browser console:
```
[Performance] page_load: 1234ms
[Performance] dom_interactive: 567ms
[Performance] LCP: 2345ms
```

**Production Mode:**

Metrics are sent to Google Analytics without console logging.

---

### 2. Test Health Check

```bash
# Start dev server
npm run dev

# In another terminal, test health check
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
  "uptime": 123.456
}
```

---

### 3. Test Web Vitals in Browser

**Chrome DevTools:**

1. Open DevTools (F12)
2. Go to **Lighthouse** tab
3. Run audit for **Performance**
4. Check Core Web Vitals scores

**Web Vitals Extension:**

Install: https://chrome.google.com/webstore/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma

View real-time Web Vitals on any page.

---

## Best Practices

### 1. Performance Budgets

Set thresholds for key metrics:

```typescript
const PERFORMANCE_BUDGET = {
  pageLoad: 3000,      // 3 seconds
  apiCall: 1000,       // 1 second
  LCP: 2500,           // 2.5 seconds (Google's "Good" threshold)
  FID: 100,            // 100ms (Google's "Good" threshold)
  CLS: 0.1,            // 0.1 (Google's "Good" threshold)
}

// Alert if metrics exceed budget
trackWebVitals((metric) => {
  const threshold = PERFORMANCE_BUDGET[metric.name]
  if (metric.value > threshold) {
    console.warn(`⚠️ ${metric.name} exceeded budget: ${metric.value}ms > ${threshold}ms`)
    // Send alert to monitoring service
  }
})
```

---

### 2. API Performance Tracking

**Always wrap production API calls:**

```typescript
// ❌ Don't: Untracked API call
const data = await fetch('/api/invoices').then(r => r.json())

// ✅ Do: Tracked API call
const data = await measureApiCall('fetch_invoices', async () => {
  return await fetch('/api/invoices').then(r => r.json())
})
```

---

### 3. Monitoring Critical User Flows

Track performance of critical business flows:

```typescript
import { mark, measure } from '@/lib/monitoring'

async function handlePayment() {
  mark('payment_start')

  try {
    await createPaymentIntent()
    mark('payment_intent_created')

    await confirmPayment()
    mark('payment_confirmed')

    await updateInvoice()
    mark('invoice_updated')

    // Measure total duration
    measure('payment_start', 'invoice_updated')

    // Measure individual steps
    measure('payment_start', 'payment_intent_created')
    measure('payment_intent_created', 'payment_confirmed')
    measure('payment_confirmed', 'invoice_updated')
  } catch (error) {
    // Even failed flows are measured
    measure('payment_start', 'payment_error')
  }
}
```

---

### 4. Sampling for High-Traffic Applications

For high-traffic apps, sample performance tracking:

```typescript
// Track 10% of page loads
if (Math.random() < 0.1) {
  measurePageLoad()
}

// Always track API errors, sample successes
async function trackedApiCall() {
  try {
    return await measureApiCall('api_name', apiFunction)
  } catch (error) {
    // Always track errors
    trackPerformance('api_name_error', duration)
    throw error
  }
}
```

---

## Troubleshooting

### Issue: Performance metrics not appearing in Google Analytics

**Solution:**

1. **Verify GA_ID is set:**
   ```bash
   echo $NEXT_PUBLIC_GA_ID
   ```

2. **Check browser console for errors:**
   - Open DevTools Console
   - Look for `window.gtag` errors

3. **Verify Google Analytics is loaded:**
   ```javascript
   // In browser console
   console.log(typeof window.gtag)
   // Should output: "function"
   ```

4. **Check GA4 Real-Time reports:**
   - Go to Google Analytics
   - Navigate to: Reports → Realtime
   - Trigger an event and verify it appears

---

### Issue: Health check returns 503 (unhealthy)

**Solution:**

1. **Check database connection:**
   ```bash
   # Verify Supabase environment variables
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Test database manually:**
   ```typescript
   // In a test route
   const { data, error } = await supabase
     .from('customers')
     .select('id')
     .limit(1)

   console.log('DB Test:', { data, error })
   ```

3. **Check health check response for details:**
   ```bash
   curl http://localhost:3009/api/health | jq
   ```

   Look at the `checks` object to identify which check failed.

---

### Issue: Web Vitals not being tracked

**Solution:**

1. **Verify web-vitals package is installed:**
   ```bash
   npm list web-vitals
   ```

2. **Check if PerformanceMonitor is mounted:**
   - Inspect the DOM
   - Verify Google Analytics is enabled (NEXT_PUBLIC_GA_ID is set)

3. **Test Web Vitals manually:**
   ```typescript
   import { onCLS, onFID, onLCP } from 'web-vitals'

   onCLS(console.log)
   onFID(console.log)
   onLCP(console.log)
   ```

---

### Issue: Performance metrics are very high

**Solution:**

1. **Check if running in development mode:**
   - Development builds are significantly slower
   - Always test performance in production mode:
     ```bash
     npm run build
     npm start
     ```

2. **Profile the application:**
   - Use Chrome DevTools Performance tab
   - Identify slow components or API calls

3. **Check for network throttling:**
   - DevTools → Network → No throttling
   - Slow 3G throttling will inflate metrics

---

### Issue: Route change performance is slow

**Solution:**

1. **Check for heavy components:**
   - Use React Profiler to identify slow renders
   - Consider code splitting with `next/dynamic`

2. **Verify prefetching is enabled:**
   ```typescript
   <Link href="/dashboard" prefetch={true}>
     Dashboard
   </Link>
   ```

3. **Monitor the route change marks:**
   ```typescript
   performance.getEntriesByType('mark')
     .filter(mark => mark.name.includes('route_change'))
   ```

---

## Next Steps

### 1. Set up Uptime Monitoring

Use a service like [Better Uptime](https://betteruptime.com/) or [Pingdom](https://www.pingdom.com/):

1. Create an uptime check for `/api/health`
2. Set check interval to 5 minutes
3. Configure alerts for downtime or degraded performance

---

### 2. Create Performance Dashboards

In Google Analytics:

1. Create custom reports for:
   - Web Vitals trends
   - API performance by endpoint
   - Page load times by route

2. Set up alerts for performance regressions

---

### 3. Implement Performance Budgets

Create performance budgets and fail CI/CD if exceeded:

```json
// budget.json
{
  "LCP": 2500,
  "FID": 100,
  "CLS": 0.1,
  "pageLoad": 3000
}
```

Use tools like [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) to enforce budgets.

---

### 4. Monitor Real User Metrics (RUM)

All current tracking is Real User Monitoring - actual performance from production users.

Consider also adding:
- Sentry Performance Monitoring (already configured)
- Custom alerting for critical metrics
- A/B testing performance improvements

---

## Summary

You now have comprehensive performance monitoring:

✅ **Core Web Vitals tracking** (CLS, FID, LCP, FCP, TTFB)
✅ **Page load performance monitoring**
✅ **API call duration measurement**
✅ **Health check endpoint** (`/api/health`)
✅ **Google Analytics integration**
✅ **Custom performance metrics**
✅ **Production-ready monitoring**

All metrics are automatically tracked and sent to Google Analytics for analysis.
