'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { FamilyGroup } from '@/types/family'
import { getFamilyGroups, createFamilyGroup, deleteFamilyGroup } from '@/lib/family-service'
import { FamilyGroupCard } from '@/components/family/FamilyGroupCard'
import { CreateFamilyGroupDialog } from '@/components/family/CreateFamilyGroupDialog'
import { AddFamilyMemberDialog } from '@/components/family/AddFamilyMemberDialog'

export default function FamilyGroupsPage() {
  const { supabase } = useSupabase()
  const { userId } = useAuth()
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<FamilyGroup | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)

  useEffect(() => {
    if (supabase && userId) {
      fetchFamilyGroups()
    }
  }, [supabase, userId])

  async function fetchFamilyGroups() {
    try {
      setIsLoading(true)
      const data = await getFamilyGroups(supabase, userId)
      setFamilyGroups(data)
    } catch (error) {
      console.error('Error fetching family groups:', error)
      toast.error('Failed to load family groups')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteGroup(groupId: number) {
    try {
      await deleteFamilyGroup(supabase, groupId)
      toast.success('Family group deleted')
      await fetchFamilyGroups()
    } catch (error) {
      console.error('Error deleting family group:', error)
      toast.error('Failed to delete family group')
    }
  }

  if (!userId) {
    return <div>Please sign in to view family groups.</div>
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Family Groups</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Family Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {familyGroups.map((group) => (
          <FamilyGroupCard
            key={group.id}
            group={group}
            onAddMember={() => {
              setSelectedGroup(group)
              setShowAddMemberDialog(true)
            }}
            onDelete={() => handleDeleteGroup(group.id)}
          />
        ))}
      </div>

      <CreateFamilyGroupDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false)
          fetchFamilyGroups()
        }}
      />

      <AddFamilyMemberDialog
        isOpen={showAddMemberDialog}
        onClose={() => setShowAddMemberDialog(false)}
        groupId={selectedGroup?.id}
        onSuccess={() => {
          setShowAddMemberDialog(false)
          fetchFamilyGroups()
        }}
      />
    </div>
  )
}
