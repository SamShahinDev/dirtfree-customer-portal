import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

// Detect if user is on a mobile browser
function isMobileBrowser(): boolean {
  if (typeof window === 'undefined') return false

  const userAgent = navigator.userAgent.toLowerCase()
  // Check for common mobile user agents
  const mobilePatterns = [
    /iphone/,
    /ipad/,
    /ipod/,
    /android/,
    /mobile/,
    /webos/,
    /windows phone/,
  ]

  return mobilePatterns.some(pattern => pattern.test(userAgent))
}

// Global error handler for WebSocket failures
function setupErrorHandling() {
  if (typeof window === 'undefined') return

  // Catch unhandled promise rejections from WebSocket
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (event.reason.message?.includes('WebSocket') ||
        event.reason.message?.includes('insecure') ||
        event.reason.message?.includes('realtime'))
    ) {
      console.warn('WebSocket connection error - app will continue to function with polling', event.reason)
      // Don't crash the app - prevent the error from bubbling
      event.preventDefault()
    }
  })
}

export function createClient() {
  const isOnMobile = isMobileBrowser()

  // Create Supabase client with realtime disabled on mobile (Safari WebSocket issues)
  const client = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {}
      },
      // Disable realtime on mobile browsers due to Safari WebSocket restrictions
      realtime: isOnMobile ? { enabled: false } : undefined
    }
  )

  // Setup error handling for WebSocket failures
  setupErrorHandling()

  // Log for debugging
  if (typeof window !== 'undefined' && isOnMobile) {
    console.log('📱 Mobile browser detected - Supabase realtime disabled for stability')
  }

  return client
}
