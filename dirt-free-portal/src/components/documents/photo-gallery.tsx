'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react'
import { OptimizedImage } from '@/components/ui/optimized-image'

interface Photo {
  id: string
  url: string
  type: 'before' | 'after'
  caption?: string
}

interface PhotoGalleryProps {
  photos: Photo[]
  jobDate: string
}

export function PhotoGallery({ photos, jobDate }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
  }

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

  const currentPhoto = selectedIndex !== null ? photos[selectedIndex] : null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative group cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <div className="aspect-square rounded-lg overflow-hidden border hover:border-primary transition-colors">
              <OptimizedImage
                src={photo.url}
                alt={`${photo.type} photo`}
                fill
                className="group-hover:scale-105 transition-transform"
                objectFit="cover"
                priority={index < 2}
              />
            </div>
            <Badge
              className="absolute top-2 left-2 text-xs"
              variant={photo.type === 'before' ? 'destructive' : 'default'}
            >
              {photo.type}
            </Badge>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-4xl">
          {currentPhoto && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={currentPhoto.type === 'before' ? 'destructive' : 'default'}>
                    {currentPhoto.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{jobDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={currentPhoto.url} download target="_blank">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={closeLightbox}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <OptimizedImage
                  src={currentPhoto.url}
                  alt={`${currentPhoto.type} photo`}
                  fill
                  objectFit="contain"
                  priority
                />
              </div>

              {currentPhoto.caption && (
                <p className="text-sm text-muted-foreground text-center">
                  {currentPhoto.caption}
                </p>
              )}

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevious}
                  disabled={selectedIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedIndex! + 1} / {photos.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNext}
                  disabled={selectedIndex === photos.length - 1}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
