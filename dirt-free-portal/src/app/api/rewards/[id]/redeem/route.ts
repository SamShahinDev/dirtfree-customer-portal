import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { rewardLimiter } from '@/lib/rate-limit'

/**
 * Redeem Reward
 *
 * Redeems loyalty points for a reward.
 * Deducts points from customer's balance and creates a redemption record.
 *
 * Authentication: Required (Supabase JWT)
 * Rate Limit: 5 requests per minute per customer
 *
 * Path Parameters:
 * - id: string - Reward UUID
 *
 * Response (Success 200):
 * {
 *   success: true,
 *   newBalance: number  // Customer's new loyalty points balance
 * }
 *
 * Error Responses:
 * - 401: Unauthorized
 * - 404: Customer not found / Reward not found (or inactive)
 * - 400: Insufficient points
 * - 429: Too many requests (rate limit exceeded)
 * - 500: Failed to redeem reward
 *
 * Example Usage:
 * POST /api/rewards/{uuid}/redeem
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

    // Get customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Rate limiting - 5 reward redemptions per minute per customer
    // Strict limit to prevent double-redemption attacks and race conditions
    try {
      await rewardLimiter.check(5, customer.id)
    } catch {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Get reward details
    const { data: reward } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!reward || !reward.active) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }

    // Get customer loyalty points
    const { data: loyalty } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('customer_id', customer.id)
      .single()

    if (!loyalty || loyalty.points < reward.points_required) {
      return NextResponse.json(
        { error: 'Insufficient points' },
        { status: 400 }
      )
    }

    // Deduct points
    const newPoints = loyalty.points - reward.points_required
    const newTotalRedeemed = loyalty.total_redeemed + reward.points_required

    const { error: updateError } = await supabase
      .from('loyalty_points')
      .update({
        points: newPoints,
        total_redeemed: newTotalRedeemed,
        updated_at: new Date().toISOString(),
      })
      .eq('customer_id', customer.id)

    if (updateError) throw updateError

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('loyalty_transactions')
      .insert({
        customer_id: customer.id,
        points: -reward.points_required,
        type: 'redemption',
        description: `Redeemed: ${reward.name}`,
      })

    if (transactionError) throw transactionError

    // Create reward redemption record
    const { error: redemptionError } = await supabase
      .from('reward_redemptions')
      .insert({
        customer_id: customer.id,
        reward_id: reward.id,
        points_used: reward.points_required,
        status: 'pending',
      })

    if (redemptionError) throw redemptionError

    // TODO: Send notification to customer and staff

    return NextResponse.json({
      success: true,
      newBalance: newPoints
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to redeem reward' },
      { status: 500 }
    )
  }
}
