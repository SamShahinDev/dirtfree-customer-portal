'use client'

import { ErrorBoundary } from '@/components/error-boundary'

/**
 * Root Error Boundary
 *
 * This catches all unhandled errors in the application.
 * It's the first line of defense for unexpected errors.
 */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundary error={error} reset={reset} />
}
