/**
 * Performance Monitoring Utilities
 *
 * Provides utilities for tracking application performance metrics
 * and sending them to Google Analytics.
 *
 * Features:
 * - Page load time tracking
 * - API call duration measurement
 * - Core Web Vitals tracking
 * - Custom performance metrics
 */

/**
 * Track a performance metric to Google Analytics
 *
 * Usage:
 * ```typescript
 * trackPerformance('page_load', 1234)
 * trackPerformance('api_call_duration', 500)
 * ```
 */
export function trackPerformance(metricName: string, value: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: metricName,
      value: Math.round(value),
      event_category: 'Performance',
    })
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metricName}: ${Math.round(value)}ms`)
  }
}

/**
 * Measure and track page load performance
 *
 * Tracks:
 * - Total page load time
 * - DOM interactive time
 * - DOM complete time
 * - First Contentful Paint (if available)
 *
 * Usage:
 * ```typescript
 * // Call once on app initialization
 * measurePageLoad()
 * ```
 */
export function measurePageLoad() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    // Wait a bit for all metrics to be available
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      if (perfData) {
        // Total page load time
        trackPerformance('page_load', perfData.loadEventEnd - perfData.fetchStart)

        // DOM interactive (when DOM is ready)
        trackPerformance('dom_interactive', perfData.domInteractive - perfData.fetchStart)

        // DOM complete (when all resources loaded)
        trackPerformance('dom_complete', perfData.domComplete - perfData.fetchStart)

        // Time to First Byte (server response time)
        trackPerformance('ttfb', perfData.responseStart - perfData.requestStart)
      }

      // Track First Contentful Paint if available
      const paintEntries = performance.getEntriesByType('paint')
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      if (fcp) {
        trackPerformance('fcp', fcp.startTime)
      }
    }, 0)
  })
}

/**
 * Measure the duration of an API call and track it
 *
 * Usage:
 * ```typescript
 * const data = await measureApiCall('fetch_invoices', async () => {
 *   return await fetch('/api/invoices')
 * })
 * ```
 */
export async function measureApiCall<T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const start = performance.now()

  try {
    const result = await apiCall()
    const duration = performance.now() - start

    // Track successful API call
    trackPerformance(`api_${name}`, duration)

    return result
  } catch (error) {
    const duration = performance.now() - start

    // Track failed API call separately
    trackPerformance(`api_${name}_error`, duration)

    throw error
  }
}

/**
 * Track Core Web Vitals to Google Analytics
 *
 * Tracks:
 * - CLS (Cumulative Layout Shift)
 * - FID (First Input Delay)
 * - LCP (Largest Contentful Paint)
 *
 * Usage:
 * ```typescript
 * trackWebVitals((metric) => {
 *   console.log(metric.name, metric.value)
 * })
 * ```
 */
export function trackWebVitals(onReport?: (metric: WebVital) => void) {
  if (typeof window === 'undefined') return

  // Import web-vitals library dynamically to reduce initial bundle
  import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
    const reportMetric = (metric: WebVital) => {
      // Send to Google Analytics
      trackPerformance(metric.name, metric.value)

      // Call custom callback if provided
      onReport?.(metric)
    }

    // Track all Core Web Vitals
    onCLS(reportMetric)
    onINP(reportMetric) // Interaction to Next Paint (replaced FID in web-vitals v3+)
    onLCP(reportMetric)
    onFCP(reportMetric)
    onTTFB(reportMetric)
  })
}

/**
 * Web Vital metric type
 */
export interface WebVital {
  name: 'CLS' | 'INP' | 'LCP' | 'FCP' | 'TTFB'
  value: number
  delta: number
  id: string
  entries: PerformanceEntry[]
}

/**
 * Create a performance mark (for measuring custom durations)
 *
 * Usage:
 * ```typescript
 * mark('start_payment')
 * // ... do work
 * const duration = measure('start_payment', 'payment_complete')
 * ```
 */
export function mark(markName: string) {
  if (typeof window !== 'undefined' && performance.mark) {
    performance.mark(markName)
  }
}

/**
 * Measure duration between two marks and track it
 *
 * Usage:
 * ```typescript
 * mark('start_operation')
 * // ... do work
 * const duration = measure('start_operation', 'operation_complete')
 * ```
 */
export function measure(startMark: string, endMark: string): number {
  if (typeof window === 'undefined') return 0

  try {
    performance.mark(endMark)
    const measureName = `${startMark}_to_${endMark}`
    performance.measure(measureName, startMark, endMark)

    const measures = performance.getEntriesByName(measureName, 'measure')
    if (measures.length > 0) {
      const duration = measures[0].duration
      trackPerformance(measureName, duration)
      return duration
    }
  } catch (error) {
    // Marks might not exist, that's okay
    console.warn(`Failed to measure ${startMark} to ${endMark}:`, error)
  }

  return 0
}

/**
 * Track resource loading performance
 *
 * Usage:
 * ```typescript
 * trackResourceTiming() // Call once to log all resource timings
 * ```
 */
export function trackResourceTiming() {
  if (typeof window === 'undefined') return

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

  // Group resources by type
  const resourcesByType: Record<string, number[]> = {}

  resources.forEach(resource => {
    const type = resource.initiatorType || 'other'

    if (!resourcesByType[type]) {
      resourcesByType[type] = []
    }

    resourcesByType[type].push(resource.duration)
  })

  // Calculate and track average duration per resource type
  Object.entries(resourcesByType).forEach(([type, durations]) => {
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    trackPerformance(`resource_${type}_avg`, avgDuration)
  })
}
