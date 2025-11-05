// src/app/(dashboard)/dashboard/history/page.tsx
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  History,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Link,
} from 'lucide-react';
import { format } from 'date-fns';

// ============================================================================
// Types
// ============================================================================

interface Job {
  id: string;
  service_type: string;
  status: string;
  scheduled_date?: string;
  created_at: string;
  linked_to_portal?: boolean;
  portal_linked_at?: string;
  estimated_price?: number;
  final_price?: number;
  notes?: string;
  room_count?: number;
  square_footage?: number;
  invoices?: Invoice[];
}

interface Invoice {
  id: string;
  status: string;
  total_amount: number;
  paid_at?: string;
  created_at: string;
}

// ============================================================================
// Main Page Component
// ============================================================================

export default async function HistoryPage() {
  const supabase = createClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Get customer record
  const { data: customer } = await supabase
    .from('customers')
    .select('*, portal_account_created_at')
    .eq('portal_user_id', user.id)
    .single();

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No Customer Record Found</h2>
          <p className="text-muted-foreground">
            Please contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  // Get all jobs with invoices
  const { data: jobs = [] } = await supabase
    .from('jobs')
    .select(`
      *,
      invoices (*)
    `)
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  // Separate pre-portal vs post-portal bookings
  const portalCreatedDate = customer.portal_account_created_at
    ? new Date(customer.portal_account_created_at)
    : new Date();

  const prePortalJobs = jobs.filter(
    job =>
      job.linked_to_portal === true ||
      (new Date(job.created_at) < portalCreatedDate && !job.linked_to_portal)
  );

  const portalJobs = jobs.filter(
    job =>
      !job.linked_to_portal &&
      new Date(job.created_at) >= portalCreatedDate
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking History</h1>
        <p className="text-muted-foreground mt-2">
          View all your past and upcoming appointments
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Bookings</CardDescription>
            <CardTitle className="text-3xl">{jobs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Previous Bookings</CardDescription>
            <CardTitle className="text-3xl">{prePortalJobs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Portal Bookings</CardDescription>
            <CardTitle className="text-3xl">{portalJobs.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Previous Bookings Section */}
      {prePortalJobs.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <History className="h-5 w-5" />
                  Previous Bookings ({prePortalJobs.length})
                </CardTitle>
                <CardDescription className="text-blue-700 mt-1">
                  These bookings were made before you created your portal account
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Link className="h-3 w-3 mr-1" />
                Linked
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prePortalJobs.map(job => (
                <JobCard key={job.id} job={job} isPreviousBooking={true} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portal Bookings Section */}
      {portalJobs.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Portal Bookings ({portalJobs.length})
            </CardTitle>
            <CardDescription>
              Bookings made through your customer portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portalJobs.map(job => (
                <JobCard key={job.id} job={job} isPreviousBooking={false} />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Portal Bookings Yet</h3>
              <p className="text-muted-foreground mb-4">
                Book your next appointment through the portal for faster service
              </p>
              <Button>Book New Appointment</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Bookings At All */}
      {jobs.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Booking History</h2>
              <p className="text-muted-foreground mb-6">
                You haven't booked any services with us yet
              </p>
              <Button size="lg">Book Your First Appointment</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// Job Card Component
// ============================================================================

function JobCard({ job, isPreviousBooking }: { job: Job; isPreviousBooking: boolean }) {
  const statusColors = {
    pending_confirmation: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    canceled: 'bg-gray-100 text-gray-700',
  };

  const statusIcons = {
    pending_confirmation: Clock,
    confirmed: CheckCircle2,
    in_progress: Clock,
    completed: CheckCircle2,
    canceled: AlertCircle,
  };

  const StatusIcon = statusIcons[job.status as keyof typeof statusIcons] || Clock;

  const serviceLabels: Record<string, string> = {
    carpet_cleaning: 'Carpet Cleaning',
    tile_grout: 'Tile & Grout',
    upholstery: 'Upholstery',
    area_rug: 'Area Rug',
    water_damage: 'Water Damage',
    pet_treatment: 'Pet Treatment',
    scotchgard: 'Scotchgard',
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg border">
      <div className="flex-shrink-0">
        <div className={`p-3 rounded-lg ${statusColors[job.status as keyof typeof statusColors] || 'bg-gray-100'}`}>
          <StatusIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">
                {serviceLabels[job.service_type] || job.service_type}
              </h3>
              {isPreviousBooking && (
                <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                  <Link className="h-3 w-3 mr-1" />
                  Linked
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              {job.scheduled_date && (
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(job.scheduled_date), 'PPP')}
                </p>
              )}
              {(job.room_count || job.square_footage) && (
                <p>
                  {job.room_count && `${job.room_count} room${job.room_count !== 1 ? 's' : ''}`}
                  {job.room_count && job.square_footage && ' • '}
                  {job.square_footage && `${job.square_footage} sq ft`}
                </p>
              )}
              <p className="text-xs">
                Booked on {format(new Date(job.created_at), 'PP')}
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <Badge className={statusColors[job.status as keyof typeof statusColors] || 'bg-gray-100'}>
              {job.status.replace('_', ' ')}
            </Badge>
            {(job.final_price || job.estimated_price) && (
              <p className="mt-2 font-semibold">
                ${job.final_price || job.estimated_price}
              </p>
            )}
          </div>
        </div>

        {job.notes && (
          <p className="mt-2 text-sm text-muted-foreground italic">
            "{job.notes}"
          </p>
        )}

        {job.invoices && job.invoices.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Invoice</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">${job.invoices[0].total_amount}</span>
                <Badge
                  variant={job.invoices[0].status === 'paid' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {job.invoices[0].status}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mt-3">
          <Button variant="outline" size="sm">
            View Details
          </Button>
          {job.status === 'completed' && (
            <Button variant="ghost" size="sm">
              Rebook Service
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
