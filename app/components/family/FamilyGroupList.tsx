'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus, UserPlus, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { CreateFamilyGroupDialog } from './CreateFamilyGroupDialog'
import { AddFamilyMemberDialog } from './AddFamilyMemberDialog'

interface FamilyGroup {
  id: number
  name: string
  created_at: string
  members: Array<{
    id: number
    name: string
    date_of_birth: string
    relationship?: string
  }>
}

export function FamilyGroupList() {
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
      const { data, error } = await supabase
        .from('family_groups')
        .select(`
          *,
          members:patient_family_group(
            patient:patients(
              id,
              name,
              date_of_birth
            )
          )
        `)
        .eq('user_id', userId)

      if (error) throw error

      const formattedGroups = data.map(group => ({
        ...group,
        members: group.members.map(m => ({
          id: m.patient.id,
          name: m.patient.name,
          date_of_birth: m.patient.date_of_birth
        }))
      }))

      setFamilyGroups(formattedGroups)
    } catch (error) {
      console.error('Error fetching family groups:', error)
      toast.error('Failed to load family groups')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteGroup(groupId: number) {
    try {
      const { error } = await supabase
        .from('family_groups')
        .delete()
        .eq('id', groupId)

      if (error) throw error

      toast.success('Family group deleted')
      fetchFamilyGroups()
    } catch (error) {
      console.error('Error deleting family group:', error)
      toast.error('Failed to delete family group')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Family Groups</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Family Group
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {familyGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>{group.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteGroup(group.id)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {group.members.length} members
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedGroup(group)
                      setShowAddMemberDialog(true)
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>
                <div className="space-y-2">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(member.date_of_birth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
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
