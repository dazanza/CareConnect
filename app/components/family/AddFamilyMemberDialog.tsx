'use client'

import { useState } from 'react'
import { useAuth } from '@/app/components/auth/SupabaseAuthProvider'
import { useSupabase } from '@/app/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AddFamilyMemberDialogProps {
  isOpen: boolean
  onClose: () => void
  groupId?: string
  onSuccess: () => void
}

export function AddFamilyMemberDialog({
  isOpen,
  onClose,
  groupId,
  onSuccess,
}: AddFamilyMemberDialogProps) {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !groupId) return

    setIsLoading(true)
    try {
      // First, create the patient
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert([{
          name,
          date_of_birth: dateOfBirth,
          user_id: user.id
        }])
        .select()
        .single()

      if (patientError) throw patientError

      // Then, add them to the family group
      const { error: groupError } = await supabase
        .from('patient_family_group')
        .insert([{
          patient_id: patient.id,
          family_group_id: groupId,
          relationship
        }])

      if (groupError) throw groupError

      toast.success('Family member added')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error adding family member:', error)
      toast.error('Failed to add family member')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
          <DialogDescription>
            Add a new member to your family group.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="spouse">Spouse</SelectItem>
                <SelectItem value="sibling">Sibling</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Member'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
