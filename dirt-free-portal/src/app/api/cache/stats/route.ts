import { NextResponse } from 'next/server'
import { getCacheStats, getCacheHitRate } from '@/lib/db-cache'

/**
 * Cache Statistics API Endpoint
 *
 * GET /api/cache/stats
 *
 * Returns detailed cache statistics including:
 * - Cache sizes and limits
 * - Hit rate percentage
 * - Memory usage estimates
 *
 * Useful for monitoring cache performance in production
 */
export async function GET() {
  try {
    const stats = getCacheStats()
    const hitRate = getCacheHitRate()

    // Calculate total memory usage estimate
    const totalSize =
      stats.customers.size +
      stats.notifications.size +
      stats.queries.size +
      stats.invoices.size +
      stats.jobs.size

    const totalMax =
      stats.customers.max +
      stats.notifications.max +
      stats.queries.max +
      stats.invoices.max +
      stats.jobs.max

    return NextResponse.json({
      success: true,
      caches: stats,
      performance: {
        hitRate: `${hitRate.toFixed(2)}%`,
        totalEntries: totalSize,
        totalCapacity: totalMax,
        utilizationRate: `${((totalSize / totalMax) * 100).toFixed(2)}%`,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching cache stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cache statistics',
      },
      { status: 500 }
    )
  }
}
