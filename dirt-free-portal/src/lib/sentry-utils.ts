/**
 * Sentry Error Tracking Utilities
 *
 * Provides consistent error tracking across API routes and server components.
 */

import * as Sentry from '@sentry/nextjs'

/**
 * Capture an exception with context
 *
 * Usage:
 * ```typescript
 * try {
 *   // Your code
 * } catch (error) {
 *   captureApiError(error, {
 *     section: 'payment-processing',
 *     invoiceId,
 *     customerId,
 *   })
 *   return NextResponse.json({ error }, { status: 500 })
 * }
 * ```
 */
export function captureApiError(
  error: unknown,
  context?: {
    section?: string
    userId?: string
    invoiceId?: string
    customerId?: string
    paymentMethodId?: string
    appointmentId?: string
    [key: string]: any
  }
) {
  // Extract error message
  const errorMessage =
    error instanceof Error ? error.message : String(error)

  // Send to Sentry
  Sentry.captureException(error, {
    tags: {
      section: context?.section || 'api',
      errorType: error instanceof Error ? error.name : 'UnknownError',
    },
    extra: {
      ...context,
      errorMessage,
    },
    level: 'error',
  })

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Sentry] ${context?.section || 'API'} Error:`, error)
    if (context) {
      console.error('[Sentry] Context:', context)
    }
  }
}

/**
 * Capture a warning message
 *
 * Usage:
 * ```typescript
 * captureApiWarning('Payment method missing', {
 *   section: 'payment-processing',
 *   customerId,
 * })
 * ```
 */
export function captureApiWarning(
  message: string,
  context?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level: 'warning',
    tags: {
      section: context?.section || 'api',
    },
    extra: context,
  })

  if (process.env.NODE_ENV === 'development') {
    console.warn(`[Sentry] Warning: ${message}`, context)
  }
}

/**
 * Set user context for error tracking
 *
 * Usage:
 * ```typescript
 * setUserContext({
 *   id: userId,
 *   email: user.email,
 * })
 * ```
 */
export function setUserContext(user: {
  id: string
  email?: string
  username?: string
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  })
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null)
}

/**
 * Add breadcrumb for debugging
 *
 * Usage:
 * ```typescript
 * addBreadcrumb({
 *   message: 'Payment intent created',
 *   data: { amount, currency },
 * })
 * ```
 */
export function addBreadcrumb(breadcrumb: {
  message: string
  category?: string
  level?: 'debug' | 'info' | 'warning' | 'error'
  data?: Record<string, any>
}) {
  Sentry.addBreadcrumb({
    message: breadcrumb.message,
    category: breadcrumb.category || 'api',
    level: breadcrumb.level || 'info',
    data: breadcrumb.data,
    timestamp: Date.now() / 1000,
  })
}
