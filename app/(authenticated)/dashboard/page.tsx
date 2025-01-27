'use client'

import { useSupabase } from '@/app/hooks/useSupabase'
import { DashboardTimeline } from '@/app/components/medical-history/DashboardTimeline'

export default function DashboardPage() {
  const { user } = useSupabase()

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-6">
        <DashboardTimeline userId={user.id} />
        {/* Other dashboard components */}
      </div>
    </div>
  )
}