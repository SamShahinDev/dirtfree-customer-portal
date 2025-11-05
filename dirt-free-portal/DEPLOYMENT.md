# Vercel Deployment Guide

## Overview

This guide covers the complete deployment process for the Dirt Free Carpet Customer Portal to Vercel, including pre-deployment checks, environment variable setup, deployment methods, and post-deployment verification.

**Framework**: Next.js 15.5.3
**Platform**: Vercel
**Region**: US East (IAD1)
**Status**: Production Ready

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Deployment Methods](#deployment-methods)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Rollback Procedures](#rollback-procedures)
6. [Troubleshooting](#troubleshooting)
7. [Optional Tools Setup](#optional-tools-setup)

---

## Pre-Deployment Checklist

### 1. Code Quality Checks

Run all checks locally before deploying:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests
npm run test

# E2E tests (optional but recommended)
npm run test:e2e

# Build verification
npm run build
```

**Expected Results**:
- ✅ No TypeScript errors
- ✅ No ESLint errors (or only acceptable warnings)
- ✅ All tests passing
- ✅ Build completes successfully

### 2. Environment Variables Validation

Verify all required environment variables are set:

```bash
# The build will fail if any required env vars are missing
npm run build
```

**Required Variables** (see `.env.local` for local development):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_WEBSITE_URL`
- `NEXT_PUBLIC_GA_ID` (optional)

### 3. Security Headers Verification

Verify security headers are configured in `next.config.ts`:

```bash
# Start dev server
npm run dev

# In another terminal, check headers
curl -I http://localhost:3009

# Verify these headers are present:
# - Strict-Transport-Security
# - X-Frame-Options
# - X-Content-Type-Options
# - Content-Security-Policy
# - Referrer-Policy
# - Permissions-Policy
```

### 4. Git Status

Ensure all changes are committed:

```bash
git status
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## Environment Variables Setup

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Project Settings**:
   - Navigate to https://vercel.com/dashboard
   - Select your project
   - Go to **Settings** → **Environment Variables**

2. **Add Variables for Production**:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Production |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production |
   | `STRIPE_SECRET_KEY` | `sk_live_...` | Production |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Production |
   | `RESEND_API_KEY` | `re_...` | Production |
   | `NEXT_PUBLIC_APP_URL` | `https://portal.dirtfreecarpet.com` | Production |
   | `NEXT_PUBLIC_WEBSITE_URL` | `https://dirtfreecarpet.com` | Production |
   | `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Production (optional) |

3. **Add Variables for Preview** (optional):
   - Same variables as above
   - Use test/staging values (e.g., `pk_test_...` for Stripe)

4. **Redeploy**:
   - After adding variables, trigger a new deployment
   - Go to **Deployments** → **...** → **Redeploy**

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add RESEND_API_KEY production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_WEBSITE_URL production
vercel env add NEXT_PUBLIC_GA_ID production

# Verify environment variables
vercel env ls
```

### Method 3: Environment Variables from `.env` File

```bash
# Pull current environment variables
vercel env pull .env.production

# Edit .env.production with your production values
nano .env.production

# Push environment variables to Vercel
vercel env push .env.production production
```

---

## Deployment Methods

### Method 1: GitHub Integration (Recommended)

**Setup** (one-time):

1. **Connect GitHub Repository**:
   - Go to https://vercel.com/new
   - Click **Import Git Repository**
   - Select your GitHub repository
   - Configure project settings:
     - **Framework Preset**: Next.js
     - **Root Directory**: `./` (or `dirt-free-portal` if monorepo)
     - **Build Command**: `npm run build` (auto-detected)
     - **Output Directory**: `.next` (auto-detected)

2. **Configure Deployment Settings**:
   - **Production Branch**: `main` or `master`
   - **Preview Branches**: All branches (or specific branches)
   - **Auto-deploy**: Enable

**Deployment Workflow**:

```bash
# Automatic deployment on push to main
git push origin main

# Vercel will:
# 1. Detect the push
# 2. Run npm install
# 3. Run npm run build
# 4. Deploy to production
# 5. Assign production domain
```

**Preview Deployments**:

```bash
# Push to feature branch
git checkout -b feature/new-feature
git push origin feature/new-feature

# Vercel will:
# 1. Create a preview deployment
# 2. Provide a unique URL (e.g., portal-abc123.vercel.app)
# 3. Post deployment URL as GitHub comment (if configured)
```

### Method 2: Vercel CLI

**Setup** (one-time):

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Link project to Vercel
cd dirt-free-portal
vercel link
```

**Deploy to Preview**:

```bash
# Deploy to preview environment
vercel

# Vercel will:
# 1. Build the project
# 2. Upload to Vercel
# 3. Provide preview URL
```

**Deploy to Production**:

```bash
# Deploy to production
vercel --prod

# Or alias a preview deployment to production
vercel alias <preview-url> <production-domain>
```

### Method 3: Vercel Dashboard (Manual)

1. **Go to Deployments**:
   - Navigate to https://vercel.com/dashboard
   - Select your project
   - Click **Deployments**

2. **Trigger Deployment**:
   - Click **Create Deployment**
   - Select **Import from Git** or **Upload Files**
   - Configure deployment settings
   - Click **Deploy**

---

## Post-Deployment Verification

### 1. Deployment Status

**Vercel Dashboard**:
- Go to **Deployments** tab
- Verify deployment status is **Ready**
- Check build logs for any warnings or errors

**Expected Output**:
```
✅ Build completed successfully
✅ Deployment created
✅ Domain assigned: https://portal.dirtfreecarpet.com
```

### 2. Health Checks

**Basic Availability**:
```bash
# Check if site is accessible
curl -I https://portal.dirtfreecarpet.com

# Expected: HTTP/2 200 OK
```

**Security Headers**:
```bash
# Verify security headers
curl -I https://portal.dirtfreecarpet.com | grep -E 'Content-Security-Policy|Strict-Transport-Security|X-Frame-Options'

# Expected:
# - Content-Security-Policy: default-src 'self'; ...
# - Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
# - X-Frame-Options: SAMEORIGIN
```

**Environment Variables**:
- Open browser DevTools (F12)
- Go to **Console** tab
- Verify no environment variable errors

### 3. Feature Testing

**Authentication**:
- [ ] Login works with Supabase
- [ ] Registration works
- [ ] Password reset works
- [ ] Session persistence works

**Payments**:
- [ ] Stripe checkout loads correctly
- [ ] Test payment works (use test card: 4242 4242 4242 4242)
- [ ] Webhook receives events from Stripe
- [ ] Payment status updates in database

**Email**:
- [ ] Welcome emails send via Resend
- [ ] Invoice emails send correctly
- [ ] Email templates render properly

**Analytics** (optional):
- [ ] Google Analytics tracking works
- [ ] Events are being recorded

### 4. Performance Testing

**Lighthouse Audit**:
```bash
# Install Lighthouse CLI
npm i -g lighthouse

# Run audit
lighthouse https://portal.dirtfreecarpet.com --view

# Expected scores:
# - Performance: 90+
# - Accessibility: 95+
# - Best Practices: 95+
# - SEO: 90+
```

**Web Vitals**:
- Open browser DevTools
- Go to **Performance** tab
- Check Core Web Vitals:
  - **LCP** (Largest Contentful Paint): < 2.5s
  - **FID** (First Input Delay): < 100ms
  - **CLS** (Cumulative Layout Shift): < 0.1

### 5. Error Monitoring

**Vercel Logs**:
```bash
# View real-time logs
vercel logs <deployment-url> --follow

# View function logs
vercel logs <deployment-url> --output=raw
```

**Check for Runtime Errors**:
- Go to Vercel Dashboard → **Logs** tab
- Filter by **Errors**
- Verify no critical errors

---

## Rollback Procedures

### Method 1: Vercel Dashboard (Fastest)

1. **Go to Deployments**:
   - Navigate to https://vercel.com/dashboard
   - Select your project
   - Click **Deployments**

2. **Find Last Good Deployment**:
   - Look for the last deployment marked as **Ready**
   - Click **...** (three dots)
   - Click **Promote to Production**

**Time to Rollback**: ~30 seconds

### Method 2: Vercel CLI

```bash
# List recent deployments
vercel ls

# Promote a specific deployment to production
vercel promote <deployment-url>

# Or rollback to previous production deployment
vercel rollback
```

**Time to Rollback**: ~1 minute

### Method 3: Git Revert + Redeploy

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Vercel will auto-deploy the reverted code
```

**Time to Rollback**: ~2-5 minutes (depends on build time)

---

## Troubleshooting

### Issue: Build Fails with Environment Variable Error

**Symptom**:
```
Error [ZodError]: [
  {
    "path": ["STRIPE_SECRET_KEY"],
    "message": "Invalid input: expected string, received undefined"
  }
]
```

**Solution**:
1. Go to Vercel Dashboard → **Settings** → **Environment Variables**
2. Add the missing variable
3. Go to **Deployments** → **Redeploy**

### Issue: Security Headers Not Applied

**Symptom**: Security scanners report missing headers

**Solution**:
1. Verify `next.config.ts` has `async headers()` function
2. Check Vercel build logs for configuration errors
3. Clear CDN cache: `vercel --prod --force`

### Issue: Stripe Webhook Not Working

**Symptom**: Payments complete but database not updated

**Solution**:
1. **Verify Webhook Endpoint**:
   - Go to Stripe Dashboard → **Developers** → **Webhooks**
   - Verify endpoint URL: `https://portal.dirtfreecarpet.com/api/webhooks/stripe`

2. **Update Webhook Secret**:
   ```bash
   # Get webhook signing secret from Stripe Dashboard
   vercel env add STRIPE_WEBHOOK_SECRET production
   # Paste the whsec_... value

   # Redeploy
   vercel --prod
   ```

3. **Check Webhook Logs**:
   - Go to Stripe Dashboard → **Developers** → **Webhooks**
   - Click on your endpoint
   - Check **Recent deliveries** for errors

### Issue: Supabase Connection Error

**Symptom**: "Invalid JWT" or "Connection refused"

**Solution**:
1. **Verify Environment Variables**:
   ```bash
   vercel env ls
   ```
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is correct

2. **Check Supabase Dashboard**:
   - Go to Supabase Dashboard → **Settings** → **API**
   - Verify URL and keys match Vercel env vars
   - Check **Database** → **Connection Pooling** is enabled

3. **Verify Supabase Allowed URLs**:
   - Go to Supabase Dashboard → **Authentication** → **URL Configuration**
   - Add `https://portal.dirtfreecarpet.com` to **Site URL**
   - Add `https://portal.dirtfreecarpet.com/**` to **Redirect URLs**

### Issue: Build Takes Too Long

**Symptom**: Build timeout or very slow builds

**Solution**:
1. **Check Build Logs**:
   - Look for slow dependencies or large bundles

2. **Optimize Build**:
   ```bash
   # Check bundle size
   npm run build

   # Use bundle analyzer
   npm i -D @next/bundle-analyzer
   ```

3. **Increase Build Timeout** (Vercel Dashboard):
   - Go to **Settings** → **General**
   - Increase **Build Timeout** (if available on your plan)

### Issue: Preview Deployment Works, Production Fails

**Symptom**: Preview URL works but production domain shows errors

**Solution**:
1. **Check Environment Variables**:
   - Ensure production env vars are set separately from preview
   - Verify `NEXT_PUBLIC_APP_URL` matches production domain

2. **Check DNS Settings**:
   - Verify domain is correctly configured in Vercel
   - Check CNAME/A records point to Vercel

3. **Clear CDN Cache**:
   ```bash
   vercel --prod --force
   ```

---

## Optional Tools Setup

### Prettier (Code Formatting)

**Installation**:
```bash
npm i -D prettier
```

**Configuration** (`.prettierrc.json`):
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Usage**:
```bash
# Format all files
npm run format

# Check formatting (for CI/CD)
npm run format:check
```

### Husky (Git Hooks)

**Installation**:
```bash
npm i -D husky lint-staged
npm run prepare
```

**Configuration** (`.husky/pre-commit`):
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**Lint-Staged Configuration** (`package.json`):
```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

**Usage**:
- Git hooks run automatically on `git commit`
- Pre-commit hook runs linting and formatting

---

## CI/CD Pipeline (Optional)

### GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          # Add other required env vars as GitHub secrets

      - name: Deploy to Vercel
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## Related Documentation

- `SECURITY-HEADERS.md` - Security headers and CSP configuration
- `RATE-LIMITING.md` - API rate limiting implementation
- `OPTIMIZATION-SUMMARY.md` - Performance optimizations
- `README.md` - Project overview and local development setup

---

## Support

**Vercel Documentation**:
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)

**Need Help?**:
- Vercel Support: https://vercel.com/support
- Next.js Discord: https://discord.gg/nextjs
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

---

**Last Updated**: January 2025
**Status**: ✅ Production Ready
**Deployment Platform**: Vercel
**Framework**: Next.js 15.5.3
