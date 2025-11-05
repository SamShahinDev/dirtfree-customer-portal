'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from '@/components/ui/optimized-image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  History,
  Calendar,
  Camera,
  FileText,
  Lightbulb,
  Download,
  User,
  MapPin,
  CheckCircle2,
  Receipt,
  Maximize2,
  Filter,
  Star,
  TrendingUp
} from 'lucide-react'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface JobPhoto {
  id: string
  url: string
  type: 'before' | 'after'
  uploaded_at: string
}

interface Job {
  id: string
  scheduled_date: string
  completed_date?: string
  total_amount: number
  notes?: string
  status: string
  services?: Array<{
    service: {
      name: string
    }
  }>
  photos?: JobPhoto[]
}

export default function DocumentsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [allPhotos, setAllPhotos] = useState<JobPhoto[]>([])

  useEffect(() => {
    async function loadServiceHistory() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', user.email)
          .single()

        if (!customer) return

        // Get completed jobs with documents
        const { data: jobsData } = await supabase
          .from('jobs')
          .select(`
            *,
            services:job_services(service:services(name)),
            photos:job_photos(*)
          `)
          .eq('customer_id', customer.id)
          .eq('status', 'completed')
          .order('scheduled_date', { ascending: false })

        setJobs(jobsData || [])
      } catch (error) {
        console.error('Error loading service history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadServiceHistory()
  }, [supabase])

  const openPhotoModal = (photos: JobPhoto[], photoUrl: string) => {
    setAllPhotos(photos)
    setSelectedPhoto(photoUrl)
    setPhotoModalOpen(true)
  }

  const filteredJobs = jobs.filter(job => {
    if (filterType === 'all') return true
    const serviceName = job.services?.[0]?.service?.name?.toLowerCase() || ''
    return serviceName.includes(filterType.toLowerCase())
  })

  // Calculate statistics
  const totalServices = jobs.length
  const firstServiceDate = jobs.length > 0 ? jobs[jobs.length - 1].scheduled_date : new Date().toISOString()
  const totalPhotos = jobs.reduce((acc, job) => acc + (job.photos?.length || 0), 0)

  // Find most popular service
  const serviceCounts: Record<string, number> = {}
  jobs.forEach(job => {
    const serviceName = job.services?.[0]?.service?.name || 'Unknown'
    serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1
  })
  const mostPopularService = Object.keys(serviceCounts).length > 0
    ? Object.entries(serviceCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    : 'None'
  const mostPopularCount = serviceCounts[mostPopularService] || 0

  // Last service info
  const lastServiceDate = jobs.length > 0 ? (jobs[0].completed_date || jobs[0].scheduled_date) : new Date().toISOString()
  const lastServiceType = jobs.length > 0 ? (jobs[0].services?.[0]?.service?.name || 'Service') : 'None'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading service history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Service History & Records</h1>
        <p className="text-muted-foreground">
          View your complete service timeline with photos, reports, and recommendations
        </p>
      </div>

      {/* Summary Stats */}
      {jobs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <History className="h-4 w-4" />
                Total Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalServices}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Since {new Date(firstServiceDate).getFullYear()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Star className="h-4 w-4" />
                Most Popular Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mostPopularService}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {mostPopularCount} {mostPopularCount === 1 ? 'time' : 'times'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Service Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPhotos}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Documenting our work
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Last Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDistanceToNow(new Date(lastServiceDate), { addSuffix: true })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {lastServiceType}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Controls */}
      {filteredJobs.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="carpet">Carpet Cleaning</SelectItem>
                <SelectItem value="tile">Tile & Grout</SelectItem>
                <SelectItem value="upholstery">Upholstery</SelectItem>
                <SelectItem value="air duct">Air Duct Cleaning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{filteredJobs.length} service{filteredJobs.length !== 1 ? 's' : ''} completed</span>
          </div>
        </div>
      )}

      {/* Service History Timeline */}
      <div className="space-y-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => {
            const beforePhotos = job.photos?.filter(p => p.type === 'before') || []
            const afterPhotos = job.photos?.filter(p => p.type === 'after') || []
            const displayDate = job.completed_date || job.scheduled_date
            const serviceDate = new Date(displayDate)

            return (
              <Card key={job.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Left: Date Badge */}
                    <div className="bg-blue-600 text-white p-6 md:w-32 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold">
                        {serviceDate.getDate()}
                      </div>
                      <div className="text-sm uppercase tracking-wide">
                        {serviceDate.toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      {index === 0 && (
                        <Badge className="mt-2 bg-white text-blue-600 text-xs hover:bg-white">
                          Most Recent
                        </Badge>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            {job.services?.map((s) => s.service?.name).join(', ') || 'Service'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              Dirt Free Team
                            </span>
                            <span>{formatCurrency(job.total_amount)}</span>
                          </div>
                        </div>

                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>

                      {/* Service Notes */}
                      {job.notes && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-medium mb-1 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            Service Notes
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {job.notes}
                          </p>
                        </div>
                      )}

                      {/* Before/After Photos */}
                      {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Camera className="h-4 w-4 text-blue-600" />
                            Service Photos ({beforePhotos.length + afterPhotos.length})
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {beforePhotos.map((photo, photoIndex) => (
                              <div
                                key={photo.id}
                                className="relative group cursor-pointer h-32 rounded-lg border overflow-hidden"
                                onClick={() => openPhotoModal([...beforePhotos, ...afterPhotos], photo.url)}
                              >
                                <OptimizedImage
                                  src={photo.url}
                                  alt="Before photo"
                                  fill
                                  objectFit="cover"
                                  priority={photoIndex < 2}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                                  <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <Badge className="absolute top-2 left-2 text-xs">
                                  Before
                                </Badge>
                              </div>
                            ))}
                            {afterPhotos.map((photo, photoIndex) => (
                              <div
                                key={photo.id}
                                className="relative group cursor-pointer h-32 rounded-lg border overflow-hidden"
                                onClick={() => openPhotoModal([...beforePhotos, ...afterPhotos], photo.url)}
                              >
                                <OptimizedImage
                                  src={photo.url}
                                  alt="After photo"
                                  fill
                                  objectFit="cover"
                                  priority={beforePhotos.length + photoIndex < 4}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                                  <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <Badge className="absolute top-2 left-2 text-xs bg-green-600 hover:bg-green-600">
                                  After
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push('/dashboard/invoices')}
                        >
                          <Receipt className="h-4 w-4 mr-2" />
                          View Invoice
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push('/dashboard/appointments')}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Again
                        </Button>
                        {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Download all photos
                              const allServicePhotos = [...beforePhotos, ...afterPhotos]
                              allServicePhotos.forEach(photo => {
                                const link = document.createElement('a')
                                link.href = photo.url
                                link.download = `service-photo-${photo.id}`
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                              })
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Photos
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="py-12 text-center"
              >
                <div className="mb-6">
                  <div className="relative inline-flex">
                    {/* Animated glow effect */}
                    <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-full p-8 border border-blue-200">
                      <History className="h-16 w-16 text-blue-600" />
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">
                  Your service history will appear here
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  After your first service, you'll be able to view detailed records,
                  before/after photos, and technician notes from all your appointments.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    asChild
                    className="transition-all hover:scale-105 hover:shadow-lg"
                  >
                    <Link href="/dashboard/appointments">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Your First Service
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="transition-all hover:scale-105"
                  >
                    <Link href="/dashboard">
                      Return to Dashboard
                    </Link>
                  </Button>
                </div>

                {/* What You'll See Preview */}
                <div className="mt-12 max-w-2xl mx-auto">
                  <p className="text-sm font-medium text-muted-foreground mb-4">
                    What you'll see after your first service:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    {/* Before & After Photos - Blue */}
                    <div className="flex items-start gap-3 bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-default">
                      <div className="bg-blue-600 p-2 rounded-lg">
                        <Camera className="h-6 w-6 text-white flex-shrink-0" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">Before & After Photos</p>
                        <p className="text-xs text-muted-foreground">
                          Visual proof of our work
                        </p>
                      </div>
                    </div>

                    {/* Service Reports - Green */}
                    <div className="flex items-start gap-3 bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-default">
                      <div className="bg-green-600 p-2 rounded-lg">
                        <FileText className="h-6 w-6 text-white flex-shrink-0" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">Service Reports</p>
                        <p className="text-xs text-muted-foreground">
                          Detailed completion notes
                        </p>
                      </div>
                    </div>

                    {/* Care Recommendations - Amber */}
                    <div className="flex items-start gap-3 bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-lg border border-amber-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-default">
                      <div className="bg-amber-600 p-2 rounded-lg">
                        <Lightbulb className="h-6 w-6 text-white flex-shrink-0" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">Care Recommendations</p>
                        <p className="text-xs text-muted-foreground">
                          Tips to maintain results
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust Elements */}
                <div className="mt-8 pt-6 border-t">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>30+ Years Experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Chemical-Free Cleaning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Satisfaction Guaranteed</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
      </div>

      {/* Photo Lightbox Modal */}
      <Dialog open={photoModalOpen} onOpenChange={setPhotoModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Service Photos</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {selectedPhoto && (
              <OptimizedImage
                src={selectedPhoto}
                alt="Service photo"
                fill
                objectFit="contain"
                priority
              />
            )}
          </div>
          {allPhotos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {allPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className={cn(
                    "h-20 w-20 rounded cursor-pointer border-2 flex-shrink-0 overflow-hidden",
                    selectedPhoto === photo.url ? "border-blue-600" : "border-transparent"
                  )}
                  onClick={() => setSelectedPhoto(photo.url)}
                >
                  <OptimizedImage
                    src={photo.url}
                    alt={`${photo.type} photo`}
                    width={80}
                    height={80}
                    objectFit="cover"
                  />
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
