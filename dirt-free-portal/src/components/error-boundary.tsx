'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

/**
 * Reusable Error Boundary Component
 *
 * This component catches errors in React components and:
 * 1. Sends error details to Sentry
 * 2. Shows a user-friendly error message
 * 3. Provides recovery options (retry, go home)
 *
 * Usage:
 * ```tsx
 * export default function Error({ error, reset }: {
 *   error: Error & { digest?: string }
 *   reset: () => void
 * }) {
 *   return <ErrorBoundary error={error} reset={reset} />
 * }
 * ```
 */

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  description?: string
  showHomeButton?: boolean
}

export function ErrorBoundary({
  error,
  reset,
  title = 'Something went wrong!',
  description = "We've been notified and are working on a fix.",
  showHomeButton = true,
}: ErrorBoundaryProps) {
  useEffect(() => {
    // Send error to Sentry with additional context
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'client-component',
      },
      extra: {
        digest: error.digest,
        message: error.message,
        stack: error.stack,
      },
      level: 'error',
    })
  }, [error])

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>

          {/* Show error message in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="rounded-md bg-muted p-3 text-xs font-mono">
              <p className="font-bold text-destructive">Error:</p>
              <p className="mt-1">{error.message}</p>
              {error.digest && (
                <p className="mt-2 text-muted-foreground">Digest: {error.digest}</p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            {showHomeButton && (
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/dashboard')}
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
