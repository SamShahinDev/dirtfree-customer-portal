/**
 * Audit Logging System
 *
 * Tracks sensitive operations and user actions for compliance and security.
 * Creates an immutable audit trail of all critical business operations.
 *
 * Features:
 * - Automatic IP address and user agent capture
 * - Structured logging integration
 * - Database persistence
 * - Type-safe action definitions
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * Audit log entry status
 */
export type AuditStatus = 'success' | 'failure' | 'pending'

/**
 * Resource types that can be audited
 */
export type AuditResourceType =
  | 'invoice'
  | 'payment'
  | 'payment_method'
  | 'reward'
  | 'appointment'
  | 'message'
  | 'document'
  | 'customer'
  | 'session'

/**
 * Standard audit actions
 */
export type AuditAction =
  // Payment actions
  | 'payment_intent_created'
  | 'payment_completed'
  | 'payment_failed'
  | 'refund_issued'
  // Invoice actions
  | 'invoice_viewed'
  | 'invoice_downloaded'
  | 'invoice_paid'
  | 'invoice_updated'
  // Account actions
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'password_changed'
  | 'email_changed'
  | 'profile_updated'
  // Payment method actions
  | 'payment_method_added'
  | 'payment_method_removed'
  | 'payment_method_set_default'
  // Reward actions
  | 'reward_redeemed'
  | 'reward_cancelled'
  | 'loyalty_points_earned'
  | 'loyalty_points_spent'
  // Booking actions
  | 'appointment_booked'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  // Message actions
  | 'message_sent'
  | 'message_viewed'
  | 'message_reply_sent'
  // Document actions
  | 'document_uploaded'
  | 'document_downloaded'
  | 'document_viewed'
  | 'document_deleted'
  // Custom actions
  | string

/**
 * Parameters for creating an audit log entry
 */
export interface AuditLogParams {
  /** Customer ID who performed the action (optional for system actions) */
  userId?: string

  /** Action performed */
  action: AuditAction

  /** Type of resource affected */
  resourceType?: AuditResourceType

  /** ID of the affected resource */
  resourceId?: string

  /** Additional context as JSON */
  details?: Record<string, any>

  /** HTTP Request object to extract IP and User-Agent */
  request?: Request

  /** Status of the action (default: 'success') */
  status?: AuditStatus
}

/**
 * Extract IP address from request headers
 */
function getIpAddress(request?: Request): string | null {
  if (!request) return null

  // Try common headers for IP address (in order of priority)
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
  ]

  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(',')[0].trim()
    }
  }

  return null
}

/**
 * Extract user agent from request headers
 */
function getUserAgent(request?: Request): string | null {
  if (!request) return null
  return request.headers.get('user-agent')
}

/**
 * Log an audit entry to the database
 *
 * @example
 * ```typescript
 * await logAudit({
 *   userId: customer.id,
 *   action: 'payment_completed',
 *   resourceType: 'invoice',
 *   resourceId: invoiceId,
 *   details: {
 *     amount: 185.00,
 *     currency: 'usd',
 *     method: 'card'
 *   },
 *   request
 * })
 * ```
 */
export async function logAudit({
  userId,
  action,
  resourceType,
  resourceId,
  details,
  request,
  status = 'success',
}: AuditLogParams): Promise<void> {
  try {
    const supabase = await createClient()

    const ipAddress = getIpAddress(request)
    const userAgent = getUserAgent(request)

    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId || null,
      action,
      resource_type: resourceType || null,
      resource_id: resourceId || null,
      details: details || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      status,
    })

    if (error) {
      // Log error but don't throw - audit logging should never break the main flow
      logger.error('Failed to create audit log', error, {
        action,
        userId,
        resourceType,
        resourceId,
      })
    } else {
      // Log successful audit log creation (only in debug mode)
      logger.debug('Audit log created', {
        action,
        userId,
        resourceType,
        resourceId,
        status,
      })
    }
  } catch (error) {
    // Catch any unexpected errors and log them
    logger.error('Unexpected error creating audit log', error as Error, {
      action,
      userId,
    })
  }
}

/**
 * Helper functions for common audit scenarios
 */

/**
 * Log a payment-related action
 */
export async function logPaymentAudit({
  userId,
  action,
  paymentIntentId,
  invoiceId,
  amount,
  currency = 'usd',
  request,
  status = 'success',
}: {
  userId: string
  action: Extract<AuditAction, 'payment_intent_created' | 'payment_completed' | 'payment_failed' | 'refund_issued'>
  paymentIntentId?: string
  invoiceId?: string
  amount?: number
  currency?: string
  request?: Request
  status?: AuditStatus
}): Promise<void> {
  await logAudit({
    userId,
    action,
    resourceType: 'payment',
    resourceId: paymentIntentId,
    details: {
      payment_intent_id: paymentIntentId,
      invoice_id: invoiceId,
      amount,
      currency,
    },
    request,
    status,
  })
}

/**
 * Log an authentication-related action
 */
export async function logAuthAudit({
  userId,
  action,
  email,
  request,
  status = 'success',
}: {
  userId?: string
  action: Extract<AuditAction, 'login_success' | 'login_failed' | 'logout' | 'password_changed' | 'email_changed'>
  email?: string
  request?: Request
  status?: AuditStatus
}): Promise<void> {
  await logAudit({
    userId,
    action,
    resourceType: 'session',
    details: {
      email,
    },
    request,
    status,
  })
}

/**
 * Log a reward-related action
 */
export async function logRewardAudit({
  userId,
  action,
  rewardId,
  points,
  rewardName,
  request,
  status = 'success',
}: {
  userId: string
  action: Extract<AuditAction, 'reward_redeemed' | 'reward_cancelled' | 'loyalty_points_earned' | 'loyalty_points_spent'>
  rewardId?: string
  points?: number
  rewardName?: string
  request?: Request
  status?: AuditStatus
}): Promise<void> {
  await logAudit({
    userId,
    action,
    resourceType: 'reward',
    resourceId: rewardId,
    details: {
      points,
      reward_name: rewardName,
    },
    request,
    status,
  })
}

/**
 * Log a document-related action
 */
export async function logDocumentAudit({
  userId,
  action,
  documentId,
  documentType,
  fileName,
  request,
  status = 'success',
}: {
  userId: string
  action: Extract<AuditAction, 'document_uploaded' | 'document_downloaded' | 'document_viewed' | 'document_deleted'>
  documentId?: string
  documentType?: string
  fileName?: string
  request?: Request
  status?: AuditStatus
}): Promise<void> {
  await logAudit({
    userId,
    action,
    resourceType: 'document',
    resourceId: documentId,
    details: {
      document_type: documentType,
      file_name: fileName,
    },
    request,
    status,
  })
}

/**
 * Log an invoice-related action
 */
export async function logInvoiceAudit({
  userId,
  action,
  invoiceId,
  amount,
  request,
  status = 'success',
}: {
  userId: string
  action: Extract<AuditAction, 'invoice_viewed' | 'invoice_downloaded' | 'invoice_paid' | 'invoice_updated'>
  invoiceId: string
  amount?: number
  request?: Request
  status?: AuditStatus
}): Promise<void> {
  await logAudit({
    userId,
    action,
    resourceType: 'invoice',
    resourceId: invoiceId,
    details: {
      amount,
    },
    request,
    status,
  })
}
