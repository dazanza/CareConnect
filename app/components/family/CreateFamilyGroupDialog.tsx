'use client'

import { useState } from 'react'
import { useSupabase } from '@/app/hooks/useSupabase'
import { useAuth } from '@clerk/nextjs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import { createFamilyGroup } from '@/lib/family-service'

interface CreateFamilyGroupDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateFamilyGroupDialog({
  isOpen,
  onClose,
  onSuccess
}: CreateFamilyGroupDialogProps) {
  const { supabase } = useSupabase()
  const { userId } = useAuth()
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !userId || !name.trim()) return

    try {
      setIsLoading(true)
      await createFamilyGroup(supabase, name.trim(), userId)
      toast.success('Family group created')
      onSuccess()
      setName('')
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
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Group Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Smith Family"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
