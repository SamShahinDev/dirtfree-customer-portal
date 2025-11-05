'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, LogOut, Phone } from 'lucide-react'
import { toast } from 'sonner'

export function CustomerNotFound() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Account Not Found</CardTitle>
          <CardDescription className="text-base mt-2">
            We couldn't find a customer account associated with your login credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <p className="font-semibold mb-2">What this means:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>You may be using incorrect login credentials</li>
              <li>Your account may not be set up yet</li>
              <li>There may be a mismatch between your email and customer record</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleLogout}
              className="w-full gap-2"
              size="lg"
            >
              <LogOut className="h-5 w-5" />
              Sign Out & Try Again
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2"
              size="lg"
              asChild
            >
              <a href="tel:7137302782">
                <Phone className="h-5 w-5" />
                Call Support: (713) 730-2782
              </a>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>Need help? Our team is available to assist you with account setup.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
