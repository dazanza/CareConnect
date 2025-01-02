'use client'

import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import FamilyGroupList from '@/app/components/family/FamilyGroupList'

export default function FamilyGroupsPage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Family Groups</h1>
      <FamilyGroupList />
    </div>
  )
}
