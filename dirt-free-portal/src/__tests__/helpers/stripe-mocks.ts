// Mock utilities for Stripe API
import Stripe from 'stripe'
import { mockPaymentIntent } from '../fixtures/payments'

// Mock Stripe instance
export const createMockStripe = () => {
  return {
    paymentIntents: {
      create: jest.fn().mockResolvedValue(mockPaymentIntent),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
      confirm: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    paymentMethods: {
      attach: jest.fn(),
      detach: jest.fn(),
      list: jest.fn(),
    },
  } as unknown as Stripe
}

// Mock webhook signature verification
export const mockWebhookSignature = (event: Stripe.Event) => {
  const stripe = require('@/lib/stripe/server')
  stripe.stripe.webhooks.constructEvent = jest.fn().mockReturnValue(event)
}

// Mock webhook signature verification failure
export const mockWebhookSignatureFailure = (error: string = 'Invalid signature') => {
  const stripe = require('@/lib/stripe/server')
  stripe.stripe.webhooks.constructEvent = jest.fn().mockImplementation(() => {
    throw new Error(error)
  })
}

// Mock payment intent creation
export const mockPaymentIntentCreation = (paymentIntent: Stripe.PaymentIntent) => {
  const stripe = require('@/lib/stripe/server')
  stripe.stripe.paymentIntents.create = jest.fn().mockResolvedValue(paymentIntent)
}

// Mock payment intent creation failure
export const mockPaymentIntentCreationFailure = (error: string = 'Payment failed') => {
  const stripe = require('@/lib/stripe/server')
  stripe.stripe.paymentIntents.create = jest.fn().mockRejectedValue(new Error(error))
}
