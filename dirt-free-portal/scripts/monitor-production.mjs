#!/usr/bin/env node

/**
 * Production Monitoring Script
 *
 * Monitors production health, recent activity, and key metrics for the
 * Dirt Free Carpet Customer Portal. Designed for manual checks during
 * launch day or automated monitoring via cron.
 *
 * Usage:
 *   npm run monitor
 *
 * Continuous monitoring:
 *   watch -n 300 npm run monitor  (every 5 minutes)
 *
 * Cron job (every 15 minutes):
 *   */15 * * * * cd /path/to/project && npm run monitor >> /var/log/portal-monitor.log 2>&1
 *
 * Exit Codes:
 *   0 - System healthy (all checks passed)
 *   1 - Issues detected (requires attention)
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })

// Configuration
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3009'
const MONITORING_WINDOW_MINUTES = 15 // Look back 15 minutes for recent activity

// Thresholds for alerts
const THRESHOLDS = {
  errorRate: 0.05,           // 5% error rate triggers warning
  responseTime: 500,         // 500ms average response time warning
  failedPayments: 0.10,      // 10% failed payment rate warning
  healthCheckTimeout: 5000,  // 5 second timeout for health check
}

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function success(message) {
  log(`✅ ${message}`, colors.green)
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

function error(message) {
  log(`❌ ${message}`, colors.red)
}

function info(message) {
  log(`ℹ️  ${message}`, colors.cyan)
}

function header(message) {
  log(`\n${message}`, colors.bright)
  log('='.repeat(70), colors.gray)
}

function formatNumber(num) {
  return num.toLocaleString()
}

function formatPercent(num) {
  return `${(num * 100).toFixed(1)}%`
}

// Track overall health
let hasIssues = false
let hasWarnings = false

/**
 * Check health endpoint
 */
async function checkHealthEndpoint() {
  header('HEALTH CHECK')

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), THRESHOLDS.healthCheckTimeout)

    const startTime = Date.now()
    const response = await fetch(`${APP_URL}/api/health`, {
      signal: controller.signal,
    })
    const duration = Date.now() - startTime
    clearTimeout(timeout)

    const data = await response.json()

    if (response.ok && data.status === 'healthy') {
      success(`Health endpoint: ${data.status}`)
      info(`Response time: ${duration}ms`)

      if (data.checks?.database?.status === 'ok') {
        success(`Database: Connected (${data.checks.database.duration}ms)`)
      } else {
        error('Database: Connection failed')
        hasIssues = true
      }

      if (duration > THRESHOLDS.responseTime) {
        warning(`Response time high: ${duration}ms (threshold: ${THRESHOLDS.responseTime}ms)`)
        hasWarnings = true
      }

      return true
    } else {
      error(`Health check failed: ${data.status || 'Unknown error'}`)
      hasIssues = true
      return false
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      error(`Health check timeout (> ${THRESHOLDS.healthCheckTimeout}ms)`)
    } else {
      error(`Health check error: ${err.message}`)
    }
    hasIssues = true
    return false
  }
}

/**
 * Check database connectivity and recent errors
 */
async function checkDatabase() {
  header('DATABASE STATUS')

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      error('Supabase credentials not configured')
      hasIssues = true
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Test basic connectivity
    const { data: testData, error: testError } = await supabase
      .from('customers')
      .select('id')
      .limit(1)

    if (testError) {
      error(`Database connection failed: ${testError.message}`)
      hasIssues = true
      return
    }

    success('Database: Connected and accessible')

    // Check for recent errors in audit logs
    const cutoffTime = new Date(Date.now() - MONITORING_WINDOW_MINUTES * 60 * 1000).toISOString()

    const { data: errorLogs, error: errorQueryError } = await supabase
      .from('audit_logs')
      .select('action, status, created_at')
      .eq('status', 'failure')
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false })
      .limit(10)

    if (errorQueryError) {
      warning(`Could not query audit logs: ${errorQueryError.message}`)
      hasWarnings = true
    } else if (errorLogs && errorLogs.length > 0) {
      warning(`Recent failures: ${errorLogs.length} failed actions in last ${MONITORING_WINDOW_MINUTES} minutes`)
      errorLogs.slice(0, 5).forEach((log) => {
        const time = new Date(log.created_at).toLocaleTimeString()
        info(`  ${time} - ${log.action}`)
      })
      hasWarnings = true
    } else {
      success(`No recent failures (last ${MONITORING_WINDOW_MINUTES} minutes)`)
    }

  } catch (err) {
    error(`Database check error: ${err.message}`)
    hasIssues = true
  }
}

/**
 * Check recent customer registrations
 */
async function checkRegistrations() {
  header('CUSTOMER REGISTRATIONS')

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      warning('Skipping - Supabase credentials not configured')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const cutoffTime = new Date(Date.now() - MONITORING_WINDOW_MINUTES * 60 * 1000).toISOString()

    // Recent registrations
    const { count: recentCount, error: recentError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', cutoffTime)

    if (recentError) {
      warning(`Could not query registrations: ${recentError.message}`)
      hasWarnings = true
      return
    }

    // Total customers
    const { count: totalCount, error: totalError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      warning(`Could not query total customers: ${totalError.message}`)
    }

    if (recentCount > 0) {
      success(`Recent registrations: ${recentCount} new customers (last ${MONITORING_WINDOW_MINUTES} min)`)
    } else {
      info(`No new registrations in last ${MONITORING_WINDOW_MINUTES} minutes`)
    }

    if (totalCount !== null) {
      info(`Total customers: ${formatNumber(totalCount)}`)
    }

  } catch (err) {
    error(`Registration check error: ${err.message}`)
    hasIssues = true
  }
}

/**
 * Check active portal sessions
 */
async function checkActiveSessions() {
  header('ACTIVE USERS')

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      warning('Skipping - Supabase credentials not configured')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const cutoffTime = new Date(Date.now() - MONITORING_WINDOW_MINUTES * 60 * 1000).toISOString()

    // Recent logins
    const { data: recentSessions, error: sessionError } = await supabase
      .from('portal_sessions')
      .select('customer_id')
      .gte('login_at', cutoffTime)

    if (sessionError) {
      warning(`Could not query sessions: ${sessionError.message}`)
      hasWarnings = true
      return
    }

    const uniqueUsers = recentSessions
      ? new Set(recentSessions.map((s) => s.customer_id)).size
      : 0

    if (uniqueUsers > 0) {
      success(`Active users: ${uniqueUsers} unique logins (last ${MONITORING_WINDOW_MINUTES} min)`)
    } else {
      info(`No logins in last ${MONITORING_WINDOW_MINUTES} minutes`)
    }

    // Today's activity
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: todaySessions } = await supabase
      .from('portal_sessions')
      .select('customer_id')
      .gte('login_at', todayStart.toISOString())

    const todayUniqueUsers = todaySessions
      ? new Set(todaySessions.map((s) => s.customer_id)).size
      : 0

    if (todayUniqueUsers > 0) {
      info(`Today's active users: ${todayUniqueUsers}`)
    }

  } catch (err) {
    error(`Session check error: ${err.message}`)
    hasIssues = true
  }
}

/**
 * Check recent bookings
 */
async function checkBookings() {
  header('APPOINTMENT BOOKINGS')

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      warning('Skipping - Supabase credentials not configured')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const cutoffTime = new Date(Date.now() - MONITORING_WINDOW_MINUTES * 60 * 1000).toISOString()

    // Recent bookings
    const { count: recentBookings, error: bookingError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', cutoffTime)

    if (bookingError) {
      warning(`Could not query bookings: ${bookingError.message}`)
      hasWarnings = true
      return
    }

    // Online bookings (via portal)
    const { count: onlineBookings, error: onlineError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', cutoffTime)
      .eq('booked_via_portal', true)

    if (onlineError) {
      warning(`Could not query online bookings: ${onlineError.message}`)
    }

    if (recentBookings > 0) {
      success(`Recent bookings: ${recentBookings} total (${onlineBookings || 0} via portal)`)
    } else {
      info(`No new bookings in last ${MONITORING_WINDOW_MINUTES} minutes`)
    }

    // Today's bookings
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { count: todayBookings } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())

    const { count: todayOnlineBookings } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())
      .eq('booked_via_portal', true)

    if (todayBookings > 0) {
      const onlinePercent = todayOnlineBookings && todayBookings
        ? ((todayOnlineBookings / todayBookings) * 100).toFixed(1)
        : '0.0'
      info(`Today's bookings: ${todayBookings} total (${todayOnlineBookings || 0} via portal, ${onlinePercent}%)`)
    }

  } catch (err) {
    error(`Booking check error: ${err.message}`)
    hasIssues = true
  }
}

/**
 * Check recent payments
 */
async function checkPayments() {
  header('PAYMENTS')

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      warning('Skipping - Supabase credentials not configured')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const cutoffTime = new Date(Date.now() - MONITORING_WINDOW_MINUTES * 60 * 1000).toISOString()

    // Recent payments (successful)
    const { count: successfulPayments, error: successError } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'paid')
      .gte('paid_date', cutoffTime)

    if (successError) {
      warning(`Could not query payments: ${successError.message}`)
      hasWarnings = true
      return
    }

    // Check for failed payment attempts in audit logs
    const { data: failedPayments, error: failedError } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('action', 'payment_failed')
      .gte('created_at', cutoffTime)

    const failedCount = failedPayments?.length || 0

    if (successfulPayments > 0 || failedCount > 0) {
      const total = successfulPayments + failedCount
      const failureRate = total > 0 ? failedCount / total : 0

      if (failureRate > THRESHOLDS.failedPayments) {
        warning(
          `Payments: ${successfulPayments} successful, ${failedCount} failed (${formatPercent(failureRate)} failure rate)`
        )
        hasWarnings = true
      } else {
        success(`Payments: ${successfulPayments} successful, ${failedCount} failed`)
      }
    } else {
      info(`No payment activity in last ${MONITORING_WINDOW_MINUTES} minutes`)
    }

    // Today's payments
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { count: todayPayments } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'paid')
      .gte('paid_date', todayStart.toISOString())

    if (todayPayments > 0) {
      info(`Today's payments: ${todayPayments}`)
    }

  } catch (err) {
    error(`Payment check error: ${err.message}`)
    hasIssues = true
  }
}

/**
 * Display summary
 */
function displaySummary() {
  header('MONITORING SUMMARY')

  const timestamp = new Date().toLocaleString()
  info(`Monitoring completed at: ${timestamp}`)
  info(`Monitoring window: Last ${MONITORING_WINDOW_MINUTES} minutes`)

  console.log('')

  if (hasIssues) {
    error('CRITICAL ISSUES DETECTED')
    error('Action required: Review error messages above and investigate immediately')
    console.log('')
  } else if (hasWarnings) {
    warning('WARNINGS DETECTED')
    warning('Action recommended: Review warnings above and monitor closely')
    console.log('')
  } else {
    success('ALL SYSTEMS OPERATIONAL')
    success('No issues detected - system is healthy')
    console.log('')
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('')
  log('🔍 PRODUCTION MONITORING - DIRT FREE CUSTOMER PORTAL', colors.bright + colors.cyan)
  log('='.repeat(70), colors.gray)
  log(`Started: ${new Date().toLocaleString()}`, colors.gray)
  console.log('')

  // Run all checks
  await checkHealthEndpoint()
  await checkDatabase()
  await checkRegistrations()
  await checkActiveSessions()
  await checkBookings()
  await checkPayments()

  // Display summary
  displaySummary()

  // Exit with appropriate code
  if (hasIssues) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}

// Run monitoring
main().catch((error) => {
  console.error('')
  console.error('❌ FATAL ERROR during monitoring:')
  console.error(error)
  console.error('')
  process.exit(1)
})
