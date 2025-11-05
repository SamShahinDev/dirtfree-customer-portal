# Dirt Free Carpet - Customer Portal

A modern, full-featured customer portal for Dirt Free Carpet cleaning services. Built with Next.js 15, this portal provides customers with a seamless experience for booking appointments, managing invoices, earning loyalty rewards, and communicating with the team.

## Overview

The Dirt Free Carpet Customer Portal is a production-ready web application that empowers customers to manage their carpet cleaning services independently. It integrates with Supabase for authentication and data storage, Stripe for payment processing, and provides real-time analytics and notifications.

### Key Features

- **Online Appointment Booking** - Schedule carpet cleaning services with real-time availability
- **Invoice Management** - View, download (PDF), and pay invoices online
- **Secure Payment Processing** - Stripe integration with saved payment methods
- **Loyalty Rewards Program** - Earn and redeem points for services
- **Real-time Messaging** - Communicate with the Dirt Free team with file attachments
- **Document Management** - Access warranties, receipts, and service records
- **Account Management** - Update profile, addresses, payment methods, and preferences
- **Email Notifications** - Automated emails for bookings, payments, and messages
- **Mobile Responsive** - PWA-ready for mobile app-like experience
- **Advanced Analytics** - Portal usage tracking and business insights
- **Performance Optimized** - Bundle optimization, caching, and monitoring

---

## Tech Stack

### Core Framework
- **Next.js 15.5.3** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5.x** - Type-safe development

### Backend & Database
- **Supabase 2.75.0** - Authentication, database (PostgreSQL), storage, Row Level Security
- **PostgreSQL** - Relational database via Supabase

### Payment Processing
- **Stripe 19.1.0** - Payment intents, setup intents, webhooks, customer management

### UI & Styling
- **Tailwind CSS 3.x** - Utility-first CSS framework
- **Shadcn/ui** - Accessible component library built on Radix UI
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Icon library

### Email & Notifications
- **Resend 6.2.0** - Transactional email service
- **React Email** - Email templating

### Monitoring & Analytics
- **Sentry 10.20.0** - Error tracking, performance monitoring, profiling
- **Google Analytics** - User analytics

### Testing
- **Jest 29.7.0** - Unit testing framework
- **Playwright 1.51.1** - End-to-end testing
- **React Testing Library** - Component testing utilities

### Code Quality
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeScript** - Static type checking

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** (recommended: 18.17.0 or higher)
- **npm 9+** or **yarn 1.22+**
- **Git**

### Required Accounts

You'll need accounts for the following services:

1. **Supabase** - [https://supabase.com](https://supabase.com)
   - Free tier available
   - Used for authentication, database, and file storage

2. **Stripe** - [https://stripe.com](https://stripe.com)
   - Test mode available
   - Used for payment processing

3. **Resend** - [https://resend.com](https://resend.com)
   - Free tier: 100 emails/day
   - Used for transactional emails

4. **Sentry** (optional for development) - [https://sentry.io](https://sentry.io)
   - Free tier available
   - Used for error tracking and performance monitoring

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dirt-free-portal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# Supabase Configuration (Shared with CRM)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe Payment Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration
RESEND_API_KEY=re_your_api_key

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3009
NEXT_PUBLIC_WEBSITE_URL=https://dirtfreecarpet.com
```

**Note:** Use port 3009 to avoid conflicts with other Next.js apps.

### 4. Database Setup

#### 4.1 Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project
3. Wait for project provisioning (~2 minutes)
4. Copy your project URL and anon key to `.env.local`

#### 4.2 Run Database Migrations

Execute the SQL migrations in order from the `/supabase` directory:

```bash
# Option 1: Using Supabase Dashboard
# Go to SQL Editor in Supabase Dashboard
# Copy and execute each file in order:
```

1. `01-create-portal-tables.sql` - Creates core tables (customers, jobs, invoices, etc.)
2. `02-apply-rls-policies.sql` - Applies Row Level Security policies
3. `03-create-test-customer.sql` - Creates test customer account
4. `03-create-storage-buckets.sql` - Sets up file storage buckets
5. `04-add-file-attachments-support.sql` - Adds attachment support
6. `05-add-missing-message-columns.sql` - Adds message columns
7. `06-add-reply-attachments-support.sql` - Adds reply attachment support
8. `07-add-attachment-analytics.sql` - Adds analytics tables
9. `08-create-notifications-table.sql` - Creates notifications table
10. `09-add-portal-analytics.sql` - Adds portal analytics
11. `10-add-performance-indexes.sql` - Adds performance indexes
12. `11-create-audit-logs-table.sql` - Creates audit logs table

**Important:** Run migrations in the exact order shown above.

#### 4.3 Create Test Data

After running migrations, you'll have a test customer account:

```
Email: test@dirtfreecarpet.com
Password: password123
```

You can create additional test data by running:

```bash
node scripts/create-test-customer.mjs
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Portal:** [http://localhost:3009](http://localhost:3009)
- **API:** [http://localhost:3009/api](http://localhost:3009/api)

### 6. Test the Portal

1. Navigate to [http://localhost:3009/login](http://localhost:3009/login)
2. Log in with test credentials (see section 4.3)
3. Explore the dashboard and features

---

## Project Structure

```
dirt-free-portal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth route group (login, signup)
│   │   ├── (dashboard)/       # Dashboard route group
│   │   │   └── dashboard/     # Dashboard pages
│   │   │       ├── appointments/
│   │   │       ├── invoices/
│   │   │       ├── messages/
│   │   │       ├── rewards/
│   │   │       ├── account/
│   │   │       └── help/
│   │   ├── api/               # API routes
│   │   │   ├── payments/      # Payment endpoints
│   │   │   ├── invoices/      # Invoice endpoints
│   │   │   ├── appointments/  # Appointment endpoints
│   │   │   ├── rewards/       # Loyalty endpoints
│   │   │   ├── notifications/ # Email endpoints
│   │   │   ├── analytics/     # Analytics endpoints
│   │   │   ├── cache/         # Cache management
│   │   │   └── webhooks/      # Stripe webhooks
│   │   ├── layout.tsx         # Root layout
│   │   └── error.tsx          # Error boundary
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn/ui components
│   │   └── dashboard/        # Dashboard-specific components
│   ├── lib/                   # Utilities & libraries
│   │   ├── supabase/         # Supabase client configuration
│   │   ├── stripe/           # Stripe utilities
│   │   ├── analytics/        # Analytics helpers
│   │   ├── cache/            # Cache system
│   │   ├── email/            # Email templates
│   │   ├── pdf/              # PDF generation
│   │   ├── rate-limit.ts     # Rate limiting
│   │   └── utils.ts          # Helper functions
│   ├── hooks/                 # React hooks
│   ├── types/                 # TypeScript type definitions
│   └── __tests__/            # Unit tests
├── supabase/                  # Database migrations (SQL)
├── e2e/                       # Playwright E2E tests
├── public/                    # Static assets
├── docs/                      # Documentation
│   ├── API.md                # API documentation
│   └── USER_GUIDE.md         # Customer user guide
├── .env.example              # Environment variables template
├── .env.local                # Your environment variables (gitignored)
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── jest.config.js            # Jest configuration
├── playwright.config.ts      # Playwright configuration
└── package.json              # Dependencies and scripts
```

---

## Available Scripts

### Development

```bash
# Start development server on port 3009
npm run dev

# Type check without emitting files
npm run type-check

# Lint code
npm run lint

# Format code with Prettier
npm run format

# Check formatting without making changes
npm run format:check
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run unit tests (Jest)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run E2E tests (Playwright)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# View E2E test report
npm run test:e2e:report
```

**When to Use Each Command:**

- **`npm run dev`** - Daily development work
- **`npm run type-check`** - Before committing to catch TypeScript errors
- **`npm run build`** - Before deploying or to test production build locally
- **`npm test`** - Run all unit tests once
- **`npm run test:watch`** - Active development with tests running automatically
- **`npm run test:coverage`** - Check test coverage before pull requests
- **`npm run test:e2e`** - Run full end-to-end tests before deployment
- **`npm run format`** - Auto-format code before committing

---

## Database Schema

### Core Tables

- **`customers`** - Customer accounts and profiles
- **`jobs`** - Service appointments and bookings
- **`invoices`** - Invoices and payment records
- **`messages`** - Customer-staff messaging
- **`loyalty_points`** - Loyalty program balances
- **`loyalty_transactions`** - Points earning/redemption history
- **`rewards`** - Available rewards catalog
- **`reward_redemptions`** - Reward redemption records
- **`notifications`** - Email notification tracking
- **`portal_sessions`** - Portal login analytics
- **`audit_logs`** - System audit trail

### Storage Buckets

- **`message-attachments`** - Customer message file uploads
- **`customer-documents`** - Receipts, warranties, certificates

### Security

All tables use **Row Level Security (RLS)** to ensure customers can only access their own data. See `supabase/02-apply-rls-policies.sql` for details.

---

## API Routes

The portal includes a comprehensive REST API for all customer operations. All endpoints (except webhooks and health checks) require authentication via Supabase JWT.

### Endpoints Overview

- **Payments** - Create intents, confirm payments, manage payment methods
- **Invoices** - Generate PDFs, export payment history
- **Appointments** - Cancel bookings
- **Rewards** - Redeem loyalty points
- **Notifications** - Send transactional emails
- **Analytics** - Portal statistics, session tracking
- **Cache** - Cache management and statistics
- **Health** - Service health checks
- **Webhooks** - Stripe payment webhooks

For complete API documentation, see **[docs/API.md](docs/API.md)**.

---

## Testing

### Unit Tests (Jest)

Located in `src/__tests__/` and `__tests__/`. Tests components, utilities, and business logic.

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

**Coverage Requirements:** Aim for 80%+ coverage on critical business logic.

### End-to-End Tests (Playwright)

Located in `e2e/`. Tests complete user workflows.

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# View test report
npm run test:e2e:report
```

**Test Scenarios:**
- User authentication flow
- Appointment booking
- Invoice payment
- Messaging system
- Loyalty redemption

### Writing Tests

**Unit Test Example:**
```typescript
// src/__tests__/components/InvoiceCard.test.tsx
import { render, screen } from '@testing-library/react'
import { InvoiceCard } from '@/components/InvoiceCard'

describe('InvoiceCard', () => {
  it('displays invoice amount correctly', () => {
    const invoice = { id: '1', amount: 185.00, status: 'pending' }
    render(<InvoiceCard invoice={invoice} />)
    expect(screen.getByText('$185.00')).toBeInTheDocument()
  })
})
```

**E2E Test Example:**
```typescript
// e2e/invoice-payment.spec.ts
import { test, expect } from '@playwright/test'

test('customer can pay invoice', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@dirtfreecarpet.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await page.goto('/dashboard/invoices')
  await page.click('text=Pay Now')

  expect(await page.url()).toContain('/invoices/')
})
```

---

## Deployment

The portal is designed for deployment on **Vercel** but can be deployed to any platform that supports Next.js.

### Quick Deploy to Vercel

1. Push code to GitHub/GitLab/Bitbucket
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables (Production)

Ensure all environment variables from `.env.example` are configured in your production environment, using production credentials instead of test/development values.

### Additional Deployment Considerations

- Set up Stripe webhook endpoint in production
- Configure custom domain
- Enable Sentry error tracking
- Set up monitoring and alerts

For detailed deployment instructions, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

---

## Troubleshooting

### Port 3009 Already in Use

```bash
# Find process using port 3009
lsof -i :3009

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3010 npm run dev
```

### Supabase Connection Errors

**Error:** `Invalid API key` or `supabase.auth.getUser() returns null`

**Solutions:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
2. Check Supabase project is not paused (free tier auto-pauses after inactivity)
3. Ensure database migrations have been run
4. Clear browser cookies and retry login

### Stripe Webhook Testing

**Error:** Webhooks not triggering in development

**Solution:** Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3009/api/webhooks/stripe

# Trigger test event
stripe trigger payment_intent.succeeded
```

Copy the webhook signing secret to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Database Migration Errors

**Error:** `relation "customers" does not exist`

**Solution:** Migrations not run in correct order. Drop all tables and re-run migrations from step 1.

```sql
-- In Supabase SQL Editor, drop all tables (caution: deletes data)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then re-run migrations 01-11 in order
```

### Build Errors

**Error:** `Type error: Cannot find module '@/...'`

**Solution:** TypeScript path alias issue. Restart TypeScript server:
- VSCode: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
- Or rebuild: `rm -rf .next && npm run build`

### Email Not Sending

**Error:** Emails not being delivered

**Solutions:**
1. Check `RESEND_API_KEY` is correct in `.env.local`
2. Verify sender domain is configured in Resend dashboard
3. Check Resend dashboard logs for delivery errors
4. Ensure "from" address matches verified domain

---

## Additional Documentation

This project includes extensive technical documentation:

- **[docs/API.md](docs/API.md)** - Complete API reference with examples
- **[docs/USER_GUIDE.md](docs/USER_GUIDE.md)** - Customer-facing user guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment procedures
- **[LOGGING.md](LOGGING.md)** - Logging system and audit trails
- **[ERROR-TRACKING.md](ERROR-TRACKING.md)** - Sentry integration and error handling
- **[PERFORMANCE-MONITORING.md](PERFORMANCE-MONITORING.md)** - Performance tracking
- **[PERFORMANCE-OPTIMIZATION.md](PERFORMANCE-OPTIMIZATION.md)** - Optimization strategies
- **[RATE-LIMITING.md](RATE-LIMITING.md)** - API rate limiting implementation
- **[SECURITY-HEADERS.md](SECURITY-HEADERS.md)** - Security configuration
- **[OPTIMIZATION-SUMMARY.md](OPTIMIZATION-SUMMARY.md)** - Bundle optimization results
- **[BUNDLE-OPTIMIZATION-SUMMARY.md](BUNDLE-OPTIMIZATION-SUMMARY.md)** - Bundle analysis

---

## Contributing

We follow a structured development workflow to maintain code quality.

### Code Style

- **TypeScript** - All new code must be TypeScript
- **Prettier** - Code formatting (run `npm run format` before committing)
- **ESLint** - Linting rules enforced
- **Naming Conventions:**
  - Components: PascalCase (`InvoiceCard.tsx`)
  - Utilities: camelCase (`formatCurrency.ts`)
  - Constants: UPPER_SNAKE_CASE (`MAX_UPLOAD_SIZE`)

### Git Workflow

1. Create a feature branch from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes and commit:
   ```bash
   git add .
   git commit -m "feat: add invoice export feature"
   ```

3. Push and create pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
- `feat: add PDF export for invoices`
- `fix: resolve payment intent creation error`
- `docs: update API documentation`

### Pull Request Guidelines

- Ensure all tests pass (`npm test` and `npm run test:e2e`)
- Run type checking (`npm run type-check`)
- Format code (`npm run format`)
- Add tests for new features
- Update documentation if needed
- Request review from team members

---

## Security

### Authentication

- **Supabase Auth** - JWT-based authentication
- **Row Level Security** - Database-level access control
- **Session Management** - Automatic session refresh

### Data Protection

- **Encryption at Rest** - Supabase handles database encryption
- **Encryption in Transit** - HTTPS required in production
- **PCI Compliance** - Stripe handles all card data (no card data stored)

### Security Headers

The portal implements comprehensive security headers via middleware:

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

See **[SECURITY-HEADERS.md](SECURITY-HEADERS.md)** for details.

### Reporting Security Issues

If you discover a security vulnerability, please email security@dirtfreecarpet.com instead of opening a public issue.

---

## License

**Proprietary** - All rights reserved. This software is proprietary to Dirt Free Carpet and is not licensed for public use, modification, or distribution.

---

## Support

### For Developers

- **Technical Issues:** Open an issue in the repository
- **Questions:** Contact the development team
- **Documentation:** See [Additional Documentation](#additional-documentation)

### For Customers

- **Phone:** (713) 730-2782
- **Email:** support@dirtfreecarpet.com
- **Hours:** Mon-Fri 8am-6pm, Sat 9am-2pm, Sun 10am-4pm
- **Portal Help:** Visit `/dashboard/help` in the portal

---

**Built with ❤️ for Dirt Free Carpet**

*Last Updated: January 2025*
