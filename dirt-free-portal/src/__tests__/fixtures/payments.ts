// Test fixtures for payment data
import Stripe from 'stripe'

export const mockPaymentIntent: Stripe.PaymentIntent = {
  id: 'pi_test_123456789',
  object: 'payment_intent',
  amount: 25000,
  amount_capturable: 0,
  amount_details: { tip: {} },
  amount_received: 0,
  application: null,
  application_fee_amount: null,
  automatic_payment_methods: null,
  canceled_at: null,
  cancellation_reason: null,
  capture_method: 'automatic',
  client_secret: 'pi_test_123456789_secret_test',
  confirmation_method: 'automatic',
  created: 1704067200,
  currency: 'usd',
  customer: null,
  description: 'Invoice #550e8400 - Dirt Free Carpet',
  invoice: null,
  last_payment_error: null,
  latest_charge: null,
  livemode: false,
  metadata: {
    invoiceId: '550e8400-e29b-41d4-a716-446655440000',
    customerId: 'cust-123',
  },
  next_action: null,
  on_behalf_of: null,
  payment_method: null,
  payment_method_configuration_details: null,
  payment_method_options: null,
  payment_method_types: ['card'],
  processing: null,
  receipt_email: 'test@example.com',
  review: null,
  setup_future_usage: null,
  shipping: null,
  source: null,
  statement_descriptor: null,
  statement_descriptor_suffix: null,
  status: 'requires_payment_method',
  transfer_data: null,
  transfer_group: null,
}

export const mockSuccessfulPaymentIntent: Stripe.PaymentIntent = {
  ...mockPaymentIntent,
  id: 'pi_test_succeeded',
  status: 'succeeded',
  amount_received: 25000,
}

export const mockFailedPaymentIntent: Stripe.PaymentIntent = {
  ...mockPaymentIntent,
  id: 'pi_test_failed',
  status: 'requires_payment_method',
  last_payment_error: {
    type: 'card_error',
    charge: 'ch_test',
    code: 'card_declined',
    decline_code: 'generic_decline',
    message: 'Your card was declined.',
    param: null,
  },
}

export const mockWebhookEvent = (
  type: string,
  data: any
): Stripe.Event => ({
  id: 'evt_test_123',
  object: 'event',
  api_version: '2023-10-16',
  created: 1704067200,
  data: { object: data },
  livemode: false,
  pending_webhooks: 0,
  request: { id: 'req_test', idempotency_key: null },
  type: type as Stripe.Event.Type,
})

export const mockPaymentIntentSucceededEvent = mockWebhookEvent(
  'payment_intent.succeeded',
  mockSuccessfulPaymentIntent
)

export const mockPaymentIntentFailedEvent = mockWebhookEvent(
  'payment_intent.payment_failed',
  mockFailedPaymentIntent
)
