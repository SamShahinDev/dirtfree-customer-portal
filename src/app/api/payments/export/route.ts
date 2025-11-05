import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const year = searchParams.get('year')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    let query = supabase
      .from('invoices')
      .select('*, job:jobs(services:job_services(service:services(name)))')
      .eq('customer_id', customer.id)
      .eq('status', 'paid')
      .order('paid_date', { ascending: false })

    if (year) {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      query = query
        .gte('paid_date', startDate)
        .lte('paid_date', endDate)
    }

    const { data: invoices } = await query

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Date', 'Invoice #', 'Services', 'Amount']
      const rows = invoices?.map(inv => [
        new Date(inv.paid_date!).toLocaleDateString(),
        inv.id.slice(0, 8),
        inv.job?.services?.map((s: any) => s.service?.name).join('; ') || '',
        inv.amount.toFixed(2),
      ]) || []

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payment-history-${year || 'all'}.csv"`,
        },
      })
    }

    // Return JSON for other formats
    return NextResponse.json({ invoices })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Export failed' },
      { status: 500 }
    )
  }
}
