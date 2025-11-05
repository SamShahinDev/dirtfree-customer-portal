import * as Sentry from '@sentry/nextjs'

/**
 * Sentry Server-Side Configuration
 *
 * Captures errors from:
 * - API routes
 * - Server Components
 * - Server Actions
 * - Middleware
 */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment (development, staging, production)
  environment: process.env.NODE_ENV,

  // Capture 100% of transactions for performance monitoring
  // In production, reduce to 0.1 (10%) to save quota
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,

  // Integrations
  integrations: [
    // Automatically instrument Node.js
    Sentry.nodeProfilingIntegration(),
  ],

  // Filter and modify events before sending
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Server (dev):', hint.originalException || event)
      return null
    }

    // Filter out specific errors
    const error = hint.originalException

    // Don't send errors from health checks
    if (
      event.request?.url?.includes('/api/health') ||
      event.request?.url?.includes('/api/ping')
    ) {
      return null
    }

    // Don't send Supabase connection errors during startup
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string' &&
      error.message.includes('Supabase') &&
      error.message.includes('initialization')
    ) {
      return null
    }

    return event
  },

  // Configure what gets sent with errors
  beforeSendTransaction(event) {
    // Don't send transaction events in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    return event
  },

  // Ignore specific errors by message
  ignoreErrors: [
    // Expected errors
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
  ],
})
