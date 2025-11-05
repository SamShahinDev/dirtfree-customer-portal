import * as Sentry from '@sentry/nextjs'

/**
 * Sentry Client-Side Configuration
 *
 * Captures errors and performance metrics from the browser.
 * Includes Session Replay for debugging user issues.
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
    // Performance monitoring for browser
    Sentry.browserTracingIntegration({
      // Track navigation and page loads
      tracePropagationTargets: [
        'localhost',
        /^\//,
        /^https:\/\/[^/]*\.dirtfreecarpet\.com/,
      ],
    }),

    // Session Replay for debugging
    Sentry.replayIntegration({
      // Mask all text content for privacy
      maskAllText: true,

      // Block all media (images, videos) for privacy
      blockAllMedia: true,

      // Mask all inputs for security
      maskAllInputs: true,
    }),
  ],

  // Session Replay sampling rates
  // Capture 10% of all sessions
  replaysSessionSampleRate: 0.1,

  // Capture 100% of sessions with errors
  replaysOnErrorSampleRate: 1.0,

  // Filter and modify events before sending
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry (dev):', hint.originalException || event)
      return null
    }

    // Filter out specific errors
    const error = hint.originalException

    // Ignore ResizeObserver errors (browser quirk, not actionable)
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string' &&
      error.message.includes('ResizeObserver')
    ) {
      return null
    }

    // Ignore network errors from ad blockers
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string' &&
      (error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError'))
    ) {
      return null
    }

    // Ignore cancelled requests
    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'AbortError'
    ) {
      return null
    }

    return event
  },

  // Ignore specific errors by message
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'atomicFindClose',
    // Random plugins/extensions
    'fb_xd_fragment',
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
    // Chrome extensions
    '__gCrWeb',
    'conduitPage',
  ],

  // Ignore specific URLs
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    // Firefox extensions
    /^moz-extension:\/\//i,
  ],
})
