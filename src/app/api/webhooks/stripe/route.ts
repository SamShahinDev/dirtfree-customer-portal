import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { invoiceId, customerId } = paymentIntent.metadata

        // Update invoice status
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_date: new Date().toISOString(),
          })
          .eq('id', invoiceId)

        // Award loyalty points (10 points per dollar)
        const pointsToAward = Math.floor(paymentIntent.amount / 100) * 10

        // Get current points
        const { data: loyalty } = await supabase
          .from('loyalty_points')
          .select('points, total_earned')
          .eq('customer_id', customerId)
          .single()

        if (loyalty) {
          // Update points
          await supabase
            .from('loyalty_points')
            .update({
              points: loyalty.points + pointsToAward,
              total_earned: loyalty.total_earned + pointsToAward,
              updated_at: new Date().toISOString(),
            })
            .eq('customer_id', customerId)

          // Create transaction record
          await supabase
            .from('loyalty_transactions')
            .insert({
              customer_id: customerId,
              points: pointsToAward,
              type: 'earned',
              description: `Payment received - Invoice #${invoiceId.slice(0, 8)}`,
            })
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        // TODO: Send notification to customer
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
