// src/components/dashboard/AccountLinkingBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, CheckCircle, Loader2, Calendar, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface LinkCheckResult {
  canLink: boolean;
  alreadyLinked?: boolean;
  potentialMatch?: {
    customerId: string;
    customerName: string;
    jobCount: number;
  };
  message?: string;
}

interface LinkResult {
  success: boolean;
  customer: {
    id: string;
    name: string;
    email: string;
    linkedJobs: number;
    linkedInvoices: number;
    welcomePoints: number;
  };
  message: string;
}

// ============================================================================
// Component
// ============================================================================

export function AccountLinkingBanner() {
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [canLink, setCanLink] = useState(false);
  const [potentialMatch, setPotentialMatch] = useState<LinkCheckResult['potentialMatch'] | null>(null);
  const [linking, setLinking] = useState(false);
  const [linked, setLinked] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check if user can link on mount
  useEffect(() => {
    checkLinkingEligibility();
  }, []);

  async function checkLinkingEligibility() {
    try {
      const response = await fetch('/api/auth/link-account');
      const data: LinkCheckResult = await response.json();

      if (data.alreadyLinked) {
        // Already linked, don't show banner
        setLinked(true);
        return;
      }

      if (data.canLink && data.potentialMatch) {
        setCanLink(true);
        setPotentialMatch(data.potentialMatch);
      }
    } catch (error) {
      console.error('Eligibility check failed:', error);
    } finally {
      setCheckingEligibility(false);
    }
  }

  async function linkAccount() {
    setLinking(true);

    try {
      const response = await fetch('/api/auth/link-account', {
        method: 'POST',
      });

      const data: LinkResult = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to link account');
      }

      setLinked(true);

      // Show success message with details
      toast.success(data.message, {
        duration: 5000,
        description: (
          <div className="mt-2 space-y-1">
            {data.customer.linkedJobs > 0 && (
              <p className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                {data.customer.linkedJobs} booking{data.customer.linkedJobs !== 1 ? 's' : ''} added to your history
              </p>
            )}
            {data.customer.welcomePoints > 0 && (
              <p className="flex items-center gap-2 text-sm">
                <Gift className="h-4 w-4" />
                {data.customer.welcomePoints} bonus points earned!
              </p>
            )}
          </div>
        ),
      });

      // Refresh the page to show updated history
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Linking failed:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to link account. Please try again.'
      );
    } finally {
      setLinking(false);
    }
  }

  // Don't show banner if:
  // - Still checking eligibility
  // - Already linked
  // - Can't link (no matching customer)
  // - User dismissed it
  if (checkingEligibility || linked || !canLink || dismissed) {
    return null;
  }

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900">
        Have you booked with us before?
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <div className="text-blue-800">
          {potentialMatch && potentialMatch.jobCount > 0 ? (
            <p>
              We found <strong>{potentialMatch.jobCount}</strong> previous booking{potentialMatch.jobCount !== 1 ? 's' : ''}
              {' '}for <strong>{potentialMatch.customerName}</strong>.
              Would you like to add them to your portal account?
            </p>
          ) : (
            <p>
              We found a customer record matching your account.
              Link it to see your complete booking history.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={linkAccount}
            disabled={linking}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {linking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Linking...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Link My Account
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
            disabled={linking}
            className="text-blue-700 hover:text-blue-800 hover:bg-blue-100"
          >
            Not now
          </Button>
        </div>

        {potentialMatch && potentialMatch.jobCount > 0 && (
          <div className="mt-3 p-3 bg-white rounded-md border border-blue-200">
            <p className="text-xs text-blue-700 font-medium mb-1">
              What you'll get:
            </p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Access to {potentialMatch.jobCount} previous booking{potentialMatch.jobCount !== 1 ? 's' : ''}
              </li>
              <li className="flex items-center gap-1.5">
                <Gift className="h-3 w-3" />
                50 bonus loyalty points
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3" />
                Complete service history in one place
              </li>
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

// ============================================================================
// Compact Version (for use in header/sidebar)
// ============================================================================

export function AccountLinkingBadge() {
  const [canLink, setCanLink] = useState(false);
  const [jobCount, setJobCount] = useState(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkLinkingEligibility();
  }, []);

  async function checkLinkingEligibility() {
    try {
      const response = await fetch('/api/auth/link-account');
      const data: LinkCheckResult = await response.json();

      if (data.canLink && data.potentialMatch) {
        setCanLink(true);
        setJobCount(data.potentialMatch.jobCount);
      }
    } catch (error) {
      console.error('Eligibility check failed:', error);
    } finally {
      setChecking(false);
    }
  }

  if (checking || !canLink) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
      <Info className="h-3 w-3" />
      {jobCount > 0 ? `${jobCount} previous booking${jobCount !== 1 ? 's' : ''} found` : 'Link your account'}
    </div>
  );
}

// ============================================================================
// Success Message Component
// ============================================================================

export function AccountLinkedSuccess({
  linkedJobs,
  welcomePoints,
}: {
  linkedJobs: number;
  welcomePoints: number;
}) {
  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-900">
        Account successfully linked!
      </AlertTitle>
      <AlertDescription className="mt-2 text-green-800">
        <div className="space-y-2">
          <p>
            Your portal account has been linked to your previous bookings.
          </p>
          {linkedJobs > 0 && (
            <p className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              {linkedJobs} booking{linkedJobs !== 1 ? 's' : ''} added to your history
            </p>
          )}
          {welcomePoints > 0 && (
            <p className="flex items-center gap-2 text-sm font-medium">
              <Gift className="h-4 w-4" />
              {welcomePoints} bonus points added to your account
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
