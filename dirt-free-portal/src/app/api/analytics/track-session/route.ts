import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { trackPortalLogin } from '@/lib/analytics/session-tracking'
import { apiLimiter } from '@/lib/rate-limit'

/**
 * Track Portal Session
 *
 * Tracks a customer portal login session for analytics.
 * Records login timestamp, IP address, and user agent.
 *
 * Authentication: Required (Supabase JWT)
 * Rate Limit: 30 requests per minute (per IP)
 *
 * Response (Success 200):
 * {
 *   success: true,
 *   sessionId: string  // UUID of created session record
 * }
 *
 * Error Responses:
 * - 401: Unauthorized
 * - 404: Customer not found
 * - 429: Too many requests (rate limit exceeded)
 * - 500: Failed to track session
 *
 * Example Usage:
 * POST /api/analytics/track-session
 *
 * Note: This endpoint is typically called automatically when a customer logs in.
 */
export async function POST(request: Request) {
  try {
    // Get request metadata
    const userAgent = request.headers.get('user-agent') || undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : request.headers.get('x-real-ip') || 'unknown'

    // Rate limiting - 30 session tracking requests per minute per IP
    // Use IP instead of user ID since this endpoint is called during login
    try {
      await apiLimiter.check(30, ipAddress)
    } catch {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer ID
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Track the session
    const result = await trackPortalLogin(customer.id, supabase, {
      userAgent,
      ipAddress,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to track session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
    })
  } catch (error: any) {
    console.error('Track session error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to track session' },
      { status: 500 }
    )
  }
}
