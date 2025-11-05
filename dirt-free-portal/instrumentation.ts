/**
 * Instrumentation Hook for Next.js
 *
 * This file is used to initialize Sentry and other instrumentation tools.
 * It runs once when the Next.js server starts.
 *
 * Learn more: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  // Edge runtime (middleware, edge functions)
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError = async (
  err: Error,
  request: {
    path: string
    method: string
    headers: { [key: string]: string | string[] | undefined }
  }
) => {
  // You can use this hook to log additional information about requests that error
  // This is useful for debugging issues in production
  console.error(`Request error on ${request.method} ${request.path}:`, err)
}
