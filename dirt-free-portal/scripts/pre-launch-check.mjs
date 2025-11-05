#!/usr/bin/env node

/**
 * Pre-Launch Check Script
 *
 * Validates all system requirements before deploying to production.
 * Checks environment variables, database connectivity, external services,
 * and system configuration.
 *
 * Usage: npm run pre-launch
 *
 * Exit Codes:
 * - 0: All checks passed (ready to deploy)
 * - 1: Critical checks failed (do not deploy)
 */

import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })

// Track results
const results = []

// Helper to add result
function addResult(name, status, message) {
  results.push({ name, status, message })
}

// 1. CHECK ENVIRONMENT VARIABLES
async function checkEnvironmentVariables() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'RESEND_API_KEY',
    'NEXT_PUBLIC_APP_URL',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length === 0) {
    addResult('Environment Variables', 'pass', `All ${required.length} required variables are set`)
  } else {
    addResult('Environment Variables', 'fail', `Missing: ${missing.join(', ')}`)
  }
}

// 2. CHECK DATABASE CONNECTION
async function checkDatabaseConnection() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      addResult('Database Connection', 'fail', 'Supabase credentials not configured')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data, error } = await supabase
      .from('customers')
      .select('id')
      .limit(1)

    if (error) throw error

    addResult('Database Connection', 'pass', 'Successfully connected to Supabase')
  } catch (error) {
    addResult('Database Connection', 'fail', error.message)
  }
}

// 3. CHECK DATABASE TABLES
async function checkDatabaseTables() {
  const tables = [
    'customers',
    'jobs',
    'invoices',
    'services',
    'job_services',
    'loyalty_points',
    'loyalty_transactions',
    'rewards',
    'reward_redemptions',
    'messages',
    'notifications',
  ]

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      addResult('Database Tables', 'fail', 'Supabase credentials not configured')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error) {
        throw new Error(`Table "${table}" not found or inaccessible: ${error.message}`)
      }
    }

    addResult('Database Tables', 'pass', `All ${tables.length} required tables exist and are accessible`)
  } catch (error) {
    addResult('Database Tables', 'fail', error.message)
  }
}

// 4. CHECK STORAGE BUCKETS
async function checkStorageBuckets() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      addResult('Storage Buckets', 'fail', 'Supabase credentials not configured')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data, error } = await supabase.storage.listBuckets()

    if (error) throw error

    const required = ['customer-documents', 'message-attachments']
    const existing = data.map(b => b.name)
    const missing = required.filter(b => !existing.includes(b))

    if (missing.length === 0) {
      addResult('Storage Buckets', 'pass', `All ${required.length} storage buckets configured`)
    } else {
      addResult('Storage Buckets', 'fail', `Missing buckets: ${missing.join(', ')}`)
    }
  } catch (error) {
    addResult('Storage Buckets', 'fail', error.message)
  }
}

// 5. CHECK STRIPE CONNECTION
async function checkStripeConnection() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY

    if (!stripeKey) {
      addResult('Stripe Connection', 'fail', 'Stripe secret key not configured')
      return
    }

    const stripe = new Stripe(stripeKey)
    await stripe.customers.list({ limit: 1 })

    addResult('Stripe Connection', 'pass', 'Successfully connected to Stripe')
  } catch (error) {
    addResult('Stripe Connection', 'fail', error.message)
  }
}

// 6. CHECK STRIPE WEBHOOK
async function checkStripeWebhook() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!stripeKey) {
      addResult('Stripe Webhook', 'warn', 'Stripe secret key not configured - skipping webhook check')
      return
    }

    if (!appUrl) {
      addResult('Stripe Webhook', 'warn', 'APP_URL not configured - cannot verify webhook endpoint')
      return
    }

    const stripe = new Stripe(stripeKey)
    const webhooks = await stripe.webhookEndpoints.list()

    const portalWebhook = webhooks.data.find(wh =>
      wh.url.includes('/api/webhooks/stripe') && wh.url.includes(appUrl)
    )

    if (portalWebhook && portalWebhook.status === 'enabled') {
      addResult('Stripe Webhook', 'pass', `Webhook endpoint configured and enabled at ${portalWebhook.url}`)
    } else {
      addResult('Stripe Webhook', 'warn', 'Webhook endpoint not found or disabled - payments may not work correctly')
    }
  } catch (error) {
    addResult('Stripe Webhook', 'warn', `Could not verify webhook: ${error.message}`)
  }
}

// 7. CHECK RESEND API (OPTIONAL)
async function checkResendAPI() {
  try {
    const resendKey = process.env.RESEND_API_KEY

    if (!resendKey) {
      addResult('Email Service (Resend)', 'warn', 'Resend API key not configured - email notifications will not work')
      return
    }

    // Simple validation - check if key has correct format
    if (!resendKey.startsWith('re_')) {
      addResult('Email Service (Resend)', 'warn', 'Resend API key format appears invalid (should start with "re_")')
      return
    }

    addResult('Email Service (Resend)', 'pass', 'Resend API key configured (format valid)')
  } catch (error) {
    addResult('Email Service (Resend)', 'warn', error.message)
  }
}

// MAIN EXECUTION
async function runAllChecks() {
  console.log('🚀 Running pre-launch checks...\n')
  console.log('This will verify all system requirements before deployment.\n')
  console.log('='.repeat(70))
  console.log('\n')

  // Run all checks
  await checkEnvironmentVariables()
  await checkDatabaseConnection()
  await checkDatabaseTables()
  await checkStorageBuckets()
  await checkStripeConnection()
  await checkStripeWebhook()
  await checkResendAPI()

  // Display results
  console.log('📊 RESULTS:\n')

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️ ' : '❌'
    const label = result.name.padEnd(30)
    console.log(`${icon} ${label} ${result.message}`)
  })

  // Summary
  const passed = results.filter(r => r.status === 'pass').length
  const warned = results.filter(r => r.status === 'warn').length
  const failed = results.filter(r => r.status === 'fail').length
  const total = results.length

  console.log('\n' + '='.repeat(70))
  console.log(`\n📈 SUMMARY: ${passed}/${total} passed, ${warned} warnings, ${failed} failed\n`)

  // Determine exit status
  if (failed > 0) {
    console.error('❌ PRE-LAUNCH CHECKS FAILED!')
    console.error('   Fix the issues above before deploying to production.')
    console.error('   Deployment is NOT recommended.\n')
    process.exit(1)
  } else if (warned > 0) {
    console.warn('⚠️  PRE-LAUNCH CHECKS PASSED WITH WARNINGS')
    console.warn('   Review warnings above before deploying.')
    console.warn('   Some features may not work correctly.\n')
    process.exit(0)
  } else {
    console.log('✅ ALL PRE-LAUNCH CHECKS PASSED!')
    console.log('   System is ready for production deployment.\n')
    process.exit(0)
  }
}

// Run checks
runAllChecks().catch(error => {
  console.error('\n❌ Fatal error during pre-launch checks:', error.message)
  process.exit(1)
})
