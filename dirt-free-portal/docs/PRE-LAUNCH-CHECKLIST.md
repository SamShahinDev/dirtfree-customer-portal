# Pre-Launch Checklist

Complete this checklist before deploying the Dirt Free Carpet Customer Portal to production. This ensures all systems are configured correctly, tested, and ready for customers.

**Last Updated:** January 2025

---

## Quick Start

Run the automated pre-launch check script:

```bash
npm run pre-launch
```

This script automatically verifies:
- ✅ Environment variables
- ✅ Database connection
- ✅ Database tables
- ✅ Storage buckets
- ✅ Stripe integration
- ✅ Email service

If all automated checks pass, proceed with the manual verification steps below.

---

## 1. Code Quality & Testing

### TypeScript

```bash
npm run type-check
```

- [ ] No TypeScript errors
- [ ] All types properly defined
- [ ] No `any` types in critical code

### Linting

```bash
npm run lint
```

- [ ] No ESLint errors
- [ ] No ESLint warnings in production code
- [ ] Code follows project style guide

### Code Formatting

```bash
npm run format:check
```

- [ ] All code properly formatted with Prettier
- [ ] Run `npm run format` if needed

### Unit Tests

```bash
npm run test:coverage
```

- [ ] All unit tests passing
- [ ] Coverage ≥ 80% on critical business logic
- [ ] No skipped tests in production code

### End-to-End Tests

```bash
npm run test:e2e
```

- [ ] All E2E tests passing
- [ ] Critical user flows tested:
  - [ ] Login/logout
  - [ ] Appointment booking
  - [ ] Invoice payment
  - [ ] Messaging
  - [ ] Loyalty redemption

---

## 2. Environment Variables

Verify all required environment variables are set in production:

### Required Variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (pk_live_...)
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (sk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (whsec_...)
- [ ] `RESEND_API_KEY` - Resend API key for emails (re_...)
- [ ] `NEXT_PUBLIC_APP_URL` - Production app URL (https://portal.dirtfreecarpet.com)
- [ ] `NEXT_PUBLIC_WEBSITE_URL` - Main website URL (https://dirtfreecarpet.com)

### Optional Variables

- [ ] `NEXT_PUBLIC_GA_ID` - Google Analytics tracking ID
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking DSN
- [ ] `SENTRY_AUTH_TOKEN` - Sentry auth token for releases
- [ ] `SENTRY_ORG` - Sentry organization slug
- [ ] `SENTRY_PROJECT` - Sentry project slug

### Security Checks

- [ ] No test/development keys in production
- [ ] All secret keys use `live` mode (not `test`)
- [ ] Service role keys secured (not exposed client-side)
- [ ] Webhook secrets properly configured

---

## 3. Database Verification

### Supabase Connection

- [ ] Production Supabase project created
- [ ] Project not paused (paid plan or active usage)
- [ ] Connection pooling enabled (if high traffic expected)

### Database Migrations

Run all migrations in order:

```bash
# Execute in Supabase SQL Editor in this exact order:
```

- [ ] `01-create-portal-tables.sql` - Core tables created
- [ ] `02-apply-rls-policies.sql` - Row Level Security enabled
- [ ] `03-create-storage-buckets.sql` - File storage configured
- [ ] `04-add-file-attachments-support.sql` - Attachments enabled
- [ ] `05-add-missing-message-columns.sql` - Messages updated
- [ ] `06-add-reply-attachments-support.sql` - Reply attachments enabled
- [ ] `07-add-attachment-analytics.sql` - Analytics tables created
- [ ] `08-create-notifications-table.sql` - Notifications enabled
- [ ] `09-add-portal-analytics.sql` - Portal analytics created
- [ ] `10-add-performance-indexes.sql` - Performance indexes added
- [ ] `11-create-audit-logs-table.sql` - Audit logging enabled

### Database Tables

Verify all required tables exist:

- [ ] `customers` - Customer accounts
- [ ] `jobs` - Service appointments
- [ ] `invoices` - Invoices and payments
- [ ] `services` - Service catalog
- [ ] `job_services` - Job-service relationships
- [ ] `loyalty_points` - Loyalty balances
- [ ] `loyalty_transactions` - Points history
- [ ] `rewards` - Rewards catalog
- [ ] `reward_redemptions` - Redemption records
- [ ] `messages` - Customer messages
- [ ] `notifications` - Email notifications

### Row Level Security (RLS)

- [ ] RLS enabled on all customer-facing tables
- [ ] Customers can only access their own data
- [ ] Service role key can access all data
- [ ] Test RLS policies with test account

---

## 4. Storage & File Uploads

### Supabase Storage Buckets

- [ ] `customer-documents` bucket created
  - [ ] Public access disabled
  - [ ] Max file size: 10MB
  - [ ] Allowed file types: PDF, JPG, PNG
- [ ] `message-attachments` bucket created
  - [ ] Public access disabled
  - [ ] Max file size: 10MB
  - [ ] Allowed file types: PDF, JPG, PNG, DOC, DOCX

### Storage Policies

- [ ] Customers can only upload to their own folders
- [ ] Customers can only read their own files
- [ ] Staff can access all files (via service role)

### Test File Uploads

- [ ] Upload test file via message attachment
- [ ] Verify file appears in bucket
- [ ] Verify file can be downloaded
- [ ] Verify file URLs are signed and secure

---

## 5. External Services

### Stripe Integration

#### Account Setup

- [ ] Stripe account in **live mode**
- [ ] Business details completed
- [ ] Bank account connected for payouts
- [ ] Tax settings configured

#### API Keys

- [ ] Production publishable key configured (pk_live_...)
- [ ] Production secret key configured (sk_live_...)
- [ ] Keys tested with sample transaction

#### Webhook Configuration

- [ ] Webhook endpoint configured: `https://[your-domain]/api/webhooks/stripe`
- [ ] Webhook secret obtained and configured
- [ ] Events enabled:
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
- [ ] Webhook tested with Stripe CLI

#### Payment Methods

- [ ] Card payments enabled (Visa, Mastercard, Amex, Discover)
- [ ] 3D Secure enabled
- [ ] Fraud detection enabled

#### Test Payments

- [ ] Process test payment in production
- [ ] Verify webhook triggers
- [ ] Verify invoice marked as paid
- [ ] Verify loyalty points awarded

### Email Service (Resend)

- [ ] Resend account created
- [ ] Production API key configured
- [ ] Sending domain verified (e.g., portal.dirtfreecarpet.com)
- [ ] SPF and DKIM records configured
- [ ] Test email sent successfully

#### Email Templates

- [ ] Appointment confirmation email working
- [ ] Invoice notification email working
- [ ] Payment receipt email working
- [ ] Message reply notification working
- [ ] Loyalty points earned email working

### Error Tracking (Sentry)

- [ ] Sentry project created
- [ ] DSN configured in environment
- [ ] Source maps uploaded
- [ ] Error alerts configured
- [ ] Performance monitoring enabled
- [ ] Test error captured successfully

### Analytics (Google Analytics)

- [ ] GA4 property created
- [ ] Tracking ID configured
- [ ] Enhanced measurement enabled
- [ ] Test pageview tracked

---

## 6. Security Verification

### Security Headers

Test at: https://securityheaders.com

- [ ] Content-Security-Policy configured
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy configured

### HTTPS & SSL

- [ ] SSL certificate installed
- [ ] HTTPS redirect enabled
- [ ] Mixed content warnings resolved
- [ ] SSL Labs score: A or higher

### Authentication

- [ ] Password requirements enforced (min 8 chars)
- [ ] Email verification required
- [ ] Session timeout configured
- [ ] Secure cookies enabled (httpOnly, secure, sameSite)

### Rate Limiting

- [ ] API rate limits configured
- [ ] Rate limit headers returned
- [ ] Brute force protection enabled

### Data Protection

- [ ] PII encrypted at rest (via Supabase)
- [ ] PII encrypted in transit (HTTPS)
- [ ] No card data stored (handled by Stripe)
- [ ] Audit logs enabled

---

## 7. Performance Optimization

### Build Optimization

```bash
npm run build
```

- [ ] Build completes without errors
- [ ] Build completes without warnings
- [ ] Bundle size analyzed
- [ ] No large dependencies in client bundle

### Performance Targets

Test with Lighthouse (https://pagespeed.web.dev):

- [ ] Performance score ≥ 85
- [ ] Accessibility score ≥ 95
- [ ] Best Practices score ≥ 95
- [ ] SEO score ≥ 90

### Core Web Vitals

- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

### Caching

- [ ] Static assets cached (1 year)
- [ ] API responses cached where appropriate
- [ ] CDN configured (Vercel Edge Network)

---

## 8. Testing & Validation

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Testing

- [ ] iOS Safari (latest)
- [ ] Android Chrome (latest)
- [ ] Responsive design works 320px-2560px
- [ ] Touch targets ≥ 44x44px

### User Flows

Test complete user journeys:

- [ ] **New User Registration**
  - [ ] Sign up with email
  - [ ] Verify email
  - [ ] Complete profile
  - [ ] Log in successfully

- [ ] **Appointment Booking**
  - [ ] Browse services
  - [ ] Select date/time
  - [ ] Enter details
  - [ ] Confirm booking
  - [ ] Receive confirmation email

- [ ] **Invoice Payment**
  - [ ] View unpaid invoice
  - [ ] Add payment method
  - [ ] Process payment
  - [ ] Receive receipt
  - [ ] Earn loyalty points

- [ ] **Messaging**
  - [ ] Send message with attachment
  - [ ] Receive notification
  - [ ] View reply
  - [ ] Download attachment

- [ ] **Loyalty Redemption**
  - [ ] View points balance
  - [ ] Browse rewards
  - [ ] Redeem reward
  - [ ] Points deducted

### Error Handling

- [ ] 404 page displays correctly
- [ ] 500 error page displays correctly
- [ ] Network errors handled gracefully
- [ ] Invalid inputs show validation errors
- [ ] Failed payments show clear error messages

---

## 9. Documentation

### User-Facing

- [ ] USER_GUIDE.md is up to date
- [ ] Help page (`/dashboard/help`) is accessible
- [ ] Contact information is correct
- [ ] FAQs cover common questions

### Developer-Facing

- [ ] README.md is comprehensive
- [ ] API.md documents all endpoints
- [ ] DEPLOYMENT.md has deployment steps
- [ ] Environment variables documented
- [ ] Database schema documented

---

## 10. Deployment Process

### Pre-Deployment

- [ ] Run automated checks: `npm run pre-launch`
- [ ] All checklist items above completed
- [ ] Create deployment ticket/issue
- [ ] Notify team of deployment window

### Deployment

- [ ] Push code to production branch
- [ ] Verify build succeeds on Vercel
- [ ] Monitor deployment logs
- [ ] Wait for deployment to complete

### Post-Deployment Verification

Immediately after deployment:

- [ ] Health check endpoint responds: `https://[domain]/api/health`
- [ ] Homepage loads correctly
- [ ] Login works
- [ ] Dashboard loads
- [ ] API endpoints respond correctly
- [ ] No console errors in browser
- [ ] Sentry shows no new errors

### Monitoring

First 24 hours after deployment:

- [ ] Monitor Sentry for errors
- [ ] Monitor Vercel analytics
- [ ] Check server logs
- [ ] Monitor Stripe webhook deliveries
- [ ] Monitor email delivery (Resend dashboard)
- [ ] Watch for customer support tickets

---

## 11. Rollback Plan

If critical issues are discovered:

### Immediate Rollback

```bash
# Revert to previous deployment on Vercel
vercel rollback
```

- [ ] Rollback procedure documented
- [ ] Team knows how to trigger rollback
- [ ] Previous deployment available
- [ ] Database changes are reversible

### Communication

- [ ] Notify customers of issue (if customer-facing)
- [ ] Update status page
- [ ] Log incident in issue tracker
- [ ] Post-mortem scheduled

---

## 12. Final Sign-Off

Before marking deployment as complete:

- [ ] All automated checks passing (`npm run pre-launch`)
- [ ] All manual checks completed
- [ ] Production environment tested
- [ ] No critical errors in logs
- [ ] Team approval obtained
- [ ] Customer support team notified

**Deployment Approved By:**

- [ ] Technical Lead: _________________ Date: _______
- [ ] QA Lead: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______

---

## Resources

- **Automated Check Script:** `npm run pre-launch`
- **Health Check Endpoint:** `GET /api/health`
- **Deployment Guide:** [DEPLOYMENT.md](../DEPLOYMENT.md)
- **API Documentation:** [API.md](./API.md)
- **Support:** support@dirtfreecarpet.com

---

**Document Version:** 1.0
**Last Reviewed:** January 2025
