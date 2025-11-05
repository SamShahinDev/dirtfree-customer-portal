import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Get Portal Statistics
 *
 * Retrieves customer portal usage statistics for the last 30 days.
 *
 * Authentication: Required
 * Rate Limit: None
 *
 * Response (Success 200):
 * {
 *   totalCustomers: number,          // Total registered customers
 *   activeCustomers: number,          // Customers logged in (last 30 days)
 *   onlineBookings: number,           // Bookings via portal (last 30 days)
 *   totalBookings: number,            // All bookings (last 30 days)
 *   onlinePayments: number,           // Online payments (last 30 days)
 *   loyaltyUsers: number,             // Customers with points > 0
 *   totalLoyaltyRecords: number,      // Customers with loyalty records
 *   adoptionRate: number,             // % active customers
 *   onlineBookingRate: number,        // % bookings made online
 *   loyaltyEngagementRate: number,    // % loyalty users with points
 *   period: "30 days",
 *   generatedAt: string               // ISO 8601 timestamp
 * }
 *
 * Error Responses:
 * - 500: Failed to fetch portal statistics
 *
 * Example Usage:
 * GET /api/analytics/portal-stats
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Total registered customers
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })

    // Active customers (logged in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: activeCustomers } = await supabase
      .from('portal_sessions')
      .select('customer_id', { count: 'exact', head: true })
      .gte('login_at', thirtyDaysAgo.toISOString())

    // Get unique active customers (since one customer can have multiple sessions)
    const { data: activeSessions } = await supabase
      .from('portal_sessions')
      .select('customer_id')
      .gte('login_at', thirtyDaysAgo.toISOString())

    const uniqueActiveCustomers = activeSessions
      ? new Set(activeSessions.map(s => s.customer_id)).size
      : 0

    // Online bookings (last 30 days)
    const { count: onlineBookings } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())
      .eq('booked_via_portal', true)

    // Total bookings (last 30 days) for comparison
    const { count: totalBookings } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Online payments (last 30 days)
    const { count: onlinePayments } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'paid')
      .gte('paid_date', thirtyDaysAgo.toISOString())

    // Loyalty program engagement (customers with points > 0)
    const { count: loyaltyUsers } = await supabase
      .from('loyalty_points')
      .select('*', { count: 'exact', head: true })
      .gt('points', 0)

    // Total loyalty users (all with loyalty records)
    const { count: totalLoyaltyRecords } = await supabase
      .from('loyalty_points')
      .select('*', { count: 'exact', head: true })

    // Calculate adoption rate
    const adoptionRate = totalCustomers && totalCustomers > 0
      ? ((uniqueActiveCustomers / totalCustomers) * 100).toFixed(1)
      : '0.0'

    // Calculate online booking percentage
    const onlineBookingRate = totalBookings && totalBookings > 0
      ? ((onlineBookings || 0) / totalBookings * 100).toFixed(1)
      : '0.0'

    // Calculate loyalty engagement rate
    const loyaltyEngagementRate = totalLoyaltyRecords && totalLoyaltyRecords > 0
      ? (((loyaltyUsers || 0) / totalLoyaltyRecords) * 100).toFixed(1)
      : '0.0'

    return NextResponse.json({
      totalCustomers: totalCustomers || 0,
      activeCustomers: uniqueActiveCustomers,
      onlineBookings: onlineBookings || 0,
      totalBookings: totalBookings || 0,
      onlinePayments: onlinePayments || 0,
      loyaltyUsers: loyaltyUsers || 0,
      totalLoyaltyRecords: totalLoyaltyRecords || 0,

      // Calculated metrics
      adoptionRate: parseFloat(adoptionRate),
      onlineBookingRate: parseFloat(onlineBookingRate),
      loyaltyEngagementRate: parseFloat(loyaltyEngagementRate),

      // Additional insights
      period: '30 days',
      generatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Portal stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch portal statistics' },
      { status: 500 }
    )
  }
}
