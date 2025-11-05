'use client'

import { useState } from 'react'
import { Download, FileText, Image as ImageIcon, File, ExternalLink, Loader2, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { formatFileSize } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export interface Attachment {
  url: string
  filename: string
  size: number
  type: string
  path: string
}

interface AttachmentCardProps {
  attachment: Attachment
  className?: string
  compact?: boolean
  messageId?: string | null
  replyId?: string | null
}

export function AttachmentCard({
  attachment,
  className,
  compact = false,
  messageId = null,
  replyId = null
}: AttachmentCardProps) {
  const [imageError, setImageError] = useState(false)
  const [downloadCount, setDownloadCount] = useState<number | null>(null)
  const [loadingCount, setLoadingCount] = useState(true)

  const supabase = createClient()
  const isImage = attachment.type.startsWith('image/')
  const isPDF = attachment.type === 'application/pdf'

  // Load download count on mount
  useEffect(() => {
    async function loadDownloadCount() {
      try {
        const { data, error } = await supabase
          .rpc('get_attachment_download_count', { attachment_path: attachment.path })

        if (!error && typeof data === 'number') {
          setDownloadCount(data)
        }
      } catch (error) {
        console.error('Failed to load download count:', error)
      } finally {
        setLoadingCount(false)
      }
    }

    loadDownloadCount()
  }, [attachment.path, supabase])

  const getFileIcon = () => {
    if (isImage && !imageError) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />
    }
    if (isPDF) {
      return <FileText className="h-5 w-5 text-red-600" />
    }
    return <File className="h-5 w-5 text-gray-600" />
  }

  const handleDownload = async () => {
    try {
      // Track download
      await trackDownload()

      const response = await fetch(attachment.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = attachment.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback: open in new tab
      window.open(attachment.url, '_blank')
    }
  }

  const trackDownload = async () => {
    try {
      // Get current customer ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!customer) return

      // Insert download tracking record
      const { error } = await supabase
        .from('attachment_downloads')
        .insert({
          attachment_path: attachment.path,
          downloaded_by: customer.id,
          message_id: messageId,
          reply_id: replyId,
        })

      if (!error) {
        // Increment local count
        setDownloadCount((prev) => (prev !== null ? prev + 1 : 1))
      }
    } catch (error) {
      // Silently fail - don't block download if tracking fails
      console.error('Failed to track download:', error)
    }
  }

  if (compact) {
    // Compact version for message lists
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer',
          className
        )}
        onClick={handleDownload}
      >
        {getFileIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{attachment.filename}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatFileSize(attachment.size)}</span>
            {!loadingCount && downloadCount !== null && downloadCount > 0 && (
              <>
                <span>•</span>
                <span className="text-blue-600">
                  Downloaded {downloadCount} {downloadCount === 1 ? 'time' : 'times'}
                </span>
              </>
            )}
          </div>
        </div>
        <Download className="h-4 w-4 text-muted-foreground" />
      </div>
    )
  }

  // Full card version for message threads
  return (
    <Card className={cn('overflow-hidden hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-0">
        {isImage && !imageError ? (
          // Image preview
          <div className="relative group h-48">
            <OptimizedImage
              src={attachment.url}
              alt={attachment.filename}
              fill
              objectFit="cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => window.open(attachment.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        ) : (
          // File icon preview
          <div className="bg-gray-50 p-8 flex items-center justify-center">
            {isPDF ? (
              <FileText className="h-16 w-16 text-red-600" />
            ) : (
              <File className="h-16 w-16 text-gray-600" />
            )}
          </div>
        )}

        {/* File info footer */}
        <div className="p-3 border-t bg-white">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" title={attachment.filename}>
                {attachment.filename}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(attachment.size)}
                {isPDF && ' • PDF Document'}
                {isImage && !imageError && ' • Image'}
              </p>
              {!loadingCount && downloadCount !== null && downloadCount > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  Downloaded {downloadCount} {downloadCount === 1 ? 'time' : 'times'}
                </p>
              )}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {!isImage && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(attachment.url, '_blank')}
                  title="View"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownload}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Component to display multiple attachments
interface AttachmentListProps {
  attachments: Attachment[]
  compact?: boolean
  className?: string
  messageId?: string | null
  replyId?: string | null
}

export function AttachmentList({
  attachments,
  compact = false,
  className,
  messageId = null,
  replyId = null
}: AttachmentListProps) {
  const [downloading, setDownloading] = useState(false)

  if (!attachments || attachments.length === 0) {
    return null
  }

  const handleDownloadAll = async () => {
    setDownloading(true)
    try {
      // Dynamic import - JSZip is only loaded when user clicks "Download All"
      // This saves ~100KB from the initial bundle
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // Fetch all files and add to ZIP
      const fetchPromises = attachments.map(async (attachment, index) => {
        try {
          const response = await fetch(attachment.url)
          const blob = await response.blob()

          // Create unique filename to avoid conflicts
          const filename = `${index + 1}_${attachment.filename}`
          zip.file(filename, blob)
        } catch (error) {
          console.error(`Failed to fetch ${attachment.filename}:`, error)
          // Continue with other files even if one fails
        }
      })

      await Promise.all(fetchPromises)

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' })

      // Create download link
      const url = window.URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attachments_${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Downloaded ${attachments.length} files as ZIP`)
    } catch (error) {
      console.error('Error creating ZIP:', error)
      toast.error('Failed to create ZIP file')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <File className="h-4 w-4" />
          <span>
            {attachments.length} {attachments.length === 1 ? 'attachment' : 'attachments'}
          </span>
        </div>

        {/* Download All button - only show for multiple attachments */}
        {attachments.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadAll}
            disabled={downloading}
            className="gap-2"
          >
            {downloading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Creating ZIP...
              </>
            ) : (
              <>
                <Archive className="h-3 w-3" />
                Download All
              </>
            )}
          </Button>
        )}
      </div>
      <div className={cn(
        compact ? 'space-y-2' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'
      )}>
        {attachments.map((attachment, index) => (
          <AttachmentCard
            key={index}
            attachment={attachment}
            compact={compact}
            messageId={messageId}
            replyId={replyId}
          />
        ))}
      </div>
    </div>
  )
}
