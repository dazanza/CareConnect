'use client'

import AppSidebar from '@/app/components/layout/Sidebar'
import Header from '@/app/components/layout/Header'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { redirect } from 'next/navigation'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-60 shrink-0">
        <AppSidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="p-4 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
} 