import { createClient } from '@/lib/supabase/server'
import { generateInvoicePDF } from '@/lib/pdf-generator-lazy'
import { NextResponse } from 'next/server'
import { apiLimiter } from '@/lib/rate-limit'

/**
 * Generate Invoice PDF
 *
 * Generates and downloads an invoice as a PDF file.
 *
 * Authentication: Required (Supabase JWT)
 * Rate Limit: 20 requests per minute per customer
 *
 * Path Parameters:
 * - id: string - Invoice UUID
 *
 * Response (Success 200):
 * Binary PDF file
 * Content-Type: application/pdf
 * Content-Disposition: attachment; filename="invoice-{id}.pdf"
 *
 * Error Responses:
 * - 401: Unauthorized
 * - 404: Customer not found / Invoice not found
 * - 429: Too many requests (rate limit exceeded)
 * - 500: Failed to generate PDF
 *
 * Example Usage:
 * GET /api/invoices/{uuid}/pdf
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id, name, email, address_line1, address_line2, city, state, postal_code')
      .eq('email', user.email)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Rate limiting - 20 PDF downloads per minute per customer
    try {
      await apiLimiter.check(20, customer.id)
    } catch {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Get invoice with related job and services
    const { data: invoice } = await supabase
      .from('invoices')
      .select(`
        *,
        job:jobs(
          services:job_services(
            service:services(
              name,
              base_price
            )
          )
        )
      `)
      .eq('id', params.id)
      .eq('customer_id', customer.id)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Generate PDF (lazy-loaded - jsPDF only loaded when this endpoint is called)
    const pdf = await generateInvoicePDF(invoice, customer)
    const pdfBuffer = pdf.output('arraybuffer')

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.id.slice(0, 8)}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
