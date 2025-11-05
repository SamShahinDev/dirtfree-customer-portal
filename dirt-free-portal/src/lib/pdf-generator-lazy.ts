/**
 * Lazy-loaded PDF Generator
 *
 * Uses dynamic imports to load jsPDF and jspdf-autotable only when needed.
 * This reduces the initial bundle size by ~450KB.
 *
 * The libraries are loaded on-demand when generateInvoicePDF is called,
 * with minimal performance impact (~100ms first-time load, then cached).
 */

interface Invoice {
  id: string
  total_cents: number
  created_at: string
  due_date: string
  paid_date?: string
  status: string
  job?: {
    services?: Array<{
      service?: {
        name: string
        base_price?: number
      }
    }>
  }
}

interface Customer {
  name: string
  email: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
}

/**
 * Generate an invoice PDF with dynamic library loading
 *
 * @param invoice - Invoice data
 * @param customer - Customer data
 * @returns Promise<jsPDF> - PDF document ready for download
 *
 * @example
 * const doc = await generateInvoicePDF(invoice, customer)
 * doc.save(`invoice-${invoice.id}.pdf`)
 */
export async function generateInvoicePDF(invoice: Invoice, customer: Customer) {
  // Dynamic import - jsPDF and jspdf-autotable are only loaded when this function is called
  // This saves ~450KB from the initial bundle
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ])

  const doc = new jsPDF()

  // Header - Company Info
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('DIRT FREE CARPET', 105, 20, { align: 'center' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('1308 Upland Dr, Katy, TX 77493', 105, 27, { align: 'center' })
  doc.text('(713) 730-2782', 105, 32, { align: 'center' })

  // Invoice Title & Number
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`Invoice #${invoice.id.slice(0, 8).toUpperCase()}`, 20, 50)

  // Invoice Info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 60)
  doc.text(`Due: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, 65)

  // Status with color
  const statusText = `Status: ${invoice.status.toUpperCase()}`
  if (invoice.status === 'paid') {
    doc.setTextColor(0, 128, 0) // Green
  } else if (invoice.status === 'overdue') {
    doc.setTextColor(220, 53, 69) // Red
  } else {
    doc.setTextColor(255, 193, 7) // Yellow
  }
  doc.text(statusText, 20, 70)
  doc.setTextColor(0, 0, 0) // Reset to black

  // Customer Info - Bill To
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', 120, 50)
  doc.setFont('helvetica', 'normal')
  doc.text(customer.name || 'Customer', 120, 55)

  if (customer.address_line1) {
    doc.text(customer.address_line1, 120, 60)
    let yPos = 65
    if (customer.address_line2) {
      doc.text(customer.address_line2, 120, yPos)
      yPos += 5
    }
    if (customer.city && customer.state && customer.postal_code) {
      doc.text(`${customer.city}, ${customer.state} ${customer.postal_code}`, 120, yPos)
    }
  }

  // Services Table
  const services = invoice.job?.services || []
  const tableData = services.map((item) => {
    const serviceName = item.service?.name || 'Service'
    const price = item.service?.base_price || 0
    const priceFormatted = `$${(price / 100).toFixed(2)}`
    return [serviceName, '1', priceFormatted, priceFormatted]
  })

  // If no services, add a placeholder row
  if (tableData.length === 0) {
    tableData.push(['Service', '1', '$0.00', '$0.00'])
  }

  autoTable(doc, {
    startY: 85,
    head: [['Description', 'Quantity', 'Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 90 }, // Description
      1: { cellWidth: 30, halign: 'center' }, // Quantity
      2: { cellWidth: 30, halign: 'right' }, // Price
      3: { cellWidth: 30, halign: 'right' }, // Total
    },
  })

  // Total
  const finalY = (doc as any).lastAutoTable.finalY || 100
  const totalAmount = `$${(invoice.total_cents / 100).toFixed(2)}`

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Total:', 140, finalY + 10)
  doc.text(totalAmount, 180, finalY + 10, { align: 'right' })

  // Payment Status Footer
  if (invoice.status === 'paid' && invoice.paid_date) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 128, 0)
    doc.text(`✓ PAID on ${new Date(invoice.paid_date).toLocaleDateString()}`, 105, finalY + 25, { align: 'center' })
    doc.setTextColor(0, 0, 0)
  } else {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Please make payment by the due date.', 105, finalY + 25, { align: 'center' })
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text('Thank you for your business!', 105, 280, { align: 'center' })
  doc.text('Questions? Contact us at (713) 730-2782 or info@dirtfreecarpet.com', 105, 285, { align: 'center' })
  doc.setTextColor(0, 0, 0)

  return doc
}
