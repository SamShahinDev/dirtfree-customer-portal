# Rate Limiting & Security Implementation Guide

## Overview

This application implements comprehensive multi-layer security to protect resources, prevent abuse, and ensure fair usage. Security is implemented in 4 layers, with server-side middleware providing the primary authentication barrier.

## Implementation Status: ✅ Complete

**Date Implemented**: January 2025

---

## Security Layers

This application uses a **defense-in-depth** security model with 4 layers:

### Layer 1: Middleware (Server-Side) - PRIMARY SECURITY ✅

**File**: `src/lib/supabase/middleware.ts`

**Purpose**: Server-side route protection that runs BEFORE any page or API route loads. This is the most critical security layer.

**Protection**:
- Protects all `/dashboard/*` routes from unauthenticated access
- Redirects authenticated users AWAY from `/login` and `/register` to `/dashboard`
- Adds `returnUrl` query parameter when redirecting to login
- Prevents unauthorized data fetching and content flash

**Implementation**:
```typescript
// Redirect authenticated users AWAY from auth pages to dashboard
if (user && (pathname === '/login' || pathname === '/register')) {
  const url = request.nextUrl.clone()
  url.pathname = '/dashboard'
  url.search = '' // Clear any query params
  return NextResponse.redirect(url)
}

// Protect dashboard routes - redirect unauthenticated users to login
if (pathname.startsWith('/dashboard') && !user) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('returnUrl', pathname)
  return NextResponse.redirect(url)
}
```

**Coverage**: ALL dashboard routes (15/15 routes protected)

**Benefits**:
✅ Runs on the server (cannot be bypassed by client)
✅ Executes BEFORE any page loads (no data leaks)
✅ Provides seamless UX with returnUrl redirects
✅ Prevents unauthorized API calls from dashboard pages

---

### Layer 2: RLS Policies (Database) ✅

**Purpose**: Database-level security that ensures customers can only access their own data

**Implementation**: Row-Level Security policies in Supabase
**Coverage**: All database tables (customers, jobs, invoices, messages, etc.)

---

### Layer 3: API Route Authentication ✅

**Purpose**: Per-endpoint authentication and rate limiting

**Implementation**: Supabase auth checks + rate limiting in API routes
**Coverage**: 9/15 API routes (all critical operations protected)

See [Protected Routes](#protected-routes) section below for details.

---

### Layer 4: Client-Side (Optional)

**Purpose**: UX enhancement only (NOT for security)

**Implementation**: Client-side auth checks in components
**Coverage**: Used for UI state management only

⚠️ **Important**: Never rely on client-side checks for security - they can be bypassed.

---

## Rate Limiting (Layer 3)

Rate limiting uses in-memory LRU (Least Recently Used) caching to track request counts per customer/IP address.

---

## Architecture

### Core Library

**File**: `src/lib/rate-limit.ts`

Uses `lru-cache` package (already installed: `v11.2.2`) to implement sliding window rate limiting.

```typescript
import { LRUCache } from 'lru-cache'

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  })

  return {
    check: (limit: number, token: string) => Promise<void>
  }
}
```

### Rate Limiter Instances

Five pre-configured limiter instances for different use cases:

| Instance | Use Case | Interval | Max Tokens |
|----------|----------|----------|------------|
| `authLimiter` | Authentication operations | 1 minute | 500 unique tokens |
| `apiLimiter` | General API operations | 1 minute | 500 unique tokens |
| `paymentLimiter` | Payment operations | 1 minute | 500 unique tokens |
| `emailLimiter` | Email sending | 1 minute | 500 unique tokens |
| `rewardLimiter` | Reward redemption | 1 minute | 500 unique tokens |

---

## Protected Routes

### 🔴 HIGH PRIORITY - Financial & Abuse Protection

#### 1. Payment Intent Creation
**Route**: `POST /api/payments/create-intent`
**Limiter**: `paymentLimiter`
**Limit**: 10 requests/minute per customer
**Token**: `customer.id`
**Risk**: Payment intent spam, DoS, financial abuse

```typescript
import { paymentLimiter } from '@/lib/rate-limit'

try {
  await paymentLimiter.check(10, customer.id)
} catch {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429 }
  )
}
```

#### 2. Payment Confirmation
**Route**: `POST /api/payments/confirm`
**Limiter**: `paymentLimiter`
**Limit**: 10 requests/minute per customer
**Token**: `customer.id` (extracted from invoice)
**Risk**: Repeated confirmation attempts

#### 3. Setup Intent Creation
**Route**: `POST /api/payments/setup-intent`
**Limiter**: `paymentLimiter`
**Limit**: 10 requests/minute per customer
**Token**: `customerId` (from request body)
**Risk**: Card tokenization spam

#### 4. Reward Redemption
**Route**: `POST /api/rewards/[id]/redeem`
**Limiter**: `rewardLimiter`
**Limit**: 5 requests/minute per customer
**Token**: `customer.id`
**Risk**: Double-redemption attacks, race conditions

```typescript
import { rewardLimiter } from '@/lib/rate-limit'

// Strict limit to prevent double-redemption attacks
try {
  await rewardLimiter.check(5, customer.id)
} catch {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429 }
  )
}
```

#### 5. Email Notifications
**Route**: `POST /api/notifications/send-email`
**Limiter**: `emailLimiter`
**Limit**: 5 requests/minute per customer
**Token**: `data.customerId`
**Risk**: Email spam, sender reputation damage, Resend quota abuse

```typescript
import { emailLimiter } from '@/lib/rate-limit'

// Strict limit to protect sender reputation
try {
  await emailLimiter.check(5, data.customerId)
} catch {
  return NextResponse.json(
    { error: 'Too many email requests. Please try again later.' },
    { status: 429 }
  )
}
```

---

### 🟡 MEDIUM PRIORITY - General Protection

#### 6. Session Tracking
**Route**: `POST /api/analytics/track-session`
**Limiter**: `apiLimiter`
**Limit**: 30 requests/minute per IP
**Token**: IP address (from `x-forwarded-for` header)
**Risk**: Analytics spam, database bloat

```typescript
import { apiLimiter } from '@/lib/rate-limit'

const forwardedFor = request.headers.get('x-forwarded-for')
const ipAddress = forwardedFor
  ? forwardedFor.split(',')[0].trim()
  : request.headers.get('x-real-ip') || 'unknown'

try {
  await apiLimiter.check(30, ipAddress)
} catch {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429 }
  )
}
```

**Note**: Uses IP instead of customer ID since this endpoint is called during login before authentication.

#### 7. Appointment Cancellation
**Route**: `POST /api/appointments/[id]/cancel`
**Limiter**: `apiLimiter`
**Limit**: 5 requests/minute per customer
**Token**: `customer.id`
**Risk**: Spam cancellations

#### 8. Cache Clear
**Route**: `POST /api/cache/clear`
**Limiter**: `apiLimiter`
**Limit**: 2 requests/minute per IP
**Token**: IP address
**Risk**: Cache thrashing, performance degradation

```typescript
// Strict limit to prevent cache thrashing
try {
  await apiLimiter.check(2, ipAddress)
} catch {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429 }
  )
}
```

---

### 🟢 LOW PRIORITY - Resource Protection

#### 9. Invoice PDF Generation
**Route**: `GET /api/invoices/[id]/pdf`
**Limiter**: `apiLimiter`
**Limit**: 20 requests/minute per customer
**Token**: `customer.id`
**Risk**: Resource exhaustion (jsPDF is computationally heavy)

---

## Rate Limit Configuration

### Default Settings

| Limiter | Requests/Minute | Use Case |
|---------|----------------|----------|
| `paymentLimiter` | 10 | Payment operations |
| `rewardLimiter` | 5 | Reward redemption (strict) |
| `emailLimiter` | 5 | Email sending (strict) |
| `apiLimiter` | 2-30 | General operations (varies by endpoint) |
| `authLimiter` | 5 | Authentication (reserved for future use) |

### Token Identification

**Customer-based** (preferred):
```typescript
// After authentication
const { data: customer } = await supabase
  .from('customers')
  .select('id')
  .eq('email', user.email)
  .single()

await limiter.check(10, customer.id)
```

**IP-based** (for pre-auth endpoints):
```typescript
const forwardedFor = request.headers.get('x-forwarded-for')
const ipAddress = forwardedFor
  ? forwardedFor.split(',')[0].trim()
  : request.headers.get('x-real-ip') || 'unknown'

await limiter.check(30, ipAddress)
```

---

## HTTP 429 Response Format

All rate-limited endpoints return consistent error responses:

```json
{
  "error": "Too many requests. Please try again later."
}
```

**Status Code**: `429 Too Many Requests`

---

## Testing Rate Limits

### Manual Testing

```bash
# Test payment intent rate limiting (10 req/min)
for i in {1..12}; do
  curl -X POST http://localhost:3009/api/payments/create-intent \
    -H "Content-Type: application/json" \
    -d '{"invoiceId":"test","amount":100}' \
    -H "Cookie: sb-access-token=YOUR_TOKEN"
  sleep 0.1
done

# Expected: First 10 succeed, requests 11-12 return 429
```

### Integration Testing

```typescript
// Example test case
describe('Rate Limiting', () => {
  it('should block after 5 reward redemptions per minute', async () => {
    const customerId = 'test-customer-id'

    // Make 5 requests (should succeed)
    for (let i = 0; i < 5; i++) {
      const res = await fetch('/api/rewards/reward-id/redeem', {
        method: 'POST',
        headers: { 'Cookie': `customer-id=${customerId}` }
      })
      expect(res.status).toBe(200)
    }

    // 6th request should be rate limited
    const res = await fetch('/api/rewards/reward-id/redeem', {
      method: 'POST',
      headers: { 'Cookie': `customer-id=${customerId}` }
    })
    expect(res.status).toBe(429)
  })
})
```

---

## Monitoring & Debugging

### Logging Rate Limit Hits

Add logging to track rate limit violations:

```typescript
try {
  await limiter.check(10, customer.id)
} catch {
  console.warn(`Rate limit exceeded for customer: ${customer.id}`)
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429 }
  )
}
```

### Cache Inspection

The LRU cache is in-memory and resets on server restart. To inspect cache state during development:

```typescript
// In src/lib/rate-limit.ts, add getter function
export function getRateLimitStats(limiterName: string) {
  // Return cache size, TTL, etc.
}
```

---

## Production Considerations

### Scaling Considerations

**Current**: In-memory LRU cache (single server)
- ✅ Simple, no external dependencies
- ✅ Fast (~1ms overhead)
- ❌ Not distributed (rate limits don't sync across servers)

**Future**: For multi-server deployments, consider:
1. **Redis**: Distributed rate limiting across servers
2. **Upstash Rate Limit**: Serverless-friendly alternative
3. **Cloudflare Rate Limiting**: Edge-level protection

### Adjusting Limits

To modify rate limits, edit `src/lib/rate-limit.ts`:

```typescript
// Increase payment limit from 10 to 20
export const paymentLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
})

// Then update check calls
await paymentLimiter.check(20, customer.id) // was 10
```

### IP Extraction in Production

Ensure proper IP extraction behind proxies/load balancers:

```typescript
// Priority order for IP extraction
const forwardedFor = request.headers.get('x-forwarded-for')
const realIp = request.headers.get('x-real-ip')
const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare

const ipAddress = forwardedFor?.split(',')[0].trim() || realIp || cfConnectingIp || 'unknown'
```

---

## Security Best Practices

### 1. Token Selection
- ✅ **Use customer.id** for authenticated routes
- ✅ **Use IP address** for pre-auth routes
- ❌ **Avoid email** (can be changed frequently)

### 2. Rate Limit Placement
```typescript
// ✅ GOOD: Check rate limit AFTER auth but BEFORE expensive operations
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

await limiter.check(10, customer.id)

// Now perform expensive operations
const paymentIntent = await stripe.paymentIntents.create(...)
```

```typescript
// ❌ BAD: Checking rate limit too late
const paymentIntent = await stripe.paymentIntents.create(...) // Expensive!
await limiter.check(10, customer.id) // Too late, already created payment intent
```

### 3. Error Handling
- Return `429` status code (standard for rate limiting)
- Use generic error messages (don't reveal rate limit details)
- Log violations for monitoring

---

## Troubleshooting

### Rate Limits Not Working

**Check 1**: Verify limiter import
```typescript
// Correct
import { paymentLimiter } from '@/lib/rate-limit'

// Incorrect (won't work - not exported)
import rateLimit from '@/lib/rate-limit'
```

**Check 2**: Verify token consistency
```typescript
// Consistent (good)
await limiter.check(10, customer.id) // UUID
await limiter.check(10, customer.id) // Same UUID

// Inconsistent (bad - each request uses different token)
await limiter.check(10, Math.random().toString())
```

### False Positives

**Scenario**: Multiple users behind same IP (corporate network, VPN)

**Solution**: Use customer ID instead of IP for authenticated routes
```typescript
// Before (IP-based, can cause false positives)
await limiter.check(10, ipAddress)

// After (customer-based, more accurate)
await limiter.check(10, customer.id)
```

### Rate Limits Reset Unexpectedly

**Cause**: Server restart clears in-memory cache

**Solution**: This is expected behavior. For persistent rate limiting, use Redis.

---

## Files Modified

### Middleware Security (Layer 1)

- ✅ `src/lib/supabase/middleware.ts` - Enhanced with comprehensive authentication logic
  - Redirects authenticated users away from `/login` and `/register`
  - Protects all `/dashboard/*` routes with session checks
  - Adds `returnUrl` parameter for seamless post-login redirects
- ✅ `middleware.ts` - Uses updated `updateSession` helper for route protection

### Core Rate Limiting (Layer 3)

- ✅ `src/lib/rate-limit.ts` - Updated with named exports and limiter instances

### Protected API Routes (9 files)

1. ✅ `src/app/api/payments/create-intent/route.ts`
2. ✅ `src/app/api/payments/confirm/route.ts`
3. ✅ `src/app/api/payments/setup-intent/route.ts`
4. ✅ `src/app/api/rewards/[id]/redeem/route.ts`
5. ✅ `src/app/api/notifications/send-email/route.ts`
6. ✅ `src/app/api/analytics/track-session/route.ts`
7. ✅ `src/app/api/appointments/[id]/cancel/route.ts`
8. ✅ `src/app/api/cache/clear/route.ts`
9. ✅ `src/app/api/invoices/[id]/pdf/route.ts`

### Documentation

- ✅ `RATE-LIMITING.md` - This file

---

## Related Documentation

- `OPTIMIZATION-SUMMARY.md` - Database caching implementation
- `BUNDLE-OPTIMIZATION-SUMMARY.md` - Code splitting implementation
- `PERFORMANCE-OPTIMIZATION.md` - General performance guide

---

## Future Enhancements

1. **Redis Integration**: Distributed rate limiting for multi-server deployments
2. **Per-Endpoint Metrics**: Track rate limit hits per endpoint
3. **Dynamic Limits**: Adjust limits based on customer tier or subscription
4. **Whitelist/Blacklist**: Bypass limits for trusted IPs, block abusive ones
5. **Rate Limit Headers**: Return `X-RateLimit-*` headers in responses

```typescript
// Future: Return rate limit info in headers
return new NextResponse(data, {
  headers: {
    'X-RateLimit-Limit': '10',
    'X-RateLimit-Remaining': '7',
    'X-RateLimit-Reset': '1642521600',
  },
})
```

---

## Support

**Rate Limit Issues**: Check server logs for `Rate limit exceeded` warnings

**Adjusting Limits**: Edit `src/lib/rate-limit.ts` and restart server

**Production Deployment**: Ensure `x-forwarded-for` header is properly configured in your hosting environment (Vercel, AWS, etc.)

---

**Implementation Date**: January 2025
**Status**: ✅ Complete - Production Ready

**Security Coverage**:
- **Layer 1 (Middleware)**: 15/15 dashboard routes protected (100% coverage) ✅
- **Layer 2 (RLS)**: All database tables protected ✅
- **Layer 3 (API Routes)**: 9/15 routes with rate limiting (all critical operations protected) ✅
- **Overall**: All sensitive routes and data fully protected ✅
