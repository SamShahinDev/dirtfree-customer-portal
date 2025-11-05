# Dirt Free Customer Portal - Complete Build Prompts (60 Total)

**Project:** Dirt Free Carpet Customer Portal  
**Tech Stack:** Next.js 15.5.3, React 19, Supabase, TypeScript, Tailwind CSS, shadcn/ui  
**Build Method:** Sequential prompts via Builder Bot  
**Total Prompts:** 60  
**Estimated Build Time:** 3-4 hours

---

## PHASE 1: PROJECT SETUP & FOUNDATION (Prompts 1-8)

### Enhanced Prompt 1: Initialize Next.js Project

Create a new Next.js 15.5.3 project for the Dirt Free Customer Portal with the following specifications:

```bash
npx create-next-app@latest dirt-free-portal --typescript --tailwind --app --use-npm
```

Project configuration:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Import alias: @/*

After initialization, update `package.json` with these scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

Create initial folder structure:
```
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── booking/
│   └── shared/
├── lib/
│   ├── supabase/
│   └── utils/
└── types/
```

End of prompt

---

### Enhanced Prompt 2: Install Core Dependencies

Install all required dependencies for the Dirt Free Customer Portal:

```bash
npm install @supabase/ssr @supabase/supabase-js
npm install @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-slot @radix-ui/react-dropdown-menu @radix-ui/react-avatar @radix-ui/react-tabs @radix-ui/react-separator @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-toast @radix-ui/react-checkbox @radix-ui/react-popover
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install date-fns react-hook-form @hookform/resolvers zod
npm install stripe @stripe/stripe-js
npm install react-day-picker sonner
npm install tailwindcss-animate
```

Update `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

Update `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

End of prompt

---

### Enhanced Prompt 3: Supabase Configuration

Create Supabase client configuration for the Customer Portal.

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
```

Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component
          }
        },
      },
    }
  )
}
```

Create `src/lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

Create `middleware.ts` in root:
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

End of prompt

---

### Enhanced Prompt 4: Type Definitions

Create TypeScript type definitions for the Customer Portal.

Create `src/types/database.types.ts`:
```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          email: string
          phone: string
          first_name: string
          last_name: string
          address: string
          city: string
          state: string
          zip: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      jobs: {
        Row: {
          id: string
          customer_id: string
          scheduled_date: string
          scheduled_time: string
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          total_amount: number
          notes: string | null
          technician_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>
      }
      invoices: {
        Row: {
          id: string
          customer_id: string
          job_id: string
          amount: number
          status: 'pending' | 'paid' | 'overdue' | 'cancelled'
          due_date: string
          paid_date: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
      }
      loyalty_points: {
        Row: {
          id: string
          customer_id: string
          points: number
          total_earned: number
          total_redeemed: number
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
```

Create `src/types/index.ts`:
```typescript
export interface Customer {
  id: string
  email: string
  phone: string
  first_name: string
  last_name: string
  full_name?: string
  address: string
  city: string
  state: string
  zip: string
  created_at: string
}

export interface Job {
  id: string
  customer_id: string
  scheduled_date: string
  scheduled_time: string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  total_amount: number
  notes: string | null
  technician_name?: string
  services?: Service[]
}

export interface Service {
  id: string
  name: string
  description: string
  base_price: number
}

export interface Invoice {
  id: string
  customer_id: string
  job_id: string
  amount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  paid_date: string | null
  created_at: string
}

export interface LoyaltyPoints {
  id: string
  customer_id: string
  points: number
  total_earned: number
  total_redeemed: number
}

export interface Appointment {
  id: string
  date: string
  time: string
  service: string
  technician: string
  status: string
  amount: number
}

export interface Message {
  id: string
  customer_id: string
  subject: string
  message: string
  status: 'open' | 'responded' | 'closed'
  created_at: string
  response?: string
  response_date?: string
}

export interface Reward {
  id: string
  name: string
  description: string
  points_required: number
  type: 'discount' | 'free_service' | 'upgrade'
  value: number
}
```

End of prompt

---

### Enhanced Prompt 5: Utility Functions

Create utility functions for the Customer Portal.

Create `src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function calculateLoyaltyReward(points: number): number {
  return Math.floor(points / 100) * 10
}
```

End of prompt

---

### Enhanced Prompt 6: shadcn/ui Component Setup

Initialize shadcn/ui and create component configuration.

Create `components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "blue",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Create essential shadcn/ui components manually in `src/components/ui/`:

1. `button.tsx` - Button component
2. `card.tsx` - Card component
3. `input.tsx` - Input component
4. `label.tsx` - Label component
5. `badge.tsx` - Badge component
6. `avatar.tsx` - Avatar component
7. `separator.tsx` - Separator component
8. `dialog.tsx` - Dialog component
9. `dropdown-menu.tsx` - Dropdown menu
10. `tabs.tsx` - Tabs component

Note: Copy these from shadcn/ui documentation or use the CLI to install them.

End of prompt

---

### Enhanced Prompt 7: Root Layout and Environment Setup

Create the root layout and environment configuration.

Update `src/app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Customer Portal - Dirt Free Carpet",
  description: "Manage your appointments, view invoices, and track your loyalty rewards",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

Create `.env.example`:
```env
# Supabase Configuration (Shared with CRM)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe Payment Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WEBSITE_URL=https://dirtfreecarpet.com
```

Create `.gitignore`:
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

End of prompt

---

### Enhanced Prompt 8: Initial Git Commit

Initialize git repository and create README.

Create `README.md`:
```markdown
# Dirt Free Customer Portal

Self-service customer portal for Dirt Free Carpet customers.

## Features
- 📅 Book and manage appointments
- 💳 View and pay invoices
- 🎁 Track loyalty points and rewards
- 💬 Communicate with the team
- 📄 Access service history and documents

## Tech Stack
- Next.js 15.5.3
- React 19
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth + Database)
- Stripe (Payments)

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

3. Run development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000)
```

Initialize git:
```bash
git init
git add .
git commit -m "Initial Customer Portal setup - Phase 1 complete"
```

End of prompt

---

## PHASE 2: AUTHENTICATION & LAYOUT (Prompts 9-11)

### Enhanced Prompt 9: Login Page

Create the customer login page with email/password authentication.

Create `src/app/(auth)/login/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">DF</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Customer Portal</CardTitle>
          <CardDescription>
            Sign in to manage your appointments and view your service history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>
              Need help?{' '}
              <a
                href="tel:7137302782"
                className="text-primary hover:underline"
              >
                Call (713) 730-2782
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

Create auth layout `src/app/(auth)/layout.tsx`:
```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```

End of prompt

---

### Enhanced Prompt 10: Dashboard Sidebar Component

Create the dashboard sidebar navigation component.

Create `src/components/dashboard/sidebar.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Calendar,
  Receipt,
  User,
  Gift,
  MessageSquare,
  FileText,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
  { name: 'Account', href: '/dashboard/account', icon: User },
  { name: 'Loyalty Rewards', href: '/dashboard/rewards', icon: Gift },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-white">DF</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Dirt Free</h2>
            <p className="text-xs text-muted-foreground">Customer Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
```

Create `src/components/dashboard/header.tsx`:
```typescript
'use client'

import { Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface HeaderProps {
  customerName?: string
  onMenuClick?: () => void
}

export function Header({ customerName = 'Customer', onMenuClick }: HeaderProps) {
  const initials = customerName.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <header className="h-16 border-b bg-white">
      <div className="flex h-full items-center justify-between px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="hidden lg:block">
          {/* Breadcrumb or title */}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right text-sm">
              <p className="font-medium">{customerName}</p>
            </div>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}
```

End of prompt

---

### Enhanced Prompt 11: Dashboard Layout

Create the main dashboard layout structure.

Create `src/app/(dashboard)/layout.tsx`:
```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch customer data
  const { data: customer } = await supabase
    .from('customers')
    .select('first_name, last_name')
    .eq('email', user.email)
    .single()

  const customerName = customer 
    ? `${customer.first_name} ${customer.last_name}`
    : user.email?.split('@')[0] || 'Customer'

  return (
    <div className="h-screen flex">
      <aside className="hidden lg:block">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header customerName={customerName} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
```

Create placeholder `src/app/page.tsx`:
```typescript
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
```

End of prompt

---

## PHASE 3: DASHBOARD & OVERVIEW (Prompts 12-15)

### Enhanced Prompt 12: Dashboard Overview Page

Create the main dashboard page with overview widgets.

Create `src/app/(dashboard)/dashboard/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Calendar, Receipt, Gift, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get customer
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  if (!customer) {
    return <div>Customer not found</div>
  }

  // Get next appointment
  const { data: nextAppointment } = await supabase
    .from('jobs')
    .select('*, services:job_services(service:services(name))')
    .eq('customer_id', customer.id)
    .in('status', ['scheduled', 'confirmed'])
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time', { ascending: true })
    .limit(1)
    .single()

  // Get total visits
  const { count: totalVisits } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customer.id)
    .eq('status', 'completed')

  // Get loyalty points
  const { data: loyalty } = await supabase
    .from('loyalty_points')
    .select('points')
    .eq('customer_id', customer.id)
    .single()

  // Get outstanding balance
  const { data: invoices } = await supabase
    .from('invoices')
    .select('amount')
    .eq('customer_id', customer.id)
    .in('status', ['pending', 'overdue'])

  const outstandingBalance = invoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0

  // Get recent jobs
  const { data: recentJobs } = await supabase
    .from('jobs')
    .select('*, services:job_services(service:services(name))')
    .eq('customer_id', customer.id)
    .eq('status', 'completed')
    .order('scheduled_date', { ascending: false })
    .limit(3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome Back!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your account
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Appointment
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <>
                <div className="text-2xl font-bold">
                  {formatDate(nextAppointment.scheduled_date)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatTime(nextAppointment.scheduled_time)} - {nextAppointment.services?.[0]?.service?.name}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming appointments</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits || 0}</div>
            <p className="text-xs text-muted-foreground">
              Completed services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyalty?.points || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency((loyalty?.points || 0) / 100)} in rewards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(outstandingBalance)}
            </div>
            <p className={`text-xs ${outstandingBalance === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
              {outstandingBalance === 0 ? 'All caught up!' : 'Payment pending'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button asChild className="h-24 flex-col gap-2">
            <Link href="/dashboard/appointments/new">
              <Calendar className="h-6 w-6" />
              <span>Book Appointment</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 flex-col gap-2">
            <Link href="/dashboard/invoices">
              <Receipt className="h-6 w-6" />
              <span>View Invoices</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 flex-col gap-2">
            <Link href="/dashboard/rewards">
              <Gift className="h-6 w-6" />
              <span>Redeem Rewards</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Service History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentJobs && recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">
                      {job.services?.map(s => s.service?.name).join(', ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(job.scheduled_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(job.total_amount)}</p>
                    <p className="text-xs text-green-600">Completed</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No service history yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 13: Appointments List Page

Create the appointments listing page.

Create `src/app/(dashboard)/dashboard/appointments/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Calendar, Clock, MapPin, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils'

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('email', user?.email)
    .single()

  if (!customer) {
    return <div>Customer not found</div>
  }

  const { data: upcomingAppointments } = await supabase
    .from('jobs')
    .select('*, services:job_services(service:services(name)), technician:technicians(first_name, last_name)')
    .eq('customer_id', customer.id)
    .in('status', ['scheduled', 'confirmed', 'in_progress'])
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .order('scheduled_date', { ascending: true })

  const { data: pastAppointments } = await supabase
    .from('jobs')
    .select('*, services:job_services(service:services(name)), technician:technicians(first_name, last_name)')
    .eq('customer_id', customer.id)
    .in('status', ['completed', 'cancelled'])
    .order('scheduled_date', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your upcoming and past appointments
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/appointments/new">
            <Calendar className="mr-2 h-4 w-4" />
            Book New Appointment
          </Link>
        </Button>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingAppointments && upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-start justify-between p-4 rounded-lg border hover:border-primary transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">
                      {appointment.services?.map(s => s.service?.name).join(', ')}
                    </h3>
                    <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(appointment.scheduled_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTime(appointment.scheduled_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {appointment.technician 
                        ? `${appointment.technician.first_name} ${appointment.technician.last_name}`
                        : 'TBD'}
                    </span>
                  </div>
                  <p className="flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4" />
                    {customer.address}, {customer.city}, {customer.state}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Reschedule</Button>
                  <Button variant="ghost" size="sm">Cancel</Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming appointments</p>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Past Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pastAppointments && pastAppointments.length > 0 ? (
            pastAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-start justify-between p-4 rounded-lg border opacity-75"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">
                      {appointment.services?.map(s => s.service?.name).join(', ')}
                    </h3>
                    <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatDate(appointment.scheduled_date)}</span>
                    <span>{formatTime(appointment.scheduled_time)}</span>
                    <span>
                      {appointment.technician 
                        ? `${appointment.technician.first_name} ${appointment.technician.last_name}`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">View Details</Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No past appointments</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 14: Invoices List Page

Create the invoices listing page.

Create `src/app/(dashboard)/dashboard/invoices/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Receipt, Download, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusColors = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  if (!customer) {
    return <div>Customer not found</div>
  }

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, job:jobs(services:job_services(service:services(name)))')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })

  const totalOwed = invoices
    ?.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.amount, 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">
          View and manage your invoices and payments
        </p>
      </div>

      {/* Summary Card */}
      {totalOwed > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Outstanding Balance</p>
                <p className="text-3xl font-bold text-yellow-800">
                  {formatCurrency(totalOwed)}
                </p>
              </div>
              <Button>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <Receipt className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Invoice #{invoice.id.slice(0, 8)}</h3>
                        <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invoice.job?.services?.map(s => s.service?.name).join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {invoice.status === 'paid' && invoice.paid_date ? (
                          <>Paid on {formatDate(invoice.paid_date)}</>
                        ) : (
                          <>Due {formatDate(invoice.due_date)}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(invoice.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(invoice.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <Button size="sm">Pay</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No invoices yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 15: Account Profile Page

Create the account profile management page.

Create `src/app/(dashboard)/dashboard/account/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function AccountPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })

  const supabase = createClient()

  useEffect(() => {
    loadCustomerData()
  }, [])

  const loadCustomerData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', user.email)
      .single()

    if (customer) {
      setFormData({
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('customers')
      .update({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
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

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setIsEditing(false)
                  loadCustomerData()
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
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
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Service Address</h3>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            <Lock className="mr-2 h-4 w-4" />
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

## PHASE 4: BOOKING SYSTEM (Prompts 16-22)

### Enhanced Prompt 16: New Appointment - Service Selection

Create service selection step for booking.

Create `src/app/(dashboard)/dashboard/appointments/new/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function NewAppointmentPage() {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('name')

    setServices(data || [])
    setLoading(false)
  }

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleContinue = () => {
    if (selectedServices.length === 0) return
    
    // Store selection in sessionStorage
    sessionStorage.setItem('bookingServices', JSON.stringify(selectedServices))
    router.push('/dashboard/appointments/new/datetime')
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Book an Appointment</h1>
        <p className="text-muted-foreground">Step 1 of 3: Select services</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all ${
              selectedServices.includes(service.id)
                ? 'ring-2 ring-primary'
                : 'hover:border-primary'
            }`}
            onClick={() => toggleService(service.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </div>
                {selectedServices.includes(service.id) && (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                )}
              </div>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold text-primary">
                Starting at {formatCurrency(service.base_price)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button disabled={selectedServices.length === 0} onClick={handleContinue}>
          Continue to Date & Time
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 17: Date & Time Selection Component

Create date and time selection step.

Create `src/app/(dashboard)/dashboard/appointments/new/datetime/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { addDays, format, startOfTomorrow } from 'date-fns'

const TIME_SLOTS = [
  '08:00:00', '09:00:00', '10:00:00', '11:00:00',
  '12:00:00', '13:00:00', '14:00:00', '15:00:00',
  '16:00:00', '17:00:00'
]

export default function DateTimePage() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (selectedDate) {
      checkAvailability(selectedDate)
    }
  }, [selectedDate])

  const checkAvailability = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    
    // Get booked slots for this date
    const { data: bookedJobs } = await supabase
      .from('jobs')
      .select('scheduled_time')
      .eq('scheduled_date', dateStr)
      .in('status', ['scheduled', 'confirmed', 'in_progress'])

    const bookedTimes = bookedJobs?.map(job => job.scheduled_time) || []
    const available = TIME_SLOTS.filter(slot => !bookedTimes.includes(slot))
    
    setAvailableSlots(available)
  }

  const formatTimeSlot = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return
    
    sessionStorage.setItem('bookingDate', format(selectedDate, 'yyyy-MM-dd'))
    sessionStorage.setItem('bookingTime', selectedTime)
    router.push('/dashboard/appointments/new/confirm')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Book an Appointment</h1>
        <p className="text-muted-foreground">Step 2 of 3: Select date & time</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < startOfTomorrow() || date > addDays(new Date(), 60)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle>Select Time</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedTime === slot ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setSelectedTime(slot)}
                    >
                      {formatTimeSlot(slot)}
                    </Button>
                  ))
                ) : (
                  <p className="col-span-2 text-sm text-muted-foreground text-center py-4">
                    No available slots for this date
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Please select a date first
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button disabled={!selectedDate || !selectedTime} onClick={handleContinue}>
          Review Booking
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 18: Booking Confirmation Page

Create booking confirmation and submission.

Create `src/app/(dashboard)/dashboard/appointments/new/confirm/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, MapPin, Loader2, CheckCircle } from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { toast } from 'sonner'

export default function ConfirmBookingPage() {
  const [services, setServices] = useState<any[]>([])
  const [customer, setCustomer] = useState<any>(null)
  const [date, setDate] = useState<string>('')
  const [time, setTime] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadBookingData()
  }, [])

  const loadBookingData = async () => {
    // Get booking data from sessionStorage
    const serviceIds = JSON.parse(sessionStorage.getItem('bookingServices') || '[]')
    const bookingDate = sessionStorage.getItem('bookingDate') || ''
    const bookingTime = sessionStorage.getItem('bookingTime') || ''

    setDate(bookingDate)
    setTime(bookingTime)

    // Load services
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .in('id', serviceIds)

    setServices(servicesData || [])

    // Load customer
    const { data: { user } } = await supabase.auth.getUser()
    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('email', user?.email)
      .single()

    setCustomer(customerData)
    setLoading(false)
  }

  const totalAmount = services.reduce((sum, service) => sum + service.base_price, 0)

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      // Create job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          customer_id: customer.id,
          scheduled_date: date,
          scheduled_time: time,
          status: 'scheduled',
          total_amount: totalAmount,
          notes: notes || null,
        })
        .select()
        .single()

      if (jobError) throw jobError

      // Create job_services entries
      const jobServices = services.map(service => ({
        job_id: job.id,
        service_id: service.id,
        quantity: 1,
        price: service.base_price,
      }))

      const { error: servicesError } = await supabase
        .from('job_services')
        .insert(jobServices)

      if (servicesError) throw servicesError

      // Clear sessionStorage
      sessionStorage.removeItem('bookingServices')
      sessionStorage.removeItem('bookingDate')
      sessionStorage.removeItem('bookingTime')

      toast.success('Appointment booked successfully!')
      router.push('/dashboard/appointments')
    } catch (error: any) {
      toast.error(error.message || 'Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Confirm Booking</h1>
        <p className="text-muted-foreground">Step 3 of 3: Review and confirm</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date & Time */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{formatTime(time)}</span>
            </div>
          </div>

          <Separator />

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-3">Selected Services</h3>
            <div className="space-y-2">
              {services.map(service => (
                <div key={service.id} className="flex justify-between items-center">
                  <span>{service.name}</span>
                  <span className="font-medium">{formatCurrency(service.base_price)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>

          <Separator />

          {/* Service Address */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Service Address
            </h3>
            <p className="text-muted-foreground">
              {customer?.address}<br />
              {customer?.city}, {customer?.state} {customer?.zip}
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requests or instructions for our team..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()} disabled={submitting}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Booking
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 19: Calendar UI Component

Install and configure the Calendar component from shadcn/ui.

Create `src/components/ui/calendar.tsx`:
```typescript
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
```

Create `src/components/ui/textarea.tsx`:
```typescript
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
```

End of prompt

---

### Enhanced Prompt 20: Appointment Detail View

Create appointment detail page for viewing individual appointments.

Create `src/app/(dashboard)/dashboard/appointments/[id]/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, MapPin, User, FileText } from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

interface Props {
  params: { id: string }
}

export default async function AppointmentDetailPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('email', user?.email)
    .single()

  const { data: appointment } = await supabase
    .from('jobs')
    .select(`
      *,
      services:job_services(
        quantity,
        price,
        service:services(name, description)
      ),
      technician:technicians(first_name, last_name, phone)
    `)
    .eq('id', params.id)
    .eq('customer_id', customer?.id)
    .single()

  if (!appointment) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Appointment Details</h1>
          <p className="text-muted-foreground">
            Appointment #{appointment.id.slice(0, 8)}
          </p>
        </div>
        <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
          {appointment.status}
        </Badge>
      </div>

      {/* Main Details */}
      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(appointment.scheduled_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">{formatTime(appointment.scheduled_time)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-3">Services</h3>
            <div className="space-y-3">
              {appointment.services?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{item.service?.name}</p>
                    <p className="text-sm text-muted-foreground">{item.service?.description}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.price)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Total Amount</span>
            <span className="font-bold">{formatCurrency(appointment.total_amount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Location & Technician */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Service Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{customer?.address}</p>
            <p>{customer?.city}, {customer?.state} {customer?.zip}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Technician
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointment.technician ? (
              <>
                <p className="font-medium">
                  {appointment.technician.first_name} {appointment.technician.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{appointment.technician.phone}</p>
              </>
            ) : (
              <p className="text-muted-foreground">To be assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {appointment.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Special Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{appointment.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
        <div className="flex gap-4">
          <Button variant="outline">Reschedule</Button>
          <Button variant="destructive">Cancel Appointment</Button>
        </div>
      )}
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 21: Reschedule Appointment Feature

Create reschedule functionality for appointments.

Create `src/app/(dashboard)/dashboard/appointments/[id]/reschedule/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { addDays, format, startOfTomorrow } from 'date-fns'
import { formatTime } from '@/lib/utils'

const TIME_SLOTS = [
  '08:00:00', '09:00:00', '10:00:00', '11:00:00',
  '12:00:00', '13:00:00', '14:00:00', '15:00:00',
  '16:00:00', '17:00:00'
]

interface Props {
  params: { id: string }
}

export default function ReschedulePage({ params }: Props) {
  const [appointment, setAppointment] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadAppointment()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      checkAvailability(selectedDate)
    }
  }, [selectedDate])

  const loadAppointment = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', params.id)
      .single()

    setAppointment(data)
    setLoading(false)
  }

  const checkAvailability = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    
    const { data: bookedJobs } = await supabase
      .from('jobs')
      .select('scheduled_time')
      .eq('scheduled_date', dateStr)
      .neq('id', params.id) // Exclude current appointment
      .in('status', ['scheduled', 'confirmed', 'in_progress'])

    const bookedTimes = bookedJobs?.map(job => job.scheduled_time) || []
    const available = TIME_SLOTS.filter(slot => !bookedTimes.includes(slot))
    
    setAvailableSlots(available)
  }

  const formatTimeSlot = (time: string) => {
    return formatTime(time)
  }

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) return

    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          scheduled_time: selectedTime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)

      if (error) throw error

      toast.success('Appointment rescheduled successfully!')
      router.push(`/dashboard/appointments/${params.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to reschedule appointment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reschedule Appointment</h1>
        <p className="text-muted-foreground">Select a new date and time</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Select New Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < startOfTomorrow() || date > addDays(new Date(), 60)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle>Select New Time</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedTime === slot ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setSelectedTime(slot)}
                    >
                      {formatTimeSlot(slot)}
                    </Button>
                  ))
                ) : (
                  <p className="col-span-2 text-sm text-muted-foreground text-center py-4">
                    No available slots for this date
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Please select a date first
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button 
          disabled={!selectedDate || !selectedTime || submitting} 
          onClick={handleReschedule}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Rescheduling...
            </>
          ) : (
            'Confirm Reschedule'
          )}
        </Button>
      </div>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 22: Cancel Appointment Feature

Create appointment cancellation functionality.

Create `src/app/api/appointments/[id]/cancel/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify appointment belongs to customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .single()

    const { data: appointment } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', params.id)
      .eq('customer_id', customer?.id)
      .single()

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot cancel this appointment' },
        { status: 400 }
      )
    }

    // Update appointment status
    const { error } = await supabase
      .from('jobs')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (error) throw error

    // TODO: Send cancellation notification to customer and staff

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to cancel appointment' },
      { status: 500 }
    )
  }
}
```

Create client-side cancel button component `src/components/appointments/cancel-button.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface CancelButtonProps {
  appointmentId: string
}

export function CancelButton({ appointmentId }: CancelButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      toast.success('Appointment cancelled successfully')
      router.push('/dashboard/appointments')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={loading}>
          Cancel Appointment
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will cancel your appointment. You can always book a new appointment later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No, keep it</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Yes, cancel it'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

Create AlertDialog component `src/components/ui/alert-dialog.tsx` - copy from shadcn/ui.

End of prompt

---

## PHASE 5: LOYALTY & REWARDS (Prompts 23-26)

### Enhanced Prompt 23: Loyalty Rewards Dashboard

Create the loyalty rewards dashboard page.

Create `src/app/(dashboard)/dashboard/rewards/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Gift, TrendingUp, Users, Award } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatCurrency, calculateLoyaltyReward } from '@/lib/utils'

export default async function RewardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  if (!customer) {
    return <div>Customer not found</div>
  }

  // Get loyalty points
  const { data: loyalty } = await supabase
    .from('loyalty_points')
    .select('*')
    .eq('customer_id', customer.id)
    .single()

  const points = loyalty?.points || 0
  const totalEarned = loyalty?.total_earned || 0
  const totalRedeemed = loyalty?.total_redeemed || 0
  const rewardValue = calculateLoyaltyReward(points)

  // Get available rewards
  const { data: rewards } = await supabase
    .from('rewards')
    .select('*')
    .eq('active', true)
    .order('points_required')

  // Get points history
  const { data: pointsHistory } = await supabase
    .from('loyalty_transactions')
    .select('*, job:jobs(scheduled_date)')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculate next reward
  const nextReward = rewards?.find(r => r.points_required > points)
  const progressToNext = nextReward 
    ? (points / nextReward.points_required) * 100
    : 100

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loyalty Rewards</h1>
        <p className="text-muted-foreground">
          Earn points with every service and redeem for rewards
        </p>
      </div>

      {/* Points Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Points
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{points}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(rewardValue)} in rewards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lifetime Earned
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEarned}</div>
            <p className="text-xs text-muted-foreground">
              Total points earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Redeemed
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRedeemed}</div>
            <p className="text-xs text-muted-foreground">
              Points used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Member Since
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2023</div>
            <p className="text-xs text-muted-foreground">
              Loyal customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Reward Progress */}
      {nextReward && (
        <Card>
          <CardHeader>
            <CardTitle>Next Reward</CardTitle>
            <CardDescription>
              {nextReward.points_required - points} more points to unlock {nextReward.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressToNext} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {points} / {nextReward.points_required} points
            </p>
          </CardContent>
        </Card>
      )}

      {/* Available Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Available Rewards</CardTitle>
          <CardDescription>
            Redeem your points for these rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rewards && rewards.length > 0 ? (
              rewards.map((reward) => (
                <Card key={reward.id} className={points >= reward.points_required ? '' : 'opacity-50'}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{reward.name}</CardTitle>
                      {points >= reward.points_required && (
                        <Badge>Available</Badge>
                      )}
                    </div>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cost</span>
                      <span className="font-bold">{reward.points_required} points</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Value</span>
                      <span className="font-bold">{formatCurrency(reward.value)}</span>
                    </div>
                    <Button 
                      className="w-full" 
                      disabled={points < reward.points_required}
                    >
                      Redeem
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="col-span-3 text-sm text-muted-foreground text-center py-8">
                No rewards available at this time
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pointsHistory && pointsHistory.length > 0 ? (
              pointsHistory.map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No points activity yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referral Program */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
        <CardHeader>
          <CardTitle>Refer a Friend, Earn 500 Points!</CardTitle>
          <CardDescription>
            Share your referral link and earn bonus points
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input 
              value={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/refer/${customer.id}`}
              readOnly
              className="bg-white"
            />
            <Button>Copy Link</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your friend gets 10% off their first service, and you get 500 points!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

Create Progress component `src/components/ui/progress.tsx` - copy from shadcn/ui.

End of prompt

---

### Enhanced Prompt 24: Reward Redemption Feature

Create reward redemption functionality.

Create `src/app/api/rewards/[id]/redeem/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get reward details
    const { data: reward } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!reward || !reward.active) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }

    // Get customer loyalty points
    const { data: loyalty } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('customer_id', customer.id)
      .single()

    if (!loyalty || loyalty.points < reward.points_required) {
      return NextResponse.json(
        { error: 'Insufficient points' },
        { status: 400 }
      )
    }

    // Deduct points
    const newPoints = loyalty.points - reward.points_required
    const newTotalRedeemed = loyalty.total_redeemed + reward.points_required

    const { error: updateError } = await supabase
      .from('loyalty_points')
      .update({
        points: newPoints,
        total_redeemed: newTotalRedeemed,
        updated_at: new Date().toISOString(),
      })
      .eq('customer_id', customer.id)

    if (updateError) throw updateError

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('loyalty_transactions')
      .insert({
        customer_id: customer.id,
        points: -reward.points_required,
        type: 'redemption',
        description: `Redeemed: ${reward.name}`,
      })

    if (transactionError) throw transactionError

    // Create reward redemption record
    const { error: redemptionError } = await supabase
      .from('reward_redemptions')
      .insert({
        customer_id: customer.id,
        reward_id: reward.id,
        points_used: reward.points_required,
        status: 'pending',
      })

    if (redemptionError) throw redemptionError

    // TODO: Send notification to customer and staff

    return NextResponse.json({ 
      success: true,
      newBalance: newPoints
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to redeem reward' },
      { status: 500 }
    )
  }
}
```

Create client-side redeem button `src/components/rewards/redeem-button.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface RedeemButtonProps {
  rewardId: string
  rewardName: string
  pointsCost: number
  rewardValue: number
  currentPoints: number
  disabled?: boolean
}

export function RedeemButton({ 
  rewardId, 
  rewardName, 
  pointsCost, 
  rewardValue,
  currentPoints,
  disabled 
}: RedeemButtonProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleRedeem = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/rewards/${rewardId}/redeem`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      toast.success(`Successfully redeemed ${rewardName}!`)
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to redeem reward')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" disabled={disabled}>
          Redeem
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redeem {rewardName}?</DialogTitle>
          <DialogDescription>
            This will deduct {pointsCost} points from your balance.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cost:</span>
            <span className="font-medium">{pointsCost} points</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Value:</span>
            <span className="font-medium">{formatCurrency(rewardValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Balance:</span>
            <span className="font-medium">{currentPoints} points</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>New Balance:</span>
            <span>{currentPoints - pointsCost} points</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRedeem} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redeeming...
              </>
            ) : (
              'Confirm Redemption'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

End of prompt

---

### Enhanced Prompt 25: Referral System

Create referral link sharing and tracking.

Create `src/app/(dashboard)/dashboard/rewards/referrals/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Share2, Copy, Mail, MessageSquare, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function ReferralsPage() {
  const [customer, setCustomer] = useState<any>(null)
  const [referrals, setReferrals] = useState<any[]>([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadReferralData()
  }, [])

  const loadReferralData = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('email', user?.email)
      .single()

    setCustomer(customerData)

    // Get referrals
    const { data: referralsData } = await supabase
      .from('referrals')
      .select('*, referred_customer:customers(*)')
      .eq('referring_customer_id', customerData?.id)
      .order('created_at', { ascending: false })

    setReferrals(referralsData || [])
    setLoading(false)
  }

  const referralLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/refer/${customer?.id}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaEmail = () => {
    const subject = 'Try Dirt Free Carpet - Get 10% Off!'
    const body = `I've been using Dirt Free Carpet and love their service! Use my referral link to get 10% off your first service: ${referralLink}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const shareViaSMS = () => {
    const message = `Check out Dirt Free Carpet! Get 10% off your first service with my referral: ${referralLink}`
    window.location.href = `sms:?body=${encodeURIComponent(message)}`
  }

  if (loading) return <div>Loading...</div>

  const totalReferrals = referrals.length
  const completedReferrals = referrals.filter(r => r.status === 'completed').length
  const pointsEarned = completedReferrals * 500

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground">
          Share the love and earn rewards
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Points Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pointsEarned}</div>
          </CardContent>
        </Card>
      </div>

      {/* Share Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            <CardTitle>Share Your Referral Link</CardTitle>
          </div>
          <CardDescription>
            Earn 500 points for each friend who completes their first service!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input 
              value={referralLink}
              readOnly
              className="bg-white"
            />
            <Button onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div<div className="flex items-center gap-2">
            <Input 
              value={referralLink}
              readOnly
              className="bg-white"
            />
            <Button onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={shareViaEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            <Button variant="outline" onClick={shareViaSMS}>
              <MessageSquare className="mr-2 h-4 w-4" />
              SMS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referrals.length > 0 ? (
              referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">
                      {referral.referred_customer?.first_name} {referral.referred_customer?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Referred on {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        referral.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : referral.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {referral.status}
                    </Badge>
                    {referral.status === 'completed' && (
                      <p className="text-sm text-green-600 mt-1">+500 points</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No referrals yet. Share your link to get started!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 26: Points Transaction History

Create detailed loyalty points transaction history.

Create `src/app/(dashboard)/dashboard/rewards/history/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function PointsHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  const { data: transactions } = await supabase
    .from('loyalty_transactions')
    .select('*, job:jobs(scheduled_date, services:job_services(service:services(name)))')
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Points History</h1>
        <p className="text-muted-foreground">
          Complete transaction history of your loyalty points
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-4 border-b last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.points > 0
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}
                    >
                      {transaction.points > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                      {transaction.job && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Service: {transaction.job.services?.[0]?.service?.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.points > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.points > 0 ? '+' : ''}
                      {transaction.points}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No transactions yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

## PHASE 6: BILLING & PAYMENTS (Prompts 27-35)

### Enhanced Prompt 27: Stripe Configuration

Set up Stripe payment integration.

Create `src/lib/stripe/client.ts`:
```typescript
import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}
```

Create `src/lib/stripe/server.ts`:
```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})
```

Install Stripe dependencies:
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

End of prompt

---

### Enhanced Prompt 28: Invoice Payment Page

Create invoice payment interface with Stripe.

Create `src/app/(dashboard)/dashboard/invoices/[id]/pay/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentForm } from '@/components/payments/payment-form'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Props {
  params: { id: string }
}

export default function PayInvoicePage({ params }: Props) {
  const [invoice, setInvoice] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadInvoiceAndCreatePaymentIntent()
  }, [])

  const loadInvoiceAndCreatePaymentIntent = async () => {
    // Load invoice
    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('*, job:jobs(services:job_services(service:services(name)))')
      .eq('id', params.id)
      .single()

    setInvoice(invoiceData)

    // Create payment intent
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: params.id,
        amount: invoiceData.amount,
      }),
    })

    const { clientSecret } = await response.json()
    setClientSecret(clientSecret)
    setLoading(false)
  }

  if (loading || !clientSecret) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pay Invoice</h1>
        <p className="text-muted-foreground">
          Invoice #{invoice.id.slice(0, 8)}
        </p>
      </div>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Date</span>
            <span className="font-medium">{formatDate(invoice.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Due Date</span>
            <span className="font-medium">{formatDate(invoice.due_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Services</span>
            <span className="font-medium">
              {invoice.job?.services?.map((s: any) => s.service?.name).join(', ')}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-4 border-t">
            <span>Amount Due</span>
            <span>{formatCurrency(invoice.amount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
              },
            }}
          >
            <PaymentForm 
              invoiceId={invoice.id} 
              amount={invoice.amount}
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 29: Stripe Payment Form Component

Create the Stripe payment form component.

Create `src/components/payments/payment-form.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface PaymentFormProps {
  invoiceId: string
  amount: number
}

export function PaymentForm({ invoiceId, amount }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/invoices/${invoiceId}/success`,
      },
    })

    if (error) {
      toast.error(error.message || 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={!stripe || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(amount)}`
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Your payment information is secure and encrypted
      </p>
    </form>
  )
}
```

End of prompt

---

### Enhanced Prompt 30: Payment Intent API Route

Create API route for Stripe payment intents.

Create `src/app/api/payments/create-intent/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'

export async function POST(request: Request) {
  try {
    const { invoiceId, amount } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify invoice belongs to customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id, email, first_name, last_name')
      .eq('email', user.email)
      .single()

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('customer_id', customer.id)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        invoiceId: invoice.id,
        customerId: customer.id,
      },
      receipt_email: customer.email,
      description: `Invoice #${invoice.id.slice(0, 8)} - Dirt Free Carpet`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    console.error('Payment intent error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
```

End of prompt

---

### Enhanced Prompt 31: Payment Success Page

Create payment success confirmation page.

Create `src/app/(dashboard)/dashboard/invoices/[id]/success/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Download, Home } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props {
  params: { id: string }
  searchParams: { payment_intent: string }
}

export default async function PaymentSuccessPage({ params, searchParams }: Props) {
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, job:jobs(services:job_services(service:services(name)))')
    .eq('id', params.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <p className="text-muted-foreground">
            Your payment has been processed successfully
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Number</span>
            <span className="font-medium">#{invoice?.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Date</span>
            <span className="font-medium">{formatDate(new Date())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Services</span>
            <span className="font-medium">
              {invoice?.job?.services?.map((s: any) => s.service?.name).join(', ')}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-4 border-t">
            <span>Amount Paid</span>
            <span className="text-green-600">{formatCurrency(invoice?.amount || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment ID</span>
            <span className="font-mono text-xs">{searchParams.payment_intent}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            A receipt has been sent to your email. Thank you for your payment!
          </p>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard/invoices">
                View All Invoices
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 32: Stripe Webhook Handler

Create webhook handler for Stripe events.

Create `src/app/api/webhooks/stripe/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { invoiceId, customerId } = paymentIntent.metadata

        // Update invoice status
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_date: new Date().toISOString(),
          })
          .eq('id', invoiceId)

        // Award loyalty points (10 points per dollar)
        const pointsToAward = Math.floor(paymentIntent.amount / 100) * 10

        // Get current points
        const { data: loyalty } = await supabase
          .from('loyalty_points')
          .select('points, total_earned')
          .eq('customer_id', customerId)
          .single()

        if (loyalty) {
          // Update points
          await supabase
            .from('loyalty_points')
            .update({
              points: loyalty.points + pointsToAward,
              total_earned: loyalty.total_earned + pointsToAward,
              updated_at: new Date().toISOString(),
            })
            .eq('customer_id', customerId)

          // Create transaction record
          await supabase
            .from('loyalty_transactions')
            .insert({
              customer_id: customerId,
              points: pointsToAward,
              type: 'earned',
              description: `Payment received - Invoice #${invoiceId.slice(0, 8)}`,
            })
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        // TODO: Send notification to customer
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
```

End of prompt

---

### Enhanced Prompt 33: Payment Methods Management

Create payment methods management page.

Create `src/app/(dashboard)/dashboard/account/payment-methods/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('email', user?.email)
      .single()

    if (customer?.stripe_customer_id) {
      // Fetch payment methods from Stripe via API
      const response = await fetch(`/api/payments/methods?customerId=${customer.stripe_customer_id}`)
      const data = await response.json()
      setPaymentMethods(data.paymentMethods || [])
    }

    setLoading(false)
  }

  const handleDelete = async (paymentMethodId: string) => {
    try {
      const response = await fetch(`/api/payments/methods/${paymentMethodId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete payment method')

      toast.success('Payment method removed')
      loadPaymentMethods()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">
            Manage your saved payment methods
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : paymentMethods.length > 0 ? (
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {method.card.brand.toUpperCase()} •••• {method.card.last4}
                        </p>
                        {method.is_default && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.card.exp_month}/{method.card.exp_year}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.is_default && (
                      <Button variant="outline" size="sm">
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Payment Methods</CardTitle>
            <CardDescription>
              Add a payment method to make payments faster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Payment Method
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 34: Auto-Pay Setup

Create automatic payment setup feature.

Create `src/components/payments/auto-pay-setup.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface AutoPaySetupProps {
  customerId: string
  currentSettings?: {
    enabled: boolean
    paymentMethodId?: string
  }
}

export function AutoPaySetup({ customerId, currentSettings }: AutoPaySetupProps) {
  const [enabled, setEnabled] = useState(currentSettings?.enabled || false)
  const [paymentMethod, setPaymentMethod] = useState(currentSettings?.paymentMethodId || '')

  const handleToggle = async (checked: boolean) => {
    try {
      const response = await fetch('/api/payments/auto-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          enabled: checked,
          paymentMethodId: paymentMethod,
        }),
      })

      if (!response.ok) throw new Error('Failed to update auto-pay')

      setEnabled(checked)
      toast.success(checked ? 'Auto-pay enabled' : 'Auto-pay disabled')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automatic Payments</CardTitle>
        <CardDescription>
          Automatically pay invoices when they're due
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-pay">Enable Auto-Pay</Label>
          <Switch
            id="auto-pay"
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        </div>

        {enabled && (
          <div className="space-y-2 pt-4 border-t">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pm_1">Visa •••• 4242</SelectItem>
                <SelectItem value="pm_2">Mastercard •••• 5555</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Invoices will be automatically charged to this card on the due date
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

Create Switch component `src/components/ui/switch.tsx` - copy from shadcn/ui.
Create Select component `src/components/ui/select.tsx` - copy from shadcn/ui.

End of prompt

---

### Enhanced Prompt 35: Payment History Export

Create payment history export functionality.

Create `src/app/api/payments/export/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const year = searchParams.get('year')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .single()

    let query = supabase
      .from('invoices')
      .select('*, job:jobs(services:job_services(service:services(name)))')
      .eq('customer_id', customer.id)
      .eq('status', 'paid')
      .order('paid_date', { ascending: false })

    if (year) {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      query = query
        .gte('paid_date', startDate)
        .lte('paid_date', endDate)
    }

    const { data: invoices } = await query

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Date', 'Invoice #', 'Services', 'Amount']
      const rows = invoices?.map(inv => [
        new Date(inv.paid_date!).toLocaleDateString(),
        inv.id.slice(0, 8),
        inv.job?.services?.map((s: any) => s.service?.name).join('; ') || '',
        inv.amount.toFixed(2),
      ]) || []

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payment-history-${year || 'all'}.csv"`,
        },
      })
    }

    // Return JSON for other formats
    return NextResponse.json({ invoices })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Export failed' },
      { status: 500 }
    )
  }
}
```

Add export button to invoices page - update the invoices page with:
```typescript
<Button variant="outline" asChild>
  <a href="/api/payments/export?format=csv&year=2024" download>
    <Download className="mr-2 h-4 w-4" />
    Export 2024 Payments
  </a>
</Button>
```

End of prompt

---

## PHASE 7: COMMUNICATION SYSTEM (Prompts 36-40)

### Enhanced Prompt 36: Messages Dashboard

Create customer messaging interface.

Create `src/app/(dashboard)/dashboard/messages/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  responded: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })

  const openCount = messages?.filter(m => m.status === 'open').length || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with the Dirt Free team
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/messages/new">
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Link>
        </Button>
      </div>

      {openCount > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-blue-900">
              You have {openCount} open {openCount === 1 ? 'message' : 'messages'}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <Link
                  key={message.id}
                  href={`/dashboard/messages/${message.id}`}
                  className="block"
                >
                  <div className="p-4 rounded-lg border hover:border-primary transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-full bg-muted">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{message.subject}</h3>
                            <Badge className={statusColors[message.status as keyof typeof statusColors]}>
                              {message.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {message.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/messages/new">
                    Send Your First Message
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt


<div className="flex items-center gap-2">
            <Input 
              value={referralLink}
              readOnly
              className="bg-white"
            />
            <Button onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={shareViaEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            <Button variant="outline" onClick={shareViaSMS}>
              <MessageSquare className="mr-2 h-4 w-4" />
              SMS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referrals.length > 0 ? (
              referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">
                      {referral.referred_customer?.first_name} {referral.referred_customer?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Referred on {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        referral.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : referral.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {referral.status}
                    </Badge>
                    {referral.status === 'completed' && (
                      <p className="text-sm text-green-600 mt-1">+500 points</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No referrals yet. Share your link to get started!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 26: Points Transaction History

Create detailed loyalty points transaction history.

Create `src/app/(dashboard)/dashboard/rewards/history/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function PointsHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  const { data: transactions } = await supabase
    .from('loyalty_transactions')
    .select('*, job:jobs(scheduled_date, services:job_services(service:services(name)))')
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Points History</h1>
        <p className="text-muted-foreground">
          Complete transaction history of your loyalty points
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-4 border-b last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.points > 0
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}
                    >
                      {transaction.points > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                      {transaction.job && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Service: {transaction.job.services?.[0]?.service?.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.points > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.points > 0 ? '+' : ''}
                      {transaction.points}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No transactions yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

## PHASE 6: BILLING & PAYMENTS (Prompts 27-35)

### Enhanced Prompt 27: Stripe Configuration

Set up Stripe payment integration.

Create `src/lib/stripe/client.ts`:
```typescript
import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}
```

Create `src/lib/stripe/server.ts`:
```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})
```

Install Stripe dependencies:
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

End of prompt

---

### Enhanced Prompt 28: Invoice Payment Page

Create invoice payment interface with Stripe.

Create `src/app/(dashboard)/dashboard/invoices/[id]/pay/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentForm } from '@/components/payments/payment-form'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Props {
  params: { id: string }
}

export default function PayInvoicePage({ params }: Props) {
  const [invoice, setInvoice] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadInvoiceAndCreatePaymentIntent()
  }, [])

  const loadInvoiceAndCreatePaymentIntent = async () => {
    // Load invoice
    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('*, job:jobs(services:job_services(service:services(name)))')
      .eq('id', params.id)
      .single()

    setInvoice(invoiceData)

    // Create payment intent
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: params.id,
        amount: invoiceData.amount,
      }),
    })

    const { clientSecret } = await response.json()
    setClientSecret(clientSecret)
    setLoading(false)
  }

  if (loading || !clientSecret) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pay Invoice</h1>
        <p className="text-muted-foreground">
          Invoice #{invoice.id.slice(0, 8)}
        </p>
      </div>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Date</span>
            <span className="font-medium">{formatDate(invoice.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Due Date</span>
            <span className="font-medium">{formatDate(invoice.due_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Services</span>
            <span className="font-medium">
              {invoice.job?.services?.map((s: any) => s.service?.name).join(', ')}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-4 border-t">
            <span>Amount Due</span>
            <span>{formatCurrency(invoice.amount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
              },
            }}
          >
            <PaymentForm 
              invoiceId={invoice.id} 
              amount={invoice.amount}
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 29: Stripe Payment Form Component

Create the Stripe payment form component.

Create `src/components/payments/payment-form.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface PaymentFormProps {
  invoiceId: string
  amount: number
}

export function PaymentForm({ invoiceId, amount }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/invoices/${invoiceId}/success`,
      },
    })

    if (error) {
      toast.error(error.message || 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={!stripe || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(amount)}`
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Your payment information is secure and encrypted
      </p>
    </form>
  )
}
```

End of prompt

---

### Enhanced Prompt 30: Payment Intent API Route

Create API route for Stripe payment intents.

Create `src/app/api/payments/create-intent/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'

export async function POST(request: Request) {
  try {
    const { invoiceId, amount } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify invoice belongs to customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id, email, first_name, last_name')
      .eq('email', user.email)
      .single()

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('customer_id', customer.id)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        invoiceId: invoice.id,
        customerId: customer.id,
      },
      receipt_email: customer.email,
      description: `Invoice #${invoice.id.slice(0, 8)} - Dirt Free Carpet`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    console.error('Payment intent error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
```

End of prompt

---

### Enhanced Prompt 31: Payment Success Page

Create payment success confirmation page.

Create `src/app/(dashboard)/dashboard/invoices/[id]/success/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Download, Home } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props {
  params: { id: string }
  searchParams: { payment_intent: string }
}

export default async function PaymentSuccessPage({ params, searchParams }: Props) {
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, job:jobs(services:job_services(service:services(name)))')
    .eq('id', params.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <p className="text-muted-foreground">
            Your payment has been processed successfully
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Number</span>
            <span className="font-medium">#{invoice?.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Date</span>
            <span className="font-medium">{formatDate(new Date())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Services</span>
            <span className="font-medium">
              {invoice?.job?.services?.map((s: any) => s.service?.name).join(', ')}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-4 border-t">
            <span>Amount Paid</span>
            <span className="text-green-600">{formatCurrency(invoice?.amount || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment ID</span>
            <span className="font-mono text-xs">{searchParams.payment_intent}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            A receipt has been sent to your email. Thank you for your payment!
          </p>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard/invoices">
                View All Invoices
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 32: Stripe Webhook Handler

Create webhook handler for Stripe events.

Create `src/app/api/webhooks/stripe/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { invoiceId, customerId } = paymentIntent.metadata

        // Update invoice status
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_date: new Date().toISOString(),
          })
          .eq('id', invoiceId)

        // Award loyalty points (10 points per dollar)
        const pointsToAward = Math.floor(paymentIntent.amount / 100) * 10

        // Get current points
        const { data: loyalty } = await supabase
          .from('loyalty_points')
          .select('points, total_earned')
          .eq('customer_id', customerId)
          .single()

        if (loyalty) {
          // Update points
          await supabase
            .from('loyalty_points')
            .update({
              points: loyalty.points + pointsToAward,
              total_earned: loyalty.total_earned + pointsToAward,
              updated_at: new Date().toISOString(),
            })
            .eq('customer_id', customerId)

          // Create transaction record
          await supabase
            .from('loyalty_transactions')
            .insert({
              customer_id: customerId,
              points: pointsToAward,
              type: 'earned',
              description: `Payment received - Invoice #${invoiceId.slice(0, 8)}`,
            })
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        // TODO: Send notification to customer
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
```

End of prompt

---

### Enhanced Prompt 33: Payment Methods Management

Create payment methods management page.

Create `src/app/(dashboard)/dashboard/account/payment-methods/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('email', user?.email)
      .single()

    if (customer?.stripe_customer_id) {
      // Fetch payment methods from Stripe via API
      const response = await fetch(`/api/payments/methods?customerId=${customer.stripe_customer_id}`)
      const data = await response.json()
      setPaymentMethods(data.paymentMethods || [])
    }

    setLoading(false)
  }

  const handleDelete = async (paymentMethodId: string) => {
    try {
      const response = await fetch(`/api/payments/methods/${paymentMethodId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete payment method')

      toast.success('Payment method removed')
      loadPaymentMethods()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">
            Manage your saved payment methods
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : paymentMethods.length > 0 ? (
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {method.card.brand.toUpperCase()} •••• {method.card.last4}
                        </p>
                        {method.is_default && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.card.exp_month}/{method.card.exp_year}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.is_default && (
                      <Button variant="outline" size="sm">
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Payment Methods</CardTitle>
            <CardDescription>
              Add a payment method to make payments faster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Payment Method
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 34: Auto-Pay Setup

Create automatic payment setup feature.

Create `src/components/payments/auto-pay-setup.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface AutoPaySetupProps {
  customerId: string
  currentSettings?: {
    enabled: boolean
    paymentMethodId?: string
  }
}

export function AutoPaySetup({ customerId, currentSettings }: AutoPaySetupProps) {
  const [enabled, setEnabled] = useState(currentSettings?.enabled || false)
  const [paymentMethod, setPaymentMethod] = useState(currentSettings?.paymentMethodId || '')

  const handleToggle = async (checked: boolean) => {
    try {
      const response = await fetch('/api/payments/auto-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          enabled: checked,
          paymentMethodId: paymentMethod,
        }),
      })

      if (!response.ok) throw new Error('Failed to update auto-pay')

      setEnabled(checked)
      toast.success(checked ? 'Auto-pay enabled' : 'Auto-pay disabled')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automatic Payments</CardTitle>
        <CardDescription>
          Automatically pay invoices when they're due
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-pay">Enable Auto-Pay</Label>
          <Switch
            id="auto-pay"
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        </div>

        {enabled && (
          <div className="space-y-2 pt-4 border-t">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pm_1">Visa •••• 4242</SelectItem>
                <SelectItem value="pm_2">Mastercard •••• 5555</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Invoices will be automatically charged to this card on the due date
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

Create Switch component `src/components/ui/switch.tsx` - copy from shadcn/ui.
Create Select component `src/components/ui/select.tsx` - copy from shadcn/ui.

End of prompt

---

### Enhanced Prompt 35: Payment History Export

Create payment history export functionality.

Create `src/app/api/payments/export/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const year = searchParams.get('year')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .single()

    let query = supabase
      .from('invoices')
      .select('*, job:jobs(services:job_services(service:services(name)))')
      .eq('customer_id', customer.id)
      .eq('status', 'paid')
      .order('paid_date', { ascending: false })

    if (year) {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      query = query
        .gte('paid_date', startDate)
        .lte('paid_date', endDate)
    }

    const { data: invoices } = await query

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Date', 'Invoice #', 'Services', 'Amount']
      const rows = invoices?.map(inv => [
        new Date(inv.paid_date!).toLocaleDateString(),
        inv.id.slice(0, 8),
        inv.job?.services?.map((s: any) => s.service?.name).join('; ') || '',
        inv.amount.toFixed(2),
      ]) || []

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payment-history-${year || 'all'}.csv"`,
        },
      })
    }

    // Return JSON for other formats
    return NextResponse.json({ invoices })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Export failed' },
      { status: 500 }
    )
  }
}
```

Add export button to invoices page - update the invoices page with:
```typescript
<Button variant="outline" asChild>
  <a href="/api/payments/export?format=csv&year=2024" download>
    <Download className="mr-2 h-4 w-4" />
    Export 2024 Payments
  </a>
</Button>
```

End of prompt

---

### Enhanced Prompt 37: New Message Form

Create form for customers to send new messages.

Create `src/app/(dashboard)/dashboard/messages/new/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'

const MESSAGE_CATEGORIES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'appointment', label: 'Appointment Question' },
  { value: 'billing', label: 'Billing Issue' },
  { value: 'service', label: 'Service Quality' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Other' },
]

export default function NewMessagePage() {
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user?.email)
        .single()

      const { error } = await supabase
        .from('messages')
        .insert({
          customer_id: customer.id,
          category,
          subject,
          message,
          status: 'open',
        })

      if (error) throw error

      // TODO: Send notification to staff

      toast.success('Message sent successfully!')
      router.push('/dashboard/messages')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Message</h1>
        <p className="text-muted-foreground">
          Send a message to the Dirt Free team
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your message"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry in detail..."
                rows={8}
                required
              />
              <p className="text-xs text-muted-foreground">
                We typically respond within 24 hours
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Need immediate help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            For urgent matters, please call us directly
          </p>
          <Button variant="outline" asChild>
            <a href="tel:7137302782">Call (713) 730-2782</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 38: Message Thread View

Create message thread view for viewing conversations.

Create `src/app/(dashboard)/dashboard/messages/[id]/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, User } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ReplyForm } from '@/components/messages/reply-form'

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  responded: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

interface Props {
  params: { id: string }
}

export default async function MessageThreadPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id, first_name, last_name')
    .eq('email', user?.email)
    .single()

  const { data: message } = await supabase
    .from('messages')
    .select('*')
    .eq('id', params.id)
    .eq('customer_id', customer?.id)
    .single()

  if (!message) {
    notFound()
  }

  // Get message replies
  const { data: replies } = await supabase
    .from('message_replies')
    .select('*, staff:staff_users(first_name, last_name)')
    .eq('message_id', message.id)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{message.subject}</h1>
          <p className="text-sm text-muted-foreground">
            Category: {message.category} • {formatDate(message.created_at)}
          </p>
        </div>
        <Badge className={statusColors[message.status as keyof typeof statusColors]}>
          {message.status}
        </Badge>
      </div>

      {/* Original Message */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">
                {customer.first_name} {customer.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(message.created_at)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{message.message}</p>
        </CardContent>
      </Card>

      {/* Replies */}
      {replies && replies.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <h2 className="text-lg font-semibold">Conversation</h2>
          {replies.map((reply) => (
            <Card key={reply.id} className={reply.is_staff_reply ? 'bg-blue-50' : ''}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${reply.is_staff_reply ? 'bg-blue-100' : 'bg-primary/10'}`}>
                    {reply.is_staff_reply ? (
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {reply.is_staff_reply 
                        ? `${reply.staff?.first_name} ${reply.staff?.last_name} (Dirt Free Team)`
                        : `${customer.first_name} ${customer.last_name}`
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(reply.created_at)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{reply.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {message.status !== 'closed' && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Add a Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <ReplyForm messageId={message.id} customerId={customer.id} />
            </CardContent>
          </Card>
        </>
      )}

      {message.status === 'closed' && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              This conversation has been closed. If you need further assistance,
              please create a new message.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 39: Message Reply Component

Create reply form component for message threads.

Create `src/components/messages/reply-form.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'

interface ReplyFormProps {
  messageId: string
  customerId: string
}

export function ReplyForm({ messageId, customerId }: ReplyFormProps) {
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reply.trim()) {
      toast.error('Please enter a message')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('message_replies')
        .insert({
          message_id: messageId,
          customer_id: customerId,
          message: reply,
          is_staff_reply: false,
        })

      if (error) throw error

      // Update message status
      await supabase
        .from('messages')
        .update({ status: 'open', updated_at: new Date().toISOString() })
        .eq('id', messageId)

      // TODO: Send notification to staff

      toast.success('Reply sent successfully')
      setReply('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reply')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Type your reply..."
        rows={4}
        disabled={loading}
      />
      <Button type="submit" disabled={loading || !reply.trim()}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Reply
          </>
        )}
      </Button>
    </form>
  )
}
```

End of prompt

---

### Enhanced Prompt 40: Support Contact Widget

Create quick support contact widget.

Create `src/components/dashboard/support-widget.tsx`:
```typescript
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Phone, Mail, MessageSquare, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function SupportWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Need Help?</DialogTitle>
            <DialogDescription>
              Choose how you'd like to contact us
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              asChild
            >
              <a href="tel:7137302782">
                <Phone className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Call Us</p>
                  <p className="text-sm text-muted-foreground">
                    (713) 730-2782
                  </p>
                </div>
              </a>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              asChild
            >
              <a href="mailto:info@dirtfreecarpet.com">
                <Mail className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Email Us</p>
                  <p className="text-sm text-muted-foreground">
                    info@dirtfreecarpet.com
                  </p>
                </div>
              </a>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href="/dashboard/messages/new">
                <MessageSquare className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Send Message</p>
                  <p className="text-sm text-muted-foreground">
                    24-hour response time
                  </p>
                </div>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              asChild
            >
              <a
                href="https://dirtfreecarpet.com/faq"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">FAQ</p>
                  <p className="text-sm text-muted-foreground">
                    Find instant answers
                  </p>
                </div>
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

Add support widget to dashboard layout by updating `src/app/(dashboard)/layout.tsx`:
```typescript
import { SupportWidget } from '@/components/dashboard/support-widget'

// ... in the return statement, add before closing div:
<SupportWidget />
```

End of prompt

---

## PHASE 8: DOCUMENTS & SERVICE HISTORY (Prompts 41-45)

### Enhanced Prompt 41: Documents Page

Create documents and receipts management page.

Create `src/app/(dashboard)/dashboard/documents/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Image } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  // Get completed jobs with documents
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      services:job_services(service:services(name)),
      photos:job_photos(*)
    `)
    .eq('customer_id', customer?.id)
    .eq('status', 'completed')
    .order('scheduled_date', { ascending: false })

  // Get invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documents & History</h1>
        <p className="text-muted-foreground">
          Access your service records, photos, and receipts
        </p>
      </div>

      {/* Service History with Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Service History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id} className="pb-6 border-b last:border-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {job.services?.map((s: any) => s.service?.name).join(', ')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(job.scheduled_date)} • {formatCurrency(job.total_amount)}
                      </p>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>

                  {job.notes && (
                    <div className="bg-muted p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium mb-1">Service Notes:</p>
                      <p className="text-sm text-muted-foreground">{job.notes}</p>
                    </div>
                  )}

                  {/* Before/After Photos */}
                  {job.photos && job.photos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-3">Service Photos:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {job.photos.map((photo: any) => (
                          <div key={photo.id} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border">
                              <img
                                src={photo.url}
                                alt={photo.type}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Badge
                              className="absolute top-2 left-2 text-xs"
                              variant={photo.type === 'before' ? 'destructive' : 'default'}
                            >
                              {photo.type}
                            </Badge>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              asChild
                            >
                              <a href={photo.url} download target="_blank">
                                <Download className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No service history available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoices & Receipts */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices & Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Invoice #{invoice.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(invoice.created_at)} • {formatCurrency(invoice.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                    >
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/api/invoices/${invoice.id}/pdf`} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No invoices available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 42: Service Photos Gallery

Create service photos gallery with lightbox.

Create `src/components/documents/photo-gallery.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react'
import Image from 'next/image'

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
              <img
                src={photo.url}
                alt={`${photo.type} photo`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
                <img
                  src={currentPhoto.url}
                  alt={`${currentPhoto.type} photo`}
                  className="w-full h-full object-contain"
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
```

End of prompt

---

## PHASE 7: COMMUNICATION SYSTEM (Prompts 36-40)

### Enhanced Prompt 36: Messages Dashboard

Create customer messaging interface.

Create `src/app/(dashboard)/dashboard/messages/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  responded: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })

  const openCount = messages?.filter(m => m.status === 'open').length || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with the Dirt Free team
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/messages/new">
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Link>
        </Button>
      </div>

      {openCount > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-blue-900">
              You have {openCount} open {openCount === 1 ? 'message' : 'messages'}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <Link
                  key={message.id}
                  href={`/dashboard/messages/${message.id}`}
                  className="block"
                >
                  <div className="p-4 rounded-lg border hover:border-primary transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-full bg-muted">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{message.subject}</h3>
                            <Badge className={statusColors[message.status as keyof typeof statusColors]}>
                              {message.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {message.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/messages/new">
                    Send Your First Message
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt


<div className="flex items-center gap-2">
            <Input 
              value={referralLink}
              readOnly
              className="bg-white"
            />
            <Button onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={shareViaEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            <Button variant="outline" onClick={shareViaSMS}>
              <MessageSquare className="mr-2 h-4 w-4" />
              SMS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referrals.length > 0 ? (
              referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">
                      {referral.referred_customer?.first_name} {referral.referred_customer?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Referred on {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        referral.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : referral.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {referral.status}
                    </Badge>
                    {referral.status === 'completed' && (
                      <p className="text-sm text-green-600 mt-1">+500 points</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No referrals yet. Share your link to get started!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 26: Points Transaction History

Create detailed loyalty points transaction history.

Create `src/app/(dashboard)/dashboard/rewards/history/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function PointsHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  const { data: transactions } = await supabase
    .from('loyalty_transactions')
    .select('*, job:jobs(scheduled_date, services:job_services(service:services(name)))')
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Points History</h1>
        <p className="text-muted-foreground">
          Complete transaction history of your loyalty points
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-4 border-b last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.points > 0
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}
                    >
                      {transaction.points > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                      {transaction.job && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Service: {transaction.job.services?.[0]?.service?.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.points > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.points > 0 ? '+' : ''}
                      {transaction.points}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No transactions yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

## PHASE 6: BILLING & PAYMENTS (Prompts 27-35)

### Enhanced Prompt 27: Stripe Configuration

Set up Stripe payment integration.

Create `src/lib/stripe/client.ts`:
```typescript
import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}
```

Create `src/lib/stripe/server.ts`:
```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})
```

Install Stripe dependencies:
```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

End of prompt

---

### Enhanced Prompt 28: Invoice Payment Page

Create invoice payment interface with Stripe.

Create `src/app/(dashboard)/dashboard/invoices/[id]/pay/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentForm } from '@/components/payments/payment-form'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Props {
  params: { id: string }
}

export default function PayInvoicePage({ params }: Props) {
  const [invoice, setInvoice] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadInvoiceAndCreatePaymentIntent()
  }, [])

  const loadInvoiceAndCreatePaymentIntent = async () => {
    // Load invoice
    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('*, job:jobs(services:job_services(service:services(name)))')
      .eq('id', params.id)
      .single()

    setInvoice(invoiceData)

    // Create payment intent
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: params.id,
        amount: invoiceData.amount,
      }),
    })

    const { clientSecret } = await response.json()
    setClientSecret(clientSecret)
    setLoading(false)
  }

  if (loading || !clientSecret) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pay Invoice</h1>
        <p className="text-muted-foreground">
          Invoice #{invoice.id.slice(0, 8)}
        </p>
      </div>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Date</span>
            <span className="font-medium">{formatDate(invoice.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Due Date</span>
            <span className="font-medium">{formatDate(invoice.due_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Services</span>
            <span className="font-medium">
              {invoice.job?.services?.map((s: any) => s.service?.name).join(', ')}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-4 border-t">
            <span>Amount Due</span>
            <span>{formatCurrency(invoice.amount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
              },
            }}
          >
            <PaymentForm 
              invoiceId={invoice.id} 
              amount={invoice.amount}
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 29: Stripe Payment Form Component

Create the Stripe payment form component.

Create `src/components/payments/payment-form.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface PaymentFormProps {
  invoiceId: string
  amount: number
}

export function PaymentForm({ invoiceId, amount }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/invoices/${invoiceId}/success`,
      },
    })

    if (error) {
      toast.error(error.message || 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={!stripe || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(amount)}`
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Your payment information is secure and encrypted
      </p>
    </form>
  )
}
```

End of prompt

---

### Enhanced Prompt 30: Payment Intent API Route

Create API route for Stripe payment intents.

Create `src/app/api/payments/create-intent/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'

export async function POST(request: Request) {
  try {
    const { invoiceId, amount } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify invoice belongs to customer
    const { data: customer } = await supabase
      .from('customers')
      .select('id, email, first_name, last_name')
      .eq('email', user.email)
      .single()

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('customer_id', customer.id)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        invoiceId: invoice.id,
        customerId: customer.id,
      },
      receipt_email: customer.email,
      description: `Invoice #${invoice.id.slice(0, 8)} - Dirt Free Carpet`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    console.error('Payment intent error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
```

End of prompt

---

### Enhanced Prompt 31: Payment Success Page

Create payment success confirmation page.

Create `src/app/(dashboard)/dashboard/invoices/[id]/success/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Download, Home } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props {
  params: { id: string }
  searchParams: { payment_intent: string }
}

export default async function PaymentSuccessPage({ params, searchParams }: Props) {
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, job:jobs(services:job_services(service:services(name)))')
    .eq('id', params.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <p className="text-muted-foreground">
            Your payment has been processed successfully
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Number</span>
            <span className="font-medium">#{invoice?.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Date</span>
            <span className="font-medium">{formatDate(new Date())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Services</span>
            <span className="font-medium">
              {invoice?.job?.services?.map((s: any) => s.service?.name).join(', ')}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-4 border-t">
            <span>Amount Paid</span>
            <span className="text-green-600">{formatCurrency(invoice?.amount || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment ID</span>
            <span className="font-mono text-xs">{searchParams.payment_intent}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            A receipt has been sent to your email. Thank you for your payment!
          </p>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard/invoices">
                View All Invoices
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 32: Stripe Webhook Handler

Create webhook handler for Stripe events.

Create `src/app/api/webhooks/stripe/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { invoiceId, customerId } = paymentIntent.metadata

        // Update invoice status
        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            paid_date: new Date().toISOString(),
          })
          .eq('id', invoiceId)

        // Award loyalty points (10 points per dollar)
        const pointsToAward = Math.floor(paymentIntent.amount / 100) * 10

        // Get current points
        const { data: loyalty } = await supabase
          .from('loyalty_points')
          .select('points, total_earned')
          .eq('customer_id', customerId)
          .single()

        if (loyalty) {
          // Update points
          await supabase
            .from('loyalty_points')
            .update({
              points: loyalty.points + pointsToAward,
              total_earned: loyalty.total_earned + pointsToAward,
              updated_at: new Date().toISOString(),
            })
            .eq('customer_id', customerId)

          // Create transaction record
          await supabase
            .from('loyalty_transactions')
            .insert({
              customer_id: customerId,
              points: pointsToAward,
              type: 'earned',
              description: `Payment received - Invoice #${invoiceId.slice(0, 8)}`,
            })
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        // TODO: Send notification to customer
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
```

End of prompt

---

### Enhanced Prompt 33: Payment Methods Management

Create payment methods management page.

Create `src/app/(dashboard)/dashboard/account/payment-methods/page.tsx`:
```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('email', user?.email)
      .single()

    if (customer?.stripe_customer_id) {
      // Fetch payment methods from Stripe via API
      const response = await fetch(`/api/payments/methods?customerId=${customer.stripe_customer_id}`)
      const data = await response.json()
      setPaymentMethods(data.paymentMethods || [])
    }

    setLoading(false)
  }

  const handleDelete = async (paymentMethodId: string) => {
    try {
      const response = await fetch(`/api/payments/methods/${paymentMethodId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete payment method')

      toast.success('Payment method removed')
      loadPaymentMethods()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">
            Manage your saved payment methods
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : paymentMethods.length > 0 ? (
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {method.card.brand.toUpperCase()} •••• {method.card.last4}
                        </p>
                        {method.is_default && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.card.exp_month}/{method.card.exp_year}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.is_default && (
                      <Button variant="outline" size="sm">
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Payment Methods</CardTitle>
            <CardDescription>
              Add a payment method to make payments faster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Payment Method
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 34: Auto-Pay Setup

Create automatic payment setup feature.

Create `src/components/payments/auto-pay-setup.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface AutoPaySetupProps {
  customerId: string
  currentSettings?: {
    enabled: boolean
    paymentMethodId?: string
  }
}

export function AutoPaySetup({ customerId, currentSettings }: AutoPaySetupProps) {
  const [enabled, setEnabled] = useState(currentSettings?.enabled || false)
  const [paymentMethod, setPaymentMethod] = useState(currentSettings?.paymentMethodId || '')

  const handleToggle = async (checked: boolean) => {
    try {
      const response = await fetch('/api/payments/auto-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          enabled: checked,
          paymentMethodId: paymentMethod,
        }),
      })

      if (!response.ok) throw new Error('Failed to update auto-pay')

      setEnabled(checked)
      toast.success(checked ? 'Auto-pay enabled' : 'Auto-pay disabled')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automatic Payments</CardTitle>
        <CardDescription>
          Automatically pay invoices when they're due
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-pay">Enable Auto-Pay</Label>
          <Switch
            id="auto-pay"
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        </div>

        {enabled && (
          <div className="space-y-2 pt-4 border-t">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pm_1">Visa •••• 4242</SelectItem>
                <SelectItem value="pm_2">Mastercard •••• 5555</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Invoices will be automatically charged to this card on the due date
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

Create Switch component `src/components/ui/switch.tsx` - copy from shadcn/ui.
Create Select component `src/components/ui/select.tsx` - copy from shadcn/ui.

End of prompt

---

### Enhanced Prompt 35: Payment History Export

Create payment history export functionality.

Create `src/app/api/payments/export/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const year = searchParams.get('year')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .single()

    let query = supabase
      .from('invoices')
      .select('*, job:jobs(services:job_services(service:services(name)))')
      .eq('customer_id', customer.id)
      .eq('status', 'paid')
      .order('paid_date', { ascending: false })

    if (year) {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      query = query
        .gte('paid_date', startDate)
        .lte('paid_date', endDate)
    }

    const { data: invoices } = await query

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Date', 'Invoice #', 'Services', 'Amount']
      const rows = invoices?.map(inv => [
        new Date(inv.paid_date!).toLocaleDateString(),
        inv.id.slice(0, 8),
        inv.job?.services?.map((s: any) => s.service?.name).join('; ') || '',
        inv.amount.toFixed(2),
      ]) || []

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payment-history-${year || 'all'}.csv"`,
        },
      })
    }

    // Return JSON for other formats
    return NextResponse.json({ invoices })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Export failed' },
      { status: 500 }
    )
  }
}
```

Add export button to invoices page - update the invoices page with:
```typescript
<Button variant="outline" asChild>
  <a href="/api/payments/export?format=csv&year=2024" download>
    <Download className="mr-2 h-4 w-4" />
    Export 2024 Payments
  </a>
</Button>
```

End of prompt

---

### Enhanced Prompt 37: New Message Form

Create form for customers to send new messages.

Create `src/app/(dashboard)/dashboard/messages/new/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'

const MESSAGE_CATEGORIES = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'appointment', label: 'Appointment Question' },
  { value: 'billing', label: 'Billing Issue' },
  { value: 'service', label: 'Service Quality' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Other' },
]

export default function NewMessagePage() {
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user?.email)
        .single()

      const { error } = await supabase
        .from('messages')
        .insert({
          customer_id: customer.id,
          category,
          subject,
          message,
          status: 'open',
        })

      if (error) throw error

      // TODO: Send notification to staff

      toast.success('Message sent successfully!')
      router.push('/dashboard/messages')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Message</h1>
        <p className="text-muted-foreground">
          Send a message to the Dirt Free team
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your message"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry in detail..."
                rows={8}
                required
              />
              <p className="text-xs text-muted-foreground">
                We typically respond within 24 hours
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Need immediate help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            For urgent matters, please call us directly
          </p>
          <Button variant="outline" asChild>
            <a href="tel:7137302782">Call (713) 730-2782</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 38: Message Thread View

Create message thread view for viewing conversations.

Create `src/app/(dashboard)/dashboard/messages/[id]/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, User } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ReplyForm } from '@/components/messages/reply-form'

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  responded: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

interface Props {
  params: { id: string }
}

export default async function MessageThreadPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id, first_name, last_name')
    .eq('email', user?.email)
    .single()

  const { data: message } = await supabase
    .from('messages')
    .select('*')
    .eq('id', params.id)
    .eq('customer_id', customer?.id)
    .single()

  if (!message) {
    notFound()
  }

  // Get message replies
  const { data: replies } = await supabase
    .from('message_replies')
    .select('*, staff:staff_users(first_name, last_name)')
    .eq('message_id', message.id)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{message.subject}</h1>
          <p className="text-sm text-muted-foreground">
            Category: {message.category} • {formatDate(message.created_at)}
          </p>
        </div>
        <Badge className={statusColors[message.status as keyof typeof statusColors]}>
          {message.status}
        </Badge>
      </div>

      {/* Original Message */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">
                {customer.first_name} {customer.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(message.created_at)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{message.message}</p>
        </CardContent>
      </Card>

      {/* Replies */}
      {replies && replies.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <h2 className="text-lg font-semibold">Conversation</h2>
          {replies.map((reply) => (
            <Card key={reply.id} className={reply.is_staff_reply ? 'bg-blue-50' : ''}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${reply.is_staff_reply ? 'bg-blue-100' : 'bg-primary/10'}`}>
                    {reply.is_staff_reply ? (
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {reply.is_staff_reply 
                        ? `${reply.staff?.first_name} ${reply.staff?.last_name} (Dirt Free Team)`
                        : `${customer.first_name} ${customer.last_name}`
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(reply.created_at)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{reply.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {message.status !== 'closed' && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Add a Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <ReplyForm messageId={message.id} customerId={customer.id} />
            </CardContent>
          </Card>
        </>
      )}

      {message.status === 'closed' && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              This conversation has been closed. If you need further assistance,
              please create a new message.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 39: Message Reply Component

Create reply form component for message threads.

Create `src/components/messages/reply-form.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'

interface ReplyFormProps {
  messageId: string
  customerId: string
}

export function ReplyForm({ messageId, customerId }: ReplyFormProps) {
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reply.trim()) {
      toast.error('Please enter a message')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('message_replies')
        .insert({
          message_id: messageId,
          customer_id: customerId,
          message: reply,
          is_staff_reply: false,
        })

      if (error) throw error

      // Update message status
      await supabase
        .from('messages')
        .update({ status: 'open', updated_at: new Date().toISOString() })
        .eq('id', messageId)

      // TODO: Send notification to staff

      toast.success('Reply sent successfully')
      setReply('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reply')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Type your reply..."
        rows={4}
        disabled={loading}
      />
      <Button type="submit" disabled={loading || !reply.trim()}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Reply
          </>
        )}
      </Button>
    </form>
  )
}
```

End of prompt

---

### Enhanced Prompt 40: Support Contact Widget

Create quick support contact widget.

Create `src/components/dashboard/support-widget.tsx`:
```typescript
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Phone, Mail, MessageSquare, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function SupportWidget() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Need Help?</DialogTitle>
            <DialogDescription>
              Choose how you'd like to contact us
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              asChild
            >
              <a href="tel:7137302782">
                <Phone className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Call Us</p>
                  <p className="text-sm text-muted-foreground">
                    (713) 730-2782
                  </p>
                </div>
              </a>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              asChild
            >
              <a href="mailto:info@dirtfreecarpet.com">
                <Mail className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Email Us</p>
                  <p className="text-sm text-muted-foreground">
                    info@dirtfreecarpet.com
                  </p>
                </div>
              </a>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href="/dashboard/messages/new">
                <MessageSquare className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Send Message</p>
                  <p className="text-sm text-muted-foreground">
                    24-hour response time
                  </p>
                </div>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              asChild
            >
              <a
                href="https://dirtfreecarpet.com/faq"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">FAQ</p>
                  <p className="text-sm text-muted-foreground">
                    Find instant answers
                  </p>
                </div>
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

Add support widget to dashboard layout by updating `src/app/(dashboard)/layout.tsx`:
```typescript
import { SupportWidget } from '@/components/dashboard/support-widget'

// ... in the return statement, add before closing div:
<SupportWidget />
```

End of prompt

---

### Enhanced Prompt 43: Invoice PDF Generation

Create invoice PDF download functionality.

Create `src/app/api/invoices/[id]/pdf/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', user.email)
      .single()

    // Get invoice with job details
    const { data: invoice } = await supabase
      .from('invoices')
      .select(`
        *,
        job:jobs(
          scheduled_date,
          services:job_services(
            quantity,
            price,
            service:services(name, description)
          )
        )
      `)
      .eq('id', params.id)
      .eq('customer_id', customer.id)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Generate HTML invoice
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${invoice.id.slice(0, 8)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .header h1 { color: #2563eb; margin: 0; }
          .invoice-info { margin-bottom: 30px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Dirt Free Carpet</h1>
          <p>Houston, TX • (713) 730-2782</p>
        </div>
        
        <div class="invoice-info">
          <div class="info-row">
            <div>
              <span class="label">Invoice #:</span> ${invoice.id.slice(0, 8)}
            </div>
            <div>
              <span class="label">Date:</span> ${new Date(invoice.created_at).toLocaleDateString()}
            </div>
          </div>
          <div class="info-row">
            <div>
              <span class="label">Bill To:</span><br>
              ${customer.first_name} ${customer.last_name}<br>
              ${customer.address}<br>
              ${customer.city}, ${customer.state} ${customer.zip}
            </div>
            <div>
              <span class="label">Due Date:</span> ${new Date(invoice.due_date).toLocaleDateString()}<br>
              <span class="label">Status:</span> ${invoice.status.toUpperCase()}
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Description</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.job?.services?.map((item: any) => `
              <tr>
                <td>${item.service?.name}</td>
                <td>${item.service?.description || ''}</td>
                <td style="text-align: right;">${item.price.toFixed(2)}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>

        <div class="total">
          Total: ${invoice.amount.toFixed(2)}
        </div>

        ${invoice.status === 'paid' && invoice.paid_date ? `
          <div style="margin-top: 20px; padding: 15px; background-color: #dcfce7; border-radius: 8px; text-align: center;">
            <strong style="color: #16a34a;">PAID</strong> on ${new Date(invoice.paid_date).toLocaleDateString()}
          </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Questions? Contact us at info@dirtfreecarpet.com or (713) 730-2782</p>
        </div>
      </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="invoice-${invoice.id.slice(0, 8)}.html"`,
      },
    })
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
```

End of prompt

---

### Enhanced Prompt 44: Service Warranty Information

Create service warranty information page.

Create `src/app/(dashboard)/dashboard/documents/warranties/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function WarrantiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  // Get completed jobs within warranty period (e.g., 30 days)
  const warrantyDate = new Date()
  warrantyDate.setDate(warrantyDate.getDate() - 30)

  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      services:job_services(service:services(name, warranty_days))
    `)
    .eq('customer_id', customer?.id)
    .eq('status', 'completed')
    .gte('scheduled_date', warrantyDate.toISOString())
    .order('scheduled_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Service Warranties</h1>
        <p className="text-muted-foreground">
          Active warranties for your recent services
        </p>
      </div>

      {/* Warranty Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">Satisfaction Guarantee</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-900">
            All our services come with a 30-day satisfaction guarantee. If you're not completely
            satisfied with our work, we'll return to re-clean at no additional charge.
          </p>
        </CardContent>
      </Card>

      {/* Active Warranties */}
      <Card>
        <CardHeader>
          <CardTitle>Active Warranties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => {
                const serviceDate = new Date(job.scheduled_date)
                const warrantyEndDate = new Date(serviceDate)
                warrantyEndDate.setDate(warrantyEndDate.getDate() + 30)
                const daysRemaining = Math.ceil(
                  (warrantyEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                )
                const isActive = daysRemaining > 0

                return (
                  <div
                    key={job.id}
                    className={`p-4 rounded-lg border ${
                      isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {isActive ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                        )}
                        <div>
                          <h3 className="font-semibold">
                            {job.services?.map((s: any) => s.service?.name).join(', ')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Service Date: {formatDate(job.scheduled_date)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Warranty Until: {formatDate(warrantyEndDate)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={isActive ? 'default' : 'secondary'}>
                        {isActive ? `${daysRemaining} days left` : 'Expired'}
                      </Badge>
                    </div>

                    {isActive && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <p className="text-xs text-muted-foreground">
                          <strong>What's covered:</strong> If you're not satisfied with the results,
                          contact us and we'll return to re-clean the affected areas at no charge.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No active warranties
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warranty Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Warranty Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <h4>30-Day Satisfaction Guarantee</h4>
          <ul>
            <li>Valid for 30 days from the service date</li>
            <li>Covers re-cleaning of any areas not meeting quality standards</li>
            <li>Customer must notify us within the warranty period</li>
            <li>Normal wear and new stains are not covered</li>
          </ul>

          <h4>How to File a Warranty Claim</h4>
          <ol>
            <li>Contact us at (713) 730-2782 or info@dirtfreecarpet.com</li>
            <li>Provide your service date and describe the issue</li>
            <li>We'll schedule a return visit within 48 hours</li>
            <li>No additional charges for warranty work</li>
          </ol>

          <h4>Exclusions</h4>
          <ul>
            <li>Damage caused by pets or accidents after service</li>
            <li>New stains or spills occurring after service</li>
            <li>Normal traffic wear and tear</li>
            <li>Issues not reported within warranty period</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 45: Service History Timeline

Create visual service history timeline component.

Create `src/components/documents/service-timeline.tsx`:
```typescript
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, CheckCircle, Clock } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface TimelineJob {
  id: string
  scheduled_date: string
  status: string
  total_amount: number
  services: Array<{ service: { name: string } }>
}

interface ServiceTimelineProps {
  jobs: TimelineJob[]
}

export function ServiceTimeline({ jobs }: ServiceTimelineProps) {
  // Group jobs by year
  const jobsByYear = jobs.reduce((acc, job) => {
    const year = new Date(job.scheduled_date).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(job)
    return acc
  }, {} as Record<number, TimelineJob[]>)

  const years = Object.keys(jobsByYear).sort((a, b) => parseInt(b) - parseInt(a))

  return (
    <div className="space-y-8">
      {years.map((year) => (
        <div key={year} className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{year}</h3>
            <div className="flex-1 h-px bg-border" />
            <Badge variant="secondary">{jobsByYear[parseInt(year)].length} services</Badge>
          </div>

          <div className="space-y-4">
            {jobsByYear[parseInt(year)].map((job, index) => (
              <div key={job.id} className="relative">
                {/* Timeline line */}
                {index < jobsByYear[parseInt(year)].length - 1 && (
                  <div className="absolute left-[11px] top-[48px] bottom-[-16px] w-[2px] bg-border" />
                )}

                <Card className="ml-6">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className="absolute left-0 -translate-x-[18px] mt-1">
                        <div className="p-1.5 rounded-full bg-primary">
                          {job.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-primary-foreground" />
                          ) : (
                            <Clock className="h-4 w-4 text-primary-foreground" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">
                              {job.services.map(s => s.service.name).join(', ')}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(job.scheduled_date)}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(job.total_amount)}</p>
                            <Badge
                              variant={job.status === 'completed' ? 'default' : 'secondary'}
                              className="mt-1"
                            >
                              {job.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ))}

      {jobs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No service history yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

End of prompt

---

## PHASE 9: INTEGRATION & POLISH (Prompts 46-60)

### Enhanced Prompt 46: Row Level Security Policies

Create Supabase RLS policies for customer portal access.

```sql
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_replies ENABLE ROW LEVEL SECURITY;

-- Customers can only view/update their own data
CREATE POLICY "Customers can view own data" 
  ON customers FOR SELECT 
  USING (auth.email() = email);

CREATE POLICY "Customers can update own data" 
  ON customers FOR UPDATE 
  USING (auth.email() = email);

-- Jobs: Customers can view and create jobs
CREATE POLICY "Customers can view own jobs" 
  ON jobs FOR SELECT 
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

CREATE POLICY "Customers can create jobs" 
  ON jobs FOR INSERT 
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- Invoices: Customers can view own invoices
CREATE POLICY "Customers can view own invoices" 
  ON invoices FOR SELECT 
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- Loyalty: Customers can view own loyalty points
CREATE POLICY "Customers can view own loyalty" 
  ON loyalty_points FOR SELECT 
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- Messages: Customers can view/create own messages
CREATE POLICY "Customers can view own messages" 
  ON messages FOR SELECT 
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

CREATE POLICY "Customers can create messages" 
  ON messages FOR INSERT 
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- Message replies: Customers can view/create replies
CREATE POLICY "Customers can view message replies" 
  ON message_replies FOR SELECT 
  USING (
    message_id IN (
      SELECT id FROM messages 
      WHERE customer_id IN (
        SELECT id FROM customers WHERE email = auth.email()
      )
    )
  );

CREATE POLICY "Customers can create replies" 
  ON message_replies FOR INSERT 
  WITH CHECK (
    message_id IN (
      SELECT id FROM messages 
      WHERE customer_id IN (
        SELECT id FROM customers WHERE email = auth.email()
      )
    )
  );
```

Create file `supabase/policies.sql` with this content.

End of prompt

---

### Enhanced Prompt 47: Real-time Notifications

Add real-time notification subscriptions.

Create `src/components/notifications/notification-provider.tsx`:
```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function NotificationProvider({ customerId }: { customerId: string }) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to job updates
    const jobsChannel = supabase
      .channel('job-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status
            
            if (newStatus === 'confirmed') {
              toast.success('Your appointment has been confirmed!')
            } else if (newStatus === 'in_progress') {
              toast.info('Your technician is on the way!')
            } else if (newStatus === 'completed') {
              toast.success('Service completed! Thank you for choosing Dirt Free.')
            }
            
            router.refresh()
          }
        }
      )
      .subscribe()

    // Subscribe to message replies
    const messagesChannel = supabase
      .channel('message-replies')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_replies',
        },
        (payload) => {
          if (payload.new.is_staff_reply) {
            toast('New message from Dirt Free', {
              description: 'You have a new reply to your message',
              action: {
                label: 'View',
                onClick: () => router.push(`/dashboard/messages/${payload.new.message_id}`),
              },
            })
            router.refresh()
          }
        }
      )
      .subscribe()

    // Subscribe to invoice updates
    const invoicesChannel = supabase
      .channel('invoice-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast('New invoice received', {
              description: 'A new invoice has been generated for your service',
              action: {
                label: 'View',
                onClick: () => router.push('/dashboard/invoices'),
              },
            })
            router.refresh()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(jobsChannel)
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(invoicesChannel)
    }
  }, [customerId, router])

  return null
}
```

Add to dashboard layout:
```typescript
<NotificationProvider customerId={customer.id} />
```

End of prompt

---

### Enhanced Prompt 48: Email Notifications

Create email notification system for customers.

Create `src/lib/email/templates.ts`:
```typescript
export const emailTemplates = {
  appointmentConfirmation: (data: {
    customerName: string
    serviceDate: string
    serviceTime: string
    services: string[]
    address: string
  }) => ({
    subject: 'Appointment Confirmed - Dirt Free Carpet',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1>Appointment Confirmed!</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${data.customerName},</p>
          <p>Your appointment has been confirmed. Here are the details:</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Date:</strong> ${data.serviceDate}</p>
            <p><strong>Time:</strong> ${data.serviceTime}</p>
            <p><strong>Services:</strong> ${data.services.join(', ')}</p>
            <p><strong>Location:</strong> ${data.address}</p>
          </div>

          <p>We'll send you a reminder 24 hours before your appointment.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              Need to reschedule? <a href="https://portal.dirtfreecarpet.com/dashboard/appointments">Manage your appointment</a>
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  paymentReceipt: (data: {
    customerName: string
    invoiceNumber: string
    amount: number
    paymentDate: string
    services: string[]
  }) => ({
    subject: 'Payment Receipt - Dirt Free Carpet',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #16a34a; color: white; padding: 20px; text-align: center;">
          <h1>Payment Received</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${data.customerName},</p>
          <p>Thank you for your payment. Your receipt is below:</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Invoice #:</strong> ${data.invoiceNumber}</p>
            <p><strong>Amount Paid:</strong> ${data.amount.toFixed(2)}</p>
            <p><strong>Payment Date:</strong> ${data.paymentDate}</p>
            <p><strong>Services:</strong> ${data.services.join(', ')}</p>
          </div>

          <p>A copy of your invoice has been saved to your account.</p>
          
          <div style="margin-top: 30px;">
            <a href="https://portal.dirtfreecarpet.com/dashboard/invoices" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Invoice
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  loyaltyPointsEarned: (data: {
    customerName: string
    pointsEarned: number
    totalPoints: number
    rewardValue: number
  }) => ({
    subject: 'You Earned Loyalty Points! - Dirt Free Carpet',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #7c3aed; color: white; padding: 20px; text-align: center;">
          <h1>🎉 Points Earned!</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${data.customerName},</p>
          <p>You've earned loyalty points for your recent service!</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="font-size: 36px; font-weight: bold; color: #7c3aed; margin: 0;">
              +${data.pointsEarned}
            </p>
            <p style="font-size: 14px; color: #6b7280;">Points Earned</p>
            <p style="margin-top: 15px;">
              <strong>New Balance:</strong> ${data.totalPoints} points (${data.rewardValue.toFixed(2)} in rewards)
            </p>
          </div>

          <p>Redeem your points for discounts, free services, and more!</p>
          
          <div style="margin-top: 30px;">
            <a href="https://portal.dirtfreecarpet.com/dashboard/rewards" 
               style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Rewards
            </a>
          </div>
        </div>
      </div>
    `,
  }),
}
```

Create `src/lib/email/send.ts`:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Dirt Free Carpet <noreply@dirtfreecarpet.com>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}
```

End of prompt

---

### Enhanced Prompt 49: Mobile Responsiveness

Ensure mobile responsiveness across all pages.

Create `src/components/dashboard/mobile-nav.tsx`:
```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Home,
  Calendar,
  Receipt,
  User,
  Gift,
  MessageSquare,
  FileText,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
  { name: 'Account', href: '/dashboard/account', icon: User },
  { name: 'Loyalty Rewards', href: '/dashboard/rewards', icon: Gift },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">DF</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold">Dirt Free</h2>
                <p className="text-xs text-muted-foreground">Customer Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

Update dashboard header to include mobile nav:
```typescript
import { MobileNav } from '@/components/dashboard/mobile-nav'

// In the Header component:
<MobileNav />
```

Create Sheet component `src/components/ui/sheet.tsx` - copy from shadcn/ui.

End of prompt

---

### Enhanced Prompt 50: Performance Optimization

Optimize performance with image optimization and lazy loading.

Update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
```

Create loading states for pages:

`src/app/(dashboard)/dashboard/loading.tsx`:
```typescript
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 bg-muted animate-pulse rounded" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-muted animate-pulse rounded-lg" />
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 51: Error Handling

Create comprehensive error handling and error pages.

Create `src/app/(dashboard)/error.tsx`:
```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Something went wrong!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We encountered an error while loading this page. Please try again.
          </p>
          <Button onClick={reset} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

Create `src/app/not-found.tsx`:
```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <FileQuestion className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 52: SEO & Metadata

Add SEO metadata to all pages.

Update page metadata in key pages:

`src/app/(dashboard)/dashboard/page.tsx`:
```typescript
export const metadata = {
  title: 'Dashboard | Dirt Free Customer Portal',
  description: 'View your appointments, invoices, and loyalty rewards',
}
```

`src/app/(dashboard)/dashboard/appointments/page.tsx`:
```typescript
export const metadata = {
  title: 'Appointments | Dirt Free Customer Portal',
  description: 'Manage your carpet cleaning appointments',
}
```

Similar for all other pages.

End of prompt

---

### Enhanced Prompt 53: Analytics Integration

Add analytics tracking.

Create `src/lib/analytics.ts`:
```typescript
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, properties)
    }
  },

  page: (path: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: path,
      })
    }
  },
}
```

Add tracking to key actions:
```typescript
// After booking appointment
analytics.track('appointment_booked', {
  services: selectedServices,
  date: selectedDate,
  amount: totalAmount,
})

// After payment
analytics.track('payment_completed', {
  invoiceId: invoice.id,
  amount: invoice.amount,
})
```

End of prompt

---

### Enhanced Prompt 54: Testing Setup

Create testing configuration.

Install dependencies:
```bash
npm install -D @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

Create `jest.config.js`:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)

### Enhanced Prompt 41: Documents Page

Create documents and receipts management page.

Create `src/app/(dashboard)/dashboard/documents/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Image } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  // Get completed jobs with documents
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      services:job_services(service:services(name)),
      photos:job_photos(*)
    `)
    .eq('customer_id', customer?.id)
    .eq('status', 'completed')
    .order('scheduled_date', { ascending: false })

  // Get invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documents & History</h1>
        <p className="text-muted-foreground">
          Access your service records, photos, and receipts
        </p>
      </div>

      {/* Service History with Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Service History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id} className="pb-6 border-b last:border-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {job.services?.map((s: any) => s.service?.name).join(', ')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(job.scheduled_date)} • {formatCurrency(job.total_amount)}
                      </p>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>

                  {job.notes && (
                    <div className="bg-muted p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium mb-1">Service Notes:</p>
                      <p className="text-sm text-muted-foreground">{job.notes}</p>
                    </div>
                  )}

                  {/* Before/After Photos */}
                  {job.photos && job.photos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-3">Service Photos:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {job.photos.map((photo: any) => (
                          <div key={photo.id} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border">
                              <img
                                src={photo.url}
                                alt={photo.type}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Badge
                              className="absolute top-2 left-2 text-xs"
                              variant={photo.type === 'before' ? 'destructive' : 'default'}
                            >
                              {photo.type}
                            </Badge>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              asChild
                            >
                              <a href={photo.url} download target="_blank">
                                <Download className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No service history available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoices & Receipts */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices & Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Invoice #{invoice.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(invoice.created_at)} • {formatCurrency(invoice.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                    >
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/api/invoices/${invoice.id}/pdf`} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No invoices available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 42: Service Photos Gallery

Create service photos gallery with lightbox.

Create `src/components/documents/photo-gallery.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react'
import Image from 'next/image'

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
              <img
                src={photo.url}
                alt={`${photo.type} photo`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
                <img
                  src={currentPhoto.url}
                  alt={`${currentPhoto.type} photo`}
                  className="w-full h-full object-contain"
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
```

End of prompt

---

## PHASE 7: COMMUNICATION SYSTEM (Prompts 36-40)

### Enhanced Prompt 36: Messages Dashboard

Create customer messaging interface.

Create `src/app/(dashboard)/dashboard/messages/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  responded: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })

  const openCount = messages?.filter(m => m.status === 'open').length || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with the Dirt Free team
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/messages/new">
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Link>
        </Button>
      </div>

      {openCount > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-blue-900">
              You have {openCount} open {openCount === 1 ? 'message' : 'messages'}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <Link
                  key={message.id}
                  href={`/dashboard/messages/${message.id}`}
                  className="block"
                >
                  <div className="p-4 rounded-lg border hover:border-primary transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-full bg-muted">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{message.subject}</h3>
                            <Badge className={statusColors[message.status as keyof typeof statusColors]}>
                              {message.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {message.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/messages/new">
                    Send Your First Message
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt: '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

Create `jest.setup.js`:
```javascript
import '@testing-library/jest-dom'
```

Create sample test `src/__tests__/dashboard.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/(dashboard)/dashboard/page'

describe('Dashboard', () => {
  it('renders dashboard heading', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument()
  })
})
```

End of prompt

---

### Enhanced Prompt 55: Environment Variables Validation

Create environment variables validation.

Create `src/lib/env.ts`:
```typescript
function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

export const env = {
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  },
  stripe: {
    publishableKey: getEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    secretKey: getEnvVar('STRIPE_SECRET_KEY'),
    webhookSecret: getEnvVar('STRIPE_WEBHOOK_SECRET'),
  },
  app: {
    url: getEnvVar('NEXT_PUBLIC_APP_URL'),
    websiteUrl: getEnvVar('NEXT_PUBLIC_WEBSITE_URL'),
  },
}
```

End of prompt

---

### Enhanced Prompt 56: Documentation

Create comprehensive README and documentation.

Update `README.md`:
```markdown
# Dirt Free Customer Portal

Self-service customer portal for Dirt Free Carpet customers.

## Features

### 🔐 Authentication
- Secure customer login with Supabase Auth
- Password reset functionality
- Session management

### 📅 Appointment Management
- 24/7 self-service booking
- Real-time availability checking
- Appointment rescheduling
- Appointment cancellation
- Service history tracking

### 💳 Billing & Payments
- View all invoices
- Secure Stripe payment integration
- Payment history
- Download receipts (PDF)
- Auto-pay setup
- Payment methods management

### 🎁 Loyalty & Rewards
- Points tracking (10 points per dollar spent)
- Rewards catalog
- Reward redemption
- Referral program
- Points history

### 💬 Communication
- Direct messaging with Dirt Free team
- Message threading
- Real-time notifications
- Support ticket system

### 📄 Documents & History
- Service history timeline
- Before/after photos gallery
- Invoice archive
- Service warranties
- Downloadable documents

## Tech Stack

- **Framework**: Next.js 15.5.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Email**: Resend
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/dirt-free-portal.git
cd dirt-free-portal
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your credentials.

4. Run database migrations:
\`\`\`bash
# Apply Supabase migrations
npm run db:migrate
\`\`\`

5. Start development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
src/
├── app/                    # Next.js app router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   ├── booking/          # Booking components
│   └── shared/           # Shared components
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase clients
│   ├── stripe/           # Stripe integration
│   └── utils/            # Utility functions
└── types/                # TypeScript types
\`\`\`

## Database Schema

Key tables:
- `customers` - Customer information
- `jobs` - Service appointments
- `invoices` - Billing invoices
- `loyalty_points` - Loyalty rewards tracking
- `messages` - Customer messages
- `message_replies` - Message threads

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

\`\`\`bash
npm run build
npm run start
\`\`\`

## Environment Variables

See `.env.example` for required variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXT_PUBLIC_WEBSITE_URL` - Main website URL

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

Proprietary - Dirt Free Carpet

## Support

- Email: info@dirtfreecarpet.com
- Phone: (713) 730-2782
- Website: https://dirtfreecarpet.com
\`\`\`

End of prompt

---

### Enhanced Prompt 57: Deployment Configuration

Create deployment configuration files.

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "@stripe-publishable-key",
    "STRIPE_SECRET_KEY": "@stripe-secret-key",
    "STRIPE_WEBHOOK_SECRET": "@stripe-webhook-secret"
  }
}
```

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
```

End of prompt

---

### Enhanced Prompt 58: Security Hardening

Implement security best practices.

Create `src/middleware.ts`:
```typescript
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Update Supabase session
  const supabaseResponse = await updateSession(request)

  // Security headers
  const response = supabaseResponse || NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

Create rate limiting for API routes:

`src/lib/rate-limit.ts`:
```typescript
import { LRUCache } from 'lru-cache'

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage >= limit

        return isRateLimited ? reject() : resolve()
      }),
  }
}
```

End of prompt

---

### Enhanced Prompt 59: Accessibility Improvements

Ensure WCAG 2.1 AA compliance.

Create `src/components/ui/skip-link.tsx`:
```typescript
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
    >
      Skip to main content
    </a>
  )
}
```

Add to layout:
```typescript
<SkipLink />
<main id="main-content">
  {children}
</main>
```

Update button components with proper ARIA labels:
```typescript
<Button aria-label="Close dialog" onClick={handleClose}>
  <X className="h-4 w-4" />
</Button>
```

Add focus-visible styles in `globals.css`:
```css
*:focus-visible {
  @apply outline-2 outline-offset-2 outline-primary;
}
```

End of prompt

---

### Enhanced Prompt 60: Final Testing & Launch Checklist

Create comprehensive launch checklist.

Create `LAUNCH_CHECKLIST.md`:
```markdown
# Dirt Free Customer Portal - Launch Checklist

## Pre-Launch Testing

### Functionality
- [ ] User authentication (login/logout)
- [ ] Password reset flow
- [ ] Appointment booking (all steps)
- [ ] Appointment rescheduling
- [ ] Appointment cancellation
- [ ] Invoice viewing
- [ ] Payment processing
- [ ] Loyalty points tracking
- [ ] Reward redemption
- [ ] Message sending
- [ ] Message replies
- [ ] Document downloads
- [ ] Photo viewing

### Integrations
- [ ] Supabase connection
- [ ] Stripe payments working
- [ ] Email notifications sending
- [ ] Real-time updates working
- [ ] CRM data syncing

### Security
- [ ] RLS policies active
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Rate limiting working
- [ ] CORS configured
- [ ] Security headers set

### Performance
- [ ] Page load times < 3s
- [ ] Images optimized
- [ ] Code split properly
- [ ] Caching configured
- [ ] Database indexed

### Mobile
- [ ] Responsive on all breakpoints
- [ ] Touch interactions working
- [ ] Mobile navigation functional
- [ ] Forms mobile-friendly

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader compatible
- [ ] Color contrast passing
- [ ] Focus indicators visible
- [ ] Alt text on images

### SEO
- [ ] Meta tags complete
- [ ] Open Graph tags
- [ ] Sitemap generated
- [ ] Robots.txt configured

## Launch Day

- [ ] Deploy to production
- [ ] Verify all environment variables
- [ ] Test production payments
- [ ] Monitor error logs
- [ ] Check analytics tracking
- [ ] Send test notifications
- [ ] Verify email delivery

## Post-Launch

- [ ] Monitor user feedback
- [ ] Track error rates
- [ ] Review performance metrics
- [ ] Check payment success rate
- [ ] Monitor database performance
- [ ] Schedule first backup

## Support Preparation

- [ ] Customer support trained
- [ ] FAQ documentation complete
- [ ] Support email configured
- [ ] Phone support ready
- [ ] Escalation process defined

## Marketing

- [ ] Announce to existing customers
- [ ] Email blast sent
- [ ] Social media posts
- [ ] Website banner added
- [ ] Blog post published
\`\`\`

Create final git commit:
```bash
git add .
git commit -m "Customer Portal v1.0 - Production Ready"
git tag v1.0.0
git push origin main --tags
```

**🎉 CUSTOMER PORTAL BUILD COMPLETE! 🎉**

All 60 prompts implemented. The portal is production-ready with:
- ✅ Full authentication system
- ✅ Appointment booking & management
- ✅ Payment processing with Stripe
- ✅ Loyalty rewards program
- ✅ Customer communication system
- ✅ Document management
- ✅ Real-time notifications
- ✅ Mobile responsive design
- ✅ Security hardening
- ✅ Performance optimization
- ✅ Accessibility compliance
- ✅ Production deployment ready

End of prompt

---

## BUILD COMPLETE!

**Total Prompts: 60**
**Estimated Build Time with Builder Bot: 3-4 hours**
**Pages Created: 20+**
**Components Created: 50+**
**API Routes Created: 15+**

The Customer Portal is now fully documented and ready to be built by the Builder Bot. Each prompt is clearly marked with "End of prompt" for the bot to process sequentially.
```

End of prompt

### Enhanced Prompt 41: Documents Page

Create documents and receipts management page.

Create `src/app/(dashboard)/dashboard/documents/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Image } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  // Get completed jobs with documents
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      services:job_services(service:services(name)),
      photos:job_photos(*)
    `)
    .eq('customer_id', customer?.id)
    .eq('status', 'completed')
    .order('scheduled_date', { ascending: false })

  // Get invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documents & History</h1>
        <p className="text-muted-foreground">
          Access your service records, photos, and receipts
        </p>
      </div>

      {/* Service History with Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Service History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id} className="pb-6 border-b last:border-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {job.services?.map((s: any) => s.service?.name).join(', ')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(job.scheduled_date)} • {formatCurrency(job.total_amount)}
                      </p>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>

                  {job.notes && (
                    <div className="bg-muted p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium mb-1">Service Notes:</p>
                      <p className="text-sm text-muted-foreground">{job.notes}</p>
                    </div>
                  )}

                  {/* Before/After Photos */}
                  {job.photos && job.photos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-3">Service Photos:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {job.photos.map((photo: any) => (
                          <div key={photo.id} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border">
                              <img
                                src={photo.url}
                                alt={photo.type}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Badge
                              className="absolute top-2 left-2 text-xs"
                              variant={photo.type === 'before' ? 'destructive' : 'default'}
                            >
                              {photo.type}
                            </Badge>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              asChild
                            >
                              <a href={photo.url} download target="_blank">
                                <Download className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No service history available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoices & Receipts */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices & Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Invoice #{invoice.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(invoice.created_at)} • {formatCurrency(invoice.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                    >
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/api/invoices/${invoice.id}/pdf`} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No invoices available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

---

### Enhanced Prompt 42: Service Photos Gallery

Create service photos gallery with lightbox.

Create `src/components/documents/photo-gallery.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react'
import Image from 'next/image'

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
              <img
                src={photo.url}
                alt={`${photo.type} photo`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
                <img
                  src={currentPhoto.url}
                  alt={`${currentPhoto.type} photo`}
                  className="w-full h-full object-contain"
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
```

End of prompt

---

## PHASE 7: COMMUNICATION SYSTEM (Prompts 36-40)

### Enhanced Prompt 36: Messages Dashboard

Create customer messaging interface.

Create `src/app/(dashboard)/dashboard/messages/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  responded: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })

  const openCount = messages?.filter(m => m.status === 'open').length || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with the Dirt Free team
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/messages/new">
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Link>
        </Button>
      </div>

      {openCount > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-blue-900">
              You have {openCount} open {openCount === 1 ? 'message' : 'messages'}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {messages && messages.length > 0 ? (
              messages.map((message) => (
                <Link
                  key={message.id}
                  href={`/dashboard/messages/${message.id}`}
                  className="block"
                >
                  <div className="p-4 rounded-lg border hover:border-primary transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-full bg-muted">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{message.subject}</h3>
                            <Badge className={statusColors[message.status as keyof typeof statusColors]}>
                              {message.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {message.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/messages/new">
                    Send Your First Message
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

End of prompt

