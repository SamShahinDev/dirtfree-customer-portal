import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
