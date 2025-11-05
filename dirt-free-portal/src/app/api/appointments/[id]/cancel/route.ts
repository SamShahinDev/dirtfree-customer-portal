import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { apiLimiter } from '@/lib/rate-limit'

/**
 * Cancel Appointment
 *
 * Cancels a scheduled appointment (job).
 *
 * Authentication: Required (Supabase JWT)
 * Rate Limit: 5 requests per minute per customer
 *
 * Path Parameters:
 * - id: string - Appointment (Job) UUID
 *
 * Response (Success 200):
 * { success: true }
 *
 * Error Responses:
 * - 401: Unauthorized
 * - 404: Customer not found / Appointment not found
 * - 400: Cannot cancel this appointment (already completed/cancelled)
 * - 429: Too many requests (rate limit exceeded)
 * - 500: Failed to cancel appointment
 *
 * Example Usage:
 * POST /api/appointments/{uuid}/cancel
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify appointment belongs to customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Rate limiting - 5 cancellation requests per minute per customer
    try {
      await apiLimiter.check(5, customer.id)
    } catch {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const { data: appointment } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', params.id)
      .eq('customer_id', customer?.id)
      .single()

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot cancel this appointment' },
        { status: 400 }
      )
    }

    // Update appointment status
    const { error } = await supabase
      .from('jobs')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (error) throw error

    // TODO: Send cancellation notification to customer and staff

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to cancel appointment' },
      { status: 500 }
    )
  }
}
