'use client'

import { useEffect, useRef } from 'react'

/**
 * Track customer portal session
 * Add this component to your dashboard layout to track user logins
 */
export function SessionTracker() {
  const tracked = useRef(false)

  useEffect(() => {
    // Only track once per page load
    if (tracked.current) return
    tracked.current = true

    // Track the session
    fetch('/api/analytics/track-session', {
      method: 'POST',
    }).catch((error) => {
      console.error('Failed to track session:', error)
    })
  }, [])

  return null
}
