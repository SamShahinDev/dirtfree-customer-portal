import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import { emailTemplates } from '@/lib/email/templates'
import { format } from 'date-fns'
import Stripe from 'stripe'
import { logger } from '@/lib/logger'
import { logPaymentAudit } from '@/lib/audit'

// Vercel serverless function configuration
// Allow longer execution time for webhook processing
export const maxDuration = 30 // 30 seconds (Stripe webhooks can be slow)

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
    logger.error('Webhook signature verification failed', error, {
      endpoint: '/api/webhooks/stripe',
    })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { invoiceId, customerId } = paymentIntent.metadata

        // Fetch customer and invoice data for emails
        const { data: customer } = await supabase
          .from('customers')
          .select('name, email')
          .eq('id', customerId)
          .single()

        const { data: invoice } = await supabase
          .from('invoices')
          .select('invoice_number, total, job_id, jobs(services)')
          .eq('id', invoiceId)
          .single()

        // Update invoice status
        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_date: new Date().toISOString(),
            stripe_payment_intent_id: paymentIntent.id,
          })
          .eq('id', invoiceId)

        if (updateError) {
          logger.error('Failed to update invoice after payment', updateError, {
            paymentIntentId: paymentIntent.id,
            invoiceId,
            customerId,
          })
          // Payment succeeded in Stripe but invoice not updated - requires manual reconciliation
        }

        // Send payment receipt email
        if (customer && invoice) {
          const services = invoice.jobs?.services || []
          const emailData = emailTemplates.paymentReceipt({
            customerName: customer.name,
            invoiceNumber: invoice.invoice_number,
            amount: paymentIntent.amount / 100,
            paymentDate: format(new Date(), 'MMM d, yyyy'),
            services: services,
          })

          await sendEmail({
            to: customer.email,
            subject: emailData.subject,
            html: emailData.html,
          })
        }

        // Award loyalty points (10 points per dollar)
        const pointsToAward = Math.floor(paymentIntent.amount / 100) * 10

        // Get current points
        const { data: loyalty } = await supabase
          .from('loyalty_points')
          .select('points, total_earned')
          .eq('customer_id', customerId)
          .single()

        if (loyalty) {
          const newTotalPoints = loyalty.points + pointsToAward
          const rewardValue = newTotalPoints * 0.1 // $0.10 per point

          // Update points
          await supabase
            .from('loyalty_points')
            .update({
              points: newTotalPoints,
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

          // Audit log: payment completed successfully
          await logPaymentAudit({
            userId: customerId,
            action: 'payment_completed',
            paymentIntentId: paymentIntent.id,
            invoiceId,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            request,
            status: 'success',
          })

          logger.info('Payment completed successfully', {
            paymentIntentId: paymentIntent.id,
            customerId,
            invoiceId,
            amount: paymentIntent.amount / 100,
            pointsAwarded: pointsToAward,
          })

          // Send loyalty points email
          if (customer) {
            const emailData = emailTemplates.loyaltyPointsEarned({
              customerName: customer.name,
              pointsEarned: pointsToAward,
              totalPoints: newTotalPoints,
              rewardValue: rewardValue,
            })

            await sendEmail({
              to: customer.email,
              subject: emailData.subject,
              html: emailData.html,
            })
          }
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { customerId, invoiceId } = paymentIntent.metadata

        logger.error('Payment failed', undefined, {
          paymentIntentId: paymentIntent.id,
          customerId,
          invoiceId,
          lastPaymentError: paymentIntent.last_payment_error,
        })

        // Audit log: payment failed
        await logPaymentAudit({
          userId: customerId,
          action: 'payment_failed',
          paymentIntentId: paymentIntent.id,
          invoiceId,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          request,
          status: 'failure',
        })

        // TODO: Send notification to customer
        break
      }

      default:
        logger.debug('Unhandled webhook event type', {
          eventType: event.type,
          eventId: event.id,
        })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    logger.error('Webhook handler error', error, {
      endpoint: '/api/webhooks/stripe',
      eventType: event?.type,
    })
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
