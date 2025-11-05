import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, paymentIntentId } = await request.json()

    if (!invoiceId || !paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify payment intent was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      )
    }

    // Update invoice status in database
    const supabase = await createClient()
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntentId,
      })
      .eq('id', invoiceId)

    if (updateError) {
      console.error('Error updating invoice:', updateError)
      return NextResponse.json(
        { error: 'Failed to update invoice' },
        { status: 500 }
      )
    }

    // Get customer info to add loyalty points
    const { data: invoice } = await supabase
      .from('invoices')
      .select('customer_id, amount')
      .eq('id', invoiceId)
      .single()

    if (invoice) {
      // Award loyalty points (1 point per dollar spent)
      const pointsToAdd = Math.floor(invoice.amount)

      const { data: customer } = await supabase
        .from('customers')
        .select('loyalty_points')
        .eq('id', invoice.customer_id)
        .single()

      if (customer) {
        await supabase
          .from('customers')
          .update({
            loyalty_points: (customer.loyalty_points || 0) + pointsToAdd,
          })
          .eq('id', invoice.customer_id)

        // Record loyalty transaction
        await supabase
          .from('loyalty_transactions')
          .insert({
            customer_id: invoice.customer_id,
            points: pointsToAdd,
            type: 'earn',
            description: `Invoice payment #${invoiceId.slice(0, 8)}`,
          })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed and invoice updated',
      invoice: invoice,
    })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
