import { z } from 'zod'

/**
 * Environment Variable Validation
 *
 * This file validates environment variables with separate schemas for:
 * - Client-side (NEXT_PUBLIC_*) - available in browser
 * - Server-side - only available on server
 *
 * Import this file in next.config.ts for build-time validation.
 *
 * Benefits:
 * - Type-safe environment variables
 * - Build-time validation (fail-fast)
 * - Format validation (URLs, key prefixes)
 * - Better error messages
 * - Auto-complete in IDE
 */

// Client-side environment variables (NEXT_PUBLIC_*)
// These are safe to use in browser code
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_').optional(),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NEXT_PUBLIC_WEBSITE_URL: z.string().url('NEXT_PUBLIC_WEBSITE_URL must be a valid URL'),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.union([
    z.string().url('NEXT_PUBLIC_SENTRY_DSN must be a valid URL'),
    z.literal(''),
    z.undefined()
  ]).optional(),
})

// Server-side environment variables
// These are NEVER sent to the browser
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_').optional(),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required').optional(),
})

// Combined schema for build-time validation
const envSchema = clientEnvSchema.merge(serverEnvSchema)

/**
 * Validated client environment variables (safe for browser)
 *
 * Usage in client components:
 * import { clientEnv } from '@/lib/env'
 * const url = clientEnv.NEXT_PUBLIC_APP_URL
 */
export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
})

/**
 * Validated server environment variables (server-side only)
 *
 * Usage in API routes and server components:
 * import { serverEnv } from '@/lib/env'
 * const apiKey = serverEnv.STRIPE_SECRET_KEY
 */
export const serverEnv = typeof window === 'undefined'
  ? serverEnvSchema.parse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
    })
  : ({} as z.infer<typeof serverEnvSchema>)

/**
 * Combined environment variables (for build-time validation only)
 * Use clientEnv or serverEnv in actual code
 */
export const env = typeof window === 'undefined'
  ? envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
      NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
    })
  : clientEnv

/**
 * Type for environment variables
 */
export type Env = z.infer<typeof envSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>
export type ServerEnv = z.infer<typeof serverEnvSchema>
