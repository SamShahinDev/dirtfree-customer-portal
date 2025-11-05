'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

/**
 * Global Error Boundary
 *
 * This is the last resort error boundary for critical errors
 * that occur in the root layout or other error boundaries.
 *
 * Note: This must be a minimal implementation because:
 * 1. It replaces the entire root layout
 * 2. It can't import components that might also error
 * 3. It must render a complete HTML document
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Send error to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'global-error',
      },
      extra: {
        digest: error.digest,
        message: error.message,
        stack: error.stack,
      },
      level: 'fatal',
    })
  }, [error])

  return (
    <html>
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '600px' }}>
            <div
              style={{
                fontSize: '4rem',
                marginBottom: '1rem',
              }}
            >
              ⚠️
            </div>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                color: '#dc2626',
              }}
            >
              Critical Error
            </h1>
            <p
              style={{
                fontSize: '1rem',
                color: '#6b7280',
                marginBottom: '2rem',
              }}
            >
              We've encountered a critical error. Our team has been notified and is working on
              a fix.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div
                style={{
                  backgroundColor: '#f3f4f6',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '2rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                }}
              >
                <p style={{ fontWeight: 'bold', color: '#dc2626' }}>Error:</p>
                <p style={{ marginTop: '0.5rem' }}>{error.message}</p>
                {error.digest && (
                  <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
