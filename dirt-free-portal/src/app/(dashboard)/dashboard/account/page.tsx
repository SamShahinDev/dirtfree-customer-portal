'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  User,
  MapPin,
  Lock,
  Shield,
  Bell,
  CreditCard,
  Plus,
  Calendar,
  CheckCircle,
  Gift,
  AlertTriangle,
  Check
} from 'lucide-react'
import { toast } from 'sonner'

export default function AccountPage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<any>(null)
  const [totalVisits, setTotalVisits] = useState(0)
  const [loyaltyPoints, setLoyaltyPoints] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_e164: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
  })

  const supabase = createClient()

  useEffect(() => {
    loadCustomerData()
  }, [])

  const loadCustomerData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('email', user.email)
      .single()

    if (customerData) {
      setCustomer(customerData)
      setFormData({
        name: customerData.name || '',
        email: customerData.email || '',
        phone_e164: customerData.phone_e164 || '',
        address_line1: customerData.address_line1 || '',
        address_line2: customerData.address_line2 || '',
        city: customerData.city || '',
        state: customerData.state || '',
        postal_code: customerData.postal_code || '',
      })

      // Get total visits
      const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customerData.id)
        .eq('status', 'completed')
      setTotalVisits(count || 0)

      // Get loyalty points
      const { data: loyalty } = await supabase
        .from('loyalty_points')
        .select('points')
        .eq('customer_id', customerData.id)
        .single()
      setLoyaltyPoints(loyalty?.points || 0)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('customers')
      .update({
        name: formData.name,
        phone_e164: formData.phone_e164,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        updated_at: new Date().toISOString(),
      })
      .eq('email', user?.email)

    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated successfully')
      setIsEditing(false)
    }
    setLoading(false)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Account Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-blue-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-2xl font-bold">{customer?.created_at ? new Date(customer.created_at).getFullYear() : '2024'}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Services</p>
                <p className="text-2xl font-bold">{totalVisits}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Loyalty Points</p>
                <p className="text-2xl font-bold">{loyaltyPoints}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Gift className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </div>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} size="sm">Edit</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setIsEditing(false)
                  loadCustomerData()
                }} size="sm">
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm">Save Changes</Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={formData.phone_e164}
              onChange={(e) => setFormData({ ...formData, phone_e164: e.target.value })}
              disabled={!isEditing}
            />
            <p className="text-xs text-muted-foreground">Format: +1234567890 (E.164 format)</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-green-100">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="font-semibold">Service Address</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_line1">Street Address</Label>
              <Input
                id="address_line1"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_line2">Apt / Suite (Optional)</Label>
              <Input
                id="address_line2"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">ZIP Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password & Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-100">
              <Lock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>Change your password to keep your account secure</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Password Status</p>
                <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Check className="mr-1 h-3 w-3" />
              Secure
            </Badge>
          </div>

          <Button variant="outline" className="w-full sm:w-auto gap-2">
            <Lock className="h-4 w-4" />
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-100">
              <Bell className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive updates and reminders</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive appointment reminders and updates via email
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            {/* SMS Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get text messages for appointment confirmations
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            {/* Marketing Emails */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive special offers and promotions
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your saved payment methods</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/account/payment-methods')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              No saved payment methods yet
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/account/payment-methods')}
            >
              Add Your First Card
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
              <div>
                <p className="font-medium text-red-900">Delete Account</p>
                <p className="text-sm text-red-700">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
