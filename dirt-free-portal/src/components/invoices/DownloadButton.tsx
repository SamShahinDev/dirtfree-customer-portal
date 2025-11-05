'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DownloadButtonProps {
  invoiceId: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
  className?: string
}

export function DownloadButton({
  invoiceId,
  variant = 'ghost',
  size = 'sm',
  showText = false,
  className
}: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`)

      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }

      // Get the PDF blob
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceId.slice(0, 8)}.pdf`
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Invoice downloaded successfully')
    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast.error('Failed to download invoice')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={downloading}
      className={className}
    >
      {downloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">
          {downloading ? 'Downloading...' : 'Download'}
        </span>
      )}
    </Button>
  )
}
