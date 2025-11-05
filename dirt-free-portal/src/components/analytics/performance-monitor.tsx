'use client'

/**
 * Performance Monitor Component
 *
 * Automatically tracks page load performance, route changes,
 * and Core Web Vitals, sending metrics to Google Analytics.
 *
 * Usage:
 * ```typescript
 * // In app/layout.tsx
 * <PerformanceMonitor />
 * ```
 */

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { measurePageLoad, trackWebVitals, mark, measure } from '@/lib/monitoring'

export function PerformanceMonitor() {
  const pathname = usePathname()

  // Track page load performance on initial mount
  useEffect(() => {
    measurePageLoad()
  }, [])

  // Track Web Vitals
  useEffect(() => {
    trackWebVitals()
  }, [])

  // Track route changes
  useEffect(() => {
    // Mark the start of route transition
    mark(`route_change_start_${pathname}`)

    // When the route has finished changing, measure the duration
    const timer = setTimeout(() => {
      measure(`route_change_start_${pathname}`, `route_change_end_${pathname}`)
    }, 0)

    return () => clearTimeout(timer)
  }, [pathname])

  // This component doesn't render anything
  return null
}
