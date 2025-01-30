'use client'

import { useEffect } from 'react'
import AppSidebar from '@/app/components/layout/Sidebar'
import Header from '@/app/components/layout/Header'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useSessionTimeout } from '@/app/hooks/useSessionTimeout'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard'

  // Initialize session timeout
  useSessionTimeout()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!user) {
    return null // Don't render anything while redirecting
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-60 shrink-0">
        <AppSidebar />
      </div>
      <div className="flex-1 flex flex-col">
        {isDashboard && <Header />}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
} 