'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  onError?: () => void
}

/**
 * OptimizedImage Component
 *
 * A wrapper around Next.js Image component that provides:
 * - Automatic image optimization (WebP/AVIF formats)
 * - Blur placeholder with smooth fade-in
 * - Lazy loading by default
 * - Priority loading option for above-the-fold images
 * - Error handling
 * - Responsive sizing
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  objectFit = 'cover',
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Error fallback
  if (hasError) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100', className)}>
        <div className="text-center p-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Failed to load image</p>
        </div>
      </div>
    )
  }

  // Common image props
  const imageProps = {
    src,
    alt,
    priority,
    onLoad: handleLoadingComplete,
    onError: handleError,
    className: cn(
      'duration-700 ease-in-out',
      isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0',
      fill ? undefined : className
    ),
  }

  return (
    <div className={cn('overflow-hidden bg-gray-100', fill ? className : undefined)}>
      {fill ? (
        <Image
          {...imageProps}
          fill
          sizes={sizes}
          style={{ objectFit }}
        />
      ) : (
        <Image
          {...imageProps}
          width={width || 800}
          height={height || 600}
          style={{ objectFit }}
        />
      )}
    </div>
  )
}
