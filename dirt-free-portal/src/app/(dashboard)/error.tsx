'use client'

import { ErrorBoundary } from '@/components/error-boundary'

/**
 * Dashboard Error Boundary
 *
 * This catches errors in the dashboard section of the application.
 */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      title="Dashboard Error"
      description="We encountered an error while loading your dashboard. Please try again."
      showHomeButton={false}
    />
  )
}
