import { createClient } from '@/lib/supabase/client'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export interface UploadResult {
  url: string | null
  path: string | null
  error: string | null
}

export interface DeleteResult {
  error: string | null
}

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name ('customer-documents' or 'message-attachments')
 * @param path - The path within the bucket (use generateFilePath helper)
 * @returns Object with url, path, and error
 */
export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { url: null, path: null, error: 'File must be less than 10MB' }
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      url: null,
      path: null,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed',
    }
  }

  const supabase = createClient()

  try {
    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Storage upload error:', error)
      return { url: null, path: null, error: error.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path)

    return { url: publicUrl, path: data.path, error: null }
  } catch (error: any) {
    console.error('Upload error:', error)
    return {
      url: null,
      path: null,
      error: error.message || 'Failed to upload file',
    }
  }
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns Object with error if any
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<DeleteResult> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      console.error('Storage delete error:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error: any) {
    console.error('Delete error:', error)
    return { error: error.message || 'Failed to delete file' }
  }
}

/**
 * Generate a unique file path for storage
 * @param customerId - The customer UUID
 * @param category - The file category (e.g., 'messages', 'documents', 'photos')
 * @param filename - The original filename
 * @returns A unique path string
 */
export function generateFilePath(
  customerId: string,
  category: string,
  filename: string
): string {
  const timestamp = Date.now()
  // Sanitize filename: remove special characters, keep alphanumeric, dots, and hyphens
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${customerId}/${category}/${timestamp}-${sanitized}`
}

/**
 * Get file extension from filename
 * @param filename - The filename
 * @returns The file extension (e.g., 'jpg', 'png', 'pdf')
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., '2.5 MB')
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate if file type is allowed
 * @param file - The file to validate
 * @returns True if file type is allowed
 */
export function isFileTypeAllowed(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type)
}

/**
 * Validate if file size is within limit
 * @param file - The file to validate
 * @returns True if file size is within limit
 */
export function isFileSizeAllowed(file: File): boolean {
  return file.size <= MAX_FILE_SIZE
}

/**
 * Get allowed file types as string for input accept attribute
 * @returns Comma-separated string of allowed MIME types
 */
export function getAllowedFileTypes(): string {
  return ALLOWED_TYPES.join(',')
}

/**
 * Constants for bucket names
 */
export const BUCKETS = {
  CUSTOMER_DOCUMENTS: 'customer-documents',
  MESSAGE_ATTACHMENTS: 'message-attachments',
} as const
