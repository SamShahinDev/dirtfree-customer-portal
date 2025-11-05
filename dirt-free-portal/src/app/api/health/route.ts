import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Health Check Endpoint
 *
 * Returns service health status for monitoring and uptime checks.
 *
 * Checks:
 * - Database connectivity (Supabase)
 * - Service availability
 * - Response time
 *
 * Usage:
 * - GET /api/health
 * - Returns 200 if healthy, 503 if unhealthy
 * - Use with uptime monitoring services (e.g., Better Uptime, Pingdom)
 */
export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, { status: 'ok' | 'error'; message?: string; duration?: number }> = {}

  try {
    // Check 1: Database connectivity
    const dbStart = Date.now()
    try {
      const supabase = await createClient()

      // Simple query to test database connection
      const { error } = await supabase
        .from('customers')
        .select('id')
        .limit(1)

      if (error) {
        checks.database = {
          status: 'error',
          message: error.message,
          duration: Date.now() - dbStart,
        }
      } else {
        checks.database = {
          status: 'ok',
          duration: Date.now() - dbStart,
        }
      }
    } catch (dbError: any) {
      checks.database = {
        status: 'error',
        message: dbError.message || 'Database connection failed',
        duration: Date.now() - dbStart,
      }
    }

    // Check 2: Service availability
    checks.service = {
      status: 'ok',
    }

    // Calculate total response time
    const responseTime = Date.now() - startTime

    // Determine overall health
    const isHealthy = Object.values(checks).every(check => check.status === 'ok')

    // Return response
    if (isHealthy) {
      return NextResponse.json(
        {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          checks,
          responseTime,
          uptime: process.uptime(),
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          checks,
          responseTime,
          uptime: process.uptime(),
        },
        { status: 503 }
      )
    }
  } catch (error: any) {
    // Catch-all for unexpected errors
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message || 'Health check failed',
        responseTime: Date.now() - startTime,
      },
      { status: 503 }
    )
  }
}
