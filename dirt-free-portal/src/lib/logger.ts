/**
 * Structured Logging System
 *
 * Provides consistent, structured logging across the application with:
 * - Log levels (info, warn, error, debug)
 * - Development-friendly console output
 * - Production JSON formatting
 * - Context/metadata support
 * - Sentry integration for errors
 * - Request ID tracking
 */

import * as Sentry from '@sentry/nextjs'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  userId?: string
  requestId?: string
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isTest = process.env.NODE_ENV === 'test'

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Development: Human-readable format with colors
      const timestamp = new Date(entry.timestamp).toLocaleTimeString()
      const level = entry.level.toUpperCase().padEnd(5)
      const contextStr = entry.context
        ? `\n${JSON.stringify(entry.context, null, 2)}`
        : ''
      const errorStr = entry.error
        ? `\n${entry.error.name}: ${entry.error.message}\n${entry.error.stack}`
        : ''
      const userStr = entry.userId ? ` [User: ${entry.userId}]` : ''
      const requestStr = entry.requestId ? ` [Req: ${entry.requestId}]` : ''

      return `[${timestamp}] ${level}${userStr}${requestStr} - ${entry.message}${contextStr}${errorStr}`
    } else {
      // Production: Structured JSON for log aggregation services
      return JSON.stringify(entry)
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    // Skip debug logs in production
    if (level === 'debug' && !this.isDevelopment) {
      return
    }

    // Skip all logs in test environment unless explicitly enabled
    if (this.isTest && !process.env.ENABLE_TEST_LOGS) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }

    const formatted = this.formatLog(entry)

    // Output to console based on level
    switch (level) {
      case 'error':
        console.error(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'debug':
        console.debug(formatted)
        break
      default:
        console.log(formatted)
    }

    // Send errors to Sentry in production
    if (level === 'error' && !this.isDevelopment) {
      const error = context?.error || new Error(message)
      Sentry.captureException(error, {
        level: 'error',
        tags: {
          logger: 'structured',
        },
        extra: context,
      })
    }
  }

  /**
   * Log an informational message
   *
   * @example
   * logger.info('Payment intent created', {
   *   paymentIntentId: 'pi_123',
   *   amount: 185.00,
   *   currency: 'usd'
   * })
   */
  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context)
  }

  /**
   * Log a warning message
   *
   * @example
   * logger.warn('Invoice already paid, skipping', {
   *   invoiceId: 'inv_123',
   *   status: 'paid'
   * })
   */
  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context)
  }

  /**
   * Log an error message with optional Error object
   *
   * @example
   * logger.error('Failed to create payment intent', error, {
   *   endpoint: '/api/payments/create-intent',
   *   invoiceId: 'inv_123'
   * })
   */
  error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    const errorInfo = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : undefined

    this.log('error', message, {
      ...context,
      error: errorInfo,
    })
  }

  /**
   * Log a debug message (only in development)
   *
   * @example
   * logger.debug('Processing payment webhook', {
   *   eventType: 'payment_intent.succeeded',
   *   eventId: 'evt_123'
   * })
   */
  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context)
  }

  /**
   * Create a child logger with persistent context
   *
   * @example
   * const reqLogger = logger.child({
   *   requestId: 'req_123',
   *   userId: 'usr_456'
   * })
   * reqLogger.info('Payment processed') // Includes requestId and userId
   */
  child(persistentContext: Record<string, any>): ChildLogger {
    return new ChildLogger(this, persistentContext)
  }
}

/**
 * Child logger with persistent context
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private persistentContext: Record<string, any>
  ) {}

  private mergeContext(context?: Record<string, any>): Record<string, any> {
    return {
      ...this.persistentContext,
      ...context,
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.parent.info(message, this.mergeContext(context))
  }

  warn(message: string, context?: Record<string, any>) {
    this.parent.warn(message, this.mergeContext(context))
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    this.parent.error(message, error, this.mergeContext(context))
  }

  debug(message: string, context?: Record<string, any>) {
    this.parent.debug(message, this.mergeContext(context))
  }

  child(additionalContext: Record<string, any>): ChildLogger {
    return new ChildLogger(this.parent, {
      ...this.persistentContext,
      ...additionalContext,
    })
  }
}

/**
 * Singleton logger instance
 *
 * @example
 * import { logger } from '@/lib/logger'
 *
 * logger.info('Server started')
 * logger.error('Failed to connect', error, { endpoint: '/api/data' })
 */
export const logger = new Logger()

/**
 * Generate a unique request ID for tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
