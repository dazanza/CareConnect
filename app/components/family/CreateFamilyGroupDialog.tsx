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

interface CreateFamilyGroupDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateFamilyGroupDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateFamilyGroupDialogProps) {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('family_groups')
        .insert([{ name, user_id: user.id }])

      if (error) throw error

      toast.success('Family group created')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating family group:', error)
      toast.error('Failed to create family group')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Family Group</DialogTitle>
          <DialogDescription>
            Create a new family group to manage related patients.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading} isLoading={isLoading}>
            Create Group
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
