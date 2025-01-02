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

interface SharePatientDialogProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  onSuccess: () => void
}

export function SharePatientDialog({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}: SharePatientDialogProps) {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [email, setEmail] = useState('')
  const [accessLevel, setAccessLevel] = useState('read')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !patientId) return

    setIsLoading(true)
    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (userError) {
        toast.error('User not found')
        return
      }

      // Then, create the share record
      const { error: shareError } = await supabase
        .from('patient_shares')
        .insert([
          {
            patient_id: patientId,
            shared_by_user_id: user.id,
            shared_with_user_id: userData.id,
            access_level: accessLevel,
          },
        ])

      if (shareError) throw shareError

      toast.success('Patient shared successfully')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error sharing patient:', error)
      toast.error('Failed to share patient')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Patient Record</DialogTitle>
          <DialogDescription>
            Share this patient's record with another user by entering their email address.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user's email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accessLevel">Access Level</Label>
            <Select value={accessLevel} onValueChange={setAccessLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select access level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Read Only</SelectItem>
                <SelectItem value="write">Read & Write</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sharing...' : 'Share Patient'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
