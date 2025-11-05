'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, File, Image, FileText, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  uploadFile,
  generateFilePath,
  isFileTypeAllowed,
  isFileSizeAllowed,
  formatFileSize,
  getFileExtension,
  BUCKETS,
} from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export interface UploadedFile {
  url: string
  filename: string
  size: number
  type: string
  path: string
}

interface FileUploadProps {
  customerId: string
  bucket?: keyof typeof BUCKETS
  category?: string
  maxFiles?: number
  onFilesChange?: (files: UploadedFile[]) => void
  existingFiles?: UploadedFile[]
  className?: string
  disabled?: boolean
}

interface FileUploadProgress {
  filename: string
  progress: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export function FileUpload({
  customerId,
  bucket = 'MESSAGE_ATTACHMENTS',
  category = 'messages',
  maxFiles = 5,
  onFilesChange,
  existingFiles = [],
  className,
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const bucketName = BUCKETS[bucket]

  // Allowed file types for display
  const allowedTypes = 'JPEG, PNG, WebP, PDF'
  const maxSizeMB = 10

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0 || disabled) return

      const fileArray = Array.from(fileList)

      // Check if adding these files would exceed max
      if (files.length + fileArray.length > maxFiles) {
        toast.error(`You can only upload up to ${maxFiles} files`)
        return
      }

      // Validate each file and track progress
      const validFiles: File[] = []
      const progressTracking: FileUploadProgress[] = []

      for (const file of fileArray) {
        let validationError: string | undefined

        if (!isFileTypeAllowed(file)) {
          const ext = getFileExtension(file.name).toUpperCase()
          validationError = `File type "${ext}" is not allowed. Please use: ${allowedTypes}`
          toast.error(`${file.name}: ${validationError}`, { duration: 5000 })
        } else if (!isFileSizeAllowed(file)) {
          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
          validationError = `File size (${fileSizeMB}MB) exceeds maximum of ${maxSizeMB}MB`
          toast.error(`${file.name}: ${validationError}`, { duration: 5000 })
        } else {
          validFiles.push(file)
          progressTracking.push({ filename: file.name, progress: 'pending' })
        }
      }

      if (validFiles.length === 0) return

      setUploading(true)
      setUploadProgress(progressTracking)

      try {
        const uploadedFiles: UploadedFile[] = []

        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i]

          // Update progress to uploading
          setUploadProgress((prev) =>
            prev.map((p, idx) =>
              idx === i ? { ...p, progress: 'uploading' } : p
            )
          )

          const filePath = generateFilePath(customerId, category, file.name)
          const result = await uploadFile(file, bucketName, filePath)

          if (result.error) {
            // Update progress to error
            setUploadProgress((prev) =>
              prev.map((p, idx) =>
                idx === i ? { ...p, progress: 'error', error: result.error } : p
              )
            )
            toast.error(`Failed to upload ${file.name}: ${result.error}`, { duration: 5000 })
            continue
          }

          if (result.url && result.path) {
            // Update progress to success
            setUploadProgress((prev) =>
              prev.map((p, idx) =>
                idx === i ? { ...p, progress: 'success' } : p
              )
            )

            uploadedFiles.push({
              url: result.url,
              filename: file.name,
              size: file.size,
              type: file.type,
              path: result.path,
            })
          }
        }

        if (uploadedFiles.length > 0) {
          const newFiles = [...files, ...uploadedFiles]
          setFiles(newFiles)
          onFilesChange?.(newFiles)
          toast.success(
            `${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} uploaded successfully`
          )
        }
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload files. Please try again.')
      } finally {
        setUploading(false)
        // Clear progress after a brief delay to show final state
        setTimeout(() => {
          setUploadProgress([])
        }, 2000)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [customerId, category, bucketName, files, maxFiles, onFilesChange, disabled]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (disabled) return

      const { files } = e.dataTransfer
      handleFiles(files)
    },
    [handleFiles, disabled]
  )

  const handleDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (disabled) return

      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true)
      } else if (e.type === 'dragleave') {
        setDragActive(false)
      }
    },
    [disabled]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      if (disabled) return
      handleFiles(e.target.files)
    },
    [handleFiles, disabled]
  )

  const handleClick = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  const removeFile = (index: number) => {
    if (disabled) return
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesChange?.(newFiles)
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-6 w-6" />
    }
    if (type === 'application/pdf') {
      return <FileText className="h-6 w-6" />
    }
    return <File className="h-6 w-6" />
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer',
          dragActive && !disabled && 'border-blue-500 bg-blue-50',
          !dragActive && !disabled && 'hover:border-blue-500',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
          uploading && 'pointer-events-none opacity-50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          disabled={disabled || uploading}
        />

        {uploading && uploadProgress.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium mb-3">Uploading Files...</p>
            {uploadProgress.map((progress, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {progress.progress === 'pending' && (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                )}
                {progress.progress === 'uploading' && (
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                )}
                {progress.progress === 'success' && (
                  <div className="h-4 w-4 rounded-full bg-green-600 flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {progress.progress === 'error' && (
                  <div className="h-4 w-4 rounded-full bg-red-600 flex items-center justify-center">
                    <X className="h-3 w-3 text-white" />
                  </div>
                )}
                <span className={cn(
                  progress.progress === 'success' && 'text-green-600',
                  progress.progress === 'error' && 'text-red-600',
                  progress.progress === 'uploading' && 'text-blue-600'
                )}>
                  {progress.filename}
                </span>
                {progress.progress === 'uploading' && (
                  <span className="text-xs text-muted-foreground ml-auto">Uploading...</span>
                )}
                {progress.progress === 'success' && (
                  <span className="text-xs text-green-600 ml-auto">Complete</span>
                )}
                {progress.progress === 'error' && (
                  <span className="text-xs text-red-600 ml-auto">Failed</span>
                )}
              </div>
            ))}
          </div>
        ) : uploading ? (
          <>
            <Loader2 className="h-8 w-8 mx-auto mb-2 text-blue-600 animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading files...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {disabled ? 'File upload disabled' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, WebP, or PDF up to 10MB
            </p>
            {maxFiles > 1 && (
              <p className="text-xs text-muted-foreground mt-1">
                Max {maxFiles} files ({files.length}/{maxFiles} uploaded)
              </p>
            )}
          </>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Uploaded Files ({files.length})
          </p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <div className="text-muted-foreground">
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      {!disabled && files.length === 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 text-blue-900 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            You can attach photos to help us better understand your request or
            provide visual context.
          </p>
        </div>
      )}
    </div>
  )
}
