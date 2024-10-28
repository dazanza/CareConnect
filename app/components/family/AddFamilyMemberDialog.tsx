'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@clerk/nextjs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { addFamilyMember } from '@/lib/family-service'

interface AddFamilyMemberDialogProps {
  isOpen: boolean
  onClose: () => void
  groupId?: number
  onSuccess: () => void
}

interface Patient {
  id: number
  name: string
  date_of_birth: string
}

export function AddFamilyMemberDialog({
  isOpen,
  onClose,
  groupId,
  onSuccess
}: AddFamilyMemberDialogProps) {
  const { supabase } = useSupabase()
  const { userId } = useAuth()
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [relationship, setRelationship] = useState<string>('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && supabase && userId && groupId) {
      fetchAvailablePatients()
    }
  }, [isOpen, supabase, userId, groupId])

  async function fetchAvailablePatients() {
    if (!supabase || !userId || !groupId) return

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, date_of_birth')
        .eq('user_id', userId)
        .not('id', 'in', (
          supabase
            .from('patient_family_group')
            .select('patient_id')
            .eq('family_group_id', groupId)
        ))

      if (error) throw error
      setPatients(data)
    } catch (error) {
      console.error('Error fetching available patients:', error)
      toast.error('Failed to load available patients')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !userId || !groupId || !selectedPatient) return

    try {
      setIsLoading(true)
      await addFamilyMember(supabase, {
        patientId: parseInt(selectedPatient),
        familyGroupId: groupId,
        userId,
        relationship: relationship || undefined
      })

      toast.success('Member added to family group')
      onSuccess()
      setSelectedPatient('')
      setRelationship('')
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
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Select Patient
            </label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    {patient.name} ({new Date(patient.date_of_birth).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              Relationship (optional)
            </label>
            <Input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g., Child, Spouse, Parent"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedPatient}>
              Add Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
