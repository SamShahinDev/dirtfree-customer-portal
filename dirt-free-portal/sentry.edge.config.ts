import * as Sentry from '@sentry/nextjs'

/**
 * Sentry Edge Runtime Configuration
 *
 * Captures errors from:
 * - Edge API routes
 * - Edge middleware
 * - Edge functions
 */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment (development, staging, production)
  environment: process.env.NODE_ENV,

  // Capture 100% of transactions for performance monitoring
  // In production, reduce to 0.1 (10%) to save quota
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Filter and modify events before sending
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Edge (dev):', hint.originalException || event)
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
})
