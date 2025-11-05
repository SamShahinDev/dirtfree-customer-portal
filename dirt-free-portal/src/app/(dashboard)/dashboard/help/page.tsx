import { Metadata } from 'next'
import { Phone, Mail, Clock, HelpCircle, BookOpen, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PrintButton } from '@/components/help/print-button'

export const metadata: Metadata = {
  title: 'Help & Support | Dirt Free Carpet',
  description: 'Get help with your Dirt Free Carpet customer portal',
}

export default function HelpPage() {
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Help & Support</h1>
        </div>
        <p className="text-muted-foreground">
          Everything you need to know about using your Dirt Free Carpet customer portal
        </p>
      </div>

      {/* Contact Information Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Need Immediate Help?
          </CardTitle>
          <CardDescription>Contact our support team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Phone */}
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Phone</p>
                <a
                  href="tel:713-730-2782"
                  className="text-primary hover:underline"
                >
                  (713) 730-2782
                </a>
                <p className="text-xs text-muted-foreground mt-1">
                  Best for urgent matters
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Email</p>
                <a
                  href="mailto:support@dirtfreecarpet.com"
                  className="text-primary hover:underline text-sm"
                >
                  support@dirtfreecarpet.com
                </a>
                <p className="text-xs text-muted-foreground mt-1">
                  Response within 1 business day
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Business Hours</p>
                <div className="text-sm space-y-0.5">
                  <p>Mon-Fri: 8am-6pm</p>
                  <p>Sat: 9am-2pm</p>
                  <p>Sun: 10am-4pm</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <a href="#getting-started" className="text-primary hover:underline">
                  Getting Started
                </a>
              </li>
              <li>
                <a href="#booking-appointments" className="text-primary hover:underline">
                  Booking Appointments
                </a>
              </li>
              <li>
                <a href="#managing-invoices" className="text-primary hover:underline">
                  Managing Invoices
                </a>
              </li>
              <li>
                <a href="#loyalty-rewards" className="text-primary hover:underline">
                  Loyalty Rewards Program
                </a>
              </li>
              <li>
                <a href="#account-settings" className="text-primary hover:underline">
                  Account Settings
                </a>
              </li>
              <li>
                <a href="#troubleshooting" className="text-primary hover:underline">
                  Troubleshooting
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a
                href="/docs/USER_GUIDE.md"
                download
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                Download Full User Guide
              </a>
              <PrintButton />
              <a
                href="/dashboard/messages"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                Send Us a Message
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Main Content */}
      <div className="prose prose-slate max-w-none">
        {/* Getting Started */}
        <section id="getting-started" className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Getting Started
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Creating Your Account</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Visit the customer portal login page</li>
            <li>Click "Sign Up" or "Create Account"</li>
            <li>Enter your information (name, email, phone, password)</li>
            <li>Check your email for a verification link</li>
            <li>Click the verification link to activate your account</li>
            <li>Complete your profile setup with your service address</li>
          </ol>

          <h3 className="text-xl font-semibold mt-6 mb-3">Logging In</h3>
          <p className="text-muted-foreground">
            Go to the portal login page, enter your email and password, then click "Log In".
            Your session will remain active for your convenience, but we recommend logging out when using shared devices.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Forgot Your Password?</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Click "Forgot Password?" on the login page</li>
            <li>Enter your registered email address</li>
            <li>Check your inbox for a password reset link (valid for 1 hour)</li>
            <li>Click the link and create a new secure password</li>
            <li>Log in with your new password</li>
          </ol>
        </section>

        {/* Booking Appointments */}
        <section id="booking-appointments" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Booking Appointments</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">How to Book a Service</h3>
          <div className="space-y-4 text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">Step 1: Select Service Type</p>
              <p>Click "Book Appointment" from the dashboard and choose your service (Carpet Cleaning, Tile & Grout, Upholstery, etc.)</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Step 2: Service Details</p>
              <p>Enter room count or square footage, add special requests, and upload photos if needed</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Step 3: Choose Date & Time</p>
              <p>View available slots and select your preferred date and time</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Step 4: Review & Confirm</p>
              <p>Double-check details, review estimated cost, and confirm your appointment</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Rescheduling & Cancellation Policy</h3>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-semibold mb-2">Cancellation Policy:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>24+ hours notice:</strong> No charge</li>
              <li><strong>Less than 24 hours:</strong> $50 cancellation fee</li>
              <li><strong>No-show:</strong> Full service charge applies</li>
            </ul>
          </div>
        </section>

        {/* Managing Invoices */}
        <section id="managing-invoices" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Managing Invoices</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Paying an Invoice</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Go to "Invoices" and click on an unpaid invoice</li>
            <li>Click "Pay Now"</li>
            <li>Choose or add a payment method (Visa, Mastercard, Amex, Discover)</li>
            <li>Review total and click "Process Payment"</li>
            <li>Receive payment confirmation and receipt</li>
          </ol>

          <p className="mt-4 text-sm text-muted-foreground">
            💳 <strong>Payment is secure:</strong> We use Stripe's industry-leading payment processing with bank-level encryption.
          </p>
        </section>

        {/* Loyalty Rewards */}
        <section id="loyalty-rewards" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Loyalty Rewards Program</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Earning Points</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Service completed:</strong> 1 point per dollar spent</li>
            <li><strong>Leave a review:</strong> 10 bonus points</li>
            <li><strong>Refer a friend:</strong> 50 points when they book</li>
            <li><strong>Birthday bonus:</strong> 20 points annually</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Redeeming Rewards</h3>
          <p className="text-muted-foreground">
            Go to "Loyalty Rewards", browse available rewards, and click "Redeem Now" on your desired reward.
            You can apply it to your next booking or save it for later.
          </p>
        </section>

        {/* Account Settings */}
        <section id="account-settings" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Account Settings</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Updating Your Profile</h3>
          <p className="text-muted-foreground">
            Go to "Account" → "Profile" to update your name, email, phone number, or address. Click "Save Changes" when done.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Managing Payment Methods</h3>
          <p className="text-muted-foreground">
            Go to "Account" → "Payment Methods" to add, remove, or set a default payment method.
            Card information is securely stored by Stripe - we never see your full card number.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Notification Preferences</h3>
          <p className="text-muted-foreground">
            Control how you want to hear from us in "Account" → "Notifications".
            Choose email, SMS, or push notifications for appointment reminders, invoices, and special offers.
          </p>
        </section>

        {/* Troubleshooting */}
        <section id="troubleshooting" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Troubleshooting</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Can't Log In?</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Verify email address and password are correct</li>
            <li>Check Caps Lock is off</li>
            <li>Try "Forgot Password" to reset</li>
            <li>Clear browser cache and cookies</li>
            <li>Try a different browser or incognito mode</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Payment Not Processing?</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Verify card details are correct</li>
            <li>Check card has sufficient funds</li>
            <li>Ensure card hasn't expired</li>
            <li>Verify billing ZIP code matches bank records</li>
            <li>Try a different payment method or contact your bank</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Not Receiving Notifications?</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Check spam/junk folder for emails</li>
            <li>Verify contact information in account settings</li>
            <li>Check notification preferences are enabled</li>
            <li>For SMS: Ensure phone carrier isn't blocking messages</li>
          </ul>
        </section>

        {/* Mobile App Setup */}
        <section id="mobile-app" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Mobile App Setup</h2>

          <p className="text-muted-foreground mb-4">
            Turn your Customer Portal into a mobile app - no app store needed!
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Install on iPhone (iOS)</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Open Safari browser and go to the portal login page</li>
            <li>Tap the Share button (box with arrow)</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" - icon appears on your home screen!</li>
          </ol>

          <h3 className="text-xl font-semibold mt-6 mb-3">Install on Android</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Open Chrome browser and go to the portal login page</li>
            <li>Tap the menu (three dots)</li>
            <li>Select "Add to Home screen"</li>
            <li>Tap "Add" to confirm - icon appears on your home screen!</li>
          </ol>
        </section>
      </div>

      {/* Footer Contact */}
      <Separator className="my-8" />

      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
          <CardDescription>Our support team is here for you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <a href="tel:713-730-2782">
                <Phone className="mr-2 h-4 w-4" />
                Call (713) 730-2782
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:support@dirtfreecarpet.com">
                <Mail className="mr-2 h-4 w-4" />
                Email Support
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard/messages">
                <Mail className="mr-2 h-4 w-4" />
                Send Message
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
