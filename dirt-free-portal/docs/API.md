# Dirt Free Carpet - Customer Portal API Documentation

**Version:** 1.0
**Base URL:** `https://your-domain.com/api`
**Environment:** Production

---

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Error Responses](#error-responses)
4. [Endpoints](#endpoints)
   - [Payments](#payments)
   - [Invoices](#invoices)
   - [Appointments](#appointments)
   - [Rewards & Loyalty](#rewards--loyalty)
   - [Notifications](#notifications)
   - [Analytics](#analytics)
   - [Cache Management](#cache-management)
   - [Health Check](#health-check)
5. [Webhooks](#webhooks)
6. [Data Models](#data-models)

---

## Authentication

All API endpoints (except `/api/health` and `/api/webhooks/stripe`) require authentication using **Supabase JWT tokens**.

### Getting Authenticated

Clients must include a valid Supabase session in their requests. The API automatically verifies the user's identity through Supabase's built-in authentication system.

**Authentication Flow:**

1. User logs in via Supabase Auth (email/password, OAuth, etc.)
2. Supabase returns a session with access token
3. Client includes session cookies/headers automatically
4. API calls `supabase.auth.getUser()` to verify identity
5. API matches user email to customer record in database

**Authorization:**

- All customer-facing endpoints verify that the authenticated user can only access their own data
- Customer ID is retrieved from the `customers` table using the authenticated user's email
- All database queries filter by `customer_id` to ensure data isolation

**Example:**

```javascript
// Client-side (automatic with Supabase client)
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'customer@example.com',
  password: 'password123'
})

// Subsequent API calls automatically include authentication
fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ invoiceId: '...', amount: 185.00 })
})
```

---

## Rate Limiting

The API implements per-customer rate limiting to prevent abuse and ensure fair resource allocation.

### Rate Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| Payment Intents | 10 requests | per minute |
| Setup Intents | 10 requests | per minute |
| Payment Confirmation | 10 requests | per minute |
| Invoice PDF Downloads | 20 requests | per minute |
| Appointment Cancellations | 5 requests | per minute |
| Reward Redemptions | 5 requests | per minute |
| Email Notifications | 5 requests | per minute |
| Session Tracking | 30 requests | per minute |
| Cache Clear | 2 requests | per minute |

### Rate Limit Headers

Rate limit information is not currently exposed in response headers but will return `429 Too Many Requests` when exceeded.

### Rate Limit Response

```json
{
  "error": "Too many requests. Please try again later."
}
```

**Status Code:** `429`

---

## Error Responses

All errors follow a consistent structure:

```json
{
  "error": "Human-readable error message"
}
```

### Standard HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `200` | Success | Request completed successfully |
| `400` | Bad Request | Missing required fields, invalid data |
| `401` | Unauthorized | Missing or invalid authentication |
| `404` | Not Found | Resource doesn't exist or doesn't belong to customer |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side error, logged for investigation |
| `503` | Service Unavailable | Health check failed, service degraded |

### Example Error Responses

**Missing Field:**
```json
{
  "error": "Missing required fields"
}
```

**Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**Resource Not Found:**
```json
{
  "error": "Invoice not found"
}
```

**Rate Limited:**
```json
{
  "error": "Too many requests. Please try again later."
}
```

---

## Endpoints

---

## Payments

### Create Payment Intent

Create a Stripe payment intent for an invoice.

**Endpoint:** `POST /api/payments/create-intent`
**Authentication:** Required
**Rate Limit:** 10 per minute

#### Request Body

```json
{
  "invoiceId": "uuid-string",
  "amount": 185.00
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `invoiceId` | `string` | Yes | UUID of the invoice to pay |
| `amount` | `number` | Yes | Payment amount in dollars (e.g., 185.00) |

#### Response

**Success (200):**
```json
{
  "clientSecret": "pi_xxx_secret_xxx"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `clientSecret` | `string` | Stripe PaymentIntent client secret for completing payment |

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `401` | `Unauthorized` | User not authenticated |
| `404` | `Customer not found` | No customer record for authenticated user |
| `404` | `Invoice not found` | Invoice doesn't exist or doesn't belong to customer |
| `400` | `Invoice already paid` | Cannot create payment intent for paid invoice |
| `429` | `Too many requests...` | Rate limit exceeded |
| `500` | `Failed to create payment intent` | Stripe API error or server issue |

#### Example Request

```bash
curl -X POST https://your-domain.com/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=xxx" \
  -d '{
    "invoiceId": "123e4567-e89b-12d3-a456-426614174000",
    "amount": 185.00
  }'
```

#### Example JavaScript

```javascript
const response = await fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    invoiceId: '123e4567-e89b-12d3-a456-426614174000',
    amount: 185.00
  })
})

const { clientSecret } = await response.json()

// Use clientSecret with Stripe.js to complete payment
const stripe = Stripe('pk_xxx')
const { error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement }
})
```

---

### Confirm Payment

Confirm a successful payment and update invoice status.

**Endpoint:** `POST /api/payments/confirm`
**Authentication:** Required
**Rate Limit:** 10 per minute

#### Request Body

```json
{
  "invoiceId": "uuid-string",
  "paymentIntentId": "pi_xxx"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `invoiceId` | `string` | Yes | UUID of the invoice being paid |
| `paymentIntentId` | `string` | Yes | Stripe PaymentIntent ID |

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Payment confirmed and invoice updated",
  "invoice": {
    "id": "uuid",
    "customer_id": "uuid",
    "amount": 185.00
  }
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `400` | `Missing required fields` | Missing invoiceId or paymentIntentId |
| `400` | `Payment not successful` | PaymentIntent status is not 'succeeded' |
| `404` | `Invoice not found` | Invalid invoice ID |
| `429` | `Too many requests...` | Rate limit exceeded |
| `500` | `Failed to update invoice` | Database error |
| `500` | `Failed to confirm payment` | Unexpected error |

#### Example Request

```bash
curl -X POST https://your-domain.com/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=xxx" \
  -d '{
    "invoiceId": "123e4567-e89b-12d3-a456-426614174000",
    "paymentIntentId": "pi_3AbCdEfGhIjKlMnO"
  }'
```

---

### Create Setup Intent

Create a Stripe setup intent for adding a payment method.

**Endpoint:** `POST /api/payments/setup-intent`
**Authentication:** Required
**Rate Limit:** 10 per minute

#### Request Body

```json
{
  "customerId": "cus_xxx"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customerId` | `string` | Yes | Stripe customer ID |

#### Response

**Success (200):**
```json
{
  "clientSecret": "seti_xxx_secret_xxx"
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `400` | `Customer ID is required` | Missing customerId |
| `429` | `Too many requests...` | Rate limit exceeded |
| `500` | `Failed to create setup intent` | Stripe API error |

#### Example Request

```bash
curl -X POST https://your-domain.com/api/payments/setup-intent \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=xxx" \
  -d '{ "customerId": "cus_AbCdEfGhIjKlMn" }'
```

---

### List Payment Methods

Get all saved payment methods for a customer.

**Endpoint:** `GET /api/payments/methods?customerId={stripe_customer_id}`
**Authentication:** Required
**Rate Limit:** None

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customerId` | `string` | Yes | Stripe customer ID |

#### Response

**Success (200):**
```json
{
  "paymentMethods": [
    {
      "id": "pm_xxx",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2025
      },
      "is_default": true
    }
  ]
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `400` | `Customer ID is required` | Missing customerId parameter |
| `500` | `Failed to fetch payment methods` | Stripe API error |

#### Example Request

```bash
curl -X GET "https://your-domain.com/api/payments/methods?customerId=cus_AbCdEfGhIjKlMn" \
  -H "Cookie: sb-access-token=xxx"
```

---

### Delete Payment Method

Remove a saved payment method.

**Endpoint:** `DELETE /api/payments/methods/{id}`
**Authentication:** Required
**Rate Limit:** None

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Stripe PaymentMethod ID |

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Payment method removed successfully"
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `400` | `Payment method ID is required` | Missing ID parameter |
| `500` | `Failed to remove payment method` | Stripe API error |

#### Example Request

```bash
curl -X DELETE https://your-domain.com/api/payments/methods/pm_xxx \
  -H "Cookie: sb-access-token=xxx"
```

---

### Set Default Payment Method

Set a payment method as the default for a customer.

**Endpoint:** `PATCH /api/payments/methods/{id}`
**Authentication:** Required
**Rate Limit:** None

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Stripe PaymentMethod ID |

#### Request Body

```json
{
  "customerId": "cus_xxx"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Default payment method updated successfully"
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `400` | `Payment method ID is required` | Missing ID parameter |
| `400` | `Customer ID is required` | Missing customerId in body |
| `500` | `Failed to set default payment method` | Stripe API error |

#### Example Request

```bash
curl -X PATCH https://your-domain.com/api/payments/methods/pm_xxx \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=xxx" \
  -d '{ "customerId": "cus_AbCdEfGhIjKlMn" }'
```

---

### Export Payment History

Export payment history as CSV or JSON.

**Endpoint:** `GET /api/payments/export?format={csv|json}&year={YYYY}`
**Authentication:** Required
**Rate Limit:** None

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `format` | `string` | No | `csv` | Export format: `csv` or `json` |
| `year` | `string` | No | All | Filter by year (e.g., `2024`) |

#### Response

**Success (200) - CSV:**

```csv
Date,Invoice #,Services,Amount
01/15/2024,12345678,Carpet Cleaning; Upholstery,185.00
```

**Content-Type:** `text/csv`
**Content-Disposition:** `attachment; filename="payment-history-{year}.csv"`

**Success (200) - JSON:**

```json
{
  "invoices": [
    {
      "id": "uuid",
      "paid_date": "2024-01-15T10:30:00Z",
      "amount": 185.00,
      "job": {
        "services": [
          { "service": { "name": "Carpet Cleaning" } }
        ]
      }
    }
  ]
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `401` | `Unauthorized` | User not authenticated |
| `404` | `Customer not found` | No customer record found |
| `500` | `Export failed` | Server error |

#### Example Request

```bash
# Export as CSV
curl -X GET "https://your-domain.com/api/payments/export?format=csv&year=2024" \
  -H "Cookie: sb-access-token=xxx" \
  -o payment-history.csv

# Export as JSON
curl -X GET "https://your-domain.com/api/payments/export?format=json" \
  -H "Cookie: sb-access-token=xxx"
```

---

## Invoices

### Generate Invoice PDF

Generate and download an invoice as a PDF file.

**Endpoint:** `GET /api/invoices/{id}/pdf`
**Authentication:** Required
**Rate Limit:** 20 per minute

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Invoice UUID |

#### Response

**Success (200):**

Binary PDF file

**Content-Type:** `application/pdf`
**Content-Disposition:** `attachment; filename="invoice-{id}.pdf"`

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `401` | `Unauthorized` | User not authenticated |
| `404` | `Customer not found` | No customer record found |
| `404` | `Invoice not found` | Invalid invoice ID or doesn't belong to customer |
| `429` | `Too many requests...` | Rate limit exceeded |
| `500` | `Failed to generate PDF` | PDF generation error |

#### Example Request

```bash
curl -X GET https://your-domain.com/api/invoices/123e4567-e89b-12d3-a456-426614174000/pdf \
  -H "Cookie: sb-access-token=xxx" \
  -o invoice.pdf
```

---

## Appointments

### Cancel Appointment

Cancel a scheduled appointment.

**Endpoint:** `POST /api/appointments/{id}/cancel`
**Authentication:** Required
**Rate Limit:** 5 per minute

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Appointment (Job) UUID |

#### Response

**Success (200):**
```json
{
  "success": true
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `401` | `Unauthorized` | User not authenticated |
| `404` | `Customer not found` | No customer record found |
| `404` | `Appointment not found` | Invalid appointment ID or doesn't belong to customer |
| `400` | `Cannot cancel this appointment` | Appointment is already completed or cancelled |
| `429` | `Too many requests...` | Rate limit exceeded |
| `500` | `Failed to cancel appointment` | Database error |

#### Example Request

```bash
curl -X POST https://your-domain.com/api/appointments/123e4567-e89b-12d3-a456-426614174000/cancel \
  -H "Cookie: sb-access-token=xxx"
```

---

## Rewards & Loyalty

### Redeem Reward

Redeem loyalty points for a reward.

**Endpoint:** `POST /api/rewards/{id}/redeem`
**Authentication:** Required
**Rate Limit:** 5 per minute

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Reward UUID |

#### Response

**Success (200):**
```json
{
  "success": true,
  "newBalance": 450
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Whether redemption succeeded |
| `newBalance` | `number` | Customer's new loyalty points balance |

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `401` | `Unauthorized` | User not authenticated |
| `404` | `Customer not found` | No customer record found |
| `404` | `Reward not found` | Invalid reward ID or reward inactive |
| `400` | `Insufficient points` | Customer doesn't have enough points |
| `429` | `Too many requests...` | Rate limit exceeded |
| `500` | `Failed to redeem reward` | Database error |

#### Example Request

```bash
curl -X POST https://your-domain.com/api/rewards/123e4567-e89b-12d3-a456-426614174000/redeem \
  -H "Cookie: sb-access-token=xxx"
```

---

## Notifications

### Send Email Notification

Send an email notification to a customer.

**Endpoint:** `POST /api/notifications/send-email`
**Authentication:** Required
**Rate Limit:** 5 per minute

#### Request Body

```json
{
  "type": "appointment_confirmed",
  "data": {
    "customerId": "uuid",
    "jobId": "uuid"
  }
}
```

**Supported Notification Types:**

| Type | Required Data Fields | Description |
|------|---------------------|-------------|
| `appointment_confirmed` | `customerId`, `jobId` | Appointment confirmation email |
| `appointment_reminder` | `customerId`, `jobId`, `hoursUntil` | Appointment reminder email |
| `invoice_created` | `customerId`, `invoiceId` | New invoice notification |
| `message_reply` | `customerId`, `subject`, `staffName`, `replyText`, `messageId` | Staff replied to customer message |

#### Response

**Success (200):**
```json
{
  "success": true
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `404` | `Customer not found` | Invalid customerId |
| `400` | `Invalid notification type` | Unsupported type |
| `429` | `Too many email requests...` | Rate limit exceeded |
| `500` | `Failed to generate email` | Template error |
| `500` | `Failed to send email` | Email service error |
| `500` | `Internal server error` | Unexpected error |

#### Example Request

```bash
curl -X POST https://your-domain.com/api/notifications/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "appointment_confirmed",
    "data": {
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "jobId": "987f6543-e21c-98b7-a654-321098765432"
    }
  }'
```

---

## Analytics

### Get Portal Statistics

Get customer portal usage statistics.

**Endpoint:** `GET /api/analytics/portal-stats`
**Authentication:** Required
**Rate Limit:** None

#### Response

**Success (200):**
```json
{
  "totalCustomers": 1250,
  "activeCustomers": 485,
  "onlineBookings": 67,
  "totalBookings": 123,
  "onlinePayments": 89,
  "loyaltyUsers": 340,
  "totalLoyaltyRecords": 1250,
  "adoptionRate": 38.8,
  "onlineBookingRate": 54.5,
  "loyaltyEngagementRate": 27.2,
  "period": "30 days",
  "generatedAt": "2024-01-15T10:30:00Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `totalCustomers` | `number` | Total registered customers |
| `activeCustomers` | `number` | Customers who logged in (last 30 days) |
| `onlineBookings` | `number` | Bookings made via portal (last 30 days) |
| `totalBookings` | `number` | All bookings (last 30 days) |
| `onlinePayments` | `number` | Payments made online (last 30 days) |
| `loyaltyUsers` | `number` | Customers with points > 0 |
| `totalLoyaltyRecords` | `number` | Customers with loyalty records |
| `adoptionRate` | `number` | % of customers who logged in (last 30 days) |
| `onlineBookingRate` | `number` | % of bookings made online |
| `loyaltyEngagementRate` | `number` | % of loyalty users with points |
| `period` | `string` | Analysis period |
| `generatedAt` | `string` | Timestamp of stats generation |

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `500` | `Failed to fetch portal statistics` | Database error |

#### Example Request

```bash
curl -X GET https://your-domain.com/api/analytics/portal-stats
```

---

### Track Portal Session

Track a customer portal login session.

**Endpoint:** `POST /api/analytics/track-session`
**Authentication:** Required
**Rate Limit:** 30 per minute (per IP)

#### Response

**Success (200):**
```json
{
  "success": true,
  "sessionId": "uuid"
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `401` | `Unauthorized` | User not authenticated |
| `404` | `Customer not found` | No customer record found |
| `429` | `Too many requests...` | Rate limit exceeded |
| `500` | `Failed to track session` | Database error |

#### Example Request

```bash
curl -X POST https://your-domain.com/api/analytics/track-session \
  -H "Cookie: sb-access-token=xxx"
```

---

## Cache Management

### Get Cache Statistics

Get cache performance statistics.

**Endpoint:** `GET /api/cache/stats`
**Authentication:** Required
**Rate Limit:** None

#### Response

**Success (200):**
```json
{
  "success": true,
  "caches": {
    "customers": { "size": 150, "max": 500 },
    "notifications": { "size": 45, "max": 200 },
    "queries": { "size": 320, "max": 1000 },
    "invoices": { "size": 78, "max": 500 },
    "jobs": { "size": 92, "max": 500 }
  },
  "performance": {
    "hitRate": "67.23%",
    "totalEntries": 685,
    "totalCapacity": 2700,
    "utilizationRate": "25.37%"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `500` | `Failed to fetch cache statistics` | Server error |

#### Example Request

```bash
curl -X GET https://your-domain.com/api/cache/stats
```

---

### Clear Cache

Clear cache entries based on provided parameters.

**Endpoint:** `POST /api/cache/clear`
**Authentication:** Required
**Rate Limit:** 2 per minute (per IP)

#### Request Body

**Clear All Caches:**
```json
{
  "all": true
}
```

**Clear by Pattern:**
```json
{
  "pattern": "customer:john@example.com"
}
```

**Clear Customer Caches:**
```json
{
  "customerId": "uuid",
  "email": "john@example.com"
}
```

**Reset Metrics:**
```json
{
  "metrics": true
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "All caches cleared successfully"
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `400` | `Invalid request. Provide one of: all, pattern, customerId, or metrics` | Missing required fields |
| `429` | `Too many requests...` | Rate limit exceeded |
| `500` | `Failed to clear cache` | Server error |

#### Example Request

```bash
# Clear all caches
curl -X POST https://your-domain.com/api/cache/clear \
  -H "Content-Type: application/json" \
  -d '{ "all": true }'

# Clear by pattern
curl -X POST https://your-domain.com/api/cache/clear \
  -H "Content-Type: application/json" \
  -d '{ "pattern": "customer:john@example.com" }'

# Clear customer caches
curl -X POST https://your-domain.com/api/cache/clear \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john@example.com"
  }'
```

---

## Health Check

### Health Check

Check service health status for monitoring.

**Endpoint:** `GET /api/health`
**Authentication:** Not Required
**Rate Limit:** None

#### Response

**Success (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "database": {
      "status": "ok",
      "duration": 45
    },
    "service": {
      "status": "ok"
    }
  },
  "responseTime": 48,
  "uptime": 345678.9
}
```

**Unhealthy (503):**
```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "database": {
      "status": "error",
      "message": "Connection timeout",
      "duration": 5000
    },
    "service": {
      "status": "ok"
    }
  },
  "responseTime": 5003,
  "uptime": 345678.9
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | `string` | Overall health: `healthy` or `unhealthy` |
| `timestamp` | `string` | ISO 8601 timestamp |
| `checks` | `object` | Individual health checks |
| `checks.database.status` | `string` | Database status: `ok` or `error` |
| `checks.database.duration` | `number` | Database query time (ms) |
| `responseTime` | `number` | Total response time (ms) |
| `uptime` | `number` | Process uptime (seconds) |

#### Example Request

```bash
curl -X GET https://your-domain.com/api/health
```

---

## Webhooks

### Stripe Webhooks

Stripe webhook endpoint for handling payment events.

**Endpoint:** `POST /api/webhooks/stripe`
**Authentication:** Stripe Signature Verification
**Rate Limit:** None

#### Supported Events

| Event | Description | Actions |
|-------|-------------|---------|
| `payment_intent.succeeded` | Payment completed successfully | Update invoice to 'paid', award loyalty points, send receipt email |
| `payment_intent.payment_failed` | Payment failed | Log error, audit log entry |

#### Webhook Signature Verification

Stripe webhooks are verified using the `stripe-signature` header and the webhook secret configured in `STRIPE_WEBHOOK_SECRET` environment variable.

**Invalid Signature Response:**

```json
{
  "error": "Invalid signature"
}
```

**Status Code:** `400`

#### Event Processing

**payment_intent.succeeded:**

1. Fetches customer and invoice data
2. Updates invoice status to 'paid'
3. Awards loyalty points (10 points per dollar)
4. Creates loyalty transaction record
5. Sends payment receipt email
6. Sends loyalty points earned email
7. Creates audit log entry

**payment_intent.payment_failed:**

1. Logs error with payment details
2. Creates audit log entry
3. TODO: Send notification to customer

#### Response

**Success (200):**
```json
{
  "received": true
}
```

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| `400` | `Invalid signature` | Webhook signature verification failed |
| `500` | `Webhook handler failed` | Error processing event |

#### Testing Webhooks

Use Stripe CLI to test webhooks locally:

```bash
stripe listen --forward-to localhost:3009/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

---

## Data Models

### Customer

```typescript
interface Customer {
  id: string                  // UUID
  email: string               // Email address (unique)
  name: string                // Full name
  first_name?: string         // First name
  last_name?: string          // Last name
  phone?: string              // Phone number
  address_line1?: string      // Address line 1
  address_line2?: string      // Address line 2
  city?: string               // City
  state?: string              // State
  postal_code?: string        // Postal code
  stripe_customer_id?: string // Stripe customer ID
  loyalty_points?: number     // Current loyalty points balance
  created_at: string          // ISO 8601 timestamp
  updated_at: string          // ISO 8601 timestamp
}
```

### Invoice

```typescript
interface Invoice {
  id: string                       // UUID
  customer_id: string              // Customer UUID
  job_id?: string                  // Job UUID
  invoice_number: string           // Human-readable invoice #
  amount: number                   // Amount in dollars
  total: number                    // Total amount (with tax/fees)
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date?: string                // ISO 8601 date
  paid_date?: string               // ISO 8601 timestamp
  stripe_payment_intent_id?: string // Stripe PaymentIntent ID
  created_at: string               // ISO 8601 timestamp
  updated_at: string               // ISO 8601 timestamp
}
```

### Job (Appointment)

```typescript
interface Job {
  id: string                       // UUID
  customer_id: string              // Customer UUID
  scheduled_date?: string          // ISO 8601 date
  scheduled_time?: string          // Time string (HH:MM)
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  address?: string                 // Service address
  services?: string[]              // Array of service names
  booked_via_portal?: boolean      // Whether booked online
  created_at: string               // ISO 8601 timestamp
  updated_at: string               // ISO 8601 timestamp
}
```

### Loyalty Points

```typescript
interface LoyaltyPoints {
  id: string                       // UUID
  customer_id: string              // Customer UUID
  points: number                   // Current points balance
  total_earned: number             // Lifetime points earned
  total_redeemed: number           // Lifetime points redeemed
  created_at: string               // ISO 8601 timestamp
  updated_at: string               // ISO 8601 timestamp
}
```

### Loyalty Transaction

```typescript
interface LoyaltyTransaction {
  id: string                       // UUID
  customer_id: string              // Customer UUID
  points: number                   // Points change (positive for earn, negative for redeem)
  type: 'earn' | 'earned' | 'redemption' | 'spent'
  description: string              // Human-readable description
  created_at: string               // ISO 8601 timestamp
}
```

### Reward

```typescript
interface Reward {
  id: string                       // UUID
  name: string                     // Reward name
  description?: string             // Reward description
  points_required: number          // Points needed to redeem
  active: boolean                  // Whether reward is available
  created_at: string               // ISO 8601 timestamp
}
```

### Reward Redemption

```typescript
interface RewardRedemption {
  id: string                       // UUID
  customer_id: string              // Customer UUID
  reward_id: string                // Reward UUID
  points_used: number              // Points deducted
  status: 'pending' | 'fulfilled' | 'cancelled'
  created_at: string               // ISO 8601 timestamp
}
```

### Payment Method

```typescript
interface PaymentMethod {
  id: string                       // Stripe PaymentMethod ID
  card: {
    brand: string                  // Card brand (visa, mastercard, etc.)
    last4: string                  // Last 4 digits
    exp_month: number              // Expiration month (1-12)
    exp_year: number               // Expiration year (YYYY)
  }
  is_default: boolean              // Whether this is the default payment method
}
```

### Portal Session

```typescript
interface PortalSession {
  id: string                       // UUID
  customer_id: string              // Customer UUID
  login_at: string                 // ISO 8601 timestamp
  ip_address?: string              // IP address
  user_agent?: string              // User agent string
}
```

### Audit Log

```typescript
interface AuditLog {
  id: string                       // UUID
  user_id?: string                 // Customer UUID (null for system actions)
  action: string                   // Action name (e.g., 'payment_completed')
  resource_type?: string           // Resource type (e.g., 'invoice', 'payment')
  resource_id?: string             // Resource UUID
  details?: Record<string, any>    // Additional context as JSON
  ip_address?: string              // IP address
  user_agent?: string              // User agent string
  status: 'success' | 'failure' | 'pending'
  created_at: string               // ISO 8601 timestamp
}
```

---

## Additional Resources

- **Related Documentation:**
  - [Rate Limiting](../RATE-LIMITING.md)
  - [Logging & Audit System](../LOGGING.md)
  - [Error Tracking](../ERROR-TRACKING.md)
  - [Security Headers](../SECURITY-HEADERS.md)
  - [Performance Monitoring](../PERFORMANCE-MONITORING.md)

- **External Resources:**
  - [Stripe API Documentation](https://stripe.com/docs/api)
  - [Supabase Documentation](https://supabase.com/docs)
  - [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

## Support

For API support, please contact:
- **Technical Issues:** Report issues in the project repository
- **Business Inquiries:** Contact Dirt Free Carpet customer service

---

**Last Updated:** January 2025
**API Version:** 1.0
