import Stripe from 'stripe'
import { env } from '@/lib/env'

// Lazy initialize Stripe to avoid errors during build when API key is not available
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    })
  }
  return stripeInstance
}

// For backward compatibility, export as a getter property
export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    return getStripe()[prop as keyof Stripe]
  },
})
