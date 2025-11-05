import { NextResponse } from 'next/server'
import {
  clearAllCaches,
  clearCachePattern,
  invalidateCustomerCaches,
  resetCacheMetrics,
} from '@/lib/db-cache'
import { apiLimiter } from '@/lib/rate-limit'

/**
 * Cache Management API Endpoint
 *
 * POST /api/cache/clear
 *
 * Clears cache based on provided parameters:
 * - all: Clear all caches
 * - pattern: Clear entries matching pattern
 * - customerId: Clear all caches for specific customer
 * - metrics: Reset hit/miss metrics
 *
 * Example requests:
 * POST /api/cache/clear { "all": true }
 * POST /api/cache/clear { "pattern": "customer:john@example.com" }
 * POST /api/cache/clear { "customerId": "uuid-here", "email": "john@example.com" }
 * POST /api/cache/clear { "metrics": true }
 */
export async function POST(request: Request) {
  try {
    // Rate limiting - 2 cache clear requests per minute per IP
    // Strict limit to prevent cache thrashing
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : request.headers.get('x-real-ip') || 'unknown'

    try {
      await apiLimiter.check(2, ipAddress)
    } catch {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    if (body.all) {
      clearAllCaches()
      return NextResponse.json({
        success: true,
        message: 'All caches cleared successfully',
      })
    }

    if (body.pattern) {
      clearCachePattern(body.pattern)
      return NextResponse.json({
        success: true,
        message: `Cache entries matching "${body.pattern}" cleared`,
      })
    }

    if (body.customerId) {
      invalidateCustomerCaches(body.customerId, body.email)
      return NextResponse.json({
        success: true,
        message: `All caches cleared for customer ${body.customerId}`,
      })
    }

    if (body.metrics) {
      resetCacheMetrics()
      return NextResponse.json({
        success: true,
        message: 'Cache metrics reset successfully',
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request. Provide one of: all, pattern, customerId, or metrics',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error clearing cache:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear cache',
      },
      { status: 500 }
    )
  }
}
